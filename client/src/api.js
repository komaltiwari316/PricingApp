const API = "/pricingitems";

async function readError(response) {
  const data = await response.json().catch(() => ({}));
  return data.error || data.message || "Request failed.";
}

export async function getItems(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

  const query = params.toString();
  const response = await fetch(query ? `${API}?${query}` : API);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function saveItem(payload, id) {
  const response = await fetch(id ? `${API}/${id}` : API, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function deleteItem(id) {
  const response = await fetch(`${API}/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 204) {
    throw new Error(await readError(response));
  }
}
