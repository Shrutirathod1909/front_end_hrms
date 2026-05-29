import axios from "axios";
import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  InputGroup,
} from "react-bootstrap";

import {
  FaUsers,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaChartBar,
  FaSearch,
  FaRedo,
  FaFileInvoiceDollar,
  FaWallet,
  FaBook,
  FaBuilding,
  FaCodeBranch,
  FaCalendar,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// import "./Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [branch, setBranch] = useState("");
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    totalSites: 0,
    totalEmployees: 0,
    workingEmployees: 0,
    leftEmployees: 0,
  });
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // CLIENT API
      const clientRes = await axios.get(`${API_URL}/api/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const clients = clientRes.data.data || [];

      const totalClients = clients.length;

      const totalSites = clients.reduce(
        (sum, client) => sum + (client.totalSites || 0),
        0,
      );

      // EMPLOYEE API
      const employeeRes = await axios.get(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const employees = employeeRes.data.data || employeeRes.data || [];

      const totalEmployees = employees.length;

      const workingEmployees = employees.filter(
        (emp) => emp.status === "Working",
      ).length;

      const leftEmployees = employees.filter(
        (emp) => emp.status === "Left" || emp.status === "Terminated",
      ).length;

      setDashboardData({
        totalClients,
        totalSites,
        totalEmployees,
        workingEmployees,
        leftEmployees,
      });
    } catch (error) {
      console.error("Dashboard API Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/companies`);
        setCompanies(res.data);
        // console.log(res.data)
      } catch (err) {
        console.error("Error fetching companies", err);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (company) {
      const fetchBranches = async () => {
        try {
          const res = await axios.get(
            `${API_URL}/api/branches/by-company/${company}`,
          );
          setBranches(res.data);
        } catch (err) {
          console.error("Error fetching branches", err);
        }
      };
      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
          company,
          branch,
        },
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // console.log({ email, password, company, branch })
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid credentials.");
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!user) {
    return <p className="loading-text">Unauthorized. Please login.</p>;
  }

  /* ADMIN ROLES */
  const adminRoles = ["Admin", "SuperAdmin", "Super Admin"];

  const isAdmin = adminRoles.includes(user.role);

  return (
    <div className="dashboard-page">
      {/* ===============================
            ADMIN DASHBOARD
      =============================== */}

      {isAdmin ? (
        <>
          {/* TOP FILTERS */}
          <div className="top-filter-card">
            <h2 className="dashboard-title">Dashboard</h2>
            <Row className="g-3 align-items-end flex-nowrap dashboard-filter-row">
              {/* COMPANY */}
              <Col xl={3} lg={3} md={6}>
                <Form.Group>
                  <Form.Label>Company</Form.Label>

                  <InputGroup>
                    <InputGroup.Text>
                      <FaBuilding className="text-secondary" />
                    </InputGroup.Text>

                    <Form.Select
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        setBranch("");
                      }}
                      className="custom-select2"
                    >
                      <option value="">Select Company</option>

                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company_name}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* BRANCH */}
              <Col xl={2} lg={3} md={6}>
                <Form.Group>
                  <Form.Label>Branch</Form.Label>

                  <InputGroup>
                    <InputGroup.Text>
                      <FaCodeBranch className="text-secondary" />
                    </InputGroup.Text>

                    <Form.Select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={!company}
                      className="custom-select2"
                    >
                      <option value="">Select Branch</option>

                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.branch_name}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* MONTH */}
              <Col xl={2} lg={2} md={6}>
                <Form.Group>
                  <Form.Label>Month</Form.Label>

                  <InputGroup>
                    <InputGroup.Text>
                      <FaCalendar className="text-secondary" />
                    </InputGroup.Text>

                    <Form.Select className="custom-select2">
                      <option>January</option>
                      <option>February</option>
                      <option>March</option>
                      <option>April</option>
                      <option>May</option>
                      <option>June</option>
                      <option>July</option>
                      <option>August</option>
                      <option>September</option>
                      <option>October</option>
                      <option>November</option>
                      <option>December</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* YEAR */}
              <Col xl={2} lg={2} md={6}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>

                  <InputGroup>
                    <InputGroup.Text>
                      <FaCalendarAlt className="text-secondary" />
                    </InputGroup.Text>

                    <Form.Select className="custom-select2">
                      <option>2026</option>
                      <option>2025</option>
                      <option>2024</option>
                      <option>2023</option>
                      <option>2022</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xl={3} lg={3} md={12}>
                <Form.Label className="d-block opacity-0">Action</Form.Label>

                <div className="d-flex gap-2 align-items-stretch">
                  <Button
                    variant="primary"
                    className="d-flex align-items-center justify-content-center fs-6"
                    style={{ height: "35px", width: "100px", fontSize: "13px" }}
                  >
                    <FaSearch className="me-0" size={12} />
                    Search
                  </Button>

                  <Button
                    variant="secondary"
                    className="d-flex align-items-center justify-content-center fs-6"
                    style={{ height: "35px", width: "100px", fontSize: "13px" }}
                  >
                    <FaRedo className="me-1" size={12} />
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>{" "}
          </div>

          {/* TOP STATS */}
          <Row className="g-4 mt-1">
            <Col lg={3} md={6}>
              <Card className="stat-card billing-card">
                <h2>
                  <span className="text-success">
                    {dashboardData.totalClients}
                  </span>{" "}
                  / {dashboardData.totalSites}
                </h2>

                <p>Total Client / Locations</p>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="stat-card billing-card">
                <h2>0/0</h2>

                <p>Total Billing Amount</p>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="stat-card payment-card">
                <h2>0</h2>
                <p>Total Payment Received</p>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="stat-card outstanding-card">
                <h2>0.00</h2>
                <p>Outstandings</p>
              </Card>
            </Col>
          </Row>

          {/* QUICK ACTIONS */}
          <Row className=" mt-1">
            <Col lg={2} md={6}>
              <Card className="quick-card p-3">
                <h4>Wages</h4>
              </Card>
            </Col>

            <Col lg={2} md={6}>
              <Card className="quick-card p-3">
                <h4>Bank TRF</h4>
              </Card>
            </Col>

            <Col lg={2} md={6}>
              <Card className="quick-card p-3">
                <h4>All Pay Slip</h4>
              </Card>
            </Col>

            <Col lg={2} md={6}>
              <Card className="quick-card p-3">
                <h4>Salary</h4>
              </Card>
            </Col>

            <Col lg={2} md={6}>
              <Card className="quick-card p-3">
                <h4>MIS</h4>
              </Card>
            </Col>

            <Col lg={2} md={6}>
              <Card className="quick-card p-3">
                <h4>Ledger</h4>
              </Card>
            </Col>
          </Row>

          {/* EMPLOYEE STATS */}
          <Card className="employee-summary-card mt-4">
            <Row className="g-4 text-center">
              <Col md={3}>
                <div className="summary-box">
                  <h3>{dashboardData.totalEmployees}</h3>
                  <p>Total Employee</p>
                </div>
              </Col>

              <Col md={3}>
                <div className="summary-box">
                  <h3>
                    1 <span>/ 0</span>
                  </h3>

                  <p>AADHAR Uploaded / Pending</p>
                </div>
              </Col>

              <Col md={3}>
                <div className="summary-box">
                  <h3>
                    1 <span>/ 0</span>
                  </h3>

                  <p>PAN Uploaded / Pending</p>
                </div>
              </Col>

              <Col md={3}>
                <div className="summary-box">
                  <h3>
                    0 <span>/ 1</span>
                  </h3>

                  <p>Bank Details Uploaded / Pending</p>
                </div>
              </Col>
            </Row>
          </Card>

          {/* BOTTOM TABLES */}
          <Row className="g-4 mt-2">
            <Col lg={8}>
              <Card className="table-card">
                <div className="table-header">
                  <h4>Attendance Count Report</h4>

                  <Button className="download-btn">Download</Button>
                </div>

                <Table responsive bordered hover>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Date</th>
                      <th>Present Staff</th>
                      <th>Absent Staff</th>
                      <th>Total Staff</th>
                      <th>Portal Staff</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td colSpan="6" className="text-center">
                        No data available for today
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="upload-card">
                <h4>Upload Today's Attendance</h4>

                <p className="mt-3">Upload Bulk Data (CSV only)</p>

                <Form.Control type="file" />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        /* ===============================
                USER DASHBOARD
        =============================== */

        <>
          <div className="user-dashboard-header">
            <h2>Welcome, {user.name}</h2>

            <p>
              Role : <span>{user.role}</span>
            </p>
          </div>

          <Row className="g-4 mt-2">
            <Col md={4}>
              <Card className="user-card">
                <FaClipboardCheck className="user-icon" />

                <h4>My Attendance</h4>

                <p>Check your attendance</p>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="user-card">
                <FaWallet className="user-icon" />

                <h4>Salary Slip</h4>

                <p>View salary details</p>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="user-card">
                <FaUsers className="user-icon" />

                <h4>Profile</h4>

                <p>Manage your profile</p>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
