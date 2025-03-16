import React from "react";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";
import MainLogo from "../assets/MeroLoan Logo.png";
import logo from "../assets/MeroLoan Logo.svg";

const Navbar = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="fixed w-full top-0 z-50 border-b-2 bg-white ">
      <div className="flex justify-between mx-auto items-center py-3 bg-white text-black font-semibold rounded-lg max-w-7xl">
        <div>
          <a href="/dashboard">
            <img src={logo} alt="MeroLoan Logo" className="h-11 w-auto" />
          </a>
        </div>
        <div>
          <ul className="flex space-x-6">
            {!isAuthenticated && (
              <>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/">About Us</a>
                </li>
                <li>
                  <a href="/signup">Sign Up</a>
                </li>
                <li>
                  <a href="/login">Login</a>
                </li>
              </>
            )}
            {isAuthenticated && (
              <>
                <li>
                  <a href="/dashboard">Dashboard</a>
                </li>
                <li>
                  <a href="/loan-requests">Loan Requests</a>
                </li>
                <li>
                  <a href="/transactionHistory">Transaction History</a>
                </li>
                <li>
                  <a href="/dashboard">Notifications</a>
                </li>

                <li>
                  <a href="/userProfile">Profile</a>
                </li>
                <li>
                  <a
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                    href="/loan-form"
                  >
                    Apply for a loan
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
