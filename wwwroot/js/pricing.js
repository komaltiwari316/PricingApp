(function () {
    const apiUrl = "/pricingitems";
    const tableBody = document.getElementById("pricingTableBody");
    const filterForm = document.getElementById("filterForm");
    const resetFilters = document.getElementById("resetFilters");
    const alertHost = document.getElementById("alertHost");
    const itemModalEl = document.getElementById("itemModal");
    const itemForm = document.getElementById("itemForm");
    const itemModalTitle = document.getElementById("itemModalTitle");
    const saveItemBtn = document.getElementById("saveItemBtn");
    const formError = document.getElementById("formError");
    const pricePreview = document.getElementById("pricePreview");
    const addItemBtn = document.getElementById("addItemBtn");

    if (!tableBody || !itemForm || !itemModalEl) {
        return;
    }

    const itemModal = new bootstrap.Modal(itemModalEl);
    const fields = {
        id: document.getElementById("itemId"),
        name: document.getElementById("productName"),
        category: document.getElementById("productCategory"),
        cost: document.getElementById("productCost"),
        margin: document.getElementById("productMargin")
    };

    function money(value) {
        const amount = Number(value);
        if (Number.isNaN(amount)) {
            return "$0.00";
        }
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    }

    function formatDate(value) {
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

    function showAlert(message, type) {
        alertHost.hidden = false;
        alertHost.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
    }

    function hideAlert() {
        alertHost.hidden = true;
        alertHost.innerHTML = "";
    }

    function calculatePreview() {
        const cost = Number(fields.cost.value);
        const margin = Number(fields.margin.value);

        if (cost > 0 && margin >= 0 && margin < 100) {
            pricePreview.textContent = money(cost / (1 - margin / 100));
            return;
        }

        pricePreview.textContent = "$0.00";
    }

    function resetForm() {
        itemForm.reset();
        fields.id.value = "";
        formError.hidden = true;
        formError.textContent = "";
        calculatePreview();
    }

    function openCreateModal() {
        resetForm();
        itemModalTitle.textContent = "Add product";
        saveItemBtn.textContent = "Save product";
        itemModal.show();
    }

    function openEditModal(button) {
        resetForm();
        fields.id.value = button.dataset.id;
        fields.name.value = button.dataset.name;
        fields.category.value = button.dataset.category;
        fields.cost.value = button.dataset.cost;
        fields.margin.value = button.dataset.margin;
        itemModalTitle.textContent = "Edit product";
        saveItemBtn.textContent = "Update product";
        calculatePreview();
        itemModal.show();
    }

    function renderRows(items) {
        if (!items || items.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="8">No products match these filters.</td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = items.map(function (item) {
            const status = item.isActive
                ? '<span class="status active">Active</span>'
                : '<span class="status inactive">Inactive</span>';

            return `
                <tr data-id="${item.id}">
                    <td><div class="product-name">${escapeHtml(item.productName)}</div></td>
                    <td><span class="chip">${escapeHtml(item.category)}</span></td>
                    <td class="num">${money(item.cost)}</td>
                    <td class="num">${Number(item.marginPercent).toFixed(2)}%</td>
                    <td class="num price">${money(item.price)}</td>
                    <td>${formatDate(item.effectiveDate)}</td>
                    <td>${status}</td>
                    <td class="actions">
                        <button type="button" class="link-btn edit-btn"
                            data-id="${item.id}"
                            data-name="${escapeAttribute(item.productName)}"
                            data-category="${escapeAttribute(item.category)}"
                            data-cost="${item.cost}"
                            data-margin="${item.marginPercent}">
                            Edit
                        </button>
                        <button type="button" class="link-btn danger delete-btn"
                            data-id="${item.id}"
                            data-name="${escapeAttribute(item.productName)}">
                            Delete
                        </button>
                    </td>
                </tr>`;
        }).join("");
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/'/g, "&#39;");
    }

    async function loadItems() {
        const params = new URLSearchParams();
        const search = document.getElementById("search").value.trim();
        const category = document.getElementById("category").value;
        const minPrice = document.getElementById("minPrice").value;
        const maxPrice = document.getElementById("maxPrice").value;

        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        const response = await fetch(`${apiUrl}?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Unable to load pricing items.");
        }

        const items = await response.json();
        renderRows(items);
    }

    async function saveItem(event) {
        event.preventDefault();
        formError.hidden = true;

        const payload = {
            productName: fields.name.value.trim(),
            category: fields.category.value.trim(),
            cost: Number(fields.cost.value),
            targetMargin: Number(fields.margin.value)
        };

        const id = fields.id.value;
        const isEdit = Boolean(id);
        saveItemBtn.disabled = true;
        saveItemBtn.textContent = isEdit ? "Updating..." : "Saving...";

        try {
            const response = await fetch(isEdit ? `${apiUrl}/${id}` : apiUrl, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(function () { return {}; });
                throw new Error(data.error || data.message || "Unable to save this product.");
            }

            itemModal.hide();
            window.location.reload();
        } catch (error) {
            formError.hidden = false;
            formError.textContent = error.message;
        } finally {
            saveItemBtn.disabled = false;
            saveItemBtn.textContent = isEdit ? "Update product" : "Save product";
        }
    }

    async function deleteItem(id, name) {
        if (!window.confirm(`Delete "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
            if (!response.ok && response.status !== 204) {
                throw new Error("Unable to delete this product.");
            }

            window.location.reload();
        } catch (error) {
            showAlert(error.message, "danger");
        }
    }

    addItemBtn.addEventListener("click", openCreateModal);
    fields.cost.addEventListener("input", calculatePreview);
    fields.margin.addEventListener("input", calculatePreview);
    itemForm.addEventListener("submit", saveItem);

    filterForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        hideAlert();
        try {
            await loadItems();
        } catch (error) {
            showAlert(error.message, "danger");
        }
    });

    resetFilters.addEventListener("click", async function () {
        filterForm.reset();
        hideAlert();
        try {
            await loadItems();
        } catch (error) {
            showAlert(error.message, "danger");
        }
    });

    tableBody.addEventListener("click", function (event) {
        const editBtn = event.target.closest(".edit-btn");
        if (editBtn) {
            openEditModal(editBtn);
            return;
        }

        const deleteBtn = event.target.closest(".delete-btn");
        if (deleteBtn) {
            deleteItem(deleteBtn.dataset.id, deleteBtn.dataset.name);
        }
    });
})();
