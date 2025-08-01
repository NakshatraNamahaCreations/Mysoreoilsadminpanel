import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Cell,
} from "recharts";

function Dashboard() {
  const [barData, setBarData] = useState([
    { month: "Jan", sales: 0 },
    { month: "Feb", sales: 0 },
    { month: "Mar", sales: 0 },
    { month: "Apr", sales: 0 },
    { month: "May", sales: 0 },
    { month: "Jun", sales: 0 },
    { month: "Jul", sales: 0 },
    { month: "Aug", sales: 0 },
    { month: "Sep", sales: 0 },
    { month: "Oct", sales: 0 },
    { month: "Nov", sales: 0 },
    { month: "Dec", sales: 0 },
  ]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://api.themysoreoils.com/api/orders");
      const ordersData = response.data || [];

      // Group sales by month
      const monthlySales = {};
      ordersData.forEach((order) => {
        const createdDate = new Date(order.createdAt);
        const monthIndex = createdDate.getMonth(); // 0 for Jan, 1 for Feb, etc.
        const monthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format(createdDate);

        if (!monthlySales[monthName]) {
          monthlySales[monthName] = 0;
        }
        monthlySales[monthName] += order.quantity; // Sum the order quantity
      });

      // Update barData with dynamic sales values
      const updatedBarData = barData.map((item) => ({
        ...item,
        sales: monthlySales[item.month] || 0,
      }));

      setBarData(updatedBarData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="dashboard p-4" style={{ marginLeft: "250px", backgroundColor: "white" }}>
      <h3 className="mb-4">Dashboard</h3>

      {/* Sales Chart */}
      <Card className="mt-4 shadow-sm">
        <Card.Body>
          <h5>Sales</h5>
          <p>Number of products sold per month</p>
          <div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <RechartsLegend />
                <Bar dataKey="sales" name="Sold Stock">
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.sales > 10 ? "#F8ABAB" : "#986A6A"} // Color logic
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;