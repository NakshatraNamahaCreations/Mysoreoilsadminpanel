import React, { useState , useEffect} from 'react';
import axios from "axios";
import { Button, Form, Table, Row, Col,Pagination } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTrash, FaEdit ,} from "react-icons/fa";
function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newStatus, setNewStatus] = useState(''); // Default status
  const [newSubCategory, setNewSubCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null); // For editing categories
  const [showTable, setShowTable] = useState(true); // State to toggle table visibility


  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Calculate total pages
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const handleCreateFormShow = () => {
    setShowTable(false); // Hide the table when creating a new category
    setEditCategory(null); // Reset the edit category
  };

  const handleFormClose = () => {
    setShowTable(true); // Show the table when closing the form
  };

  

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newStatus) {
        alert('Please provide both Category Name and Status.');
        return;
    }
    
    try {
        const response = await axios.post('https://api.themysoreoils.com/api/categories', {
            category: newCategoryName,
            status: newStatus
        });

        if (response.status === 201) {
            alert('Category created successfully!');
            // Reset the form fields after successful creation
            setNewCategoryName('');
            setNewStatus('');
        }
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
        alert(`Error: ${error.response?.data?.message || error.message}`);
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

const handleEditCategory = (category) => {
  setEditCategory(category); // Set the category to be edited
  setNewCategoryName(category.name); // ✅ Correct field
  setNewStatus(category.status);     // Use status field directly
  setShowTable(false);               // Show form for editing
};



const handleUpdateCategory = async () => {
  if (!editCategory || !newCategoryName || !newStatus) {
    alert("All fields are required");
    return;
  }

  try {
    const response = await fetch(`https://api.themysoreoils.com/api/categories/${editCategory._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newCategoryName,
        status: newStatus,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update category");
    }

    const result = await response.json();
    alert("Category updated successfully");

    setCategories(categories.map((cat) =>
      cat._id === editCategory._id ? result.category : cat
    ));
    setShowTable(true);
  } catch (error) {
    console.error("Error updating category:", error);
    alert(error.message);
  }
};




const handleDeleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`https://api.themysoreoils.com/api/categories/${categoryId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (result.success) {
      alert('Category deleted successfully!');
      setCategories(categories.filter((cat) => cat._id !== categoryId));
    } else {
      alert('Failed to delete category.');
    }
  } catch (error) {
    console.error('Error deleting category:', error.message);
    alert('An error occurred while deleting the category.');
  }
};




  
  return (
    <div style={{ maxWidth: '85%', marginLeft: '20%', marginTop: '1%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', marginRight: '10px' }}>
          <input
            type="text"
            placeholder="Search"
            style={{ padding: '5px 10px 5px 30px', width: '200px' }}
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
        <button variant="primary" onClick={handleCreateFormShow} style={{ marginLeft: 'auto' }}>
          Create New Category
        </button>
      </div>

      {/* Conditionally render the form or the table */}
      {showTable ? (
       <>
       <Table striped bordered hover style={{ textAlign: "center" }}>
         <thead>
           <tr>
             <th>SL No</th>
             <th>Category Name</th>
             <th>Status</th>
             <th>Created At</th>
             <th>Actions</th>
           </tr>
         </thead>
         <tbody>
           {currentCategories.map((category, index) => (
             <tr key={category._id}>
               <td>{indexOfFirstItem + index + 1}</td>
               <td>{category.name}</td>
               <td>{category.status || "Active"}</td>
               <td>{new Date(category.createdAt).toLocaleDateString()}</td>
               <td>
                 <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                   <FaEdit
                     onClick={() => handleEditCategory(category)}
                     style={{ marginRight: "5px", cursor: "pointer" }}
                   />
                   <FaTrash
                     style={{ cursor: "pointer", color: "red" }}
                     onClick={() => handleDeleteCategory(category._id)}
                     aria-label="Delete category"
                   />
                 </div>
               </td>
             </tr>
           ))}
         </tbody>
       </Table>
 
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
      ) : (
        <div className="category-form" style={{ marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            {/* <h4>Create New Category</h4> */}
            <Form   onSubmit={(e) => {
        e.preventDefault();
        if (editCategory) {
          handleUpdateCategory();
        } else {
          handleCreateCategory();
        }
      }}>
                <Row style={{ marginBottom: '15px' }}>
                    <Col md={6}>
                        <Form.Group controlId="categoryName">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
  type="text"
  value={newCategoryName || ""} // ensures it’s always a string
  onChange={(e) => setNewCategoryName(e.target.value)}
  placeholder="Enter category name"
  style={{ padding: '10px', marginBottom: '15px' }}
/>

                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group controlId="status">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
  as="select"
  value={newStatus || ""} // prevents undefined warning
  onChange={(e) => setNewStatus(e.target.value)}
  style={{ padding: '10px', marginBottom: '15px' }}
>
  <option value="">Choose</option>
  <option value="Active">Active</option>
  <option value="Inactive">Inactive</option>
</Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="secondary" onClick={() => { setNewCategoryName(''); setNewStatus(''); }} style={{ padding: '10px 20px' }}>
                        Close
                    </Button>
                    <Button
        variant="primary"
        onClick={editCategory ? handleUpdateCategory : handleCreateCategory}
        style={{ padding: '10px 20px' }}
      >
        {editCategory ? 'Update Category' : 'Create Category'}
      </Button>
                </div>
            </Form>
        </div>
    </div>
      )}
    </div>
  );
}

export default Categories;
