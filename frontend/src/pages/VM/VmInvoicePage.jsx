import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VmInvoicePage.css";

const VmInvoicePage = () => {
  const [open, setOpen] = useState(false);

  const [vendors, setVendors] = useState([]);
  const [quotations, setQuotations] = useState([]); // ✅ ADDED

  const [selectedVendorCode, setSelectedVendorCode] = useState("");
  const [isInterState, setIsInterState] = useState(false);

  const [form, setForm] = useState({
    billToName: "",
    billToAddress: "",
    contactName: "",
    contactEmail: "",
    contactNo: "",
    quotationDate: "",
    quotationNo: "",
    poNo: "",
    venCode: "",
    items: [{ desc: "", qty: 1, price: 0 }],
    discount: 0,
  });

  /* ================= LOAD VENDORS + QUOTATIONS ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/vm/vendors")
      .then((res) => setVendors(res.data))
      .catch(() => {});

    loadQuotations(); // ✅ ADDED
  }, []);

  const loadQuotations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/vm/quotation");
      setQuotations(res.data);
    } catch {}
  };

  /* ================= CALCULATIONS ================= */
  const subtotal = form.items.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  const subtotalLessDiscount = subtotal - Number(form.discount || 0);

  const SGST_RATE = 9;
  const CGST_RATE = 9;
  const IGST_RATE = 18;

  const sgstAmount = isInterState
    ? 0
    : (subtotalLessDiscount * SGST_RATE) / 100;

  const cgstAmount = isInterState
    ? 0
    : (subtotalLessDiscount * CGST_RATE) / 100;

  const igstAmount = isInterState
    ? (subtotalLessDiscount * IGST_RATE) / 100
    : 0;

  const totalTax = sgstAmount + cgstAmount + igstAmount;
  const total = subtotalLessDiscount + totalTax;

  /* ================= HANDLERS ================= */
  const updateItem = (i, key, value) => {
    const items = [...form.items];
    items[i][key] = Number.isNaN(value) ? value : Number(value);
    setForm({ ...form, items });
  };

  const addRow = () => {
    setForm({
      ...form,
      items: [...form.items, { desc: "", qty: 1, price: 0 }],
    });
  };

  /* ================= VENDOR SELECT ================= */
  const handleVendorSelect = async (code) => {
    setSelectedVendorCode(code);
    if (!code) return;

    const res = await axios.get(
      `http://localhost:5000/vm/vendors/code/${code}`
    );

    const v = res.data;

    setForm((prev) => ({
      ...prev,
      billToName: v.company_name || "",
      billToAddress: v.vendor_address || "",
      venCode: v.vendor_code || "",
    }));
  };

  /* ================= SAVE QUOTATION ================= */
  const saveQuotation = async () => {
    try {
      const payload = {
        vendorCode: form.venCode,
        billToName: form.billToName,
        billToAddress: form.billToAddress,
        quotationDate: form.quotationDate,
        quotationNo: form.quotationNo,
        poNo: form.poNo,
        discount: Number(form.discount),
        isInterState,
        subtotal,
        totalTax,
        total,
        items: form.items,
      };

      await axios.post("http://localhost:5000/vm/quotation", payload);

      alert("Quotation saved successfully");

      loadQuotations(); // ✅ ADDED (ONLY CHANGE AFTER SAVE)

      // reset form (UNCHANGED)
      setForm({
        billToName: "",
        billToAddress: "",
        contactName: "",
        contactEmail: "",
        contactNo: "",
        quotationDate: "",
        quotationNo: "",
        poNo: "",
        venCode: "",
        items: [{ desc: "", qty: 1, price: 0 }],
        discount: 0,
      });

      setSelectedVendorCode("");
      setIsInterState(false);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save quotation");
    }
  };

  return (
    <div className="page">
      {/* ================= SAVED QUOTATIONS (BACKGROUND AREA) ================= */}
      {!open && (
        <div className="card">
          <h3>Saved Quotations</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Vendor Code</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No quotations available
                  </td>
                </tr>
              )}

              {quotations.map((q) => (
                <tr key={q.quotation_id}>
                  <td>{q.quotation_no}</td>
                  <td>{q.vendor_code}</td>
                  <td>{q.quotation_date}</td>
                  <td>₹ {q.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE BUTTON (UNCHANGED) */}
      {!open && (
        <div className="top-right">
          <button className="btn-primary" onClick={() => setOpen(true)}>
            Create Quotation +
          </button>
        </div>
      )}

      {/* FORM (100% UNCHANGED) */}
      {open && (
        <div className="card">
          {/* HEADER */}
          <div className="card-header">
            <h2>Quotation Form</h2>
            <button className="btn-close" onClick={() => setOpen(false)}>
              ✕ Close
            </button>
          </div>

          {/* SELECT VENDOR */}
          <Section title="Select Vendor">
            <select
              className="input"
              value={selectedVendorCode}
              onChange={(e) => handleVendorSelect(e.target.value)}
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map((v) => (
                <option key={v.vendor_id} value={v.vendor_code}>
                  {v.company_name} ({v.vendor_code})
                </option>
              ))}
            </select>
          </Section>

          {/* BILL TO */}
          <Section title="Bill To">
            <input className="input" value={form.billToName} readOnly />
            <textarea className="textarea" value={form.billToAddress} readOnly />
          </Section>

          {/* INTER-STATE */}
          <Section title="Tax Type">
            <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isInterState}
                onChange={(e) => setIsInterState(e.target.checked)}
              />
              Inter-state Transaction (Apply IGST 18%)
            </label>
          </Section>

          {/* QUOTATION DETAILS */}
          <Section title="Quotation Details">
            <div className="grid grid-4">
              <input
                type="date"
                className="input"
                onChange={(e) =>
                  setForm({ ...form, quotationDate: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Quotation No"
                onChange={(e) =>
                  setForm({ ...form, quotationNo: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="PO No"
                onChange={(e) =>
                  setForm({ ...form, poNo: e.target.value })
                }
              />
              <input className="input" value={form.venCode} readOnly />
            </div>
          </Section>

          {/* SERVICES */}
          <Section title="Service Details">
            <table className="table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        className="table-input"
                        onChange={(e) =>
                          updateItem(i, "desc", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="table-input"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(i, "qty", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="table-input"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(i, "price", e.target.value)
                        }
                      />
                    </td>
                    <td>₹ {item.qty * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="btn-secondary" onClick={addRow}>
              + Add Row
            </button>
          </Section>

          {/* CALCULATION */}
          <Section title="Calculation">
            <div className="calc-grid">
              <div className="calc-left">
                <p>Subtotal</p>
                <p>Discount</p>
                <p>Subtotal Less Discount</p>
                {!isInterState && <p>SGST (9%)</p>}
                {!isInterState && <p>CGST (9%)</p>}
                {isInterState && <p>IGST (18%)</p>}
                <p><b>Total Tax</b></p>
                <p className="total-label">Total</p>
              </div>

              <div className="calc-right">
                <p>₹ {subtotal}</p>

                <input
                  type="number"
                  className="input"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: e.target.value })
                  }
                />

                <p>₹ {subtotalLessDiscount}</p>

                {!isInterState && <p>₹ {sgstAmount}</p>}
                {!isInterState && <p>₹ {cgstAmount}</p>}
                {isInterState && <p>₹ {igstAmount}</p>}

                <p><b>₹ {totalTax}</b></p>
                <p className="total-value">₹ {total}</p>
              </div>
            </div>
          </Section>

          {/* ACTIONS */}
          <div className="actions">
            <button className="btn-secondary" onClick={saveQuotation}>
              Save Quotation
            </button>
            <button className="btn-primary">Download Excel</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* SMALL COMPONENT */
const Section = ({ title, children }) => (
  <div className="section">
    <h4>{title}</h4>
    {children}
  </div>
);

export default VmInvoicePage;
