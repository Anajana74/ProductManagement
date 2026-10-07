using System.ComponentModel.DataAnnotations;

namespace ProductManagement.Api.Dtos;

public record ProductDto(int Id, string Name, string Sku, int CategoryId, string Category,
    decimal Price, int Stock, string Status, string? Description, string? ImageUrl, bool IsActive);

public class ProductFormDto
{
    [Required, StringLength(150)] public string Name { get; set; } = "";
    [Required, StringLength(50)] public string Sku { get; set; } = "";
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    [Range(0, 99999999)] public decimal Price { get; set; }
    [Range(0, int.MaxValue)] public int Stock { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public IFormFile? Image { get; set; }
}

public record StockUpdateDto([property: Range(0, int.MaxValue)] int Quantity);

public record CategoryDto(int Id, string Name, int TotalProducts, string Status);
public class CategorySaveDto
{
    [Required, StringLength(100)] public string Name { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

public record PagedResult<T>(IEnumerable<T> Items, int Total, int Page, int PageSize);
public record SaleDto(int Id, int Quantity, decimal UnitPrice, decimal Total, DateTime SoldAt);
public record ProductSalesDto(int UnitsSold, decimal Revenue, IEnumerable<SaleDto> Sales);
