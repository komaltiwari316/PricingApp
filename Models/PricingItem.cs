namespace PricingApp.Models
{
    public class PricingItem
    {
        public int Id { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public decimal Cost { get; set; }

        public decimal Price { get; set; }

        public decimal MarginPercent { get; set; }

        public DateTime? EffectiveDate { get; set; }

        public bool IsActive { get; set; } = true;
    }
}