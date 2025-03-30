import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppealStore } from "../store/appealStore";
import { AlertCircle, Clock, Check, X, ChevronLeft } from "lucide-react";
import Navbar from "@/components/navbar";

const AppealPage = () => {
  const { user } = useAuthStore();
  const {
    createAppeal,
    fetchUserAppeals,
    appeals,
    isLoading,
    error,
    clearError,
  } = useAppealStore();
  const [formData, setFormData] = useState({
    reason: "",
    details: "",
  });
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch any existing appeals when component mounts
    if (user?._id) {
      fetchUserAppeals(user._id);
    }
  }, [user, fetchUserAppeals]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.reason.trim()) {
      newErrors.reason = "Please select a reason for your appeal";
    }
    if (formData.details.trim().length < 20) {
      newErrors.details = "Please provide at least 20 characters of details";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    // Check if there's a pending appeal already
    const hasPendingAppeal = appeals.some(
      (appeal) => appeal.status === "pending"
    );
    if (hasPendingAppeal) {
      setErrors({
        general:
          "You already have a pending appeal. Please wait for it to be reviewed.",
      });
      return;
    }

    try {
      const result = await createAppeal({
        userId: user._id,
        ...formData,
      });

      if (result) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          reason: "",
          details: "",
        });
      }
    } catch (err) {
      console.error("Error submitting appeal:", err);
    }
  };

  // Handle going back
  const handleBack = () => {
    navigate(-1);
  };

  // Show appeal status cards
  const renderAppealCards = () => {
    if (appeals.length === 0) return null;

    return (
      <>
        {/* <Navbar /> */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Your Appeals</h3>
          <div className="space-y-4">
            {appeals.map((appeal) => (
              <div
                key={appeal._id}
                className={`border rounded-lg p-4 ${
                  appeal.status === "pending"
                    ? "border-amber-300 bg-amber-50"
                    : appeal.status === "approved"
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 p-2 rounded-full bg-white">
                    {appeal.status === "pending" && (
                      <Clock size={20} className="text-amber-500" />
                    )}
                    {appeal.status === "approved" && (
                      <Check size={20} className="text-green-500" />
                    )}
                    {appeal.status === "rejected" && (
                      <X size={20} className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{appeal.reason}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {appeal.details}
                    </p>

                    {appeal.status !== "pending" && appeal.adminResponse && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-sm font-medium">Admin Response:</p>
                        <p className="text-sm">{appeal.adminResponse}</p>
                      </div>
                    )}

                    <div className="mt-2 flex justify-between items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          appeal.status === "pending"
                            ? "bg-amber-200 text-amber-800"
                            : appeal.status === "approved"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {appeal.status.charAt(0).toUpperCase() +
                          appeal.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(appeal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-3xl pt-20 pb-10 px-4">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-6">Account Ban Appeal</h1>

        {renderAppealCards()}

        {/* Show this alert if there's a pending appeal */}
        {appeals.some((appeal) => appeal.status === "pending") ? (
          <div className="mb-8 p-4 border border-amber-300 bg-amber-50 rounded-lg">
            <div className="flex items-center">
              <Clock size={20} className="text-amber-500 mr-2" />
              <p className="font-medium text-amber-800">
                You have a pending appeal. We'll review it as soon as possible.
              </p>
            </div>
          </div>
        ) : submitSuccess ? (
          <div className="mb-8 p-4 border border-green-300 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Check size={20} className="text-green-500 mr-2" />
              <div>
                <p className="font-medium text-green-800">
                  Your appeal has been submitted successfully!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  We'll review your appeal as soon as possible. You'll be
                  notified when there's an update.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Submit an Appeal</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                <p>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for Appeal*
                </label>
                <select
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a reason</option>
                  <option value="Incorrect Ban">
                    I believe my account was banned by mistake
                  </option>
                  <option value="Policy Misunderstanding">
                    I misunderstood the platform's policies
                  </option>
                  <option value="Account Compromised">
                    My account was compromised/hacked
                  </option>
                  <option value="Changed Behavior">
                    I understand my mistake and won't repeat it
                  </option>
                  <option value="Other">Other reason</option>
                </select>
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="details"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Appeal Details*
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Please explain in detail why your account should be unbanned..."
                  className={`w-full p-2 border rounded-md ${
                    errors.details ? "border-red-500" : "border-gray-300"
                  }`}
                ></textarea>
                {errors.details && (
                  <p className="text-red-500 text-xs mt-1">{errors.details}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Provide as much relevant information as possible to help us
                  review your case.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Appeal"
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="h-5 w-5 text-center text-xs bg-gray-200 rounded-full flex items-center justify-center mr-2 mt-0.5">
                    1
                  </span>
                  <span>
                    Our team will review your appeal within 2-3 business days.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-center text-xs bg-gray-200 rounded-full flex items-center justify-center mr-2 mt-0.5">
                    2
                  </span>
                  <span>You'll receive a notification with our decision.</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-center text-xs bg-gray-200 rounded-full flex items-center justify-center mr-2 mt-0.5">
                    3
                  </span>
                  <span>
                    If approved, your account ban will be lifted immediately.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AppealPage;
