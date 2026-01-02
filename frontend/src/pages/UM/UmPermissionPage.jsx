import { Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function UmPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newPermission, setNewPermission] = useState("");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchPermissions = async () => {
    try {
      const res = await fetch("http://localhost:5000/user/permission/getAll");
      const data = await res.json();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Permission fetch error:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("http://localhost:5000/user/role/getAll");
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0]);
      }
    } catch (err) {
      console.error("Role fetch error:", err);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      console.log("Fetching permissions for role ID:", roleId); // Debug log
      const res = await fetch(`http://localhost:5000/user/permission/getByRole/${roleId}`);
      const data = await res.json();
      console.log("Received role permissions:", data); // Debug log
      setRolePermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Role permissions fetch error:", err);
      setRolePermissions([]);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      setRolePermissions([]); // Clear old data immediately
      fetchRolePermissions(selectedRole.n_id);
    }
  }, [selectedRole]);

  const addPermission = async () => {
    if (!newPermission.trim()) return;
    await fetch("http://localhost:5000/user/permission/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s_permission_name: newPermission }),
    });
    setNewPermission("");
    fetchPermissions();
  };

  const deletePermission = async (id) => {
    await fetch(`http://localhost:5000/user/permission/delete/${id}`, {
      method: "DELETE",
    });
    fetchPermissions();
  };

  // Get available permissions (not already assigned to this role)
  const getAvailablePermissions = () => {
    const assignedPermissionIds = rolePermissions.map(rp => rp.permission_id);
    return permissions.filter(p => !assignedPermissionIds.includes(p.n_id));
  };

  // Handle checkbox selection
  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Select all available permissions
  const handleSelectAll = () => {
    const available = getAvailablePermissions();
    if (selectedPermissions.length === available.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(available.map(p => p.n_id));
    }
  };

  const saveAssign = async () => {
    if (!selectedRole || selectedPermissions.length === 0) {
      alert("Please select at least one permission");
      return;
    }

    try {
      // Assign all selected permissions
      const promises = selectedPermissions.map(permissionId =>
        fetch("http://localhost:5000/user/permission/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role_id: selectedRole.n_id,
            permission_id: permissionId,
          }),
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);

      if (failed.length > 0) {
        alert(`Failed to assign ${failed.length} permission(s)`);
      } else {
        alert(`Successfully assigned ${selectedPermissions.length} permission(s)`);
      }

      setSelectedPermissions([]);
      setIsAssignOpen(false);
      fetchRolePermissions(selectedRole.n_id);
    } catch (err) {
      console.error("Assign error:", err);
      alert("Failed to assign permissions");
    }
  };

  const removePermission = async (permissionId) => {
    if (!confirm("Remove this permission from the role?")) return;

    try {
      const res = await fetch("http://localhost:5000/user/permission/unassign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_id: selectedRole.n_id,
          permission_id: permissionId,
        }),
      });

      if (res.ok) {
        alert("Permission removed successfully");
        fetchRolePermissions(selectedRole.n_id);
      } else {
        alert("Failed to remove permission");
      }
    } catch (err) {
      console.error("Remove permission error:", err);
      alert("Failed to remove permission");
    }
  };

  const availablePermissions = getAvailablePermissions();
  const allSelected = selectedPermissions.length === availablePermissions.length && availablePermissions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Role & Permission Management</h1>
          <Button onClick={() => setIsManageOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Manage Permissions
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDE - ROLES */}
          <div className="col-span-4 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Roles</h2>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.n_id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRole?.n_id === role.n_id
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="font-medium">{role.s_role_name}</div>
                  <div className="text-sm text-gray-500">
                    {selectedRole?.n_id === role.n_id
                      ? `${rolePermissions.length} permissions`
                      : "Click to view"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - ASSIGNED PERMISSIONS */}
          <div className="col-span-8 bg-white rounded-lg shadow p-4">
            {selectedRole ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Permissions for "{selectedRole.s_role_name}"
                    </h2>
                    <p className="text-sm text-gray-500">
                      {rolePermissions.length} permission(s) assigned
                    </p>
                  </div>
                  <Button onClick={() => setIsAssignOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Permission
                  </Button>
                </div>

                {rolePermissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No permissions assigned yet</p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAssignOpen(true)}
                    >
                      Assign First Permission
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {rolePermissions
                      .filter(perm => perm && perm.permission_id && perm.permission_name) // Safety filter
                      .map((perm) => (
                        <div
                          key={perm.permission_id}
                          className="border-2 border-gray-200 p-3 rounded-lg flex justify-between items-center hover:border-gray-300 transition-colors"
                        >
                          <div>
                            <div className="font-medium">
                              {perm.permission_name}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              Active
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePermission(perm.permission_id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a role to view permissions
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MANAGE PERMISSIONS DIALOG */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Create or remove system permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Permission name"
              value={newPermission}
              onChange={(e) => setNewPermission(e.target.value)}
            />
            <Button onClick={addPermission}>Add</Button>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto">
            {permissions.map((p) => (
              <div
                key={p.n_id}
                className="flex justify-between items-center py-2 border-b"
              >
                <span>{p.s_permission_name}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePermission(p.n_id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ASSIGN PERMISSION DIALOG - WITH CHECKBOXES */}
      <Dialog open={isAssignOpen} onOpenChange={(open) => {
        setIsAssignOpen(open);
        if (!open) setSelectedPermissions([]);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Permissions</DialogTitle>
            <DialogDescription>
              Select one or more permissions to assign to "{selectedRole?.s_role_name}"
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {availablePermissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                All permissions are already assigned to this role
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="font-medium">
                      Select All ({availablePermissions.length} available)
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedPermissions.length} selected
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {availablePermissions.map((perm) => (
                    <div
                      key={perm.n_id}
                      onClick={() => handlePermissionToggle(perm.n_id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedPermissions.includes(perm.n_id)
                          ? "bg-blue-50 border-blue-500"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.n_id)}
                        onChange={() => handlePermissionToggle(perm.n_id)}
                        className="w-4 h-4 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{perm.s_permission_name}</div>
                        <div className="text-xs text-gray-500">
                          Permission ID: {perm.n_id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {selectedPermissions.length > 0 && 
                `${selectedPermissions.length} permission(s) will be assigned`
              }
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAssignOpen(false);
                  setSelectedPermissions([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveAssign}
                disabled={selectedPermissions.length === 0}
              >
                Assign Selected ({selectedPermissions.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}