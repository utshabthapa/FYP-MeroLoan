// src/pages/BanAlert.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Navbar from "@/components/navbar";

const BanAlert = () => {
  const { user } = useAuthStore();

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-20">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Account Restricted
        </h1>
        <p className="mb-4">
          Your account has been banned by the administration. You can only
          access your profile, transaction history, and dashboard pages.
        </p>

        {user?.banReason && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <h2 className="font-semibold">Reason for ban:</h2>
            <p>{user.banReason}</p>
          </div>
        )}

        <p className="mb-6">
          If you believe this was a mistake, you can appeal the decision by
          clicking the button below.
        </p>

        <Link
          to="/account/appeal"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Appeal Ban
        </Link>
      </div>
    </>
  );
};

export default BanAlert;
