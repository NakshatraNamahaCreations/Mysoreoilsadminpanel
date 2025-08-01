import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://api.themysoreoils.com/api/admin/login", {
        email,
        password,
      });

      const { token, username } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("username", username);

        // 🔥 This triggers App.js to re-check auth
        window.dispatchEvent(new Event("authChanged"));

        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials, please try again.");
    }
  };
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="card p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4" style={{ color: '#602810', fontWeight: 'bold' }}>Login</h2>
        {error && <p className="text-danger">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn w-100" style={{ backgroundColor: '#602810', color: 'white', fontWeight: 'bold' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
