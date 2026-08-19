using System.ComponentModel.DataAnnotations;

namespace PricingApp.Models
{
  public class CreatePricingItemRequest
  {
    [Required]
    [StringLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Cost { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal TargetMargin { get; set; }
  }
}