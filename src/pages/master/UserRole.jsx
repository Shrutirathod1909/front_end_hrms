import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Dropdown,
} from "react-bootstrap";
import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrashAlt,
  FaEllipsisV,
} from "react-icons/fa";

const UserRole = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [search, setSearch] = useState("");

  const [roleName, setRoleName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  };

  // ================= FETCH ROLES =================
  const fetchRoles = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/roles`,
        getAuthHeaders(),
      );

      setRoles(response.data || []);
    } catch (err) {
      console.log(err);

      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ================= SAVE ROLE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      alert("Role Name is required");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/roles/${editingId}`,
          {
            role_name: roleName,
          },
          getAuthHeaders(),
        );
      } else {
        await axios.post(
          `${API_URL}/api/roles`,
          {
            role_name: roleName,
          },
          getAuthHeaders(),
        );
      }

      resetForm();
      fetchRoles();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (role) => {
    setEditingId(role.id);
    setRoleName(role.role_name);
    setShowForm(true);
    setShowSearch(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await axios.delete(`${API_URL}/api/roles/${id}`, getAuthHeaders());
      alert("Role deleted successfully");

      fetchRoles();
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setRoleName("");
    setEditingId(null);
    setShowForm(false);
  };

  // ================= FILTER =================
  const filteredRoles = roles.filter((item) =>
    item.role_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <h1 className="page-title">
          Role Master{" "}
          <span className="text-success">({filteredRoles.length})</span>
        </h1>

        <div className="page-actions">
          <button
            className="search-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch /> {showSearch ? "Hide Search" : "Search"}
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
              setShowSearch(false);
            }}
          >
            <FaPlus /> Create New
          </button>
        </div>
      </div>

      {/* SEARCH */}
      {showSearch && (
        <Card className="mb-3 p-3">
          <Row>
            <Col md={4}>
              <Form.Control
                placeholder="Search Here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* FORM */}
      {showForm && (
        <Card className="p-4 mb-3">
          <h4 className="mb-4">{editingId ? "Edit Role" : "Create Role"}</h4>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role Name *</Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Enter Role Name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={resetForm}>
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                {editingId ? "Update Role" : "Save Role"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* TABLE */}
      {!showForm && (
        <Card>
          {loading ? (
            <Alert variant="warning" className="mb-0 text-center">
              Loading...
            </Alert>
          ) : error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
            <Table bordered hover responsive>
              <thead className="table-secondary">
                <tr>
                  <th width="80">Sr No.</th>
                  <th>Role Name</th>
                  <th width="120">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No roles found
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, index) => (
                    <tr key={role.id}>
                      <td>{index + 1}</td>

                      <td>{role.role_name}</td>

                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="secondary"
                            size="sm"
                            className="border-0 shadow-none"
                          >
                            Actions
                            {/* <FaEllipsisV /> */}
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(role)}>
                              <FaPen className="me-2 text-primary" />
                              Edit
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() => handleDelete(role.id)}
                            >
                              <FaTrashAlt className="me-2 text-danger" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
};

export default UserRole;
