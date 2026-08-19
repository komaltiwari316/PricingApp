# PricingApp

ASP.NET Core app for a product pricing table. You enter cost and target margin; a Python script calculates sell price and stores the row in SQL Server.

**Formula:** `price = cost / (1 - margin / 100)`

## Requirements

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Python 3](https://www.python.org/downloads/) on `PATH` (`python` must work in a terminal)
- SQL Server on `localhost:1433` (this project uses a Docker container named `pricing-sqlserver`)

## Run SQL Server

If the container already exists:

```bat
docker start pricing-sqlserver
```

To create it for the first time:

```bat
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=SqlServer@12345" -p 1433:1433 --name pricing-sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

The app creates `PricingDB` and the `PricingItems` table automatically on startup.

## Run the app

From this folder:

```bat
dotnet run
```

Open [http://localhost:5015](http://localhost:5015).

## What you can do

- Add a product with name, category, cost, and target margin
- See the calculated sell price before saving
- Filter by name, category, or price range
- Edit or delete a row

## Database

Connection string (in `appsettings.json`):

```
Server=localhost,1433;Database=PricingDB;User Id=sa;Password=SqlServer@12345;TrustServerCertificate=True;
```

`sqlcmd` is usually not installed on Windows. Inspect data through the container:

```bat
docker exec -it pricing-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P SqlServer@12345 -C
```

If that path is missing, try:

```bat
docker exec -it pricing-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P SqlServer@12345
```

Then:

```sql
USE PricingDB;
GO
SELECT * FROM PricingItems;
GO
```

You can also connect with SQL Server Management Studio or Azure Data Studio:

- Server: `localhost,1433`
- Login: `sa`
- Password: `SqlServer@12345`
- Database: `PricingDB`
- Table: `PricingItems`

## API

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/pricingitems` | List items (`search`, `category`, `minPrice`, `maxPrice` query params) |
| GET | `/pricingitems/{id}` | Get one item |
| POST | `/pricingitems` | Create item (`productName`, `category`, `cost`, `targetMargin`) |
| PUT | `/pricingitems/{id}` | Update item |
| DELETE | `/pricingitems/{id}` | Delete item |

Example create body:

```json
{
  "productName": "Widget",
  "category": "Hardware",
  "cost": 80,
  "targetMargin": 20
}
```

## Project layout

```
Controllers/          Pricing page and JSON API
Data/                 EF Core DbContext
Models/               PricingItem and request models
PythonPricing/        pricing.py sell-price calculator
Serivces/             Calls Python from .NET
Views/Pricing/        Pricing table UI
wwwroot/              CSS and JavaScript
```
