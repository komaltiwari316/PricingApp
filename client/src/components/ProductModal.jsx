import { useState } from "react";
import { saveItem } from "../api.js";
import { previewPrice } from "../format.js";

const emptyForm = {
  productName: "",
  category: "",
  cost: "",
  targetMargin: ""
};

export default function ProductModal({ item, categories, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState(
    item
      ? {
          productName: item.productName,
          category: item.category,
          cost: String(item.cost),
          targetMargin: String(item.marginPercent)
        }
      : emptyForm
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await saveItem(
        {
          productName: form.productName.trim(),
          category: form.category.trim(),
          cost: Number(form.cost),
          targetMargin: Number(form.targetMargin)
        },
        item?.id
      );
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>{isEdit ? "Edit product" : "Add product"}</h2>
            <button type="button" className="icon-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <div className="modal-body">
            <label className="form-label" htmlFor="productName">
              Product name
            </label>
            <input
              id="productName"
              name="productName"
              className="form-control"
              maxLength="200"
              required
              value={form.productName}
              onChange={updateField}
            />

            <label className="form-label" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              name="category"
              className="form-control"
              maxLength="100"
              required
              list="categoryOptions"
              value={form.category}
              onChange={updateField}
            />
            <datalist id="categoryOptions">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>

            <div className="form-row">
              <div>
                <label className="form-label" htmlFor="cost">
                  Cost
                </label>
                <input
                  id="cost"
                  name="cost"
                  className="form-control"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.cost}
                  onChange={updateField}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="targetMargin">
                  Target margin (%)
                </label>
                <input
                  id="targetMargin"
                  name="targetMargin"
                  className="form-control"
                  type="number"
                  min="0"
                  max="99.99"
                  step="0.01"
                  required
                  value={form.targetMargin}
                  onChange={updateField}
                />
              </div>
            </div>

            <div className="preview-box">
              <span>Calculated sell price</span>
              <strong>{previewPrice(form.cost, form.targetMargin)}</strong>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update product"
                  : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
