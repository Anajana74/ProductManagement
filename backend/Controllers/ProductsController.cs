using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Api.Data;
using ProductManagement.Api.Dtos;
using ProductManagement.Api.Models;

namespace ProductManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private static readonly string[] AllowedExt = { ".png", ".jpg", ".jpeg" };
    private const long MaxImageBytes = 2 * 1024 * 1024;

    public ProductsController(AppDbContext db, IWebHostEnvironment env) { _db = db; _env = env; }

    internal static ProductDto ToDto(Product p) => new(p.Id, p.Name, p.Sku, p.CategoryId,
        p.Category?.Name ?? "", p.Price, p.StockQuantity,
        p.StockQuantity == 0 ? "Out of Stock" : p.IsActive ? "Active" : "Inactive",
        p.Description, p.ImageUrl, p.IsActive);

    // GET api/products?search=&categoryId=&status=Active|Inactive|Out of Stock&page=1&pageSize=5
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
        string? search, int? categoryId, string? status, int page = 1, int pageSize = 5)
    {
        var q = _db.Products.Include(p => p.Category).AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(p => p.Name.Contains(search) || p.Sku.Contains(search));
        if (categoryId.HasValue) q = q.Where(p => p.CategoryId == categoryId);
        q = status switch
        {
            "Out of Stock" => q.Where(p => p.StockQuantity == 0),
            "Active" => q.Where(p => p.IsActive && p.StockQuantity > 0),
            "Inactive" => q.Where(p => !p.IsActive && p.StockQuantity > 0),
            _ => q
        };

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.Id)
            .Skip((Math.Max(page, 1) - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<ProductDto>(items.Select(ToDto), total, page, pageSize);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> Get(int id)
    {
        var p = await _db.Products.Include(x => x.Category).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return p is null ? NotFound() : ToDto(p);
    }

    // POST api/products  (multipart/form-data)
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromForm] ProductFormDto dto)
    {
        if (!await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId)) return BadRequest("Invalid category.");
        if (await _db.Products.AnyAsync(p => p.Sku == dto.Sku)) return Conflict("SKU already exists.");

        var p = new Product();
        Apply(p, dto);
        if (dto.Image != null)
        {
            var (url, error) = await SaveImage(dto.Image);
            if (error != null) return BadRequest(error);
            p.ImageUrl = url;
        }
        _db.Products.Add(p);
        await _db.SaveChangesAsync();
        await _db.Entry(p).Reference(x => x.Category).LoadAsync();
        return CreatedAtAction(nameof(Get), new { id = p.Id }, ToDto(p));
    }

    // PUT api/products/5  (multipart/form-data; Image optional)
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromForm] ProductFormDto dto)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();
        if (!await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId)) return BadRequest("Invalid category.");
        if (await _db.Products.AnyAsync(x => x.Sku == dto.Sku && x.Id != id)) return Conflict("SKU already exists.");

        Apply(p, dto);
        if (dto.Image != null)
        {
            var (url, error) = await SaveImage(dto.Image);
            if (error != null) return BadRequest(error);
            DeleteImage(p.ImageUrl);
            p.ImageUrl = url;
        }
        await _db.SaveChangesAsync();
        await _db.Entry(p).Reference(x => x.Category).LoadAsync();
        return ToDto(p);
    }

    // PATCH api/products/5/stock  { "quantity": 20 }
    [HttpPatch("{id:int}/stock")]
    public async Task<ActionResult<ProductDto>> UpdateStock(int id, StockUpdateDto dto)
    {
        var p = await _db.Products.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();
        p.StockQuantity = dto.Quantity;
        p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToDto(p);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();
        DeleteImage(p.ImageUrl);
        _db.Products.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET api/products/5/sales
    [HttpGet("{id:int}/sales")]
    public async Task<ActionResult<ProductSalesDto>> Sales(int id)
    {
        if (!await _db.Products.AnyAsync(p => p.Id == id)) return NotFound();
        var sales = await _db.Sales.Where(s => s.ProductId == id).OrderByDescending(s => s.SoldAt).ToListAsync();
        return new ProductSalesDto(sales.Sum(s => s.Quantity), sales.Sum(s => s.Quantity * s.UnitPrice),
            sales.Select(s => new SaleDto(s.Id, s.Quantity, s.UnitPrice, s.Quantity * s.UnitPrice, s.SoldAt)));
    }

    private static void Apply(Product p, ProductFormDto d)
    {
        p.Name = d.Name.Trim(); p.Sku = d.Sku.Trim().ToUpper(); p.CategoryId = d.CategoryId;
        p.Price = d.Price; p.StockQuantity = d.Stock; p.Description = d.Description;
        p.IsActive = d.IsActive; p.UpdatedAt = DateTime.UtcNow;
    }

    private async Task<(string? url, string? error)> SaveImage(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExt.Contains(ext)) return (null, "Only PNG and JPG images are allowed.");
        if (file.Length > MaxImageBytes) return (null, "Image must be 2MB or smaller.");

        var folder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
        Directory.CreateDirectory(folder);
        var name = $"{Guid.NewGuid()}{ext}";
        await using var fs = System.IO.File.Create(Path.Combine(folder, name));
        await file.CopyToAsync(fs);
        return ($"/uploads/{name}", null);
    }

    private void DeleteImage(string? url)
    {
        if (string.IsNullOrEmpty(url)) return;
        var path = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", Path.GetFileName(url));
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
    }
}
