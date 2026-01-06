import { Plus, Pencil, Trash2, Settings, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/user';

// Status options
const STATUS_OPTIONS = [
  { value: 1, label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 2, label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
  { value: 3, label: 'On Leave', color: 'bg-yellow-100 text-yellow-700' },
  { value: 4, label: 'Suspended', color: 'bg-red-100 text-red-700' },
];

// Mock components (replace with your actual shadcn/ui components)
const Badge = ({ className, children }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Button = ({ variant = 'default', size = 'default', onClick, children, className = '' }) => {
  const variants = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-sm',
  };
  return (
    <button
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} rounded-md font-medium transition ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ type = 'text', placeholder, value, onChange, name, maxLength, className = '', accept }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    name={name}
    maxLength={maxLength}
    accept={accept}
    className={`w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-h-[90vh] overflow-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold z-10"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = '' }) => (
  <div className={`p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${className}`}>{children}</div>
);

const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-xl font-bold text-gray-900 dark:text-white">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{children}</p>;

// File Input Component with Label
const FileInputField = ({ label, name, onChange, required = false }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Input
        type="file"
        name={name}
        onChange={onChange}
        accept="image/*,application/pdf"
        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
      />
    </div>
  </div>
);

export default function UmUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteRoleId, setDeleteRoleId] = useState(null);
  const [newRoleInManage, setNewRoleInManage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({});

  const [form, setForm] = useState({
    n_user_id: null,
    s_full_name: '',
    s_email: '',
    s_password: '',
    n_role: '',
    d_joining_date: '',
    n_status: 1,
    s_aadhar_card_no: '',
    s_pan_card_no: '',
    s_bank_name: '',
    s_bank_account_no: '',
    s_bank_ifsc_code: '',
  });

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (!fileList || !fileList.length) return;
    setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/getAll`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/role/getAll`);
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch roles error:', err);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const resetForm = () => {
    setForm({
      n_user_id: null,
      s_full_name: '',
      s_email: '',
      s_password: '',
      n_role: '',
      d_joining_date: '',
      n_status: 1,
      s_aadhar_card_no: '',
      s_pan_card_no: '',
      s_bank_name: '',
      s_bank_account_no: '',
      s_bank_ifsc_code: '',
    });
    setFiles({});
    setIsEdit(false);
  };

  const saveUser = async () => {
    try {
      if (!form.s_full_name || !form.s_email || !form.n_role) {
        alert('Please fill all required fields');
        return;
      }

      if (!isEdit && !form.s_password) {
        alert('Password is required for new users');
        return;
      }

      const url = isEdit ? `${API_BASE}/update` : `${API_BASE}/create`;
      const method = isEdit ? 'PUT' : 'POST';

      const formData = new FormData();

      if (isEdit) {
        formData.append('n_user_id', form.n_user_id);
      }

      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'n_user_id' && value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      Object.entries(files || {}).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await fetch(url, { method, body: formData });

      let result = null;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save user');
      }

      setIsOpen(false);
      resetForm();
      fetchUsers();
      alert(isEdit ? 'User updated successfully' : 'User created successfully');
    } catch (err) {
      console.error('Save user error:', err);
      alert(err.message || 'Failed to save user');
    }
  };

  const deleteUsers = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete user');
      setDeleteId(null);
      fetchUsers();
      alert('User deleted successfully');
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user');
    }
  };

const openEdit = (user) => {
  setForm({
    n_user_id: user.n_user_id,
    s_full_name: user.s_full_name || '',
    s_email: user.s_email || '',
    n_role: user.n_role || '',
    d_joining_date: user.d_joining_date?.split('T')[0] || '',
    n_status: user.n_status ?? 1,
    s_aadhar_card_no: user.s_aadhar_card_no || '',
    s_pan_card_no: user.s_pan_card_no || '',
    s_bank_name: user.s_bank_name || '',
    s_bank_account_no: user.s_bank_account_no || '',
    s_bank_ifsc_code: user.s_bank_ifsc_code || '',

    // 👇 store flags
    has_aadhar_img: user.has_aadhar_img,
    has_pan_img: user.has_pan_img,
    has_passport_photo: user.has_passport_photo,
  });

  setFiles({});
  setIsEdit(true);
  setIsOpen(true);
};


  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.n_id === roleId);
    return role ? role.s_role_name : 'No Role';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toISOString().split('T')[0];
  };

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    return statusOption || STATUS_OPTIONS[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage users and assigned roles</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <Button variant="outline" onClick={() => setIsManageRolesOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Roles
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No users found. Create your first user!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((user) => {
              const statusBadge = getStatusBadge(user.n_status);
              return (
                <div
                  key={user.n_user_id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md dark:hover:shadow-lg transition"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{user.s_full_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.s_email}</p>
                    </div>
                    <Badge className={`${statusBadge.color} h-fit`}>{statusBadge.label}</Badge>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p><strong>Role:</strong> {getRoleName(user.n_role)}</p>
                    <p><strong>Joined:</strong> {formatDate(user.d_joining_date)}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(user.n_user_id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT USER DIALOG */}
      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="w-[90vw] max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Update User' : 'Create User'}</DialogTitle>
            <DialogDescription>{isEdit ? 'Modify user details' : 'Add a new team member'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* BASIC INFORMATION */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b dark:border-gray-700 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter full name"
                    value={form.s_full_name}
                    onChange={(e) => setForm({ ...form, s_full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={form.s_email}
                    onChange={(e) => setForm({ ...form, s_email: e.target.value })}
                  />
                </div>
                {!isEdit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={form.s_password}
                      onChange={(e) => setForm({ ...form, s_password: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.n_role}
                    onChange={(e) => setForm({ ...form, n_role: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.n_id} value={r.n_id}>{r.s_role_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.n_status}
                    onChange={(e) => setForm({ ...form, n_status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joining Date</label>
                  <Input
                    type="date"
                    value={form.d_joining_date}
                    onChange={(e) => setForm({ ...form, d_joining_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* IDENTITY DETAILS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b dark:border-gray-700 pb-2">Identity Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar Number</label>
                  <Input
                    placeholder="Enter 12-digit Aadhaar"
                    maxLength={12}
                    value={form.s_aadhar_card_no}
                    onChange={(e) => setForm({ ...form, s_aadhar_card_no: e.target.value })}
                  />
                </div>
                <FileInputField label="Choose Aadhaar Card Image" name="b_aadhar_card_img" onChange={handleFileChange} />
                {/* Aadhaar Preview */}
                  {isEdit && form.has_aadhar_img && (
                    <div className="mt-2">
                      <a
                        href={`${API_BASE}/document/${form.n_user_id}/b_aadhar_card_img`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm underline block mt-1"
                      >
                        Download Aadhaar
                      </a>
                    </div>
                  )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN Number</label>
                  <Input
                    placeholder="Enter 10-digit PAN"
                    maxLength={10}
                    value={form.s_pan_card_no}
                    onChange={(e) => setForm({ ...form, s_pan_card_no: e.target.value })}
                  />
                </div>
                <FileInputField label="Choose PAN Card Image" name="b_pan_card_img" onChange={handleFileChange} />
                {isEdit && form.has_pan_img && (
                  <div className="mt-2">
                    <a
                      href={`${API_BASE}/document/${form.n_user_id}/b_pan_card_img`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm underline block mt-1"
                    >
                      Download PAN
                    </a>
                  </div>
                )}
                
                <FileInputField label="Choose Passport Photo" name="b_passport_photo" onChange={handleFileChange} />
                {isEdit && form.has_passport_photo && (
                <div className="mt-2">
                  <a
                    href={`${API_BASE}/document/${form.n_user_id}/b_passport_photo`}
                    target="_blank"
                    className="text-blue-600 text-sm underline block mt-1"
                  >
                    Download Passport Photo
                  </a>
                </div>
              )}

                
              </div>
            </div>

            {/* EDUCATION DOCUMENTS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b dark:border-gray-700 pb-2">Education Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileInputField label="Choose 10th Marksheet" name="b_10th_mark_sheet" onChange={handleFileChange} />
                <FileInputField label="Choose 12th Marksheet" name="b_12th_mark_sheet" onChange={handleFileChange} />
                <FileInputField label="Choose Degree Marksheet" name="b_degree_mark_sheet" onChange={handleFileChange} />
                <FileInputField label="Choose Certificates" name="b_certificates" onChange={handleFileChange} />
              </div>
            </div>

            {/* PROFESSIONAL DOCUMENTS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b dark:border-gray-700 pb-2">Professional Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileInputField label="Choose Professional Certifications" name="b_professional_certifications" onChange={handleFileChange} />
                <FileInputField label="Choose Offer Letter" name="b_offer_letter" onChange={handleFileChange} />
                <FileInputField label="Choose Experience Letter" name="b_experience_letter" onChange={handleFileChange} />
                <FileInputField label="Choose Salary Slips" name="b_salary_slips" onChange={handleFileChange} />
              </div>
            </div>

            {/* BANK DETAILS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b dark:border-gray-700 pb-2">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                  <Input
                    placeholder="Enter bank name"
                    value={form.s_bank_name}
                    onChange={(e) => setForm({ ...form, s_bank_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                  <Input
                    placeholder="Enter account number"
                    value={form.s_bank_account_no}
                    onChange={(e) => setForm({ ...form, s_bank_account_no: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
                  <Input
                    placeholder="Enter IFSC code"
                    value={form.s_bank_ifsc_code}
                    onChange={(e) => setForm({ ...form, s_bank_ifsc_code: e.target.value })}
                  />
                </div>
                <FileInputField label="Choose Bank Passbook Copy" name="b_bank_passbook_copy" onChange={handleFileChange} />
                <FileInputField label="Choose Resume/CV" name="b_resume_cv" onChange={handleFileChange} />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={saveUser}>{isEdit ? 'Update User' : 'Create User'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE USER DIALOG */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>Are you sure you want to delete this user? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteUsers(deleteId)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}