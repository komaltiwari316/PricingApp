import { useEffect, useMemo, useState } from "react";
import { deleteItem, getItems } from "../api.js";
import { formatDate, money } from "../format.js";
import ProductModal from "./ProductModal.jsx";

const emptyFilters = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: ""
};

export default function PricingPage() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  function refresh() {
    setReloadToken((value) => value + 1);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [filtered, all] = await Promise.all([
          getItems(filters),
          getItems()
        ]);

        if (!cancelled) {
          setItems(filtered);
          setAllItems(all);
        }
      } catch (error) {
        if (!cancelled) {
          setAlert({ type: "danger", message: error.message });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters, reloadToken]);

  const categories = useMemo(
    () =>
      [...new Set(allItems.map((item) => item.category).filter(Boolean))].sort(),
    [allItems]
  );

  const stats = useMemo(() => {
    const source = items;
    const count = source.length;
    const averageMargin =
      count === 0
        ? 0
        : source.reduce((sum, item) => sum + Number(item.marginPercent), 0) / count;
    const averagePrice =
      count === 0
        ? 0
        : source.reduce((sum, item) => sum + Number(item.price), 0) / count;
    const totalValue = source.reduce((sum, item) => sum + Number(item.price), 0);

    return { count, averageMargin, averagePrice, totalValue };
  }, [items]);

  function updateDraft(event) {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setAlert(null);
    setFilters({ ...draftFilters, search: draftFilters.search.trim() });
  }

  function resetFilters() {
    setAlert(null);
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setModalOpen(true);
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.productName}"?`)) {
      return;
    }

    try {
      await deleteItem(item.id);
      refresh();
    } catch (error) {
      setAlert({ type: "danger", message: error.message });
    }
  }

  return (
    <section className="pricing-page">
      <div className="page-header">
        <h1>Pricing Table</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add product
        </button>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Products</span>
          <strong>{stats.count}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Average margin</span>
          <strong>{stats.averageMargin.toFixed(2)}%</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Average price</span>
          <strong>{money(stats.averagePrice)}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Catalog value</span>
          <strong>{money(stats.totalValue)}</strong>
        </article>
      </div>

      <div className="panel">
        <form className="filters" onSubmit={applyFilters}>
          <div className="field grow">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              name="search"
              type="search"
              className="form-control"
              placeholder="Product name"
              value={draftFilters.search}
              onChange={updateDraft}
            />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={draftFilters.category}
              onChange={updateDraft}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="minPrice">Min price</label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={draftFilters.minPrice}
              onChange={updateDraft}
            />
          </div>
          <div className="field">
            <label htmlFor="maxPrice">Max price</label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={draftFilters.maxPrice}
              onChange={updateDraft}
            />
          </div>
          <div className="filter-actions">
            <button type="submit" className="btn btn-dark">
              Filter
            </button>
            <button type="button" className="btn btn-outline" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </form>

        {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

        <div className="table-wrap">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className="num">Cost</th>
                <th className="num">Margin</th>
                <th className="num">Price</th>
                <th>Effective</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="empty-row">
                  <td colSpan="8">Loading products...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="8">No products yet. Add one to calculate a sell price.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-name">{item.productName}</div>
                    </td>
                    <td>
                      <span className="chip">{item.category}</span>
                    </td>
                    <td className="num">{money(item.cost)}</td>
                    <td className="num">{Number(item.marginPercent).toFixed(2)}%</td>
                    <td className="num price">{money(item.price)}</td>
                    <td>{formatDate(item.effectiveDate)}</td>
                    <td>
                      <span className={`status ${item.isActive ? "active" : "inactive"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="actions">
                      <button type="button" className="link-btn" onClick={() => openEdit(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link-btn danger"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          item={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={refresh}
        />
      )}
    </section>
  );
}
