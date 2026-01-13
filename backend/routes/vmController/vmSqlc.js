const insertVendorQuery = `
  INSERT INTO vendors
  (vendor_code, company_name, vendor_address, industry, registration_number, gst_number, pan_number, website)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
  RETURNING *;
`;

const getAllVendorsQuery = `
  SELECT *
  FROM vendors
  ORDER BY created_at DESC;
`;

const updateVendorQuery = `
  UPDATE vendors
  SET
    company_name = $1,
    vendor_address = $2,
    industry = $3,
    registration_number = $4,
    gst_number = $5,
    pan_number = $6,
    website = $7,
    updated_at = CURRENT_TIMESTAMP
  WHERE vendor_id = $8
  RETURNING *;
`;


const deleteVendorQuery = `
  DELETE FROM vendors
  WHERE vendor_id = $1
  RETURNING *;
`;

/* ===========================
   QUOTATION SQL
=========================== */

const insertQuotationMasterQuery = `
  INSERT INTO quotation_master
  (vendor_code, bill_to_name, bill_to_address, quotation_date,
   quotation_no, po_no, discount, is_interstate,
   subtotal, total_tax, total)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  RETURNING quotation_id;
`;

const insertQuotationItemQuery = `
  INSERT INTO quotation_items
  (quotation_id, description, qty, price, amount)
  VALUES ($1,$2,$3,$4,$5);
`;

const getAllQuotationsQuery = `
  SELECT *
  FROM quotation_master
  ORDER BY created_at DESC;
`;


export default {
  insertVendorQuery,
  getAllVendorsQuery,
  updateVendorQuery,
  deleteVendorQuery,
  insertQuotationMasterQuery,
  insertQuotationItemQuery,
  getAllQuotationsQuery,
};
