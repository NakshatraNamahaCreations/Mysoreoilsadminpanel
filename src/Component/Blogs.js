import React, { useState, useEffect } from "react";
import axios from 'axios';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    image: "",
    content: "",
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('');
      setBlogs(res.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };
  
  useEffect(() => {
    fetchBlogs();
  }, []);
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.title || !formData.content || !formData.image) {
      return alert("All fields are required");
    }
  
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.content);
      data.append('metaTitle', formData.title); // optional
      data.append('metaDescription', formData.content); // optional
      data.append('image', formData.imageFile); // actual file object
  
      if (isEdit) {
        await axios.put(``, data);
        alert("Blog updated!");
      } else {
        await axios.post('', data);
        alert("Blog created!");
      }
  
      fetchBlogs(); // refresh list
      setShowForm(false);
      setFormData({ title: "", image: "", content: "", imageFile: null });
      setIsEdit(false);
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      alert("Error while submitting blog.");
    }
  };
  const handleEdit = (index) => {
    const selected = blogs[index];
    setFormData({
      ...selected,
      content: selected.description,
      image: ``,
      imageFile: null, // new file can be selected
      _id: selected._id
    });
    setIsEdit(true);
    setEditIndex(index);
    setShowForm(true);
  };
  
  const handleDelete = async (index) => {
    const blog = blogs[index];
    try {
      await axios.delete(``);
      alert("Deleted successfully");
      fetchBlogs();
    } catch (error) {
      alert("Delete failed");
    }
  };
  

  return (
    <div style={{ padding: "30px" , width:'84%', marginLeft:'17%', fontFamily: "'Poppins', sans-serif"}}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{color:'black',}}>Admin Blog Page</h2>
        {!showForm && (
          <button className="btn btn-transparent" style={{borderColor:'black'}} onClick={() => setShowForm(true)}>
            + Add Blog
          </button>
        )}
      </div>

      {/* Blog Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: "20px", borderRadius: "6px", marginBottom: "30px" }}>
          <div className="form-group mb-3">
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
            />
          </div>

          <div className="form-group mb-3">
            <label>Image</label>
            <input type="file" className="form-control" name="image" accept="image/*" onChange={handleChange} />
          </div>

          {formData.image && (
            <div className="mb-3">
              <img src={formData.image} alt="preview" style={{ height: "80px", borderRadius: "5px", border: "1px solid #ccc" }} />
            </div>
          )}

          <div className="form-group mb-3">
            <label>Content</label>
            <CKEditor
              editor={ClassicEditor}
              data={formData.content}
              onChange={(event, editor) => {
                const data = editor.getData();
                setFormData((prev) => ({ ...prev, content: data }));
              }}
            />
          </div>

          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-success">
              {isEdit ? "Update Blog" : "Add Blog"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({ title: "", image: "", content: "" });
                setIsEdit(false);
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {/* Blog Table */}
      {!showForm && (
        <div className="table-responsive" >
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr style={{textAlign:'center'}}>
                <th style={{ width: "50px" , whiteSpace:"nowrap"}}>Sl no</th>
                <th>Title</th>
                <th>Image</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{textAlign:'center'}}>
              {blogs.map((blog, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{blog.title}</td>
                  <td>
                    <img src={blog.image} alt="Blog" style={{ height: "50px", borderRadius: "4px" }} />
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(index)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Blogs;
