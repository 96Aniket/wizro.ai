import pool from "../../config/config.js";
import vmSqlc from "./vmSqlc.js";

/* ===========================
   DASHBOARD (UNCHANGED)
=========================== */

const getDashboardStats = async (req, res) => {
  try {
    res.json([
      {
        total_vms: 12,
        running_vms: 8,
        stopped_vms: 3,
        pending_vms: 1,
        avg_cpu: 64,
        total_storage: 520,
      },
    ]);
  } catch {
    res.status(500).json({ message: "VM dashboard stats error" });
  }
};

const getVmUsageStats = async (req, res) => {
  try {
    res.json([
      { id: 1, vm_name: "VM-Production", cpu: 70, ram: 16, status: "Running" },
      { id: 2, vm_name: "VM-Staging", cpu: 35, ram: 8, status: "Stopped" },
    ]);
  } catch {
    res.status(500).json({ message: "VM usage stats error" });
  }
};

/* ===========================
   VENDOR FUNCTIONS
=========================== */

const addVendor = async (req, res) => {
  try {
    const {
      vendorCode,
      companyName,
      vendorAddress,
      industry,
      registrationNumber,
      gstNumber,
      panNumber,
      website,
    } = req.body;

    const result = await pool.query(vmSqlc.insertVendorQuery, [
      vendorCode,
      companyName,
      vendorAddress,
      industry,
      registrationNumber,
      gstNumber,
      panNumber,
      website,
    ]);

    res.status(201).json({
      message: "Vendor added successfully",
      vendor: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ message: "Vendor code already exists" });
    }

    res.status(500).json({ message: "Error adding vendor" });
  }
};

const getAllVendors = async (_req, res) => {
  try {
    const result = await pool.query(vmSqlc.getAllVendorsQuery);
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Error fetching vendors" });
  }
};

/* ===========================
   QUOTATION FUNCTIONS
=========================== */

const saveQuotation = async (req, res) => {
  try {
    const {
      vendorCode,
      billToName,
      billToAddress,
      quotationDate,
      quotationNo,
      poNo,
      discount,
      isInterState,
      subtotal,
      totalTax,
      total,
      items,
    } = req.body;

    const masterResult = await pool.query(
      vmSqlc.insertQuotationMasterQuery,
      [
        vendorCode,
        billToName,
        billToAddress,
        quotationDate,
        quotationNo,
        poNo,
        discount,
        isInterState,
        subtotal,
        totalTax,
        total,
      ]
    );

    const quotationId = masterResult.rows[0].quotation_id;

    for (const item of items) {
      await pool.query(vmSqlc.insertQuotationItemQuery, [
        quotationId,
        item.desc,
        item.qty,
        item.price,
        item.qty * item.price,
      ]);
    }

    res.status(201).json({
      message: "Quotation saved successfully",
      quotationId,
    });
  } catch (err) {
    console.error("SAVE QUOTATION ERROR:", err);
    res.status(500).json({ message: "Error saving quotation" });
  }
};

const getAllQuotations = async (_req, res) => {
  try {
    const result = await pool.query(vmSqlc.getAllQuotationsQuery);
    res.json(result.rows);
  } catch (err) {
    console.error("FETCH QUOTATIONS ERROR:", err);
    res.status(500).json({ message: "Error fetching quotations" });
  }
};


/* ===========================
   NEW: GET QUOTATION BY ID
=========================== */
const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Get quotation master
    const masterResult = await pool.query(
      vmSqlc.getQuotationByIdQuery,
      [id]
    );

    if (masterResult.rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // 2️⃣ Get quotation items
    const itemsResult = await pool.query(
      vmSqlc.getQuotationItemsByQuotationIdQuery,
      [id]
    );

    res.json({
      ...masterResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error("GET QUOTATION BY ID ERROR:", err);
    res.status(500).json({ message: "Error fetching quotation details" });
  }
};

/* ===========================
   NEW: GET VENDOR BY CODE
=========================== */
const getVendorByCode = async (req, res) => {
  try {
    const { vendorCode } = req.params;

    const result = await pool.query(
      "SELECT * FROM vendors WHERE vendor_code = $1",
      [vendorCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET VENDOR ERROR:", err);
    res.status(500).json({ message: "Error fetching vendor" });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      companyName,
      vendorAddress,
      industry,
      registrationNumber,
      gstNumber,
      panNumber,
      website,
    } = req.body;

    const result = await pool.query(vmSqlc.updateVendorQuery, [
      companyName,
      vendorAddress,
      industry,
      registrationNumber,
      gstNumber,
      panNumber,
      website,
      id,
    ]);

    res.json({
      message: "Vendor updated successfully",
      vendor: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Error updating vendor" });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(vmSqlc.deleteVendorQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      message: "Vendor deleted permanently",
      vendor: result.rows[0],
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Error deleting vendor" });
  }
};

export default {
  getDashboardStats,
  getVmUsageStats,
  addVendor,
  getAllVendors,
  getVendorByCode, // 👈 NEW EXPORT
  updateVendor,
  deleteVendor,
   saveQuotation,
  getAllQuotations,
  getQuotationById,
};
