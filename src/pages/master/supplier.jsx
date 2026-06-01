import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Supplier = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_person_name: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    bank_name: "",
    account_no: "",
    account_type: "",
    swift_code: "",
    micr_no: "",
    ifsc_code: "",
  });

  // ================= FETCH =================
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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      supplier_name: "",
      contact_person_name: "",
      phone: "",
      email: "",
      address: "",
      state: "",
      city: "",
      pincode: "",
      bank_name: "",
      account_no: "",
      account_type: "",
      swift_code: "",
      micr_no: "",
      ifsc_code: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      supplier_name: item.supplier_name || "",
      contact_person_name: item.contact_person_name || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      state: item.state || "",
      city: item.city || "",
      pincode: item.pincode || "",
      bank_name: item.bank_name || "",
      account_no: item.account_no || "",
      account_type: item.account_type || "",
      swift_code: item.swift_code || "",
      micr_no: item.micr_no || "",
      ifsc_code: item.ifsc_code || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`${API_URL}/api/suppliers/update/${editId}`, formData, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        alert("Supplier Updated");
      } else {
        await axios.post(`${API_URL}/api/suppliers/create`, formData, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        alert("Supplier Created");
      }

      fetchSuppliers();
      resetForm();
    } catch (err) {
      console.log(err);
      alert("Error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete supplier?")) return;

    await axios.delete(`${API_URL}/api/suppliers/delete/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    fetchSuppliers();
  };

  return (
    <div className="container py-4">

      {/* ================= HEADER ================= */}
      {!showForm && (
        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0 fw-bold">Supplier Management</h2>
              <small className="text-muted">
                Manage suppliers with complete bank details
              </small>
            </div>

            <button
              className="btn btn-primary px-4"
              onClick={() => setShowForm(true)}
            >
              + Add Supplier
            </button>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!showForm && (
        <div className="card shadow border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((item) => (
                  <tr key={item.id}>
                    <td className="text-muted">{item.id}</td>
                    <td className="fw-bold">{item.supplier_name}</td>
                    <td>{item.contact_person_name}</td>
                    <td>{item.phone}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {item.city}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="card shadow-lg border-0">

          <div className="card-header bg-white d-flex justify-content-between">
            <h4 className="mb-0">
              {editId ? "Update Supplier" : "Create Supplier"}
            </h4>

            <button className="btn btn-outline-secondary btn-sm" onClick={resetForm}>
              Back
            </button>
          </div>

          <div className="card-body">

            <form onSubmit={handleSubmit}>

              {/* BASIC */}
              <div className="p-3 border rounded mb-3">
                <h6 className="text-primary fw-bold mb-3">
                  Basic Details
                </h6>

                <div className="row">
                  {[
                    "supplier_name",
                    "contact_person_name",
                    "phone",
                    "email",
                    "state",
                    "city",
                    "pincode",
                  ].map((key) => (
                    <div className="col-md-3 mb-3" key={key}>
                      <label className="form-label text-capitalize">
                        {key.replaceAll("_", " ")}
                      </label>
                      <input
                        name={key}
                        className="form-control"
                        value={formData[key]}
                        onChange={handleChange}
                      />
                    </div>
                  ))}

                  <div className="col-md-12">
                    <label>Address</label>
                    <textarea
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* BANK */}
              <div className="p-3 border rounded mb-3">
                <h6 className="text-success fw-bold mb-3">
                  Bank Details
                </h6>

                <div className="row">
                  {[
                    "bank_name",
                    "account_no",
                    "account_type",
                    "ifsc_code",
                    "swift_code",
                    "micr_no",
                  ].map((key) => (
                    <div className="col-md-3 mb-3" key={key}>
                      <label className="form-label text-capitalize">
                        {key.replaceAll("_", " ")}
                      </label>
                      <input
                        name={key}
                        className="form-control"
                        value={formData[key]}
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-success px-4">
                {editId ? "Update Supplier" : "Save Supplier"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Supplier;