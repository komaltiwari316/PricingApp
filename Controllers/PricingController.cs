using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PricingApp.Data;
using PricingApp.Models;

namespace PricingApp.Controllers
{
    public class PricingController : Controller
    {
        private readonly AppDbContext _context;

        public PricingController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var items = await _context.PricingItems
                .OrderByDescending(x => x.Id)
                .ToListAsync();

            ViewBag.Categories = items
                .Select(x => x.Category)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .OrderBy(x => x)
                .ToList();

            return View(items);
        }
    }
}
