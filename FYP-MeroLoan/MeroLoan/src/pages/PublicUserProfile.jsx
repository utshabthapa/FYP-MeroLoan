"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfileStore } from "../store/userProfileStore";
import { useAuthStore } from "../store/authStore";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  User,
  Mail,
  Calendar,
  Award,
  Shield,
  Clock,
  AlertTriangle,
  ChevronRight,
  DollarSign,
  Loader2,
} from "lucide-react";
import defaultUser from "../assets/userProfile.png";
import { toast } from "react-toastify";

// Helper function to format currency
const formatCurrency = (amount) => {
  return Number.parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const LoanItem = ({ loan, userId, onClick }) => {
  const isLender = loan.lender === userId;
  const formattedAmount = formatCurrency(loan.amount);
  const dueDate = loan.dueDate ? formatDate(loan.dueDate) : "Not specified";

  // Calculate days remaining if due date exists
  const daysRemaining = loan.dueDate
    ? Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-all cursor-pointer border border-gray-100 mb-3 shadow-sm"
      onClick={onClick}
    >
      <div
        className={`rounded-full p-2 ${
          isLender ? "bg-blue-50" : "bg-green-50"
        }`}
      >
        {isLender ? (
          <ArrowUpRight className="w-5 h-5 text-blue-600" />
        ) : (
          <ArrowDownRight className="w-5 h-5 text-green-600" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">
          {isLender ? "Loan Given" : "Loan Received"}
        </h4>
        <div className="flex items-center mt-1">
          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
          <p className="text-gray-600 text-sm">
            Rs. {formattedAmount} {isLender ? "to receive" : "to repay"}
          </p>
        </div>
        {dueDate && (
          <div className="flex items-center mt-1">
            <Calendar className="w-4 h-4 text-gray-500 mr-1" />
            <p className="text-gray-600 text-sm">
              Due: {dueDate}
              {daysRemaining !== null && daysRemaining > 0 && (
                <span
                  className={`ml-2 ${
                    daysRemaining <= 3
                      ? "text-red-500 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  ({daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left)
                </span>
              )}
              {daysRemaining !== null && daysRemaining <= 0 && (
                <span className="ml-2 text-red-500 font-medium">(Overdue)</span>
              )}
            </p>
          </div>
        )}
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
          Total: Rs. {formatCurrency(loan.totalRepaymentAmount)}
        </span>
        <div className="mt-2 text-xs text-blue-600 flex items-center">
          View details <ChevronRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </motion.div>
  );
};

const CreditScoreCard = ({ score }) => {
  // Determine score category and color
  const getScoreCategory = (score) => {
    if (score >= 90) return { category: "Excellent", color: "bg-green-500" };
    if (score >= 80) return { category: "Very Good", color: "bg-green-400" };
    if (score >= 70) return { category: "Good", color: "bg-green-300" };
    if (score >= 60) return { category: "Fair", color: "bg-yellow-400" };
    if (score >= 50) return { category: "Average", color: "bg-yellow-300" };
    if (score >= 40)
      return { category: "Below Average", color: "bg-orange-400" };
    if (score >= 30) return { category: "Poor", color: "bg-red-400" };
    return { category: "Very Poor", color: "bg-red-500" };
  };

  const { category, color } = getScoreCategory(score);

  // Calculate percentage for progress bar
  const percentage = Math.min(Math.max(score, 0), 100);

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Award className="w-5 h-5 text-gray-700 mr-2" />
          <span className="text-lg font-medium text-gray-800">
            Credit Score
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gray-800">{score}</span>
            <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
              {category}
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-1">Out of 100 points</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Score breakdown */}
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
};

const KycStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
          label: "KYC Verified",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "rejected":
        return {
          icon: <AlertTriangle className="w-4 h-4 mr-1" />,
          label: "KYC Rejected",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "pending":
        return {
          icon: <Clock className="w-4 h-4 mr-1" />,
          label: "KYC Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      default:
        return {
          icon: <Shield className="w-4 h-4 mr-1" />,
          label: "KYC Not Applied",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const { icon, label, className } = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      {icon}
      {label}
    </span>
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
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUserProfile(userId);

        // Only load contracts if current user is KYC verified
        if (currentUser?.kycStatus === "approved") {
          setLoadingContracts(true);
          const contracts = await getUserActiveContracts(userId);
          setActiveContracts(contracts);
        }
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
  }, [
    userId,
    fetchUserProfile,
    getUserActiveContracts,
    currentUser?.kycStatus,
  ]);

  const navigateToLoanDetails = (loanId) => {
    navigate(`/loan-details/${loanId}`);
  };

  // Filter loans based on active tab
  const filteredLoans = activeContracts.filter((contract) => {
    if (activeTab === "active") return contract.status === "ACTIVE";
    if (activeTab === "completed") return contract.status === "COMPLETED";
    if (activeTab === "given") return contract.lender === userProfile?._id;
    if (activeTab === "received") return contract.lender !== userProfile?._id;
    return true; // "all" tab
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-28 px-4 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
            <p className="mt-4 text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-28 px-4 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 text-xl mb-4">
              Failed to load user profile
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-28 px-4 flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-4">User profile not found</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-28 px-4 pb-12">
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
          <div className="space-y-6">
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="h-36 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white relative bg-white shadow-md">
                    <img
                      src={userProfile?.image || defaultUser}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-6 px-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {userProfile?.name}
                    </h2>
                    {userProfile?.kycStatus === "approved" && (
                      <CheckCircle2 className="ml-2 text-green-500" size={20} />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {userProfile?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Member since{" "}
                    {formatDate(userProfile?.createdAt || new Date())}
                  </p>

                  <div className="mt-4">
                    <KycStatusBadge
                      status={userProfile?.kycStatus || "notApplied"}
                    />
                  </div>
                </div>

                {/* Account stats */}
                {userProfile.totalBorrowed !== undefined &&
                  userProfile.totalLent !== undefined && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Borrowed</p>
                        <p className="text-lg font-semibold text-gray-800">
                          Rs. {formatCurrency(userProfile?.totalBorrowed || 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Lent</p>
                        <p className="text-lg font-semibold text-gray-800">
                          Rs. {formatCurrency(userProfile?.totalLent || 0)}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>

            {/* Contact or action buttons could go here */}
            {currentUser && currentUser._id !== userProfile._id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/messages/${userProfile._id}`)}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </button>

                  {currentUser?.kycStatus === "approved" && (
                    <button
                      onClick={() =>
                        navigate(`/loan-form?lender=${userProfile._id}`)
                      }
                      className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Request Loan
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                User Information
              </h2>

              {/* Credit Score Card */}
              <CreditScoreCard score={userProfile?.creditScore || 50} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="mt-1 p-2 pl-10 block w-full rounded-md border border-gray-200 bg-gray-50">
                      {userProfile?.name}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="mt-1 p-2 pl-10 block w-full rounded-md border border-gray-200 bg-gray-50">
                      {userProfile?.email}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Status
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="mt-1 p-2 pl-10 block w-full rounded-md border border-gray-200 bg-gray-50">
                      {userProfile?.isVerified
                        ? "Verified User"
                        : "Unverified User"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="mt-1 p-2 pl-10 block w-full rounded-md border border-gray-200 bg-gray-50">
                      {formatDate(userProfile?.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* User's Active Loans Section - Only visible to KYC verified users */}
            {currentUser?.kycStatus === "approved" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                    Loan History
                  </h2>
                </div>

                {/* Loan tabs */}
                <div className="border-b border-gray-200 mb-4">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "all"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      All Loans
                    </button>
                    <button
                      onClick={() => setActiveTab("active")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "active"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setActiveTab("completed")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "completed"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setActiveTab("given")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "given"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      Given
                    </button>
                    <button
                      onClick={() => setActiveTab("received")}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeTab === "received"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      Received
                    </button>
                  </div>
                </div>

                {loadingContracts ? (
                  <div className="py-12 flex justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="mt-4 text-gray-500">Loading loans...</p>
                    </div>
                  </div>
                ) : filteredLoans.length > 0 ? (
                  <AnimatePresence>
                    <div className="space-y-2">
                      {filteredLoans.map((contract) => (
                        <LoanItem
                          key={contract._id}
                          loan={contract}
                          userId={userProfile._id}
                          onClick={() => navigateToLoanDetails(contract.loan)}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">
                      {activeTab === "all"
                        ? "This user doesn't have any loans at the moment."
                        : activeTab === "active"
                        ? "This user doesn't have any active loans."
                        : activeTab === "completed"
                        ? "This user doesn't have any completed loans."
                        : activeTab === "given"
                        ? "This user hasn't given any loans yet."
                        : "This user hasn't received any loans yet."}
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
