import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const ContactPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("");
      setSubmissions(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch contact forms", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{marginLeft:'-4%', width:'100%'}}>
        <h2 className="text-center fw-bold mb-4">Contact Form </h2>
        
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-center text-muted">No submissions found.</p>
        ) : (
          <div className="table-responsive" >
            <table className="table table-striped table-hover align-middle text-center">
              <thead className="table-secondary">
                <tr>
                  <th scope="col">Sl. No</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone Number</th>
                  <th scope="col">Message</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((entry, index) => (
                  <tr key={entry._id}>
                    <td>{index + 1}</td>
                    <td>{entry.firstName}</td>
                    <td>{entry.lastName}</td>
                    <td>{entry.email}</td>
                    <td>{entry.phoneNumber}</td>
                    <td>{entry.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
