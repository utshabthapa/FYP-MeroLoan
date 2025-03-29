import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { useAdminStore } from "../store/adminStore";
import { formatDate } from "../utils/date";

const BanUsers = () => {
  const { allUsers, isLoading, error, fetchAllUsers, banUser, unbanUser } =
    useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(""); // 'ban' or 'unban'
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const filteredUsers = allUsers
    .filter((user) => user.role !== "admin") // Exclude admin users
    .filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleBanClick = (user) => {
    setSelectedUser(user);
    setActionType("ban");
    setShowConfirmModal(true);
  };

  const handleUnbanClick = (user) => {
    setSelectedUser(user);
    setActionType("unban");
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      if (actionType === "ban") {
        await banUser(selectedUser._id);
      } else {
        await unbanUser(selectedUser._id);
      }
      setShowConfirmModal(false);
    } catch (error) {
      console.error(`Failed to ${actionType} user:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="fixed h-screen">
        <AdminSidebar />
      </div>
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  User Management
                </h1>
                <p className="text-gray-300 text-sm mt-1">
                  Manage user accounts and ban status
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2 text-gray-300 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="bg-gray-700 px-3 py-1 rounded-full text-white text-sm whitespace-nowrap">
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "User" : "Users"}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-lg">
                  {searchTerm ? "No matching users found" : "No users found"}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 p-6">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
                      user.banStatus === "banned" ? "bg-red-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-800">
                          {user.name || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Joined On</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium text-gray-800 capitalize">
                          {user.role}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p
                          className={`font-medium ${
                            user.banStatus === "banned"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {user.banStatus === "banned" ? "Banned" : "Active"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {user.banStatus === "banned" ? (
                        <button
                          onClick={() => handleUnbanClick(user)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          Unban User
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanClick(user)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          Ban User
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-b-lg">
                {error}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm {actionType === "ban" ? "Ban" : "Unban"}
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to {actionType} user{" "}
              <span className="font-semibold">
                {selectedUser.name || selectedUser.email}
              </span>
              ?
              {actionType === "ban" && (
                <span className="block mt-2 text-red-500">
                  This will prevent the user from accessing their account.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  actionType === "ban"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanUsers;
