import { Plus, Pencil, Trash2 } from "lucide-react";
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
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const [roleForm, setRoleForm] = useState({
    s_role_name: "",
  });

  const [form, setForm] = useState({
    n_user_id: null,
    s_full_name: "",
    s_email: "",
    s_role: "",
    d_joining_date: "",
  });

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/user/getAll");
    const data = await res.json();
    setUsers(data);
  };

const handleAddRole = async () => {
  if (!roleForm.s_role_name.trim()) {
    alert("Role name is required");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/role/create", {
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

    console.log("Role Added:", data);

    setRoleForm({ s_role_name: "" });
    setIsRoleOpen(false);
    alert("Role added successfully");

  } catch (error) {
    console.error("Error adding role:", error);
  }
};




  useEffect(() => {
    fetchUsers();
  }, []);

  const saveUser = async () => {
    const url = isEdit
      ? "http://localhost:5000/user/update"
      : "http://localhost:5000/user/create";

    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        n_user_id: form.n_user_id, // 🔥 REQUIRED
      }),
    });

    setIsOpen(false);
    setIsEdit(false);
    setForm({
      s_full_name: "",
      s_email: "",
      s_role: "",
      d_joining_date: "",
    });

    fetchUsers();

  };

  const deleteUser = async (id) => {
    await fetch(`http://localhost:5000/user/delete/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
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

        <Button onClick={() => setIsRoleOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Role
        </Button>

      </div>


      </div>

      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-7 gap-4 font-semibold border-b pb-2">
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
            className="grid grid-cols-7 gap-4 items-center py-2 border-b"
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
                type="button"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteId(user.n_user_id); // open confirm dialog
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            <Input
              placeholder="Enter Role Name"
              value={roleForm.s_role_name}
              onChange={(e) =>
                setRoleForm({ ...roleForm, s_role_name: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRoleOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleAddRole}>
                Save Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


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
                await fetch(`http://localhost:5000/user/delete/${deleteId}`, {
                  method: "DELETE",
                });
                setDeleteId(null);
                fetchUsers();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>


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
              variant="destructive"
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


      {/* MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Update User" : "Create User"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Full Name"
              value={form.s_full_name}
              onChange={(e) =>
                setForm({ ...form, s_full_name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={form.s_email}
              onChange={(e) =>
                setForm({ ...form, s_email: e.target.value })
              }
            />
            <Input
              placeholder="Role"
              value={form.s_role}
              onChange={(e) =>
                setForm({ ...form, s_role: e.target.value })
              }
            />
            <Input
              type="date"
              value={form.d_joining_date}
              onChange={(e) =>
                setForm({ ...form, d_joining_date: e.target.value })
              }
            />
            <Button
              onClick={() => {
                if (isEdit) {
                  setConfirmUpdate(true);   // open confirmation
                } else {
                  saveUser(); // create user directly
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
