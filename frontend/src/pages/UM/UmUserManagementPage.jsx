import { useAuth } from '@/context/AuthContext';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const API_BASE = 'http://localhost:5000/user';

// Status options - using numeric codes for database
const STATUS_OPTIONS = [
  { value: 1, label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 2, label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
  { value: 3, label: 'On Leave', color: 'bg-yellow-100 text-yellow-700' },
  { value: 4, label: 'Suspended', color: 'bg-red-100 text-red-700' },
];

export default function UmUserManagementPage() {
  const { isAdmin, isHR } = useAuth();

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

  const [form, setForm] = useState({
    n_user_id: null,
    s_full_name: '',
    s_email: '',
    s_password: '',
    n_role: '',
    d_joining_date: '',
    n_status: 1, // Default status (1 = Active)
  });

  /* ---------------- FETCH ---------------- */

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

  /* ---------------- USER CRUD ---------------- */

  const resetForm = () => {
    setForm({
      n_user_id: null,
      s_full_name: '',
      s_email: '',
      s_password: '',
      n_role: '',
      d_joining_date: '',
      n_status: 1,
    });
    setIsEdit(false);
  };

  const saveUser = async () => {
    try {
      // Validation
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

      // Prepare payload
      const payload = {
        s_full_name: form.s_full_name,
        s_email: form.s_email,
        n_role: parseInt(form.n_role),
        d_joining_date: form.d_joining_date || null,
        n_status: parseInt(form.n_status),
      };

      if (isEdit) {
        payload.n_user_id = form.n_user_id;
      } else {
        payload.s_password = form.s_password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to save user');
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
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

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
      s_full_name: user.s_full_name,
      s_email: user.s_email,
      s_password: '',
      n_role: user.n_role,
      d_joining_date: user.d_joining_date?.split('T')[0] || '',
      n_status: user.n_status || 1,
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  /* ---------------- ROLE CRUD ---------------- */

  const handleAddRoleInManage = async () => {
    if (!newRoleInManage.trim()) {
      alert('Role name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/role/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s_role_name: newRoleInManage.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      setNewRoleInManage('');
      fetchRoles();
      alert('Role created successfully');
    } catch (err) {
      console.error('Create role error:', err);
      alert('Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole.s_role_name.trim()) {
      alert('Role name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/role/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRole),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setEditingRole(null);
      fetchRoles();
      fetchUsers();
      alert('Role updated successfully');
    } catch (err) {
      console.error('Update role error:', err);
      alert('Failed to update role');
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/role/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      setDeleteRoleId(null);
      fetchRoles();
      alert('Role deleted successfully');
    } catch (err) {
      console.error('Delete role error:', err);
      alert('Failed to delete role. It may be assigned to users.');
    }
  };

  /* ---------------- HELPER FUNCTIONS ---------------- */

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

  /* ---------------- ACCESS CONTROL ---------------- */

  if (!isAdmin() && !isHR()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Members
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage users and assigned roles
            </p>
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

        {/* ERROR MESSAGE */}
        {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">{error}</div>}

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found. Create your first user!</p>
          </div>
        ) : (
          /* USER CARDS */
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
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {user.s_full_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.s_email}
                      </p>
                    </div>
                    <Badge className={`${statusBadge.color} h-fit text-xs px-2 py-0.5`}>{statusBadge.label}</Badge>
                  </div>

                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p>
                      <strong>Role:</strong> {getRoleName(user.n_role)}
                    </p>
                    <p>
                      <strong>Joined:</strong> {formatDate(user.d_joining_date)}
                    </p>
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

      {/* ADD / EDIT USER */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Update User' : 'Create User'}</DialogTitle>
            <DialogDescription>{isEdit ? 'Modify user details' : 'Add a new team member'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input
              placeholder="Full Name *"
              value={form.s_full_name}
              onChange={(e) => setForm({ ...form, s_full_name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email *"
              value={form.s_email}
              onChange={(e) => setForm({ ...form, s_email: e.target.value })}
            />
            {!isEdit && (
              <Input
                type="password"
                placeholder="Password *"
                value={form.s_password}
                onChange={(e) => setForm({ ...form, s_password: e.target.value })}
              />
            )}
            <select
              className="w-full h-10 rounded-md border px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              value={form.n_role}
              onChange={(e) => setForm({ ...form, n_role: e.target.value })}
            >
              <option value="">Select Role *</option>
              {roles.map((r) => (
                <option key={r.n_id} value={r.n_id}>
                  {r.s_role_name}
                </option>
              ))}
            </select>
            <select
              className="w-full h-10 rounded-md border px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              value={form.n_status}
              onChange={(e) => setForm({ ...form, n_status: e.target.value })}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={form.d_joining_date}
              onChange={(e) => setForm({ ...form, d_joining_date: e.target.value })}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveUser}>{isEdit ? 'Update User' : 'Create User'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE USER */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteUsers(deleteId)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MANAGE ROLES */}
      <Dialog open={isManageRolesOpen} onOpenChange={setIsManageRolesOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            <DialogDescription>Create, update or delete roles</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-3">
            <Input
              placeholder="New role name"
              value={newRoleInManage}
              onChange={(e) => setNewRoleInManage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddRoleInManage();
              }}
            />
            <Button onClick={handleAddRoleInManage}>Add</Button>
          </div>

          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No roles created yet</p>
            ) : (
              roles.map((role) => (
                <div key={role.n_id} className="flex justify-between items-center border rounded-lg p-3">
                  {editingRole?.n_id === role.n_id ? (
                    <>
                      <Input
                        value={editingRole.s_role_name}
                        onChange={(e) =>
                          setEditingRole({
                            ...editingRole,
                            s_role_name: e.target.value,
                          })
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleUpdateRole();
                        }}
                      />
                      <div className="flex gap-2 ml-2">
                        <Button size="sm" onClick={handleUpdateRole}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingRole(null)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{role.s_role_name}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingRole(role)}>
                          <Pencil size={14} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteRoleId(role.n_id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE ROLE */}
      <Dialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This may affect users assigned to this role.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteRoleId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteRole(deleteRoleId)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
