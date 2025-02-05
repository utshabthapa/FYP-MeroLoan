import React, { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import SignUp from "./pages/SignUp";
import { useAuthStore } from "./store/authStore";
import Dashboard from "./pages/Dashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import InsuranceReview from "./pages/InsuranceReview";
import LoanApplicationReview from "./pages/LoanApplicationReview";
import UserProfile from "./pages/UserProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KYCForm from "./pages/KYCForm";
import KYCAdminPage from "./pages/KYCAdminPage";
import KYCDetailsPage from "./pages/KYCDetailsPage";

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
    return <Navigate to="/" replace />;
  }
  if (isAuthenticated && user.isVerified && user.role === "admin") {
    return <Navigate to="/adminDashboard" replace />;
  }

  return children;
};
function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
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
            path="/insuranceReview"
            element={
              <AdminRoute>
                <InsuranceReview />
              </AdminRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
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
          {/* KYC Form Page for Users */}
          <Route
            path="/kyc-form/:_id"
            element={
              <ProtectedRoute>
                <KYCForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;
