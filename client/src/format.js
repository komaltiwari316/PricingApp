export function money(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function previewPrice(cost, margin) {
  const parsedCost = Number(cost);
  const parsedMargin = Number(margin);

  if (parsedCost > 0 && parsedMargin >= 0 && parsedMargin < 100) {
    return money(parsedCost / (1 - parsedMargin / 100));
  }

  return "$0.00";
}
