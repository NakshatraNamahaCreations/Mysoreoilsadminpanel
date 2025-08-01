import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const [showDropdown, setShowDropdown] = useState(false);

  // Hide Header on Login Page
  if (location.pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="d-flex justify-content-between align-items-center p-3 shadow-sm" style={{ backgroundColor: "", color: "black" }}>
      <h4>Admin Panel</h4>
      <div className="position-relative">
        <FaUserCircle
          size={35}
          className="me-2"
          style={{ cursor: "pointer" }}
          onClick={() => setShowDropdown(!showDropdown)}
        />
        {showDropdown && (
          <div
            className="position-absolute bg-white shadow rounded"
            style={{
              top: "100%", 
              right: "0",
              width: "180px",
              textAlign: "center",
              zIndex: 1000, 
            }}
          >
            <p className="m-0 fw-bold text-dark">Hi, {username || "Your Account"}</p>
            <hr className="my-2" />
            <button onClick={handleLogout} className="btn btn-sm btn-danger w-100">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
