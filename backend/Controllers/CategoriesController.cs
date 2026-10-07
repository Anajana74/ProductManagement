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
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoriesController(AppDbContext db) => _db = db;

    private static CategoryDto ToDto(Category c, int count) =>
        new(c.Id, c.Name, count, c.IsActive ? "Active" : "Inactive");

    [HttpGet]
    public async Task<IEnumerable<CategoryDto>> GetAll(string? search)
    {
        var q = _db.Categories.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(c => c.Name.Contains(search));
        var list = await q.OrderBy(c => c.Id)
            .Select(c => new { c, Count = c.Products.Count }).ToListAsync();
        return list.Select(x => ToDto(x.c, x.Count));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Get(int id)
    {
        var c = await _db.Categories.Include(x => x.Products).FirstOrDefaultAsync(x => x.Id == id);
        return c is null ? NotFound() : ToDto(c, c.Products.Count);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CategorySaveDto dto)
    {
        if (await _db.Categories.AnyAsync(c => c.Name == dto.Name)) return Conflict("Category already exists.");
        var c = new Category { Name = dto.Name.Trim(), IsActive = dto.IsActive };
        _db.Categories.Add(c);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = c.Id }, ToDto(c, 0));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Update(int id, CategorySaveDto dto)
    {
        var c = await _db.Categories.Include(x => x.Products).FirstOrDefaultAsync(x => x.Id == id);
        if (c is null) return NotFound();
        if (await _db.Categories.AnyAsync(x => x.Name == dto.Name && x.Id != id)) return Conflict("Category already exists.");
        c.Name = dto.Name.Trim(); c.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
        return ToDto(c, c.Products.Count);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Categories.FindAsync(id);
        if (c is null) return NotFound();
        if (await _db.Products.AnyAsync(p => p.CategoryId == id))
            return BadRequest("Cannot delete a category that still has products.");
        _db.Categories.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
