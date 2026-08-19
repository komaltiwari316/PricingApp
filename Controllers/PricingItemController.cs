using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PricingApp.Data;
using PricingApp.Models;
using PricingApp.Services;

namespace PricingApp.Controllers
{
  [Route("pricingitems")]
  [IgnoreAntiforgeryToken]
  public class PricingItemController : Controller
  {
    private readonly AppDbContext _context;
    private readonly PythonPricingService _pythonPricingService;

    public PricingItemController(
        AppDbContext context,
        PythonPricingService pythonPricingService)
    {
      _context = context;
      _pythonPricingService = pythonPricingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        string? category,
        string? search,
        decimal? minPrice,
        decimal? maxPrice)
    {
      var query = _context.PricingItems.AsQueryable();

      if (!string.IsNullOrWhiteSpace(category))
      {
        query = query.Where(x => x.Category == category);
      }

      if (!string.IsNullOrWhiteSpace(search))
      {
        query = query.Where(x =>
            x.ProductName.Contains(search));
      }

      if (minPrice.HasValue)
      {
        query = query.Where(x =>
            x.Price >= minPrice.Value);
      }

      if (maxPrice.HasValue)
      {
        query = query.Where(x =>
            x.Price <= maxPrice.Value);
      }

      var items = await query.ToListAsync();

      return Json(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
      var item = await _context.PricingItems
          .FirstOrDefaultAsync(x => x.Id == id);

      if (item == null)
      {
        return NotFound(new
        {
          message = "Pricing item not found."
        });
      }

      return Json(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
     [FromBody] CreatePricingItemRequest request)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      try
      {
        var price = await _pythonPricingService.CalculatePriceAsync(
            request.Cost,
            request.TargetMargin
        );

        var item = new PricingItem
        {
          ProductName = request.ProductName,
          Category = request.Category,
          Cost = request.Cost,
          Price = price,
          MarginPercent = request.TargetMargin,
          EffectiveDate = DateTime.Now,
          IsActive = true
        };

        _context.PricingItems.Add(item);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = item.Id },
            item
        );
      }
      catch (Exception ex)
      {
        return StatusCode(500, new
        {
          message = "Pricing calculation failed.",
          error = ex.Message
        });
      }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
    int id,
    [FromBody] CreatePricingItemRequest request)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      var item = await _context.PricingItems
          .FirstOrDefaultAsync(x => x.Id == id);

      if (item == null)
      {
        return NotFound(new
        {
          message = "Pricing item not found."
        });
      }

      try
      {
        // Python se updated price calculate karo
        var price = await _pythonPricingService.CalculatePriceAsync(
            request.Cost,
            request.TargetMargin
        );

        item.ProductName = request.ProductName;
        item.Category = request.Category;
        item.Cost = request.Cost;
        item.Price = price;
        item.MarginPercent = request.TargetMargin;

        await _context.SaveChangesAsync();

        return Ok(item);
      }
      catch (Exception ex)
      {
        return StatusCode(500, new
        {
          message = "Pricing calculation failed.",
          error = ex.Message
        });
      }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
      var item = await _context.PricingItems
          .FirstOrDefaultAsync(x => x.Id == id);

      if (item == null)
      {
        return NotFound(new
        {
          message = "Pricing item not found."
        });
      }

      _context.PricingItems.Remove(item);
      await _context.SaveChangesAsync();

      return NoContent();
    }
  }
}