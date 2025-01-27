import React from "react";
import AdminSidebar from "@/components/AdminSidebar";

const UserManagement = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-10">User Management</div>
    </div>
  );
};

export default UserManagement;
