import { useState, useEffect } from "react";
import { useAppealStore } from "../store/appealStore";
import { useAuthStore } from "../store/authStore"; // Import auth store to get admin ID
import {
  Search,
  Filter,
  Check,
  X,
  Clock,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import AdminSidebar from "@/components/AdminSidebar";

const AdminAppealsPage = () => {
  const { appeals, isLoading, error, fetchAllAppeals, updateAppeal } =
    useAppealStore();
  const { user } = useAuthStore(); // Get the current logged-in admin user
  const [filteredAppeals, setFilteredAppeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    // Fetch all appeals when the component mounts
    fetchAllAppeals();
  }, [fetchAllAppeals]);

  useEffect(() => {
    // Filter and sort appeals based on current filters
    if (appeals.length > 0) {
      let filtered = [...appeals];

      // Apply status filter
      if (filterStatus !== "all") {
        filtered = filtered.filter((appeal) => appeal.status === filterStatus);
      }

      // Apply search filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (appeal) =>
            appeal.reason.toLowerCase().includes(lowerSearchTerm) ||
            appeal.details.toLowerCase().includes(lowerSearchTerm) ||
            appeal.userId?.name?.toLowerCase().includes(lowerSearchTerm) ||
            appeal.userId?.email?.toLowerCase().includes(lowerSearchTerm)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle nested fields
        if (sortField === "userId.name" && a.userId && b.userId) {
          aValue = a.userId.name;
          bValue = b.userId.name;
        }

        // Handle date comparisons
        if (sortField === "createdAt" || sortField === "reviewedAt") {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }

        // Apply sort direction
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setFilteredAppeals(filtered);
    }
  }, [appeals, filterStatus, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleViewAppeal = (appeal) => {
    setSelectedAppeal(appeal);
    setAdminResponse(appeal.adminResponse || "");
    setUpdateError(null); // Clear any previous errors
  };

  const handleUpdateStatus = async (appealId, newStatus) => {
    try {
      // Make sure we have the admin's ID
      if (!user || !user._id) {
        setUpdateError("Admin ID not available. Please log in again.");
        return;
      }

      await updateAppeal(appealId, {
        status: newStatus,
        adminResponse,
        reviewedBy: user._id, // Use the actual admin ID from auth store
      });

      setSelectedAppeal(null);
      setUpdateError(null);
    } catch (err) {
      console.error("Failed to update appeal status:", err);
      setUpdateError(err.message || "Failed to update appeal status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
            <Check size={12} className="mr-1" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
            <X size={12} className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="fixed h-screen">
        <AdminSidebar />
      </div>
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            User Appeals Management
          </h1>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search appeals..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("userId.name")}
                  >
                    <div className="flex items-center">
                      User
                      {sortField === "userId.name" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("reason")}
                  >
                    <div className="flex items-center">
                      Reason
                      {sortField === "reason" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "status" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Date Submitted
                      {sortField === "createdAt" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppeals.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No appeals found
                    </td>
                  </tr>
                ) : (
                  filteredAppeals.map((appeal) => (
                    <tr key={appeal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appeal.userId?.name || "Unknown user"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appeal.userId?.email || "No email provided"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {appeal.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appeal.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(appeal.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewAppeal(appeal)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appeal Details Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Appeal Details
                </h3>
                <button
                  onClick={() => setSelectedAppeal(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              {updateError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {updateError}
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">
                  User Information
                </h4>
                <p className="text-base font-medium">
                  {selectedAppeal.userId?.name || "Unknown user"}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAppeal.userId?.email || "No email provided"}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <div className="mt-1">
                  {getStatusBadge(selectedAppeal.status)}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">
                  Appeal Reason
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedAppeal.reason}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Details</h4>
                <div className="mt-1 text-sm text-gray-900 whitespace-pre-line bg-gray-50 p-3 rounded">
                  {selectedAppeal.details}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Dates</h4>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="text-sm">
                      {format(
                        new Date(selectedAppeal.createdAt),
                        "MMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                  {selectedAppeal.reviewedAt && (
                    <div>
                      <p className="text-xs text-gray-500">Reviewed</p>
                      <p className="text-sm">
                        {format(
                          new Date(selectedAppeal.reviewedAt),
                          "MMM d, yyyy h:mm a"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Response Section */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">
                  Admin Response
                </h4>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows="4"
                  placeholder="Enter your response to this appeal..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  disabled={selectedAppeal.status !== "pending"}
                ></textarea>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              {selectedAppeal.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedAppeal._id, "rejected")
                    }
                    className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={!user || !user._id}
                  >
                    <X size={16} className="mr-2" /> Reject Appeal
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedAppeal._id, "approved")
                    }
                    className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={!user || !user._id}
                  >
                    <Check size={16} className="mr-2" /> Approve Appeal
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedAppeal(null)}
                className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppealsPage;
