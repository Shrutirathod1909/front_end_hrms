import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import {
  FaTachometerAlt,
  FaThLarge,
  FaLayerGroup,
  FaUser,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaTicketAlt,
  FaChartBar,
  FaPlus,
  FaClipboard,
  FaStore,
  FaEnvelopeOpenText,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import logo from "../assets/images/ods_logo.jpeg";
import "./Sidebar.css";

const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar }) => {
  const moduleIcons = {
    Master: <FaLayerGroup />,
    "Add New": <FaPlus />,
    Employee: <FaUser />,
    Attendance: <FaCalendarCheck />,
    Billing: <FaFileInvoiceDollar />,
    Salary: <FaMoneyBillWave />,
    Vouchers: <FaTicketAlt />,
    "Work Order": <FaClipboard />,
    Vendor: <FaStore />,
    "Raise Ticket": <FaEnvelopeOpenText />,
    Reports: <FaChartBar />,
  };

  const [menuItems, setMenuItems] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found.");
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(
          `${API_URL}/api/permissions/mymenu`,
          config,
        );

        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else setError("Failed to load.");
        console.error("Failed to fetch menu:", err);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  return (
    <nav
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
    >
      <div className="sidebar-header">
        {!isCollapsed ? (
          <div className="ods-u-shield">
            <h2>ODS</h2>

            <span>PROTECTIVE SERVICES</span>
            <span>PVT LTD</span>
          </div>
        ) : (
          <div className="sidebar-header">
            <img
              src={logo}
              alt="Logo"
              className={`sidebar-logo ${isCollapsed ? "small" : "large"}`}
            />
          </div>
        )}
      </div>

      <ul className="menu-list">
        {loading && <li className="loading-text">Loading Menu...</li>}
        {error && <li className="error-text">{error}</li>}

        {/* Dashboard link */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
            onClick={() => isMobileOpen && closeSidebar()}
            end
          >
            <FaTachometerAlt className="menu-icon" />
            {!isCollapsed && <span className="menu-text">Dashboard</span>}
          </NavLink>
        </li>

        {/* Dynamic modules with dropdowns */}
     {/* Dynamic modules with dropdowns */}
{menuItems.map((module) => {
  const isMasterModule = module.moduleName === "Master";

  return (
    <li key={module.moduleName}>
      <div
        className="menu-link clickable"
        onClick={() => toggleModule(module.moduleName)}
      >
        <span className="menu-icon">
          {moduleIcons[module.moduleName] || <FaThLarge />}
        </span>

        {!isCollapsed && (
          <>
            <span className="menu-text">
              {module.moduleName}
            </span>

            <span className="dropdown-icon">
              {expandedModules[module.moduleName] ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </span>
          </>
        )}
      </div>

      {/* Submodules */}
     {expandedModules[module.moduleName] &&
  !isCollapsed && (
          <ul className="submenu-list">

            {/* Static Product */}
            {isMasterModule && (
              <>
                <li>
                  <NavLink
                    to="/master/product"
                    className={({ isActive }) =>
                      isActive
                        ? "submenu-link active"
                        : "submenu-link"
                    }
                    style={{ textDecoration: "none" }}
                  >
                    Product
                  </NavLink>
                </li>
<li>
                  <NavLink
                    to="/master/purchase-orders"
                    className={({ isActive }) =>
                      isActive
                        ? "submenu-link active"
                        : "submenu-link"
                    }
                    style={{ textDecoration: "none" }}
                  >
                    Purchase-Orders
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/master/supplier"
                    className={({ isActive }) =>
                      isActive
                        ? "submenu-link active"
                        : "submenu-link"
                    }
                    style={{ textDecoration: "none" }}
                  >
                    Supplier
                  </NavLink>
                </li>
              </>
            )}

            {/* API Submodules */}
            {module.submodules.map((sub) => (
              <li key={sub.moduleId}>
                <NavLink
                  to={`/${module.moduleName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}/${sub.moduleName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className={({ isActive }) =>
                    isActive
                      ? "submenu-link active"
                      : "submenu-link"
                  }
                  onClick={() =>
                    isMobileOpen && closeSidebar()
                  }
                  style={{ textDecoration: "none" }}
                >
                  {sub.moduleName}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
    </li>
  );
})}  
      </ul>
    </nav>
  );
};

export default Sidebar;
