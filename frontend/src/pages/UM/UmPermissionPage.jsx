import { Plus, Trash2 } from "lucide-react";
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

export default function UmPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [newPermission, setNewPermission] = useState("");
  const [isManageOpen, setIsManageOpen] = useState(false);

  const fetchPermissions = async () => {
    try {
      const res = await fetch("http://localhost:5000/user/permission/getAll");
      const data = await res.json();

      if (Array.isArray(data)) {
        setPermissions(data);
      } else {
        console.error("Invalid permission data:", data);
        setPermissions([]);
      }
    } catch (err) {
      console.error("Fetch permission error:", err);
      setPermissions([]);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // 🔹 Add Permission
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

  // 🔹 Delete Permission
  const deletePermission = async (id) => {
    await fetch(`http://localhost:5000/user/permission/delete/${id}`, {
      method: "DELETE",
    });
    fetchPermissions();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-[var(--color-card)]">
        <h2 className="text-lg font-semibold">Permissions</h2>

        <div className="flex gap-2">
          <Button onClick={() => setIsManageOpen(true)}>
            Manage Permissions
          </Button>

          <Button variant="outline">
            Assign Permission
          </Button>
        </div>
      </div>


      {/* Permission List */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-6">
          {permissions.map((perm) => (
            <div
              key={perm.n_id}
              className="flex justify-between items-center border rounded-lg p-4 hover:bg-muted"
            >
              <span>{perm.s_permission_name}</span>
              <Badge variant="secondary">Active</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* MANAGE PERMISSIONS MODAL */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Add or remove permissions available in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Permission */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter permission name"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
              />
              <Button onClick={addPermission}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Permission List */}
            <div className="space-y-2">
              {permissions.map((perm) => (
                <div
                  key={perm.n_id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{perm.s_permission_name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePermission(perm.n_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
