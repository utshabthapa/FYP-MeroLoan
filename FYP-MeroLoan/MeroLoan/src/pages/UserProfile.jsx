"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useActiveContractStore } from "../store/activeContractStore";
import { useUserDashboardStore } from "../store/userDashboardStore";

import {
  Camera,
  CheckCircle,
  CreditCard,
  CheckCircle2,
  Edit2,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertTriangle,
  Clock,
  ChevronRight,
  Calendar,
  DollarSign,
  Award,
  LogOut,
  Loader2,
  Settings,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import defaultUser from "../assets/userProfile.png";

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

LoanItem.propTypes = {
  loan: PropTypes.object.isRequired,
  userId: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const EditableField = ({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  icon,
  placeholder = "",
  maxLength,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      {isEditing ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`mt-1 p-2 block w-full rounded-md border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors ${
            icon ? "pl-10" : ""
          }`}
        />
      ) : (
        <div
          className={`mt-1 p-2 block w-full rounded-md border border-gray-200 bg-gray-50 ${
            icon ? "pl-10" : ""
          }`}
        >
          {value || <span className="text-gray-400">Not provided</span>}
        </div>
      )}
    </div>
  </div>
);

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
          <div className="relative ml-2 group">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-help text-gray-700 text-xs font-bold">
              ?
            </div>
            <div className="absolute left-0 mb-2 w-72 bg-white p-4 rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible transition-all z-10">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">
                How Credit Score Works
              </h4>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                <li>Timely loan repayments increase your score by 2 points</li>
                <li>Late payments decrease your score by 3 points</li>
                <li>Successfully completing loans adds 5 bonus points</li>
                <li>Defaulting on loans reduces score by 10 points</li>
                <li>New users start with a base score of 50</li>
                <li>Maximum attainable score is 100</li>
              </ul>
              <div className="mt-2 text-xs">
                <p className="font-medium text-gray-700">Score Ranges:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    90-100: Excellent
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                    80-89: Very Good
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-300 mr-1"></span>
                    70-79: Good
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
                    60-69: Fair
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-yellow-300 mr-1"></span>
                    50-59: Average
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-400 mr-1"></span>
                    40-49: Below Average
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>
                    30-39: Poor
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                    0-29: Very Poor
                  </span>
                </div>
              </div>
            </div>
          </div>
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

const KycStatusCard = ({ status, userId, navigate }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: "KYC Approved",
          description: "Your identity has been verified",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "rejected":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          title: "KYC Rejected",
          description: "Please reapply with correct information",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "pending":
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          title: "KYC Pending",
          description: "Your application is under review",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      default:
        return {
          icon: <Shield className="w-5 h-5 text-gray-500" />,
          title: "KYC Not Applied",
          description: "Verify your identity to access all features",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const { icon, title, description, color, bgColor, borderColor } =
    getStatusConfig();

  return (
    <div className={`p-4 rounded-lg ${bgColor} ${borderColor} border mb-4`}>
      <div className="flex items-center">
        {icon}
        <div className="ml-3">
          <h3 className={`font-medium ${color}`}>{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      {(status === "notApplied" || status === "rejected") && (
        <button
          onClick={() => navigate(`/kyc-form/${userId}`)}
          className="mt-3 w-full px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
        >
          <Shield className="w-4 h-4 mr-2" />
          {status === "rejected"
            ? "Reapply for KYC"
            : "Apply for KYC Verification"}
        </button>
      )}
    </div>
  );
};

const UserProfile = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [activeTab, setActiveTab] = useState("active");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { user, updateProfilePicture, logout, updateUserProfile } =
    useAuthStore();

  // Use the active contract store
  const {
    dashboardStats,
    loanActivity,
    loanStatusDistribution,
    recentTransactions,
    monthlyComparison,
    fetchDashboardStats,
  } = useUserDashboardStore();

  useEffect(() => {
    if (user?._id) {
      fetchDashboardStats(user._id);
    }
  }, [fetchDashboardStats, user]);
  const {
    activeContracts,
    fetchActiveContracts,
    isProcessing: isLoading,
    error,
  } = useActiveContractStore();

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name,
        phone: user.phone || "",
        address: user.address || "",
      });

      // Fetch active contracts using the store
      const loadContracts = async () => {
        try {
          await fetchActiveContracts(user._id);
        } catch (error) {
          toast.error("Failed to load active loans");
        }
      };

      loadContracts();
    }
  }, [user, fetchActiveContracts]);

  // Show error toast if there's an error from the store
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        setPreviewImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "UserImages_Preset");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dqejmq2px/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        const uploadedImage = data.secure_url;
        const publicId = data.public_id;

        const userId = user?._id;
        if (!userId) {
          toast.error("User ID not found!");
          return;
        }

        await updateProfilePicture(uploadedImage, publicId, userId);
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to update profile picture");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (editedUser.phone && !/^\d{10}$/.test(editedUser.phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    const userId = user?._id;
    if (!userId) {
      toast.error("User ID not found!");
      return;
    }
    try {
      await updateUserProfile(editedUser, userId);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const navigateToLoanDetails = (loanId) => {
    navigate(`/loan-details/${loanId}`);
  };

  // Filter loans based on active tab
  const filteredLoans = activeContracts.filter((contract) => {
    if (activeTab === "active") return contract.status === "ACTIVE";
    if (activeTab === "completed") return contract.status === "COMPLETED";
    if (activeTab === "given") return contract.lender === user._id;
    if (activeTab === "received") return contract.lender !== user._id;
    return true; // "all" tab
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-28 px-4 pb-12">
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
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-white cursor-pointer relative bg-white shadow-md"
                    onClick={handleImageClick}
                    role="button"
                    aria-label="Change profile picture"
                  >
                    <img
                      src={previewImage || user?.image || defaultUser}
                      alt="Profile"
                      className={`w-full h-full object-cover transition-opacity ${
                        isUploading ? "opacity-50" : "opacity-100"
                      }`}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="pt-20 pb-6 px-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {user?.name}
                    </h2>
                    {user?.kycStatus === "approved" && (
                      <CheckCircle2 className="ml-2 text-green-500" size={20} />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Member since {formatDate(user?.createdAt || new Date())}
                  </p>
                </div>

                {/* Account stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Total Borrowed</p>
                    <p className="text-lg font-semibold text-gray-800">
                      Rs.{" "}
                      {formatCurrency(
                        dashboardStats?.loanBorrowed
                          ? dashboardStats.loanBorrowed.toFixed(2)
                          : "0.00"
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Total Lent</p>
                    <p className="text-lg font-semibold text-gray-800">
                      Rs.{" "}
                      {formatCurrency(
                        dashboardStats?.loanLended
                          ? dashboardStats.loanLended.toFixed(2)
                          : "0.00"
                      )}
                    </p>
                  </div>
                </div>

                {/* KYC Status Card */}
                <div className="mt-6">
                  <KycStatusCard
                    status={user?.kycStatus || "notApplied"}
                    userId={user?._id}
                    navigate={navigate}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Account Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/transactionHistory")}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Transaction History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Personal Information
                </h2>
                <button
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isEditing
                      ? "bg-green-100 hover:bg-green-200 text-green-700"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>

              {/* Credit Score Card */}
              <CreditScoreCard score={user?.creditScore || 50} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField
                  label="Full Name"
                  value={editedUser.name}
                  isEditing={isEditing}
                  onChange={(value) =>
                    setEditedUser({ ...editedUser, name: value })
                  }
                  icon={<User className="w-4 h-4" />}
                  placeholder="Enter your full name"
                />
                <EditableField
                  label="Email Address"
                  value={user?.email}
                  isEditing={false}
                  onChange={() => {}}
                  icon={<Mail className="w-4 h-4" />}
                />
                <EditableField
                  label="Phone Number"
                  value={editedUser.phone}
                  isEditing={isEditing}
                  onChange={(value) => {
                    // Allow only numeric input
                    if (/^\d*$/.test(value)) {
                      setEditedUser({ ...editedUser, phone: value });
                    }
                  }}
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
                <EditableField
                  label="Address"
                  value={editedUser.address}
                  isEditing={isEditing}
                  onChange={(value) =>
                    setEditedUser({ ...editedUser, address: value })
                  }
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="Enter your address"
                />
              </div>
            </motion.div>

            {/* Loans Section with Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                  Loan Management
                </h2>
                <button
                  onClick={() => navigate("/loan-form")}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Apply for a Loan
                </button>
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

              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="mt-4 text-gray-500">Loading loans...</p>
                  </div>
                </div>
              ) : filteredLoans.length > 0 ? (
                <div className="h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    <div className="space-y-2">
                      {filteredLoans.map((contract) => (
                        <LoanItem
                          key={contract._id}
                          loan={contract}
                          userId={user._id}
                          onClick={() => navigateToLoanDetails(contract.loan)}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">
                    {activeTab === "all"
                      ? "You don't have any loans at the moment."
                      : activeTab === "active"
                      ? "You don't have any active loans."
                      : activeTab === "completed"
                      ? "You don't have any completed loans."
                      : activeTab === "given"
                      ? "You haven't given any loans yet."
                      : activeTab === "given"
                      ? "You haven't given any loans yet."
                      : "You haven't received any loans yet."}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {activeTab === "given"
                      ? "Browse loan requests to find borrowers."
                      : activeTab === "received"
                      ? "Apply for a loan to get started."
                      : "Start by applying for a loan or browsing loan requests."}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => navigate("/loan-requests")}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Browse Loan Requests
                    </button>
                    <button
                      onClick={() => navigate("/loan-form")}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Apply for a Loan
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
