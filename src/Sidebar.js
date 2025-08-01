/*eslint-disable*/
import React from "react";
import { useLocation } from "react-router-dom"; 
import { 
  FaTachometerAlt, 
  FaBoxOpen, 
  FaList, 
  FaWarehouse, 
  FaShoppingCart, 
  FaUsers, 

} from "react-icons/fa";
import "./Sidebar.css";
import logo from "../src/images/logo.png";

export default function Sidebar() {
  const location = useLocation();

  const routes = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Products", path: "/products", icon: <FaBoxOpen /> },
    { name: "Categories", path: "/categories", icon: <FaList /> },
    // { name: "Inventory", path: "/inventory", icon: <FaWarehouse /> },
    { name: "Orders", path: "/orders", icon: <FaShoppingCart /> },
    { name: "Customers", path: "/customers", icon: <FaUsers /> },

  ];
  
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
      <img
          src={logo}
          alt="Admin Logo"
          style={{ width: "100%", padding: "20px", objectFit: "contain" }}
        />
      </div>
      <div className="sidebar-links">
        {routes.map((route, index) => (
          <div
            key={index}
            className={`sidebar-link ${
              location.pathname === route.path ? "active" : ""
            }`}
            onClick={() => (window.location.href = route.path)}
          >
            <span className="sidebar-icon">{route.icon}</span>
            <span className="sidebar-text">{route.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
