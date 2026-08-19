import sys

cost = float(sys.argv[1])
margin = float(sys.argv[2])

if cost <= 0:
    raise ValueError("Cost must be greater than 0")

if margin < 0 or margin >= 100:
    raise ValueError("Margin must be between 0 and 99.99")

price = cost / (1 - margin / 100)

print(round(price, 2))