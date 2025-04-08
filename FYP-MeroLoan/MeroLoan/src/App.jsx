import React, { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import SignUp from "./pages/SignUp";
import { useAuthStore } from "./store/authStore";
import { useReminderStore } from "./store/reminderStore";
import Dashboard from "./pages/Dashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import LoanApplicationReview from "./pages/LoanApplicationReview";
import UserProfile from "./pages/UserProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KYCForm from "./pages/KYCForm";
import KYCAdminPage from "./pages/KYCAdminPage";
import KYCDetailsPage from "./pages/KYCDetailsPage";
import LoanForm from "./pages/LoanForm";
import LoanRequests from "./pages/LoanRequests";
import LoanDetails from "./pages/LoanDetails";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import UserLoanRequests from "./pages/UserLoanRequests";
import RepaymentSuccess from "./pages/RepaymentSuccess";
import LoanApplicationDetail from "./pages/LoanApplicationDetail";
import TransactionHistory from "./pages/TransactionHistory";
import BalanceTransferRequest from "./pages/BalanceTransferRequest";
import PublicUserProfile from "./pages/PublicUserProfile";
import BanUsers from "./pages/BanUsers";
import AppealPage from "./pages/AppealPage";
import AdminAppealsPage from "./pages/AdminAppealsPage";
import ActiveContracts from "./pages/ActiveContracts";
import ContractDetailView from "./pages/ContractDetailView";
import { SocketContext } from "./socketContext"; // Import the context
import { io } from "socket.io-client";
import BanAlert from "./pages/BanAlert";
import Policy from "./pages/Policy";
import AboutPage from "./pages/AboutUs";

const socket = io("http://localhost:5000");

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  // Show a loading spinner while checking auth
  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.isVerified) {
    // Check if user exists and isVerified
    return <Navigate to="/verify-email" replace />;
  }

  if (isAuthenticated && user.isVerified && user.role === "admin") {
    return <Navigate to="/adminDashboard" replace />;
  }
  // List of allowed routes for banned users
  const allowedRoutesForBannedUsers = [
    "/dashboard",
    "/userProfile",
    "/transactionHistory",
    "/account/appeal",
    "/user-profile/",
  ];

  // Check if user is banned and trying to access a restricted route
  if (user.banStatus === "banned") {
    const currentPath = window.location.pathname;
    const isAllowed = allowedRoutesForBannedUsers.some(
      (route) => currentPath === route || currentPath.startsWith(route)
    );

    if (!isAllowed) {
      return <BanAlert />;
    }
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  // Show a loading spinner while checking auth
  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }
  if (isAuthenticated && user.isVerified && user.role === "user") {
    return <Navigate to="/dashboard" replace />;
  }
  if (isAuthenticated && user.isVerified && user.role === "admin") {
    return <Navigate to="/adminDashboard" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();
  const { checkReminders } = useReminderStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // In your app.jsx
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      user.isVerified &&
      user.role === "user" &&
      user.banStatus !== "banned"
    ) {
      const userId = user._id;

      // Only check if we haven't checked recently (using localStorage)
      const lastCheck = localStorage.getItem(`lastReminderCheck-${userId}`);
      const now = new Date().getTime();

      if (!lastCheck || now - parseInt(lastCheck) > 12 * 60 * 60 * 1000) {
        const checkUserReminders = () => {
          checkReminders(userId);
          localStorage.setItem(`lastReminderCheck-${userId}`, now.toString());
        };

        checkUserReminders();
      }

      const intervalId = setInterval(() => {
        const now = new Date().getTime();
        localStorage.setItem(`lastReminderCheck-${userId}`, now.toString());
        checkReminders(userId);
      }, 12 * 60 * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, user, checkReminders]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <>
          <ToastContainer />
          <Routes>
            <Route
              path="/adminDashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/kycApplications"
              element={
                <AdminRoute>
                  <KYCAdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/banUsers"
              element={
                <AdminRoute>
                  <BanUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/kyc/:kycId"
              element={
                <AdminRoute>
                  <KYCDetailsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/loanApplicationReview"
              element={
                <AdminRoute>
                  <LoanApplicationReview />
                </AdminRoute>
              }
            />
            <Route
              path="/loanApplicationDetails/:loanId"
              element={
                <AdminRoute>
                  <LoanApplicationDetail />
                </AdminRoute>
              }
            />
            <Route
              path="/balanceTransferRequests"
              element={
                <AdminRoute>
                  <BalanceTransferRequest />
                </AdminRoute>
              }
            />
            <Route
              path="/"
              element={
                <RedirectAuthenticatedUser>
                  <LandingPage />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/about"
              element={
                <RedirectAuthenticatedUser>
                  <AboutPage />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userProfile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-profile/:userId"
              element={
                <ProtectedRoute>
                  <PublicUserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactionHistory"
              element={
                <ProtectedRoute>
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <RedirectAuthenticatedUser>
                  <Login />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/signUp"
              element={
                <RedirectAuthenticatedUser>
                  <SignUp />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <RedirectAuthenticatedUser>
                  <ForgotPassword />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <RedirectAuthenticatedUser>
                  <ResetPassword />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/verify-email"
              element={
                <RedirectAuthenticatedUser>
                  <EmailVerificationPage />
                </RedirectAuthenticatedUser>
              }
            />
            {/* KYC Admin Page for Admins */}
            <Route
              path="/kyc-admin"
              element={
                <AdminRoute>
                  <KYCAdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/banAppeals"
              element={
                <AdminRoute>
                  <AdminAppealsPage />
                </AdminRoute>
              }
            />
            {/* KYC Form Page for Users */}
            <Route
              path="/kyc-form/:_id"
              element={
                <ProtectedRoute>
                  <KYCForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loan-form"
              element={
                <ProtectedRoute>
                  <LoanForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loan-requests"
              element={
                <ProtectedRoute>
                  <LoanRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loan-details/:loanId"
              element={
                <ProtectedRoute>
                  <LoanDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userLoanRequests"
              element={
                <ProtectedRoute>
                  <UserLoanRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repayment-success"
              element={
                <ProtectedRoute>
                  <RepaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-failure"
              element={
                <ProtectedRoute>
                  <PaymentFailure />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/appeal"
              element={
                <ProtectedRoute>
                  <AppealPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/active-contracts"
              element={
                <ProtectedRoute>
                  <ActiveContracts />
                </ProtectedRoute>
              }
            />
            <Route path="/policy" element={<Policy />} />
            {/* <Route
            path="/contract-detail-view"
            element={
              <ProtectedRoute>
                <ContractDetailView />
              </ProtectedRoute>
            }
          /> */}
          </Routes>
        </>
      </BrowserRouter>
    </SocketContext.Provider>
  );
}

export default App;
