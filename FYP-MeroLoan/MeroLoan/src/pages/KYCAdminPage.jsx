import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKYCStore } from "../store/kycStore";
import AdminSidebar from "@/components/AdminSidebar";

const KYCAdminPage = () => {
  const {
    kycRequests,
    fetchKYCRequests,
    fetchSingleKYCRequest,
    isLoading,
    error,
  } = useKYCStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKYCRequests();
  }, [fetchKYCRequests]);

  const handleViewDetails = async (kycId) => {
    try {
      await fetchSingleKYCRequest(kycId);
      navigate(`/kyc/${kycId}`);
    } catch (err) {
      console.error("Failed to fetch KYC details", err);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm animate-pulse"
        >
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className=" mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            KYC Verification Requests
          </h1>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-600 text-center">
              {error}
            </div>
          ) : kycRequests.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-gray-600">Name</th>
                      <th className="text-left p-4 text-gray-600">Email</th>
                      <th className="text-left p-4 text-gray-600">Status</th>
                      <th className="text-right p-4 text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {kycRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-4 text-gray-900 font-medium">
                          {request.userId?.name || "N/A"}
                        </td>
                        <td className="p-4 text-gray-600">
                          {request.userId?.email || "N/A"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-2 rounded-full text-sm ${
                              request.status === "pending"
                                ? "bg-gray-100 text-gray-700"
                                : request.status === "rejected"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-800 text-white"
                            }`}
                          >
                            {request.status === "pending"
                              ? "Pending"
                              : request.status === "rejected"
                              ? "Rejected"
                              : "Verified"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleViewDetails(request._id)}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200"
                          >
                            View Details
                            <svg
                              className="ml-2 w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-600 text-center">
              No pending KYC requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCAdminPage;
