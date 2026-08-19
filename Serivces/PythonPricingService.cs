using System.Diagnostics;
using System.Globalization;

namespace PricingApp.Services
{
  public class PythonPricingService
  {
    private readonly string _scriptPath;
    private readonly string _workingDirectory;

    public PythonPricingService(IWebHostEnvironment environment)
    {
      _workingDirectory = environment.ContentRootPath;
      _scriptPath = Path.Combine(environment.ContentRootPath, "PythonPricing", "pricing.py");
    }

    public async Task<decimal> CalculatePriceAsync(
        decimal cost,
        decimal margin)
    {
      var startInfo = new ProcessStartInfo
      {
        FileName = "python",
        ArgumentList =
        {
          _scriptPath,
          cost.ToString(CultureInfo.InvariantCulture),
          margin.ToString(CultureInfo.InvariantCulture)
        },
        WorkingDirectory = _workingDirectory,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true
      };

      using var process = new Process
      {
        StartInfo = startInfo
      };

      process.Start();

      var output = await process.StandardOutput.ReadToEndAsync();
      var error = await process.StandardError.ReadToEndAsync();

      await process.WaitForExitAsync();

      if (process.ExitCode != 0)
      {
        throw new Exception(
            string.IsNullOrWhiteSpace(error)
                ? "Python pricing calculation failed."
                : error
        );
      }

      if (!decimal.TryParse(
              output.Trim(),
              NumberStyles.Number,
              CultureInfo.InvariantCulture,
              out var price))
      {
        throw new Exception("Invalid price returned by Python.");
      }

      return price;
    }
  }
}
