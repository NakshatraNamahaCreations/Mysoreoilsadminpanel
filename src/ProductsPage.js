import React, { useState, useEffect } from "react";
import "./ProductsPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTrash, FaEdit } from "react-icons/fa";
import { Table, Pagination } from "react-bootstrap";

const ProductsPage = ({ existingProductData }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    categoryId: "",
    description: "",
    stock: "",
    images: [null, null, null, null, null],
    descriptionImage: null,
    benefitsImage: null,
    usesImage: null,
    nutritionImage: null,
    discountPrice: "",
    variants: [],
    unit: "",
    quantity: "",
    variantPrice: "",
      variantDiscountPrice: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [imagePreviews, setImagePreviews] = useState({
    mainImages: [null, null, null, null, null],
    descriptionImage: null,
    benefitsImage: null,
    usesImage: null,
    nutritionImage: null,
  });

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleSearch = (query) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleAddVariant = () => {
    const { quantity, variantPrice, variantDiscountPrice, unit } = newProduct;
    const price = parseFloat(variantPrice);
    const discountPrice = parseFloat(variantDiscountPrice) || 0;

    if (!quantity.trim() || isNaN(price) || price <= 0 || !unit) {
      alert("Please provide a valid quantity, price, and unit.");
      return;
    }

    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { quantity, price, discountPrice, unit }],
      quantity: "",
      variantPrice: "",
        variantDiscountPrice: "",
      unit: "",
    });
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = newProduct.variants.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleEditVariant = (index) => {
    const variant = newProduct.variants[index];
    setNewProduct({
      ...newProduct,
      quantity: variant.quantity,
      variantPrice: variant.price,
         variantDiscountPrice: variant.discountPrice || "",
      unit: variant.unit || "",
    });
    setEditingVariantIndex(index);
  };

  const handleUpdateVariant = () => {
    if (editingVariantIndex === null) return;

    const { quantity, variantPrice,variantDiscountPrice, unit } = newProduct;
    const price = parseFloat(variantPrice);
      const discountPrice = parseFloat(variantDiscountPrice) || 0;

    if (!quantity.trim() || isNaN(price) || price <= 0 || !unit) {
      alert("Please provide a valid quantity, price, and unit.");
      return;
    }

    const updatedVariants = [...newProduct.variants];
    updatedVariants[editingVariantIndex] = { quantity, price,discountPrice, unit };

    setNewProduct({
      ...newProduct,
      variants: updatedVariants,
      quantity: "",
      variantPrice: "",
       variantDiscountPrice: "",
      unit: "",
    });
    setEditingVariantIndex(null);
  };

  const filteredData = searchTerm
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://api.themysoreoils.com/api/products");
      const productsData = (response.data || []).map((product) => ({
        ...product,
        formattedCreatedDate: new Date(product.createdAt).toLocaleDateString(
          "en-IN",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        ),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e, type, index = null) => {
    const file = e.target.files[0];
    if (file) {
      const updatedPreviews = { ...imagePreviews };
      let updatedImages = [...newProduct.images];

      if (type === "mainImages") {
        if (index !== null && index < updatedImages.length) {
          // Replace existing image
          updatedPreviews.mainImages[index] = URL.createObjectURL(file);
          updatedImages[index] = file;
        } else {
          // Add new image
          updatedPreviews.mainImages.push(URL.createObjectURL(file));
          updatedImages.push(file);
        }
        setNewProduct({ ...newProduct, images: updatedImages });
      } else {
        updatedPreviews[type] = URL.createObjectURL(file);
        setNewProduct({ ...newProduct, [type]: file });
      }
      setImagePreviews(updatedPreviews);
    }
  };

  const handleAddImageSlot = () => {
    setNewProduct({
      ...newProduct,
      images: [...newProduct.images, null],
    });
    setImagePreviews({
      ...imagePreviews,
      mainImages: [...imagePreviews.mainImages, null],
    });
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.categoryId ||
      !newProduct.description ||
      !newProduct.stock ||
      !newProduct.variants[0]?.quantity ||
      !newProduct.variants[0]?.price ||
      !newProduct.variants[0]?.unit
    ) {
      alert("Please fill all required product fields, including at least one variant with quantity, price, and unit.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("description", newProduct.description);
    formData.append("stock", newProduct.stock);
    formData.append("discountPrice", newProduct.discountPrice || 0);
    formData.append("variants", JSON.stringify(newProduct.variants));

    newProduct.images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });

    if (newProduct.descriptionImage instanceof File) {
      formData.append("descriptionImage", newProduct.descriptionImage);
    }
    if (newProduct.benefitsImage instanceof File) {
      formData.append("benefitsImage", newProduct.benefitsImage);
    }
    if (newProduct.usesImage instanceof File) {
      formData.append("usesImage", newProduct.usesImage);
    }
    if (newProduct.nutritionImage instanceof File) {
      formData.append("nutritionImage", newProduct.nutritionImage);
    }

    try {
      const response = await axios.post(
        "https://api.themysoreoils.com/api/products",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.message) {
        alert("Product added successfully!");
        setNewProduct({
          name: "",
          category: "",
          categoryId: "",
          description: "",
          stock: "",
          images: [null, null, null, null, null],
          descriptionImage: null,
          benefitsImage: null,
          usesImage: null,
          nutritionImage: null,
          discountPrice: "",
          variants: [],
          unit: "",
          quantity: "",
          variantPrice: "",
        });
        setImagePreviews({
          mainImages: [null, null, null, null, null],
          descriptionImage: null,
          benefitsImage: null,
          usesImage: null,
          nutritionImage: null,
        });
        fetchProducts();
        setIsAddingProduct(false);
      } else {
        alert("Failed to add product. Please try again.");
      }
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error);
      alert("An error occurred while adding the product.");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      if (!newProduct._id) return;

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("category", newProduct.category);
      formData.append("description", newProduct.description);
      formData.append("stock", newProduct.stock);
      formData.append("discountPrice", newProduct.discountPrice || 0);
      formData.append("variants", JSON.stringify(newProduct.variants));

      // Track replaced and new images
      const replacedIndices = [];
      const newImages = [];
      newProduct.images.forEach((image, index) => {
        if (image instanceof File) {
          if (index < (newProduct.originalImageCount || newProduct.images.length)) {
            replacedIndices.push(index);
          } else {
            newImages.push(image);
          }
          formData.append("images", image);
        }
      });
      formData.append("replacedImageIndices", JSON.stringify(replacedIndices));
      formData.append("newImageCount", newImages.length);

      if (newProduct.descriptionImage instanceof File) {
        formData.append("descriptionImage", newProduct.descriptionImage);
      }
      if (newProduct.benefitsImage instanceof File) {
        formData.append("benefitsImage", newProduct.benefitsImage);
      }
      if (newProduct.usesImage instanceof File) {
        formData.append("usesImage", newProduct.usesImage);
      }
      if (newProduct.nutritionImage instanceof File) {
        formData.append("nutritionImage", newProduct.nutritionImage);
      }

      const response = await axios.put(
        `https://api.themysoreoils.com/api/products/${newProduct._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.message) {
        alert("Product updated successfully!");
        setIsAddingProduct(false);
        setIsEditingProduct(false);
        fetchProducts();
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.response) console.error("Response data:", error.response.data);
      alert("Failed to update product.");
    }
  };

  const handleEditProduct = (productId) => {
    const productToEdit = products.find((product) => product._id === productId);
    if (!productToEdit) return;

    const matchedCategory = categories.find(
      (cat) => cat.name === productToEdit.category
    );

    const updatedImagePreviews = {
      mainImages: productToEdit.images.map((image) =>
        image ? `https://api.themysoreoils.com${image}` : null
      ),
      descriptionImage: productToEdit.descriptionImage
        ? `https://api.themysoreoils.com${productToEdit.descriptionImage}`
        : null,
      benefitsImage: productToEdit.benefitsImage
        ? `https://api.themysoreoils.com${productToEdit.benefitsImage}`
        : null,
      usesImage: productToEdit.usesImage
        ? `https://api.themysoreoils.com${productToEdit.usesImage}`
        : null,
      nutritionImage: productToEdit.nutritionImage
        ? `https://api.themysoreoils.com${productToEdit.nutritionImage}`
        : null,
    };

    setNewProduct({
      ...productToEdit,
      category: productToEdit.category || "",
      categoryId: matchedCategory?._id || "",
      images: productToEdit.images.map((img) => img), // Store URLs initially
      descriptionImage: productToEdit.descriptionImage,
      benefitsImage: productToEdit.benefitsImage,
      usesImage: productToEdit.usesImage,
      nutritionImage: productToEdit.nutritionImage,
      discountPrice: productToEdit.discountPrice || "",
      variants: productToEdit.variants || [],
      originalImageCount: productToEdit.images.length, // Track original image count
    });

    setImagePreviews(updatedImagePreviews);
    setIsAddingProduct(true);
    setIsEditingProduct(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await axios.delete(
        `https://api.themysoreoils.com/api/products/${productId}`
      );

      if (response.data.success) {
        alert("Product deleted successfully!");
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting product:", error.message);
      alert("An error occurred while deleting the product.");
      window.location.reload();
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://api.themysoreoils.com/api/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (selectedCategoryId) => {
    const selectedCategory = categories.find(
      (cat) => cat._id === selectedCategoryId
    );

    setNewProduct({
      ...newProduct,
      categoryId: selectedCategory?._id || "",
      category: selectedCategory?.name || "",
    });
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToTable = () => {
    setSelectedProduct(null);
  };

  const inputStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    width: "100%",
  };

  const smallBtnStyle = {
    backgroundColor: "#e0e0e0",
    border: "none",
    borderRadius: "4px",
    padding: "4px 10px",
    fontSize: "13px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px",
        marginLeft: "20%",
      }}
    >
      <div className="row">
        <div className="col-md-12">
          {isAddingProduct ? (
            <div
              style={{
                padding: "24px",
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 0 20px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
              >
                <button
                  onClick={() => setIsAddingProduct(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    marginRight: "16px",
                  }}
                >
                  ←
                </button>
                <h2 style={{ margin: 0, color: "black" }}>
                  {isEditingProduct ? "Edit Product" : "Add Product"}
                </h2>
              </div>

              {/* Image Uploads */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {imagePreviews.mainImages.map((preview, index) => (
                  <label
                    key={index}
                    htmlFor={`image${index}`}
                    style={{
                      width: "120px",
                      height: "120px",
                      border: "2px dashed #ccc",
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ color: "#aaa", fontSize: "14px" }}>
                        + Add Image
                      </span>
                    )}
                    <input
                      id={`image${index}`}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageChange(e, "mainImages", index)}
                    />
                  </label>
                ))}
                <button
                  onClick={handleAddImageSlot}
                  style={{
                    width: "120px",
                    height: "120px",
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#aaa",
                  }}
                >
                  + Add More Images
                </button>
              </div>

              {/* Additional Image Uploads */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {["descriptionImage", "benefitsImage", "usesImage", "nutritionImage"].map(
                  (type) => (
                    <label
                      key={type}
                      htmlFor={type}
                      style={{
                        width: "120px",
                        height: "120px",
                        border: "2px dashed #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      {imagePreviews[type] ? (
                        <img
                          src={imagePreviews[type]}
                          alt={`${type} Preview`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ color: "#aaa", fontSize: "14px" }}>
                          + {type.replace("Image", "")}
                        </span>
                      )}
                      <input
                        id={type}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(e, type)}
                      />
                    </label>
                  )
                )}
              </div>

              {/* Inputs: Name, Category, Stock, Description, Discount Price */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  style={inputStyle}
                />
                <select
                  value={newProduct.categoryId || ""}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Stock"
                  value={newProduct.stock || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  style={inputStyle}
                />
              
                <textarea
                  rows={3}
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {/* Variant Section */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  margin: "20px 0",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Quantity (e.g. 500g)"
                  value={newProduct.quantity || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                  style={{ ...inputStyle, flex: "1 1 120px" }}
                />
                <select
                  value={newProduct.unit || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit: e.target.value })
                  }
                  style={{ ...inputStyle, flex: "1 1 100px" }}
                >
                  <option value="">Unit</option>
                  <option value="ml">ml</option>
                  <option value="gm">gm</option>
                  <option value="kg">kg</option>
                  <option value="ltr">ltr</option>
                  <option value="pcs">pcs</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.variantPrice || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, variantPrice: e.target.value })
                  }
                  style={{ ...inputStyle, flex: "1 1 120px" }}
                />
                <input
  type="number"
  placeholder="Discount Price"
  value={newProduct.variantDiscountPrice || ""}
  onChange={(e) =>
    setNewProduct({ ...newProduct, variantDiscountPrice: e.target.value })
  }
  style={{ ...inputStyle, flex: "1 1 120px" }}
/>

                <button
                  onClick={
                    editingVariantIndex !== null
                      ? handleUpdateVariant
                      : handleAddVariant
                  }
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {editingVariantIndex !== null ? "Save" : "+"}
                </button>
              </div>

              {/* Variant List */}
              <div>
                {newProduct.variants.map((variant, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#f1f1f1",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>
                      Qty: {variant.quantity} | Price: ₹{variant.price} | Unit: {variant.unit}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEditVariant(index)}
                        style={smallBtnStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveVariant(index)}
                        style={{
                          ...smallBtnStyle,
                          backgroundColor: "#dc3545",
                          color: "#fff",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div style={{ textAlign: "right", marginTop: "24px" }}>
                <button
                  onClick={
                    isEditingProduct ? handleUpdateProduct : handleAddProduct
                  }
                  style={{
                    backgroundColor: "#00614A",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  {isEditingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "-3%",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search"
                    style={{ padding: "5px 10px 5px 30px", width: "250px" }}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <FaSearch
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    style={{ padding: "5px 10px", cursor: "pointer" }}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              <div>
                {!selectedProduct && (
                  <>
                    <Table
                      striped
                      bordered
                      hover
                      responsive
                      className="product-table shadow-sm"
                    >
                      <thead style={{ textAlign: "center" }}>
                        <tr>
                          <th>Sl.no</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Stock</th>
                          <th>Sold</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProducts.map((product, index) => (
                          <tr key={product._id} style={{ cursor: "pointer" }}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td onClick={() => handleRowClick(product)}>
                              {product.name}
                            </td>
                            <td onClick={() => handleRowClick(product)}>
                              {product.category}
                            </td>
                            <td onClick={() => handleRowClick(product)}>
                              {product.stock}
                            </td>
                            <td onClick={() => handleRowClick(product)}>
                              {product.soldStock || 0}
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <FaEdit
                                  style={{ cursor: "pointer", marginRight: "5px" }}
                                  onClick={() => handleEditProduct(product._id)}
                                />
                                <FaTrash
                                  style={{ cursor: "pointer", color: "red" }}
                                  onClick={() => handleDeleteProduct(product._id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <Pagination className="justify-content-center">
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </>
                )}

                {selectedProduct && (
                  <div>
                    <button
                      onClick={handleBackToTable}
                      style={{
                        padding: "10px",
                        backgroundColor: "transparent",
                        color: "#333",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="Back"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
                      </svg>
                    </button>
                    <div
                      style={{
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        maxWidth: "900px",
                        margin: "0 auto",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginBottom: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        {selectedProduct.images &&
                          selectedProduct.images.map((image, index) => {
                            const filename = image.split("/").pop();
                            const fullImageUrl = `https://api.themysoreoils.com/uploads/${filename}`;
                            return (
                              <div
                                key={index}
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  border: "1px solid #ccc",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f9f9f9",
                                }}
                              >
                                <img
                                  src={fullImageUrl}
                                  alt={`Product ${index}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            );
                          })}
                        {["descriptionImage", "benefitsImage", "usesImage", "nutritionImage"].map(
                          (type) =>
                            selectedProduct[type] && (
                              <div
                                key={type}
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  border: "1px solid #ccc",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f9f9f9",
                                }}
                              >
                                <img
                                  src={`https://api.themysoreoils.com${selectedProduct[type]}`}
                                  alt={`${type}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            )
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "15px",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Category:</strong> {selectedProduct.category}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Stock:</strong> {selectedProduct.stock}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Sold:</strong> {selectedProduct.soldStock || 0}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Discount Price:</strong> ₹
                          {selectedProduct.discountPrice || "N/A"}
                        </div>
                      </div>

                      <div>
                        <h3>Description</h3>
                        <p style={{ lineHeight: "1.6", color: "#555" }}>
                          {selectedProduct.description}
                        </p>
                      </div>

                      <div>
                        <h3>Variants</h3>
                        {selectedProduct.variants.map((variant, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              marginBottom: "10px",
                            }}
                          >
                            <p>
                              Quantity: {variant.quantity} | Price: ₹{variant.price} | Unit: {variant.unit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;