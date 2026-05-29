import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const PurchaseOrder = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    po_number: "",
    supplier_name: "",
    product_name: "",
    quantity: "",
    purchase_price: "",
    total_amount: "",
    order_date: "",
    status: "Pending",
  });

  // ================= FETCH =================
  const fetchPurchaseOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/purchase-orders`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      setPurchaseOrders(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/suppliers`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      setSuppliers(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      setProducts(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchProducts();
  }, []);

  // ================= FILTER =================
  const filtered = useMemo(() => {
    return purchaseOrders.filter((p) =>
      `${p.po_number} ${p.supplier_name} ${p.product_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [purchaseOrders, search]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };

    if (e.target.name === "quantity" || e.target.name === "purchase_price") {
      const qty =
        e.target.name === "quantity" ? e.target.value : formData.quantity;

      const price =
        e.target.name === "purchase_price"
          ? e.target.value
          : formData.purchase_price;

      updated.total_amount = Number(qty || 0) * Number(price || 0);
    }

    setFormData(updated);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(
          `${API_URL}/api/purchase-orders/update/${editId}`,
          formData,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
      } else {
        await axios.post(
          `${API_URL}/api/purchase-orders/create`,
          formData,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
      }

      fetchPurchaseOrders();
      resetForm();
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
    setFormData({
      po_number: "",
      supplier_name: "",
      product_name: "",
      quantity: "",
      purchase_price: "",
      total_amount: "",
      order_date: "",
      status: "Pending",
    });

    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;

    await axios.delete(`${API_URL}/api/purchase-orders/delete/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    fetchPurchaseOrders();
  };

  return (
    <div className="container-fluid py-3 bg-light min-vh-100">

      {/* ================= LIST ================= */}
      {!showForm && (
        <>
          {/* HEADER */}
          <div className="bg-white p-3 rounded shadow-sm mb-3">

            <div className="d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0">Purchase Orders</h4>

              <button
                className="btn btn-dark btn-sm px-3"
                onClick={() => setShowForm(true)}
              >
                + New
              </button>
            </div>

            {/* SEARCH FULL WIDTH */}
            <div className="mt-3">
              <input
                className="form-control"
                placeholder="Search PO / Supplier / Product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                list="poList"
              />

              <datalist id="poList">
                {purchaseOrders.map((p) => (
                  <option key={p.id} value={p.po_number} />
                ))}
              </datalist>
            </div>

            {/* COUNT SMALL CARD */}
            <div className="mt-3">
              <div className="bg-light border rounded px-3 py-1 d-inline-block">
                <small>Total: </small>
                <strong>{filtered.length}</strong>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>PO</th>
                    <th>Supplier</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.po_number}</td>
                        <td>{p.supplier_name}</td>
                        <td>{p.product_name}</td>
                        <td>{p.quantity}</td>
                        <td>₹{p.total_amount}</td>
                        <td>{p.status}</td>
                        <td>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEdit(p)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="d-flex justify-content-between mb-3">
            <h5>{editId ? "Update" : "Create"} Purchase Order</h5>

            <button className="btn btn-outline-dark btn-sm" onClick={resetForm}>
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-2">

              <div className="col-md-4">
                <input
                  className="form-control"
                  name="po_number"
                  placeholder="PO Number"
                  value={formData.po_number}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <select
                  className="form-control"
                  name="supplier_name"
                  onChange={handleChange}
                  value={formData.supplier_name}
                >
                  <option>Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id}>{s.supplier_name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <select
                  className="form-control"
                  name="product_name"
                  onChange={handleChange}
                  value={formData.product_name}
                >
                  <option>Select Product</option>
                  {products.map((p) => (
                    <option key={p.id}>{p.product_name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <input
                  className="form-control"
                  name="quantity"
                  placeholder="Qty"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <input
                  className="form-control"
                  name="purchase_price"
                  placeholder="Price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <input
                  className="form-control bg-light"
                  name="total_amount"
                  value={formData.total_amount}
                  readOnly
                />
              </div>

              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="btn btn-dark mt-3">
              {editId ? "Update" : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;