import React, { useState, useEffect } from 'react';
import { Pagination } from "react-bootstrap";
import { FaArrowLeft, FaTrash } from 'react-icons/fa';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const response = await fetch('https://api.themysoreoils.com/api/customers/all');
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      if (Array.isArray(data)) setCustomers(data);
      else throw new Error('Invalid data format');
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search filter
  const filteredCustomers = customers.filter((customer) =>
    (customer.firstname && customer.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.lastname && customer.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  // Delete Customer Function
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.themysoreoils.com/api/customers/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomers(customers.filter((customer) => customer._id !== id));
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="container" style={{ marginTop: '1%', }}>
      <div>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search"
          style={{ padding: '5px 10px', width: '250px', marginBottom: '10px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Customers Table */}
        <table className="table table-bordered" style={{width:'90%'}}>
          <thead style={{textAlign:'center'}}>
            <tr>
              <th>Sl No</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map((customer, index) => (
              <tr key={customer._id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{customer.firstname}</td>
                <td>{customer.lastname}</td>
                <td>{customer.email}</td>
                <td>
                  <FaTrash
                    onClick={() => handleDelete(customer._id)}
                    style={{ cursor: 'pointer', color: 'red' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />

          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    </div>
  );
}

export default Customer;
