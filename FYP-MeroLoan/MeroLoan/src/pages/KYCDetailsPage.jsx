import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useKYCStore } from "../store/kycStore";
import { toast } from "react-hot-toast";
import AdminSidebar from "@/components/AdminSidebar";

const KYCDetailsPage = () => {
  const { kycId } = useParams();
  const navigate = useNavigate();
  const {
    selectedKYC,
    fetchSingleKYCRequest,
    verifyKYCRequest,
    clearSelectedKYC,
    isLoading,
    error,
  } = useKYCStore();

  useEffect(() => {
    fetchSingleKYCRequest(kycId);
    return () => clearSelectedKYC();
  }, [kycId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await verifyKYCRequest(kycId, newStatus);
      toast.success(`KYC request ${newStatus}`);
      navigate("/kycApplications");
    } catch (err) {
      toast.error("Failed to update KYC status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="fixed h-screen">
        <AdminSidebar />
      </div>
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">KYC Details</h1>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedKYC?.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedKYC?.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {selectedKYC?.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {selectedKYC ? (
            <div className="space-y-6">
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Full Name
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.userId?.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.userId?.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Father's Name
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.fatherName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Mother's Name
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.motherName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Date of Birth
                      </label>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedKYC.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Gender
                      </label>
                      <p className="mt-1 text-gray-900">{selectedKYC.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Occupation
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.occupation}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Address Information
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      District
                    </label>
                    <p className="mt-1 text-gray-900">{selectedKYC.district}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Municipality
                    </label>
                    <p className="mt-1 text-gray-900">
                      {selectedKYC.municipality}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Ward
                    </label>
                    <p className="mt-1 text-gray-900">{selectedKYC.ward}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Identity Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Identity Type
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.identityType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Identity Number
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.identityNumber}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Issued Place
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedKYC.issuedPlace}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Issued Date
                      </label>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedKYC.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Uploaded Documents
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Identity Card Front
                    </label>
                    <img
                      src={selectedKYC.identityCardFront}
                      alt="Identity Front"
                      className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Identity Card Back
                    </label>
                    <img
                      src={selectedKYC.identityCardBack}
                      alt="Identity Back"
                      className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>
                </div>
              </section>

              <section className="flex items-center justify-between pt-6">
                <Link
                  to="/kycApplications"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Requests
                </Link>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedKYC.status === "rejected"}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange("approved")}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedKYC.status === "approved"}
                  >
                    Approve
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-600">
                No KYC details found for this request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCDetailsPage;
