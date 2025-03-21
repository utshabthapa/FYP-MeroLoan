import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfileStore } from "../store/userProfileStore";
import { useAuthStore } from "../store/authStore";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import defaultUser from "../assets/userProfile.png";
import { toast } from "react-toastify";

const LoanItem = ({ loan, userId, onClick }) => {
  const isLender = loan.lender === userId;
  const formattedAmount = parseFloat(loan.amount).toLocaleString();

  return (
    <div
      className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100 mb-3"
      onClick={onClick}
    >
      <div className="rounded-full p-2 bg-gray-100">
        {isLender ? (
          <ArrowUpRight className="w-5 h-5 text-orange-600" />
        ) : (
          <ArrowDownRight className="w-5 h-5 text-green-600" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">
          {isLender ? "Loan Given" : "Loan Received"}
        </h4>
        <p className="text-gray-600 text-sm">
          Rs. {formattedAmount} {isLender ? "to receive" : "to repay"}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            loan.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : loan.status === "COMPLETED"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {loan.status}
        </span>
        <span className="text-sm text-gray-500 mt-1">
          Total: Rs. {parseFloat(loan.totalRepaymentAmount).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const PublicUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const {
    userProfile,
    isLoading,
    error,
    fetchUserProfile,
    getUserActiveContracts,
  } = useUserProfileStore();

  const [activeContracts, setActiveContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUserProfile(userId);

        setLoadingContracts(true);
        const contracts = await getUserActiveContracts(userId);
        setActiveContracts(contracts);
      } catch (error) {
        toast.error("Failed to load user profile");
      } finally {
        setLoadingContracts(false);
      }
    };

    if (userId) {
      loadData();
    }

    // Cleanup function
    return () => {
      // Clear user profile when component unmounts
      useUserProfileStore.getState().clearUserProfile();
    };
  }, [userId, fetchUserProfile, getUserActiveContracts]);

  const navigateToLoanDetails = (loanId) => {
    navigate(`/loan-details/${loanId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">
            Failed to load user profile
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-xl mb-4">User profile not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-28 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Left Column */}
          <div className="space-y-6 relative">
            <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-full h-36 absolute top-0 left-0 rounded-t-xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900"></div>
              <div className="flex flex-col items-center">
                <div className="relative mt-12">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white relative">
                    <img
                      src={userProfile?.image || defaultUser}
                      alt="Profile"
                      className="w-full h-full object-cover bg-white rounded-full"
                    />
                  </div>
                </div>
                <p className="mt-4 font-semibold text-2xl text-center text-gray-700 flex items-center">
                  {userProfile?.name}
                  {userProfile?.kycStatus === "approved" && (
                    <CheckCircle2
                      className="ml-1 text-white bg-green-400 rounded-full"
                      size={22}
                    />
                  )}
                </p>

                {/* KYC Status Badge */}
                <div className="mt-2">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      userProfile?.kycStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : userProfile?.kycStatus === "rejected"
                        ? "bg-red-100 text-red-800"
                        : userProfile?.kycStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {userProfile?.kycStatus === "approved"
                      ? "KYC Verified"
                      : userProfile?.kycStatus === "rejected"
                      ? "KYC Rejected"
                      : userProfile?.kycStatus === "pending"
                      ? "KYC Pending"
                      : "KYC Not Applied"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-6">User Information</h2>

              {/* Credit Score Card */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-xl font-medium text-gray-700">
                      Credit Score
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {userProfile?.creditScore}
                    </span>
                    <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {userProfile?.creditScore >= 90
                        ? "Excellent"
                        : userProfile?.creditScore >= 80
                        ? "Very Good"
                        : userProfile?.creditScore >= 70
                        ? "Good"
                        : userProfile?.creditScore >= 60
                        ? "Fair"
                        : userProfile?.creditScore >= 50
                        ? "Average"
                        : userProfile?.creditScore >= 40
                        ? "Below Average"
                        : userProfile?.creditScore >= 30
                        ? "Poor"
                        : "Very Poor"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {userProfile?.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {userProfile?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User Status
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {userProfile?.isVerified
                      ? "Verified User"
                      : "Unverified User"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Member Since
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {new Date(userProfile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* User's Active Loans Section */}
            {currentUser?.kycStatus === "approved" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <h2 className="text-xl font-semibold mb-6">Active Loans</h2>

                {loadingContracts ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
                  </div>
                ) : activeContracts.length > 0 ? (
                  <div className="space-y-2">
                    {activeContracts.map((contract) => (
                      <LoanItem
                        key={contract._id}
                        loan={contract}
                        userId={userProfile._id}
                        onClick={() => navigateToLoanDetails(contract.loan)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">
                      This user doesn't have any active loans at the moment.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicUserProfile;
