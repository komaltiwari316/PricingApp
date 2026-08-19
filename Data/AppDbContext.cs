using Microsoft.EntityFrameworkCore;
using PricingApp.Models;

namespace PricingApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<PricingItem> PricingItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PricingItem>()
                .Property(p => p.Cost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PricingItem>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PricingItem>()
                .Property(p => p.MarginPercent)
                .HasPrecision(5, 2);
        }
    }
}