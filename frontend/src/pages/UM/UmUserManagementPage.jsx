import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function UmUserManagementPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteRoleId, setDeleteRoleId] = useState(null);
  const [newRoleInManage, setNewRoleInManage] = useState("");

  const [form, setForm] = useState({
    n_user_id: null,
    s_full_name: "",
    s_email: "",
    s_role: "",
    d_joining_date: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/user/getAll");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("http://localhost:5000/user/role/getAll");
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
      console.log("Roles fetched:", data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

  const handleAddRole = async () => {
    if (!roleForm.s_role_name.trim()) {
      alert("Role name is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/user/role/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          s_role_name: roleForm.s_role_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add role");
        return;
      }

      setRoleForm({ s_role_name: "" });
      setIsRoleOpen(false);
      alert("Role added successfully");
      fetchRoles();
    } catch (error) {
      console.error("Error adding role:", error);
      alert("Error adding role");
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.s_role_name.trim()) {
      alert("Role name is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/user/role/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          n_id: editingRole.n_id,
          s_role_name: editingRole.s_role_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update role");
        return;
      }

      setEditingRole(null);
      alert("Role updated successfully");
      fetchRoles();
      fetchUsers(); // Refresh users to show updated role names
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating role");
    }
  };

  const handleAddRoleInManage = async () => {
    if (!newRoleInManage.trim()) {
      alert("Role name is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/user/role/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          s_role_name: newRoleInManage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add role");
        return;
      }

      setNewRoleInManage("");
      alert("Role added successfully");
      fetchRoles();
    } catch (error) {
      console.error("Error adding role:", error);
      alert("Error adding role");
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const res = await fetch(`http://localhost:5000/user/role/delete/${roleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete role");
        return;
      }

      setDeleteRoleId(null);
      alert("Role deleted successfully");
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Error deleting role");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const saveUser = async () => {
    const url = isEdit
      ? "http://localhost:5000/user/update"
      : "http://localhost:5000/user/create";

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          n_user_id: form.n_user_id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to save user");
        return;
      }

      setIsOpen(false);
      setIsEdit(false);
      setForm({
        n_user_id: null,
        s_full_name: "",
        s_email: "",
        s_role: "",
        d_joining_date: "",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user");
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`http://localhost:5000/user/delete/${id}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openEdit = (user) => {
    setForm({
      n_user_id: user.n_user_id,
      s_full_name: user.s_full_name || "",
      s_email: user.s_email || "",
      s_role: user.s_role || "",
      d_joining_date: user.d_joining_date
        ? user.d_joining_date.slice(0, 10)
        : "",
    });

    setIsEdit(true);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Team Members</h2>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setForm({
                n_user_id: null,
                s_full_name: "",
                s_email: "",
                s_role: "",
                d_joining_date: "",
              });
              setIsEdit(false);
              setIsOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </Button>

          <Button 
            variant="outline" 
            onClick={() => {
              console.log("Manage Roles clicked");
              setIsManageRolesOpen(true);
            }}
          >
            <Settings className="w-4 h-4 mr-1" />
            Manage Roles
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-6 gap-4 font-semibold border-b pb-2">
          <div>Name</div>
          <div>Role</div>
          <div>Email</div>
          <div>Joining Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {users.map((user) => (
          <div
            key={user.n_user_id}
            className="grid grid-cols-6 gap-4 items-center py-2 border-b"
          >
            <div>{user.s_full_name}</div>
            <div>{user.s_role}</div>
            <div>{user.s_email}</div>
            <div>
              {user.d_joining_date
                ? new Date(user.d_joining_date).toLocaleDateString()
                : "-"}
            </div>
            <div>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                <Pencil size={16} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteId(user.n_user_id);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Manage Roles Dialog */}
      <Dialog open={isManageRolesOpen} onOpenChange={setIsManageRolesOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            <DialogDescription>
              View, edit, or delete existing roles
            </DialogDescription>
          </DialogHeader>

          {/* Add New Role Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-semibold mb-2">Add New Role</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter role name"
                value={newRoleInManage}
                onChange={(e) => setNewRoleInManage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRoleInManage();
                  }
                }}
              />
              <Button onClick={handleAddRoleInManage}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4 font-semibold border-b pb-2 mb-2">
              <div>Role Name</div>
              <div>Role ID</div>
              <div>Actions</div>
            </div>

            {Array.isArray(roles) && roles.length > 0 ? (
              roles.map((role) => (
                <div
                  key={role.n_id}
                  className="grid grid-cols-3 gap-4 items-center py-3 border-b"
                >
                  {editingRole && editingRole.n_id === role.n_id ? (
                    <>
                      <Input
                        value={editingRole.s_role_name}
                        onChange={(e) =>
                          setEditingRole({
                            ...editingRole,
                            s_role_name: e.target.value,
                          })
                        }
                      />
                      <div>{role.n_id}</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateRole}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRole(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>{role.s_role_name}</div>
                      <div>{role.n_id}</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRole(role)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteRoleId(role.n_id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No roles found. Add a role to get started.
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsManageRolesOpen(false);
                setEditingRole(null);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <Dialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteRoleId(null)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleDeleteRole(deleteRoleId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={async () => {
                await deleteUser(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <Dialog open={confirmUpdate} onOpenChange={setConfirmUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update this user?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmUpdate(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={async () => {
                await saveUser();
                setConfirmUpdate(false);
              }}
            >
              Yes, Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit User Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Update User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update user information" : "Add a new team member to your organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              id="full-name"
              name="fullName"
              placeholder="Full Name"
              value={form.s_full_name}
              onChange={(e) =>
                setForm({ ...form, s_full_name: e.target.value })
              }
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.s_email}
              onChange={(e) =>
                setForm({ ...form, s_email: e.target.value })
              }
            />
            <select
              id="role"
              name="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.s_role}
              onChange={(e) =>
                setForm({ ...form, s_role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              {Array.isArray(roles) && roles.map((role) => (
                <option key={role.n_id} value={role.s_role_name}>
                  {role.s_role_name}
                </option>
              ))}
            </select>
            <Input
              id="joining-date"
              name="joiningDate"
              type="date"
              value={form.d_joining_date}
              onChange={(e) =>
                setForm({ ...form, d_joining_date: e.target.value })
              }
            />
            <Button
              onClick={() => {
                if (isEdit) {
                  setConfirmUpdate(true);
                } else {
                  saveUser();
                }
              }}
            >
              {isEdit ? "Update User" : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
