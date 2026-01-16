import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VmViewPage.css";

const VmViewPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [success, setSuccess] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editVendor, setEditVendor] = useState(null);

  const [vendorData, setVendorData] = useState({
    vendorCode: "",
    companyName: "",
    vendorAddress: "",
    industry: "",
    registrationNumber: "",
    gstNumber: "",
    panNumber: "",
    website: "",
  });

  /* =====================
     LOAD VENDORS
  ====================== */
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const res = await axios.get("http://localhost:5000/vm/vendors");
    setVendors(res.data);
  };

  /* =====================
     ADD VENDOR
  ====================== */
  const handleChange = (e) => {
    setVendorData({ ...vendorData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await axios.post(
      "http://localhost:5000/vm/vendors",
      vendorData
    );

    setVendors((prev) => [res.data.vendor, ...prev]);
    setShowForm(false);
    setSuccess(true);

    setVendorData({
      vendorCode: "",
      companyName: "",
      vendorAddress: "",
      industry: "",
      registrationNumber: "",
      gstNumber: "",
      panNumber: "",
      website: "",
    });

    setTimeout(() => setSuccess(false), 3000);
  };

  /* =====================
     DELETE (SOFT / HARD)
  ====================== */
  const handleDelete = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    await axios.delete(`http://localhost:5000/vm/vendors/${vendorId}`);
    setSelectedVendor(null);
    fetchVendors();
  };

  /* =====================
     UPDATE VENDOR
  ====================== */
  const handleUpdate = async (e) => {
    e.preventDefault();

    await axios.put(
      `http://localhost:5000/vm/vendors/${editVendor.vendor_id}`,
      {
        companyName: editVendor.company_name,
        vendorAddress: editVendor.vendor_address,
        industry: editVendor.industry,
        registrationNumber: editVendor.registration_number,
        gstNumber: editVendor.gst_number,
        panNumber: editVendor.pan_number,
        website: editVendor.website,
        
      }
    );

    setEditVendor(null);
    fetchVendors();
  };

  return (
    <div className="vm-page">
      {/* HEADER */}
      <div className="vm-header">
        <h2>Vendor Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Vendor
        </button>
      </div>

      {success && (
        <div className="success-alert">Vendor added successfully</div>
      )}

      {/* ADD VENDOR MODAL */}
      {showForm && (
        <div className="overlay">
          <div className="form-card">
            <h3>Add Vendor</h3>

            <form onSubmit={handleSubmit} className="form-grid">
              <input name="vendorCode" placeholder="Vendor Code" required onChange={handleChange} />
              <input name="companyName" placeholder="Company Name" required onChange={handleChange} />
              <input name="vendorAddress" placeholder="Vendor Address" onChange={handleChange} />
              <input name="industry" placeholder="Industry" onChange={handleChange} />
              <input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} />
              <input name="gstNumber" placeholder="GST Number" onChange={handleChange} />
              <input name="panNumber" placeholder="PAN Number" onChange={handleChange} />
              <input name="website" placeholder="Website" onChange={handleChange} />

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR LIST */}
      <div className="vendor-grid">
        {vendors.map((vendor) => (
          <div
            key={vendor.vendor_id}
            className="vendor-card"
            onClick={() => setSelectedVendor(vendor)}
          >
            <h4>{vendor.company_name}</h4>
            <p><strong>Industry:</strong> {vendor.industry}</p>
            <p><strong>Address:</strong> {vendor.vendor_address}</p>

            <span className={`status-badge ${vendor.status === "Active" ? "active" : "inactive"}`}>
              {vendor.status}
            </span>
          </div>
        ))}
      </div>

      {/* VIEW VENDOR MODAL */}
      {selectedVendor && (
        <div className="overlay">
          <div className="details-card">
            <h3>{selectedVendor.company_name}</h3>

            <div className="details-grid">
              <p><strong>Vendor Code:</strong> {selectedVendor.vendor_code}</p>
              <p><strong>Vendor Address:</strong> {selectedVendor.vendor_address}</p>
              <p><strong>Industry:</strong> {selectedVendor.industry}</p>
              <p><strong>Website:</strong> {selectedVendor.website}</p>
              <p><strong>Registration No:</strong> {selectedVendor.registration_number}</p>
              <p><strong>GST:</strong> {selectedVendor.gst_number}</p>
              <p><strong>PAN:</strong> {selectedVendor.pan_number}</p>
              
            </div>

            <div className="details-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  setEditVendor({ ...selectedVendor });
                  setSelectedVendor(null);
                }}
              >
                Edit
              </button>

              <button
                className="btn-danger"
                onClick={() => handleDelete(selectedVendor.vendor_id)}
              >
                Delete
              </button>

              <button
                className="btn-secondary"
                onClick={() => setSelectedVendor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {editVendor && (
        <div className="overlay">
          <div className="form-card">
            <h3>Edit Vendor</h3>

            <form onSubmit={handleUpdate} className="form-grid">
              <input value={editVendor.company_name} onChange={(e) => setEditVendor({ ...editVendor, company_name: e.target.value })} />
              <input value={editVendor.vendor_address} onChange={(e) => setEditVendor({ ...editVendor, vendor_address: e.target.value })} />
              <input value={editVendor.industry} onChange={(e) => setEditVendor({ ...editVendor, industry: e.target.value })} />
              <input value={editVendor.registration_number} onChange={(e) => setEditVendor({ ...editVendor, registration_number: e.target.value })} />
              <input value={editVendor.gst_number} onChange={(e) => setEditVendor({ ...editVendor, gst_number: e.target.value })} />
              <input value={editVendor.pan_number} onChange={(e) => setEditVendor({ ...editVendor, pan_number: e.target.value })} />
              <input value={editVendor.website} onChange={(e) => setEditVendor({ ...editVendor, website: e.target.value })} />

              

              <div className="form-actions">
                <button type="submit" className="btn-primary">Update</button>
                <button type="button" className="btn-secondary" onClick={() => setEditVendor(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VmViewPage;
