import React, { useState, useEffect } from "react";
import { Table, Button, Card, Form, Row, Col, Pagination, Container } from "react-bootstrap";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Helper: format date dd/mm/yyyy
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("https://api.themysoreoils.com/api/orders");
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error.message);
      }
    };

    fetchOrders();
  }, []);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  const handleEditClick = (order) => {
    setSelectedOrder(order);

    // use actual items array
    const products = order.items.map((item) => ({
      _id: item._id,
      name: item.productName,
      image: item.productImage,
      price: item.price,
      quantity: item.quantity,
      status: order.status || "Pending",
    }));

    setUpdatedProducts(products);
    setIsModified(false);
  };

  const handleProductStatusChange = (index, newStatus) => {
    const updated = [...updatedProducts];
    updated[index].status = newStatus;
    setUpdatedProducts(updated);
    setIsModified(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder || !selectedOrder._id) {
      console.error("Selected order is invalid or null", selectedOrder);
      return;
    }

    try {
      const response = await fetch(
        `https://api.themysoreoils.com/api/orders/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: updatedProducts[0].status, // save overall order status
          }),
        }
      );

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
        alert("✅ Order status updated successfully!");
        setSelectedOrder(null);
      } else {
        console.error("❌ Failed to update order status.");
      }
    } catch (error) {
      console.error("🚨 Error updating order:", error.message);
    }
  };

  return (
    <Container className="py-4">
      {!selectedOrder ? (
        <>
          <h3 className="text-center mb-4">Orders Management</h3>
          <Table bordered hover responsive className="shadow-sm" style={{ width: "93%" }}>
            <thead className="bg-light">
              <tr className="text-center">
                <th>Sl.No</th>
                <th>Customer</th>
                <th>Amount (₹)</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <tr key={order._id} className="text-center">
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    {order.address?.firstName} {order.address?.lastName || ""}
                  </td>
                  <td>₹{order.amount ? Number(order.amount).toFixed(2) : "0.00"}</td>
                  <td>{order.paymentMode}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={() => handleEditClick(order)}
                      className="rounded-pill px-3"
                    >
                      ✏️ Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="justify-content-center">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
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
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={() => setSelectedOrder(null)}
            className="mb-3 rounded-pill px-3"
          >
            Back
          </Button>

          <h4 className="mb-3">Order Details</h4>
          <Card className="shadow-lg border-0 rounded p-3 mb-3" style={{ maxWidth: "500px" }}>
            <Card.Body>
              <h6>
                {selectedOrder.address?.firstName} {selectedOrder.address?.lastName}
              </h6>
              <p className="mb-1">
                <strong>Total:</strong> ₹
                {selectedOrder.amount ? Number(selectedOrder.amount).toFixed(2) : "0.00"}
              </p>
              <p className="mb-1">
                <strong>Payment:</strong> {selectedOrder.paymentMode}
              </p>
              <p className="mb-1">
                <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
              </p>
              <p className="mb-1">
                <strong>Address:</strong>
              </p>
              <p>
                {selectedOrder.address ? (
                  <>
                    {selectedOrder.address.address},<br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} -{" "}
                    {selectedOrder.address.pincode}
                  </>
                ) : (
                  "No address available"
                )}
              </p>
            </Card.Body>
          </Card>

          <h5>🛒 Products</h5>
          <Row>
            {updatedProducts.map((product, index) => (
              <Col md={6} key={index} className="mb-3" style={{ width: "26%" }}>
                <Card className="border-0 rounded shadow-sm p-2 h-100">
                  <Card.Img
                    variant="top"
                    src={product.image}
                    alt={product.name}
                    style={{ height: "140px", objectFit: "contain" }}
                  />
                  <Card.Body>
                    <Card.Title
                      className="text-center"
                      style={{ fontSize: "16px", whiteSpace: "nowrap" }}
                    >
                      {product.name}
                    </Card.Title>
                    <Card.Text className="text-muted text-center">
                      ₹{product.price} | Qty: {product.quantity}
                    </Card.Text>
                    <Form>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Control
                          as="select"
                          value={product.status}
                          onChange={(e) => handleProductStatusChange(index, e.target.value)}
                          className="rounded"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Ready for Dispatch">Ready for Dispatch</option>
                          <option value="Delivered">Delivered</option>
                        </Form.Control>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Button
            onClick={handleSaveChanges}
            variant="success"
            className="rounded-pill px-4 mt-3"
            disabled={!isModified}
          >
            💾 Save Changes
          </Button>
        </>
      )}
    </Container>
  );
};

export default OrdersPage;
