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

  // ✅ FIXED FIELD NAMES (MATCH BACKEND)
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_person_name: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
  });

  // ================= GET =================
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/suppliers`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setSuppliers(response.data.data || []);
    } catch (error) {
      console.log("GET ERROR:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ================= CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("FORM DATA:", formData);

      if (editId) {
        await axios.put(
          `${API_URL}/api/suppliers/update/${editId}`,
          formData,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        alert("Supplier Updated Successfully");
      } else {
        await axios.post(
          `${API_URL}/api/suppliers/create`,
          formData,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        alert("Supplier Created Successfully");
      }

      fetchSuppliers();
      resetForm();
    } catch (error) {
      console.log("SUBMIT ERROR:", error.response?.data || error.message);
      alert("Something went wrong");
    }
  };

  // ================= RESET =================
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
    });

    setEditId(null);
    setShowForm(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure want to delete?")) return;

    try {
      await axios.delete(`${API_URL}/api/suppliers/delete/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      alert("Supplier Deleted Successfully");
      fetchSuppliers();
    } catch (error) {
      console.log("DELETE ERROR:", error.response?.data || error.message);
      alert("Delete Failed");
    }
  };

  // ================= EDIT =================
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
    });

    setShowForm(true);
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* LIST PAGE */}
      {!showForm && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">
              Supplier Management
              <span className="text-primary ms-2">
                ({suppliers.length})
              </span>
            </h2>

            <button
              className="btn btn-primary px-4"
              onClick={() => setShowForm(true)}
            >
              + Create New
            </button>
          </div>

          <div className="card shadow p-3">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Supplier</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.supplier_name}</td>
                    <td>{item.contact_person_name}</td>
                    <td>{item.phone}</td>
                    <td>{item.email}</td>
                    <td>{item.city}</td>

                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
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
        </>
      )}

      {/* FORM PAGE */}
      {showForm && (
        <div className="card shadow p-4">

          <div className="d-flex justify-content-between mb-3">
            <h3>{editId ? "Update Supplier" : "Create Supplier"}</h3>
            <button className="btn btn-secondary" onClick={resetForm}>
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">

              <div className="col-md-3 mb-2">
                <input
                  name="supplier_name"
                  placeholder="Supplier Name"
                  className="form-control"
                  value={formData.supplier_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  name="contact_person_name"
                  placeholder="Contact Person"
                  className="form-control"
                  value={formData.contact_person_name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  name="phone"
                  placeholder="Phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  name="email"
                  placeholder="Email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  name="state"
                  placeholder="State"
                  className="form-control"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  name="city"
                  placeholder="City"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  name="pincode"
                  placeholder="Pincode"
                  className="form-control"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-2">
                <textarea
                  name="address"
                  placeholder="Address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button className="btn btn-success mt-3">
              {editId ? "Update" : "Save"}
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default Supplier;