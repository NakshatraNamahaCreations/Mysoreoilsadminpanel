import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "./Sidebar";
import Header from "../src/Component/Header";
import Dashboard from "./Dashboard";
import ProductsPage from "./ProductsPage";
import Categories from "./Component/Categories";
import Inventory from "./Component/Inventory";
import OrdersPage from "./Component/OrdersPage ";
import Customer from "./Component/Customer";
import Login from "./Component/Login";
import ContactPage from "./Component/Contactpage";
import Blogs from "./Component/Blogs";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    };

    // Event to refresh login state when token is set
    window.addEventListener("authChanged", checkAuth);

    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  return (
    <Router>
      <MainLayout isAuthenticated={isAuthenticated} />
    </Router>
  );
}

function MainLayout({ isAuthenticated }) {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";

  return (
    <div className="app">
     
      {!hideSidebar && <Header />}

    
      {isAuthenticated && !hideSidebar && <Sidebar />}

      <div className={hideSidebar ? "login-page" : "main-content"}>
        <Routes>
          <Route path="/" element={<Login />} />

        
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/products" element={isAuthenticated ? <ProductsPage /> : <Navigate to="/" />} />
          <Route path="/categories" element={isAuthenticated ? <Categories /> : <Navigate to="/" />} />
          <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/" />} />
          <Route path="/orders" element={isAuthenticated ? <OrdersPage /> : <Navigate to="/" />} />
          <Route path="/customers" element={isAuthenticated ? <Customer /> : <Navigate to="/" />} />
          <Route path="/contactpage" element={isAuthenticated ? <ContactPage /> : <Navigate to="/" />} />
          <Route path="/blog" element={isAuthenticated ? <Blogs /> : <Navigate to="/" />} />


          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

