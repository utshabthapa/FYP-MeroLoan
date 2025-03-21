import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Link, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { Bell, User, BellOff, DollarSign, Trash2 } from "lucide-react";
import logo from "../assets/MeroLoan Logo.svg";

const socket = io("http://localhost:5000");

const Navbar = () => {
  const { isAuthenticated, user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    addNotification,
    deleteAllNotifications, // Import the deleteAllNotifications function
  } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const location = useLocation(); // Get current location/path

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchNotifications(user._id);
    }
  }, [isAuthenticated, user?._id, fetchNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      socket.emit("joinUserRoom", user._id);

      socket.on("newNotification", (notification) => {
        addNotification(notification);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user?._id, addNotification]);

  // Toggle notification popup
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications(user._id);
      alert("All notifications deleted successfully");
    } catch (error) {
      alert("Failed to delete notifications");
    }
  };

  // Active link style classes - using monotone colors
  const activeLinkClasses =
    "text-gray-800 font-bold border-b-2 border-gray-500";
  const defaultLinkClasses =
    "flex items-center gap-2 transition-all duration-200 hover:text-gray-600";

  return (
    <div className="fixed w-full top-0 z-50 border-b-2 bg-white">
      <div className="flex justify-between mx-auto items-center py-3 bg-white text-black font-semibold rounded-lg max-w-7xl">
        <div>
          <Link to="/dashboard">
            <img src={logo} alt="MeroLoan Logo" className="h-11 w-auto" />
          </Link>
        </div>
        <div>
          <ul className="flex space-x-6 items-center">
            {!isAuthenticated && (
              <>
                <li>
                  <Link
                    to="/"
                    className={`${defaultLinkClasses} ${
                      isActive("/") ? activeLinkClasses : ""
                    }`}
                  >
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`${defaultLinkClasses} ${
                      isActive("/about") ? activeLinkClasses : ""
                    }`}
                  >
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className={`${defaultLinkClasses} ${
                      isActive("/signup") ? activeLinkClasses : ""
                    }`}
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className={`${defaultLinkClasses} ${
                      isActive("/login") ? activeLinkClasses : ""
                    }`}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className={`${defaultLinkClasses} ${
                      isActive("/dashboard") ? activeLinkClasses : ""
                    }`}
                  >
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/loan-requests"
                    className={`${defaultLinkClasses} ${
                      isActive("/loan-requests") ? activeLinkClasses : ""
                    }`}
                  >
                    <span>Loan Requests</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/transactionHistory"
                    className={`${defaultLinkClasses} ${
                      isActive("/transactionHistory") ? activeLinkClasses : ""
                    }`}
                  >
                    <span>Transaction History</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/active-contracts"
                    className={`${defaultLinkClasses} ${
                      isActive("/active-contracts") ? activeLinkClasses : ""
                    }`}
                  >
                    <span>Active Contracts</span>
                  </Link>
                </li>
                <li className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="relative flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    aria-label="Notifications"
                  >
                    <Bell size={20} className="text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {/* Notification Popup - positioned relative to the notification button */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg">
                            Notifications
                          </h3>
                          <div className="flex gap-2">
                            {notifications.length > 0 && (
                              <>
                                <button
                                  className="text-gray-600 text-xs hover:text-gray-800 transition-colors duration-200"
                                  onClick={() =>
                                    notifications.forEach(
                                      (n) => !n.read && markAsRead(n._id)
                                    )
                                  }
                                >
                                  Mark all as read
                                </button>
                                <button
                                  className="text-gray-600 text-xs hover:text-red-600 transition-colors duration-200"
                                  onClick={handleDeleteAllNotifications}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="text-center py-6">
                            <BellOff
                              size={32}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-gray-500 mt-2">
                              No notifications
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification, index) => (
                            <div
                              key={index}
                              className={`p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
                                !notification.read ? "bg-gray-100" : ""
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="mr-2 mt-1">
                                  {notification.type === "loan" ? (
                                    <DollarSign
                                      size={18}
                                      className="text-gray-600"
                                    />
                                  ) : (
                                    <Bell size={18} className="text-gray-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm">
                                    {notification.message}
                                  </p>
                                  <div className="flex justify-between items-center mt-1">
                                    <small className="text-xs text-gray-500">
                                      {new Date(
                                        notification.timestamp
                                      ).toLocaleString()}
                                    </small>
                                    {!notification.read && (
                                      <button
                                        className="text-gray-600 text-xs hover:text-gray-800 transition-colors duration-200"
                                        onClick={(e) =>
                                          handleMarkAsRead(notification._id, e)
                                        }
                                      >
                                        Mark as read
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </li>
                <li>
                  <Link
                    to="/userProfile"
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${
                      isActive("/userProfile")
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <User size={20} className="text-gray-700" />
                  </Link>
                </li>
                <li>
                  <Link
                    className={`${
                      isActive("/loan-form") ? "bg-gray-800" : "bg-gray-700"
                    } text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200`}
                    to="/loan-form"
                  >
                    Apply for a loan
                  </Link>
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
