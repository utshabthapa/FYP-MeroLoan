import { useEffect } from "react";
import { useKYCStore } from "../store/kycStore";

const KYCAdminPage = () => {
  const { kycRequests, fetchKYCRequests, verifyKYC, isLoading, error } =
    useKYCStore();

  useEffect(() => {
    fetchKYCRequests();
  }, [fetchKYCRequests]);

  const handleVerification = (id, status) => {
    verifyKYC(id, status);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">KYC Verification Requests</h1>
      {isLoading ? (
        <p>Loading KYC requests...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : kycRequests.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycRequests.map((request) => (
              <tr key={request._id} className="border-b">
                <td className="p-2">{request.userName}</td>
                <td className="p-2">
                  {request.status === "pending" ? "Pending" : "Verified"}
                </td>
                <td className="p-2">
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded mr-2"
                    onClick={() => handleVerification(request._id, "verified")}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleVerification(request._id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending KYC requests.</p>
      )}
    </div>
  );
};

export default KYCAdminPage;
