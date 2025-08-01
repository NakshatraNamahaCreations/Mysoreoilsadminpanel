import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pagination } from "react-bootstrap";

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [showInventory, setShowInventory] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newInventory, setNewInventory] = useState({
        category: '',
        productName: '',
        quantity: '',
    });

    const filteredInventory = showInventory
    ? inventory.filter((item) =>
          item.Product.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

    const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Calculate total pages
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            const response = await axios.get("");
            const productsData = response.data.data || [];

            // Transform API data to match table structure
            const formattedInventory = productsData.map((product, index) => ({
                SlNo: (index + 1).toString().padStart(2, '0'), // Serial number formatting
                Product: product.name, // Product Name
                Category: product.category, // Category
                'Stock Sold (this month)': `${product.sold || 0} pc`, // Sold stock
                CurrentStock: `${product.stock || 0} pc`, // Available stock
            }));

            setInventory(formattedInventory);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Fetch products when the component mounts
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

 

    return (
        <div className="container" style={{ marginTop: '1%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', marginRight: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search"
                        style={{ padding: '5px 10px 5px 30px', width: '200px' }}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <i
                        className="fa fa-search"
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    ></i>
                </div>
                <i className="fa fa-filter" style={{ marginRight: '10px' }}></i>
            </div>

            {showInventory && (
               <>
               <table className="table table-bordered" style={{width:'94%'}}>
                 <thead style={{ textAlign: "center" }}>
                   <tr>
                     <th>Sl No</th>
                     <th>Product</th>
                     <th>Category</th>
                     <th>Stock Sold (this month)</th>
                     <th>Current Stock</th>
                   </tr>
                 </thead>
                 <tbody>
                   {currentItems.map((item) => (
                     <tr key={item.SlNo}>
                       <td>{item.SlNo}</td>
                       <td>{item.Product}</td>
                       <td>{item.Category}</td>
                       <td>{item["Stock Sold (this month)"]}</td>
                       <td>{item.CurrentStock}</td>
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
             </>
            )}
        </div>
    );
}

export default Inventory;
