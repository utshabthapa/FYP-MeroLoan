import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveContractStore } from "../store/activeContractStore";
import { useAuthStore } from "../store/authStore";
import { useLoanStore } from "@/store/loanStore";
import { useUserProfileStore } from "../store/userProfileStore"; // Import the user profile store
import { motion, AnimatePresence } from "framer-motion";
import { Tab } from "@headlessui/react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  ArrowRight,
  User,
  SortDesc,
  SortAsc,
} from "lucide-react";

import Navbar from "@/components/navbar";

const ActiveContracts = () => {
  const { activeContracts, isProcessing, error, fetchActiveContracts } =
    useActiveContractStore();
  const { user } = useAuthStore();
  const { fetchUserProfile } = useUserProfileStore(); // Get the fetch function from the store
  const navigate = useNavigate();
  const [selectedContract, setSelectedContract] = useState(null);
  const [viewMode, setViewMode] = useState("active"); // active, completed
  const [expandedDetails, setExpandedDetails] = useState({});
  const [userDetails, setUserDetails] = useState({});
  // Add sorting state - default to "newest"
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (user?._id) {
      fetchActiveContracts(user._id);
    }
  }, [fetchActiveContracts, user]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Extract unique user IDs from contracts
        const userIds = new Set();
        activeContracts.forEach((contract) => {
          if (contract.borrower !== user?._id) userIds.add(contract.borrower);
          if (contract.lender !== user?._id) userIds.add(contract.lender);
        });

        // Create a map to store user details
        const userDetailsMap = {};

        // Fetch user details for each ID using the store
        for (const userId of userIds) {
          try {
            const userData = await fetchUserProfile(userId);
            if (userData) {
              userDetailsMap[userId] = userData;
            } else {
              console.error("No user data returned for ID:", userId);
              userDetailsMap[userId] = { firstName: "User", lastName: "" };
            }
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            userDetailsMap[userId] = { firstName: "User", lastName: "" };
          }
        }

        setUserDetails(userDetailsMap);
      } catch (error) {
        console.error("Error in fetchUserDetails:", error);
      }
    };

    if (activeContracts.length > 0) {
      fetchUserDetails();
    }
  }, [activeContracts, user?._id, fetchUserProfile]);

  const getUserName = (userId) => {
    if (!userId) return "Unknown User";

    if (userId === user?._id) {
      return user.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user.name || "You";
    }

    const userDetail = userDetails[userId];
    if (!userDetail) return "Unknown User";

    return userDetail.firstName
      ? `${userDetail.firstName} ${userDetail.lastName || ""}`.trim()
      : userDetail.name || `User ${userId.substring(0, 5)}...`;
  };

  const toggleExpandDetails = (contractId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [contractId]: !prev[contractId],
    }));
  };

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
  };

  const handleCloseDetails = () => {
    setSelectedContract(null);
  };

  const handlePayment = (loanId) => {
    console.log("Payment button clicked for loan ID:", loanId);
    navigate(`/loan-details/${loanId}`);
  };

  // Handle sort order change
  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  // Sort contracts function
  const sortContracts = (contracts) => {
    return [...contracts].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (sortOrder === "newest") {
        return dateB - dateA; // Newest first (descending)
      } else {
        return dateA - dateB; // Oldest first (ascending)
      }
    });
  };

  // Separate contracts based on user role
  const borrowerContracts = activeContracts.filter(
    (contract) => contract.borrower === user?._id
  );

  const lenderContracts = activeContracts.filter(
    (contract) => contract.lender === user?._id
  );

  // Further filter by status and apply sorting
  const activeAsBorrower = sortContracts(
    borrowerContracts.filter((contract) => contract.status === "active")
  );
  const completedAsBorrower = sortContracts(
    borrowerContracts.filter((contract) => contract.status === "completed")
  );

  const activeAsLender = sortContracts(
    lenderContracts.filter((contract) => contract.status === "active")
  );
  const completedAsLender = sortContracts(
    lenderContracts.filter((contract) => contract.status === "completed")
  );

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Calculate progress for milestone payments
  const calculateProgress = (repaymentSchedule) => {
    if (!repaymentSchedule || repaymentSchedule.length === 0) return 0;

    const paidMilestones = repaymentSchedule.filter(
      (item) => item.status === "paid"
    ).length;
    return Math.round((paidMilestones / repaymentSchedule.length) * 100);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "paid":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <Check size={14} className="inline mr-1" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={14} className="inline mr-1" /> Pending
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

  const renderRepaymentSchedule = (schedule) => {
    return (
      <div className="space-y-3 mt-3">
        {schedule.map((payment, index) => (
          <div
            key={payment._id}
            className={`p-3 rounded-md ${
              payment.status === "paid"
                ? "bg-green-50 border border-green-100"
                : "bg-gray-50 border border-gray-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">
                  Payment {index + 1} of {schedule.length}
                </p>
                <div className="flex items-center mt-1 text-sm text-gray-700">
                  <Calendar size={14} className="mr-1" />
                  Due: {formatDate(payment.dueDate)}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  Rs. {payment.amountDue.toLocaleString()}
                </p>
                <div className="mt-1">{renderStatusBadge(payment.status)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContractsList = (contracts, role) => {
    if (contracts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No {viewMode} contracts found where you are the {role}.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract._id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {role === "borrower"
                        ? `Loan from ${getUserName(contract.lender)}`
                        : `Loan to ${getUserName(contract.borrower)}`}
                    </h3>
                    <div className="ml-2">
                      {renderStatusBadge(contract.status)}
                    </div>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Transaction ID: {contract.transactionId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">
                    Rs.{" "}
                    {parseFloat(contract.totalRepaymentAmount).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contract.repaymentType === "milestone"
                      ? `${contract.repaymentSchedule.length} Milestones`
                      : "One-time Payment"}
                  </p>
                </div>
              </div>

              {contract.repaymentType === "milestone" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Progress
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {calculateProgress(contract.repaymentSchedule)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${calculateProgress(
                          contract.repaymentSchedule
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Created On</span>
                  <p className="font-medium">
                    {formatDate(contract.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Next Payment</span>
                  <p className="font-medium">
                    {contract.status === "completed"
                      ? "All payments completed"
                      : contract.repaymentSchedule.find(
                          (p) => p.status === "pending"
                        )
                      ? formatDate(
                          contract.repaymentSchedule.find(
                            (p) => p.status === "pending"
                          ).dueDate
                        )
                      : "No pending payments"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => toggleExpandDetails(contract._id)}
                  className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                >
                  {expandedDetails[contract._id] ? (
                    <>
                      <ChevronDown size={16} className="mr-1" /> Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronRight size={16} className="mr-1" /> Show Details
                    </>
                  )}
                </button>

                <div className="flex space-x-2">
                  {role === "borrower" && contract.status === "active" && (
                    <button
                      onClick={() => handlePayment(contract.loan._id)}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Make Payment
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(contract)}
                    className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    View Contract
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedDetails[contract._id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Repayment Schedule
                      </h4>
                      {renderRepaymentSchedule(contract.repaymentSchedule)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">
                  My Loan Contracts
                </h1>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  {/* Sort dropdown */}
                  <div className="relative inline-block">
                    <div className="flex items-center bg-gray-700 rounded-md shadow-sm">
                      <button
                        onClick={() => handleSortChange("newest")}
                        className={`px-3 py-2 text-sm flex items-center rounded-l-md ${
                          sortOrder === "newest"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                      >
                        <SortDesc size={16} className="mr-1" /> Newest
                      </button>
                      <button
                        onClick={() => handleSortChange("oldest")}
                        className={`px-3 py-2 text-sm flex items-center rounded-r-md ${
                          sortOrder === "oldest"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                      >
                        <SortAsc size={16} className="mr-1" /> Oldest
                      </button>
                    </div>
                  </div>

                  {/* View mode buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setViewMode("active")}
                      className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                        viewMode === "active"
                          ? "bg-blue-600 text-white focus:ring-blue-500"
                          : "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500"
                      }`}
                    >
                      Active Contracts
                    </button>
                    <button
                      onClick={() => setViewMode("completed")}
                      className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                        viewMode === "completed"
                          ? "bg-blue-600 text-white focus:ring-blue-500"
                          : "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500"
                      }`}
                    >
                      Completed Contracts
                    </button>
                  </div>
                </div>
              </div>

              {isProcessing ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-red-800">
                    Error Loading Contracts
                  </h3>
                  <p className="text-red-600 mt-2">{error}</p>
                </div>
              ) : (
                <Tab.Group>
                  <Tab.List className="bg-gray-100 p-2 flex space-x-2">
                    <Tab
                      className={({ selected }) => `
                      flex-1 py-2.5 text-sm font-medium rounded-md 
                      ${
                        selected
                          ? "bg-white shadow text-gray-800"
                          : "text-gray-600 hover:bg-white/[0.5] hover:text-gray-700"
                      }
                    `}
                    >
                      Borrowing (
                      {viewMode === "active"
                        ? activeAsBorrower.length
                        : completedAsBorrower.length}
                      )
                    </Tab>
                    <Tab
                      className={({ selected }) => `
                      flex-1 py-2.5 text-sm font-medium rounded-md 
                      ${
                        selected
                          ? "bg-white shadow text-gray-800"
                          : "text-gray-600 hover:bg-white/[0.5] hover:text-gray-700"
                      }
                    `}
                    >
                      Lending (
                      {viewMode === "active"
                        ? activeAsLender.length
                        : completedAsLender.length}
                      )
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="p-6">
                    <Tab.Panel>
                      {viewMode === "active"
                        ? renderContractsList(activeAsBorrower, "borrower")
                        : renderContractsList(completedAsBorrower, "borrower")}
                    </Tab.Panel>
                    <Tab.Panel>
                      {viewMode === "active"
                        ? renderContractsList(activeAsLender, "lender")
                        : renderContractsList(completedAsLender, "lender")}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contract Details Modal */}
      <AnimatePresence>
        {selectedContract && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={handleCloseDetails}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 z-10 overflow-hidden relative"
            >
              <div className="px-6 py-4 bg-gray-800 text-white flex justify-between items-center">
                <h3 className="text-xl font-semibold">Contract Details</h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-white hover:text-gray-300"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2">
                    {selectedContract.borrower === user?._id
                      ? `Loan from ${getUserName(selectedContract.lender)}`
                      : `Loan to ${getUserName(selectedContract.borrower)}`}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Contract ID</p>
                    <p className="font-medium text-gray-800">
                      {selectedContract._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div>{renderStatusBadge(selectedContract.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Your Role</p>
                    <p className="font-medium text-gray-800">
                      {selectedContract.borrower === user?._id
                        ? "Borrower"
                        : "Lender"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {selectedContract.borrower === user?._id
                        ? "Lender"
                        : "Borrower"}
                    </p>
                    <p className="font-medium text-gray-800 flex items-center">
                      <User size={16} className="mr-1" />
                      {selectedContract.borrower === user?._id
                        ? getUserName(selectedContract.lender)
                        : getUserName(selectedContract.borrower)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-gray-800">
                      Rs. {parseFloat(selectedContract.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Insurance Added</p>
                    <p className="font-medium text-gray-800">
                      {selectedContract.insuranceAdded ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Repayment Type</p>
                    <p className="font-medium text-gray-800">
                      {selectedContract.repaymentType === "milestone"
                        ? "Milestone Payments"
                        : "One-time Payment"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Creation Date</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(selectedContract.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(selectedContract.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Transaction Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-medium text-gray-800">
                        {selectedContract.transactionId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Repayment</p>
                      <p className="font-medium text-gray-800">
                        Rs.{" "}
                        {parseFloat(
                          selectedContract.totalRepaymentAmount
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    Repayment Schedule
                  </h4>
                  <div className="space-y-4">
                    {selectedContract.repaymentSchedule.map(
                      (payment, index) => (
                        <div
                          key={payment._id}
                          className={`p-4 rounded-lg border ${
                            payment.status === "paid"
                              ? "bg-green-50 border-green-100"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                Payment {index + 1} of{" "}
                                {selectedContract.repaymentSchedule.length}
                              </h5>
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <Calendar size={16} className="mr-1" />
                                Due: {formatDate(payment.dueDate)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold flex items-center">
                                Rs. {payment.amountDue.toLocaleString()}
                              </div>
                              <div className="mt-2">
                                {renderStatusBadge(payment.status)}
                              </div>
                            </div>
                          </div>

                          {payment.status === "pending" &&
                            selectedContract.borrower === user?._id && (
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() =>
                                    handlePayment(selectedContract.loan._id)
                                  }
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Make Payment{" "}
                                  <ArrowRight size={16} className="ml-1" />
                                </button>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActiveContracts;
