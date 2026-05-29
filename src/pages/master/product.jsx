import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Product = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [step, setStep] = useState(1);

  // SEARCH
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    supplier_name: "",
    product_name: "",
    sku_code: "",
    color: "#000000",
    height: "",
    width: "",
    length: "",
    gender: "",
    purchase_price: "",
    sale_price: "",
    status: "active",
  });

  // IMAGES
  const [images, setImages] = useState(
    Array(10).fill(null)
  );

  const [previewImages, setPreviewImages] =
    useState(Array(10).fill(null));

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products`,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      setProducts(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= FETCH SUPPLIERS =================
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/suppliers`,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      setSuppliers(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  // ================= FILTER PRODUCTS =================
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const text = `
        ${item.product_name}
        ${item.supplier_name}
        ${item.sku_code}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });
  }, [products, search]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];

    if (!file) return;

    const updatedImages = [...images];
    updatedImages[index] = file;

    setImages(updatedImages);

    const updatedPreview = [...previewImages];

    updatedPreview[index] =
      URL.createObjectURL(file);

    setPreviewImages(updatedPreview);
  };

  // ================= REMOVE IMAGE =================
  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages[index] = null;

    const updatedPreview = [...previewImages];
    updatedPreview[index] = null;

    setImages(updatedImages);
    setPreviewImages(updatedPreview);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasImage = previewImages.some(
      (img) => img !== null
    );

    if (!hasImage) {
      alert("Please upload at least 1 image");
      return;
    }

    try {
      const form = new FormData();

      Object.keys(formData).forEach(
        (key) => {
          form.append(key, formData[key]);
        }
      );

      images.forEach((img) => {
        if (img) {
          form.append("images", img);
        }
      });

      if (editId) {
        await axios.put(
          `${API_URL}/api/products/update/${editId}`,
          form,
          {
            headers: {
              Authorization: token
                ? `Bearer ${token}`
                : "",
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        alert("Updated Successfully");
      } else {
        await axios.post(
          `${API_URL}/api/products/create`,
          form,
          {
            headers: {
              Authorization: token
                ? `Bearer ${token}`
                : "",
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        alert("Created Successfully");
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      supplier_name: "",
      product_name: "",
      sku_code: "",
      color: "#000000",
      height: "",
      width: "",
      length: "",
      gender: "",
      purchase_price: "",
      sale_price: "",
      status: "active",
    });

    setImages(Array(10).fill(null));
    setPreviewImages(Array(10).fill(null));

    setEditId(null);
    setStep(1);
    setShowForm(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete Product?"))
      return;

    try {
      await axios.delete(
        `${API_URL}/api/products/delete/${id}`,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditId(item.id);

    setFormData({
      supplier_name:
        item.supplier_name || "",
      product_name:
        item.product_name || "",
      sku_code:
        item.sku_code || "",
      color:
        item.color || "#000000",
      height:
        item.height || "",
      width:
        item.width || "",
      length:
        item.length || "",
      gender:
        item.gender || "",
      purchase_price:
        item.purchase_price || "",
      sale_price:
        item.sale_price || "",
      status:
        item.status || "active",
    });

    const oldPreview =
      Array(10).fill(null);

    if (item.images) {
      item.images.forEach(
        (img, index) => {
          oldPreview[index] =
            `${API_URL}${img.image_path}`;
        }
      );
    }

    setPreviewImages(oldPreview);

    setShowForm(true);
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* ================= PRODUCT LIST ================= */}
      {!showForm && (
        <>
          {/* HEADER */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

              <div>
                <h3 className="fw-bold mb-1">
                  Product Management
                </h3>

                <small className="text-muted">
                  Manage all products
                </small>
              </div>

              <button
                className="btn btn-dark rounded-pill px-4"
                onClick={() =>
                  setShowForm(true)
                }
              >
                + Create Product
              </button>

            </div>

            {/* SEARCH */}
            <div className="mt-3">

              <div className="position-relative">

                <input
                  type="text"
                  className="form-control rounded-pill ps-5 py-3 shadow-sm"
                  placeholder="Search Product / Supplier / SKU..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  list="productSuggestions"
                />

                {/* SEARCH ICON */}
                <span
                  className="position-absolute"
                  style={{
                    left: "18px",
                    top: "14px",
                    fontSize: "18px",
                  }}
                >
                  🔍
                </span>

                {/* AUTO COMPLETE */}
                <datalist id="productSuggestions">

                  {products.map((item) => (
                    <option
                      key={item.id}
                      value={
                        item.product_name
                      }
                    />
                  ))}

                </datalist>

              </div>

            </div>

            {/* SMALL COUNT CARD */}
            <div className="mt-3">

              <div
                className="border rounded-4 bg-light px-3 py-2 d-inline-block"
                style={{
                  minWidth: "120px",
                }}
              >
                <h6 className="fw-bold mb-0">
                  {
                    filteredProducts.length
                  }
                </h6>

                <small className="text-muted">
                  Products
                </small>
              </div>

            </div>

          </div>

          {/* TABLE */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">

                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>SKU</th>
                    <th>Purchase</th>
                    <th>Sale</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.length >
                  0 ? (
                    filteredProducts.map(
                      (item) => (
                        <tr key={item.id}>

                          <td>
                            {item.id}
                          </td>

                          {/* IMAGE */}
                          <td>
                            {item.images &&
                            item.images.length >
                              0 ? (
                              <img
                                src={`${API_URL}${item.images[0].image_path}`}
                                alt=""
                                width="65"
                                height="65"
                                style={{
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "10px",
                                  border:
                                    "1px solid #ddd",
                                }}
                              />
                            ) : (
                              <span className="text-muted">
                                No Image
                              </span>
                            )}
                          </td>

                          <td className="fw-semibold">
                            {
                              item.product_name
                            }
                          </td>

                          <td>
                            {
                              item.supplier_name
                            }
                          </td>

                          <td>
                            {item.sku_code}
                          </td>

                          <td>
                            ₹
                            {
                              item.purchase_price
                            }
                          </td>

                          <td>
                            ₹
                            {
                              item.sale_price
                            }
                          </td>

                          <td>

                            <div className="d-flex gap-2">

                              <button
                                className="btn btn-warning btn-sm rounded-pill px-3"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-danger btn-sm rounded-pill px-3"
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-5"
                      >
                        No Products Found
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

        <div className="card border-0 shadow-sm rounded-4 p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>
              <h4 className="fw-bold mb-1">
                {editId
                  ? "Update Product"
                  : "Create Product"}
              </h4>

              <small className="text-muted">
                Fill product details
              </small>
            </div>

            <button
              className="btn btn-outline-dark rounded-pill px-4"
              onClick={resetForm}
            >
              Back
            </button>

          </div>

          {/* STEP */}
          <div className="d-flex gap-2 mb-4">

            <button
              type="button"
              className={`btn rounded-pill px-4 ${
                step === 1
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
              onClick={() =>
                setStep(1)
              }
            >
              Details
            </button>

            <button
              type="button"
              className={`btn rounded-pill px-4 ${
                step === 2
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
              onClick={() =>
                setStep(2)
              }
            >
              Images
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            {/* STEP 1 */}
            {step === 1 && (

              <div className="row g-3">

                {/* SUPPLIER */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Supplier
                  </label>

                  <select
                    name="supplier_name"
                    className="form-select rounded-3"
                    value={
                      formData.supplier_name
                    }
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Supplier
                    </option>

                    {suppliers.map((sup) => (
                      <option
                        key={sup.id}
                        value={
                          sup.supplier_name
                        }
                      >
                        {
                          sup.supplier_name
                        }
                      </option>
                    ))}

                  </select>
                </div>

                {/* PRODUCT */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="product_name"
                    className="form-control rounded-3"
                    value={
                      formData.product_name
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SKU */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    SKU Code
                  </label>

                  <input
                    type="text"
                    name="sku_code"
                    className="form-control rounded-3"
                    value={
                      formData.sku_code
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* COLOR */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Color
                  </label>

                  <input
                    type="color"
                    name="color"
                    className="form-control form-control-color w-100 rounded-3"
                    value={formData.color}
                    onChange={handleChange}
                    style={{
                      height: "45px",
                    }}
                  />
                </div>

                {/* HEIGHT */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Height
                  </label>

                  <input
                    type="text"
                    name="height"
                    className="form-control rounded-3"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>

                {/* WIDTH */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Width
                  </label>

                  <input
                    type="text"
                    name="width"
                    className="form-control rounded-3"
                    value={formData.width}
                    onChange={handleChange}
                  />
                </div>

                {/* LENGTH */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Length
                  </label>

                  <input
                    type="text"
                    name="length"
                    className="form-control rounded-3"
                    value={formData.length}
                    onChange={handleChange}
                  />
                </div>

                {/* GENDER */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Gender
                  </label>

                  <select
                    name="gender"
                    className="form-select rounded-3"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Both">
                      Both
                    </option>

                  </select>
                </div>

                {/* PURCHASE */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    name="purchase_price"
                    className="form-control rounded-3"
                    value={
                      formData.purchase_price
                    }
                    onChange={handleChange}
                  />
                </div>

                {/* SALE */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Sale Price
                  </label>

                  <input
                    type="number"
                    name="sale_price"
                    className="form-control rounded-3"
                    value={
                      formData.sale_price
                    }
                    onChange={handleChange}
                  />
                </div>

                {/* NEXT */}
                <div className="mt-3">

                  <button
                    type="button"
                    className="btn btn-dark rounded-pill px-5"
                    onClick={() =>
                      setStep(2)
                    }
                  >
                    Next
                  </button>

                </div>

              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (

              <>
                <div className="row">

                  {Array.from({
                    length: 10,
                  }).map((_, index) => (

                    <div
                      className="col-lg-2 col-md-3 col-6 mb-3"
                      key={index}
                    >

                      <div className="border rounded-4 p-2 bg-white">

                        {/* IMAGE BOX */}
                        <div
                          className="position-relative mb-2"
                          style={{
                            height: "110px",
                            borderRadius:
                              "10px",
                            overflow:
                              "hidden",
                            background:
                              "#f8f9fa",
                            border:
                              "1px solid #dee2e6",
                          }}
                        >

                          {previewImages[
                            index
                          ] ? (

                            <>
                              <img
                                src={
                                  previewImages[
                                    index
                                  ]
                                }
                                alt=""
                                className="w-100 h-100"
                                style={{
                                  objectFit:
                                    "cover",
                                }}
                              />

                              {/* REMOVE ICON */}
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "28px",
                                  height:
                                    "28px",
                                  fontSize:
                                    "12px",
                                  padding: 0,
                                }}
                                onClick={() =>
                                  removeImage(
                                    index
                                  )
                                }
                              >
                                ✕
                              </button>
                            </>

                          ) : (

                            <div className="d-flex flex-column align-items-center justify-content-center h-100">

                              <div
                                style={{
                                  fontSize:
                                    "28px",
                                }}
                              >
                                🖼️
                              </div>

                              <small className="text-muted">
                                Upload
                              </small>

                            </div>

                          )}

                        </div>

                        {/* FILE */}
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          onChange={(e) =>
                            handleImageChange(
                              e,
                              index
                            )
                          }
                        />

                      </div>

                    </div>
                  ))}

                </div>

                {/* BUTTONS */}
                <div className="d-flex gap-2 mt-3">

                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    Previous
                  </button>

                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-5"
                  >
                    {editId
                      ? "Update Product"
                      : "Save Product"}
                  </button>

                </div>

              </>
            )}

          </form>

        </div>
      )}

    </div>
  );
};

export default Product;