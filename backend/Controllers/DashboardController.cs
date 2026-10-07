using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Api.Data;

namespace ProductManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var since = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-5);
        var created = await _db.Products.Where(p => p.CreatedAt >= since).Select(p => p.CreatedAt).ToListAsync();

        var overview = Enumerable.Range(0, 6).Select(i => since.AddMonths(i)).Select(m => new
        {
            month = m.ToString("MMM"),
            count = created.Count(d => d.Year == m.Year && d.Month == m.Month)
        });

        var recent = (await _db.Products.Include(p => p.Category)
            .OrderByDescending(p => p.Id).Take(4).ToListAsync()).Select(ProductsController.ToDto);

        return Ok(new
        {
            totalProducts = await _db.Products.CountAsync(),
            activeProducts = await _db.Products.CountAsync(p => p.IsActive && p.StockQuantity > 0),
            outOfStock = await _db.Products.CountAsync(p => p.StockQuantity == 0),
            totalCategories = await _db.Categories.CountAsync(),
            overview,
            recentProducts = recent
        });
    }
}
