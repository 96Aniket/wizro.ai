import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./VmInvoicePage.css";

const VmInvoicePage = () => {
  const [open, setOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); // ✅ ADDED

  const [vendors, setVendors] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [selectedVendorCode, setSelectedVendorCode] = useState("");
  const [isInterState, setIsInterState] = useState(false);
  const printRef = useRef();

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };


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
    axios.get("http://localhost:5000/vm/vendors").then((res) => {
      setVendors(res.data);
    });

    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/vm/quotation");
      setQuotations(res.data);
    } catch { }
  };

  /* ================= DATE FORMAT ================= */
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  /* ================= CALCULATIONS ================= */
  const subtotal = form.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const subtotalLessDiscount = subtotal - Number(form.discount || 0);

  const sgstAmount = isInterState ? 0 : (subtotalLessDiscount * 9) / 100;
  const cgstAmount = isInterState ? 0 : (subtotalLessDiscount * 9) / 100;
  const igstAmount = isInterState ? (subtotalLessDiscount * 18) / 100 : 0;

  const totalTax = sgstAmount + cgstAmount + igstAmount;
  const total = subtotalLessDiscount + totalTax;

  /* ================= HANDLERS ================= */
  const updateItem = (i, key, value) => {
    if (isViewMode) return;

    const items = [...form.items];

    if (key === "desc") {
      items[i][key] = value;           // ✅ keep string
    } else {
      items[i][key] = Number(value) || 0; // ✅ numeric only
    }

    setForm({ ...form, items });
  };

  const addRow = () => {
    if (isViewMode) return;
    setForm({
      ...form,
      items: [...form.items, { desc: "", qty: 1, price: 0 }],
    });
  };

  /* ================= VENDOR SELECT ================= */
  const handleVendorSelect = async (code) => {
    if (isViewMode) return;

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

  /* ================= PRINT HANDLER ================= */
  const handlePrint = () => {
    const printContents = printRef.current.cloneNode(true);

    // Convert inputs to plain text
    printContents.querySelectorAll("input, textarea").forEach((el) => {
      const span = document.createElement("span");
      span.innerText = el.value || "—";
      span.style.display = "inline-block";
      span.style.minWidth = "80px";
      el.replaceWith(span);
    });

    const printWindow = window.open("", "", "width=900,height=650");

    printWindow.document.write(`
    <html>
      <head>
        <title>Quotation</title>
        <style>
          body {
            font-family: Inter, Segoe UI, sans-serif;
            margin: 24px;
            color: #000;
          }

          h2, h4 {
            margin-bottom: 12px;
          }

          /* Section spacing */
          .section {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }

          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            padding: 6px 4px;
          }

          tr {
            page-break-inside: avoid;
          }

          /* CALCULATION FIX */
          .calc-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            border: 1px solid #ddd;
            padding: 16px;
          }

          .calc-left {
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 13px;
          }

          .calc-right {
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 13px;
            text-align: right;
          }

          .total-label {
            font-weight: 700;
            margin-top: 8px;
          }

          .total-value {
            font-weight: 800;
            font-size: 16px;
          }

          /* Hide buttons */
          button {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${printContents.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };


  /* ================= VIEW QUOTATION (ONLY ADDITION) ================= */
  const handleViewQuotation = async (quotationId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/vm/quotation/${quotationId}`
      );

      const q = res.data;

      setForm({
        billToName: q.bill_to_name,
        billToAddress: q.bill_to_address,
        contactName: "",
        contactEmail: "",
        contactNo: "",
        quotationDate: toInputDate(q.quotation_date),
        quotationNo: q.quotation_no,
        poNo: q.po_no,
        venCode: q.vendor_code,
        items: q.items,        // ✅ MULTIPLE SERVICES
        discount: q.discount,
      });

      setSelectedVendorCode(q.vendor_code);
      setIsInterState(q.is_inter_state);
      setIsViewMode(true);
      setOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load quotation details");
    }
  };


  /* ================= SAVE QUOTATION (UNCHANGED) ================= */
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

      loadQuotations();

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
      setIsViewMode(false);
    } catch {
      alert("Failed to save quotation");
    }
  };

  return (
    <div className="page">
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
                <th>Action</th> {/* ✅ ADDED */}
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.quotation_id}>
                  <td>{q.quotation_no || q.quotationNo}</td>

                  <td>{q.vendor_code}</td>
                  <td>{formatDate(q.quotation_date)}</td>
                  <td>₹ {q.total}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleViewQuotation(q.quotation_id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!open && (
        <div className="top-right">
          <button
            className="btn-primary"
            onClick={() => {
              setOpen(true);
              setIsViewMode(false);
            }}
          >
            Create Quotation +
          </button>
        </div>
      )}

      {open && (
        <div className="card" ref={printRef}>
          <div className="card-header">
            <h2>Quotation Form</h2>
            <button
              className="btn-close"
              onClick={() => {
                setOpen(false);
                setIsViewMode(false);
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* 🔴 EVERYTHING BELOW IS YOUR ORIGINAL FORM — UNTOUCHED */}
          {/* Only disabled/readOnly added */}

          {/* SELECT VENDOR */}
          <Section title="Select Vendor">
            <select
              className="input"
              value={selectedVendorCode}
              onChange={(e) => handleVendorSelect(e.target.value)}
              disabled={isViewMode}
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
                disabled={isViewMode}
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
                placeholder="Quotation Date"
                value={form.quotationDate}
                disabled={isViewMode}
                onChange={(e) =>
                  setForm({ ...form, quotationDate: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Quotation Number"
                value={form.quotationNo}
                disabled={isViewMode}
                onChange={(e) =>
                  setForm({ ...form, quotationNo: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="PO Number"
                value={form.poNo}
                disabled={isViewMode}
                onChange={(e) =>
                  setForm({ ...form, poNo: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Vendor Code"
                value={form.venCode}
                readOnly
              />

            </div>
          </Section>

          {/* SERVICES */}
          <Section title="Service Details">
            <table className="table">
              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        className="table-input"
                        placeholder="Description"
                        value={item.desc}
                        disabled={isViewMode}
                        onChange={(e) =>
                          updateItem(i, "desc", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="table-input"
                        placeholder="Quantity"
                        value={item.qty}
                        disabled={isViewMode}
                        onChange={(e) =>
                          updateItem(i, "qty", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="table-input"
                        placeholder="Amount"
                        value={item.price}
                        disabled={isViewMode}
                        onChange={(e) =>
                          updateItem(i, "price", e.target.value)
                        }
                      />
                    </td>
                    <td>₹ {(Number(item.qty) || 0) * (Number(item.price) || 0)}</td>

                  </tr>
                ))}
              </tbody>
            </table>

            {!isViewMode && (
              <button className="btn-secondary" onClick={addRow}>
                + Add Row
              </button>
            )}
          </Section>

          {/* CALCULATION (UNCHANGED) */}
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
                  disabled={isViewMode}
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
            {!isViewMode && (
              <button className="btn-secondary" onClick={saveQuotation}>
                Save Quotation
              </button>
            )}
            {isViewMode && (
              <button className="btn-primary" onClick={handlePrint}>
                Print
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="section">
    <h4>{title}</h4>
    {children}
  </div>
);

export default VmInvoicePage;
