import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaWindowClose } from "react-icons/fa";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    purchase_price: "",
    sale_price: "",
    quantity: ""
  });

  const token = localStorage.getItem("accesstoken");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/wholesaler/getproduct", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async () => {
    const { name, purchase_price, sale_price, quantity } = formData;
    if (!name || !purchase_price || !sale_price || !quantity) {
      alert("Please fill all fields");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/wholesaler/addproduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          purchase_price: parseFloat(purchase_price),
          sale_price: parseFloat(sale_price),
          quantity: parseInt(quantity, 10)
        })
      });
      if (res.ok) {
        fetchProducts();
        setShowAddForm(false);
        setFormData({ name: "", purchase_price: "", sale_price: "", quantity: "" });
      } else {
        console.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.product_id);
    setFormData({
      name: product.name,
      purchase_price: product.purchase_price.toString(),
      sale_price: product.sale_price.toString(),
      quantity: product.quantity.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setFormData({ name: "", purchase_price: "", sale_price: "", quantity: "" });
  };

  const handleSaveEdit = async () => {
    const { name, purchase_price, sale_price, quantity } = formData;
    try {
      const res = await fetch(`http://localhost:4000/api/wholesaler/${editingProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          purchase_price: parseFloat(purchase_price),
          sale_price: parseFloat(sale_price),
          quantity: parseInt(quantity, 10)
        })
      });
      if (res.ok) {
        fetchProducts();
        setEditingProductId(null);
        setFormData({ name: "", purchase_price: "", sale_price: "", quantity: "" });
      } else {
        console.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (product_id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/wholesaler/${product_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Added styles for inputs to make them visually interactive
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginTop: 6,
    border: "2px solid #ccc",
    borderRadius: 5,
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s ease"
  };

  const inputFocusStyle = {
    borderColor: "#4CAF50",
    boxShadow: "0 0 5px rgba(76, 175, 80, 0.7)"
  };

  // To handle focus styling, create a controlled component with local state for focused input
  const [focusedInput, setFocusedInput] = useState(null);

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 20, position: "relative" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem" }}>Manage Products</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          {/* Placeholder for future search or filters */}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            cursor: "pointer",
            padding: "8px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            gap: 5
          }}
          title="Add New Product"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 0 8px rgba(0,0,0,0.1)"
          }}
        >
          <thead style={{ backgroundColor: "#f9f9f9" }}>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Purchase Price</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Sale Price</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Quantity</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 15 }}>
                  No products found
                </td>
              </tr>
            )}

            {products.map((product) =>
              editingProductId === product.product_id ? (
                <tr key={product.product_id} style={{ backgroundColor: "#fff9c4" }}>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{product.product_id}</td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>
                    <input
                      type="number"
                      name="purchase_price"
                      value={formData.purchase_price}
                      onChange={handleInputChange}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>
                    <input
                      type="number"
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleInputChange}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>
                    <button
                      onClick={handleSaveEdit}
                      title="Save"
                      style={{ marginRight: 8, cursor: "pointer" }}
                    >
                      <FaSave />
                    </button>
                    <button onClick={handleCancelEdit} title="Cancel" style={{ cursor: "pointer" }}>
                      <FaWindowClose />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={product.product_id} style={{ backgroundColor: "#fff" }}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.product_id}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.purchase_price}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.sale_price}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.quantity}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button
                      onClick={() => handleEditClick(product)}
                      title="Edit"
                      style={{ marginRight: 8, cursor: "pointer" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      title="Delete"
                      style={{ cursor: "pointer" }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
          onClick={() => setShowAddForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: 30,
              borderRadius: 8,
              minWidth: 350,
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              position: "relative"
            }}
          >
            <h2 style={{ marginBottom: 20 }}>Add New Product</h2>

            <label style={{ display: "block", fontWeight: "600", marginTop: 10 }}>
              Name
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...inputStyle,
                  ...(focusedInput === "name" ? inputFocusStyle : {})
                }}
              />
            </label>

            <label style={{ display: "block", fontWeight: "600", marginTop: 15 }}>
              Purchase Price
              <input
                type="number"
                name="purchase_price"
                placeholder="Enter purchase price"
                value={formData.purchase_price}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput("purchase_price")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...inputStyle,
                  ...(focusedInput === "purchase_price" ? inputFocusStyle : {})
                }}
              />
            </label>

            <label style={{ display: "block", fontWeight: "600", marginTop: 15 }}>
              Sale Price
              <input
                type="number"
                name="sale_price"
                placeholder="Enter sale price"
                value={formData.sale_price}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput("sale_price")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...inputStyle,
                  ...(focusedInput === "sale_price" ? inputFocusStyle : {})
                }}
              />
            </label>

            <label style={{ display: "block", fontWeight: "600", marginTop: 15 }}>
              Quantity
              <input
                type="number"
                name="quantity"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                onFocus={() => setFocusedInput("quantity")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...inputStyle,
                  ...(focusedInput === "quantity" ? inputFocusStyle : {})
                }}
              />
            </label>

            <div style={{ marginTop: 25, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer"
                }}
              >
                Cancel <FaTimes style={{ marginLeft: 6 }} />
              </button>
              <button
                onClick={handleAddProduct}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                Save <FaSave style={{ marginLeft: 6 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
