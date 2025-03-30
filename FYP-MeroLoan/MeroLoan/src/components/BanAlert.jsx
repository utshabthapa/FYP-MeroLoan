import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppealStore } from "../store/appealStore"; // Adjust the path as needed
import { useAuthStore } from "../store/authStore"; // Assuming you have an auth context, adjust as needed

const BanAlert = () => {
  const [dismissed, setDismissed] = useState(false);
  const [hasActiveAppeal, setHasActiveAppeal] = useState(false);
  const navigate = useNavigate();

  // Get user info from auth context
  const { user } = useAuthStore();

  // Get appeal store methods
  const { appeals, fetchUserAppeals, isLoading, error } = useAppealStore();

  useEffect(() => {
    if (user?._id) {
      // Fetch user's appeals when component mounts
      fetchUserAppeals(user._id);
    }
  }, [user, fetchUserAppeals]);

  useEffect(() => {
    // Check if user has any pending appeals
    if (appeals.length > 0) {
      const pendingAppeal = appeals.find(
        (appeal) => appeal.status === "pending"
      );
      setHasActiveAppeal(!!pendingAppeal);
    }
  }, [appeals]);

  if (dismissed) return null;

  const handleSubmitAppeal = () => {
    navigate("/account/appeal");
  };

  return (
    <div className="w-full bg-red-50 border-b border-t border-red-200 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <p className="text-red-800 font-medium">
              Your account has been banned. You cannot request loans or make
              transactions.
            </p>
            <p className="text-red-700 text-sm">
              {hasActiveAppeal
                ? "You have a pending appeal. We'll review it as soon as possible."
                : "If you believe this is a mistake, please submit an appeal."}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!hasActiveAppeal ? (
            <button
              onClick={handleSubmitAppeal}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-1.5 rounded-md text-sm transition-colors duration-200"
            >
              Submit Appeal
            </button>
          ) : (
            <Link
              to="/account/appeal"
              className="bg-red-700 hover:bg-red-800 text-white font-medium px-4 py-1.5 rounded-md text-sm transition-colors duration-200"
            >
              View Appeal
            </Link>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-red-700 hover:text-red-900"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanAlert;
