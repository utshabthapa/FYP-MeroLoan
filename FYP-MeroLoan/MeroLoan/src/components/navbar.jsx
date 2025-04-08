"use client";

import { useState, useEffect, useRef, useContext } from "react"; // Add useContext
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Link, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Bell,
  User,
  BellOff,
  DollarSign,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import logo from "../assets/MeroLoan Logo.svg";
import { motion, AnimatePresence } from "framer-motion";
import BanAlert from "./BanAlert";
import { SocketContext } from "../socketContext"; // Import the context

// Helper function to format time
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
};

// Notification type icons
const getNotificationIcon = (type) => {
  switch (type) {
    case "loan":
      return <DollarSign size={18} className="text-blue-500" />;
    case "payment":
      return <Check size={18} className="text-green-500" />;
    case "reminder":
      return <Clock size={18} className="text-amber-500" />;
    case "alert":
      return <AlertCircle size={18} className="text-red-500" />;
    default:
      return <Bell size={18} className="text-gray-500" />;
  }
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
        !notification.read ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-1 p-2 rounded-full bg-gray-100">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1">
          <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
            {notification.message}
          </p>
          <div className="flex justify-between items-center mt-1">
            <small className="text-xs text-gray-500">
              {formatTimeAgo(notification.timestamp)}
            </small>
            {!notification.read && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification._id);
                }}
              >
                <CheckCheck size={14} className="mr-1" />
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationPanel = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteAll,
  onClose,
  activeFilter,
  setActiveFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter notifications based on active filter and search term
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unread" && !notification.read) ||
      activeFilter === notification.type;

    const matchesSearch =
      !searchTerm ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-96 max-h-[32rem] flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg flex items-center">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search notifications..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Bell size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
          {searchTerm && (
            <button
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
          <button
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              activeFilter === "unread"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setActiveFilter("unread")}
          >
            Unread
          </button>
          {/* Type filters commented out */}
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff size={32} className="mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">
                {searchTerm
                  ? "No notifications match your search"
                  : activeFilter !== "all"
                  ? `No ${activeFilter} notifications`
                  : "No notifications"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 flex justify-between">
          <button
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
            onClick={onMarkAllAsRead}
          >
            <CheckCheck size={14} className="mr-1" />
            Mark all as read
          </button>
          <button
            className="text-xs text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center"
            onClick={onDeleteAll}
          >
            <Trash2 size={14} className="mr-1" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const socket = useContext(SocketContext); // Access socket from context
  const { isAuthenticated, user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    addNotification,
    deleteAllNotifications,
  } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const notificationRef = useRef(null);
  const location = useLocation();

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
  // useEffect(() => {
  //   if (isAuthenticated && user?._id) {
  //     socket.emit("joinUserRoom", user._id);

  //     const handleNewNotification = (notification) => {
  //       addNotification(notification);

  //       if ("Notification" in window && Notification.permission === "granted") {
  //         new Notification("MeroLoan Notification", {
  //           body: notification.message,
  //           icon: "/favicon.ico",
  //         });
  //       }
  //     };

  //     socket.on("newNotification", handleNewNotification);

  //     return () => {
  //       socket.emit("leaveUserRoom", user._id);
  //       socket.off("newNotification", handleNewNotification);
  //     };
  //   }
  // }, [isAuthenticated, user?._id, addNotification]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      socket.emit("joinUserRoom", user._id);

      socket.on("newNotification", (notification) => {
        addNotification(notification);
      });

      return () => {
        socket.emit("leaveUserRoom", user._id);
        socket.off("newNotification");
      };
    }
  }, [socket, isAuthenticated, user?._id, addNotification]);
  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Toggle notification popup
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);

    // Reset filter when opening
    if (!showNotifications) {
      setActiveFilter("all");
    }
  };

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    for (const notification of unreadNotifications) {
      await markAsRead(notification._id);
    }
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications(user._id);
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    }
  };

  // Active link style classes
  const activeLinkClasses =
    "text-gray-800 font-bold border-b-2 border-gray-500";
  const defaultLinkClasses =
    "flex items-center gap-2 transition-all duration-200 hover:text-gray-600";

  return (
    <>
      <div className="fixed w-full top-0 z-50 border-b-2 bg-white ">
        <div className="flex justify-between mx-auto items-center py-3 bg-white text-black font-semibold rounded-lg max-w-7xl">
          <div>
            <Link to="/dashboard">
              <img
                src={logo || "/placeholder.svg"}
                alt="MeroLoan Logo"
                className="h-11 w-auto"
              />
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
                      to="/policy"
                      className={`${defaultLinkClasses} ${
                        isActive("/policy") ? activeLinkClasses : ""
                      }`}
                    >
                      <span>Privacy Policy</span>
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
                  <li>
                    <Link
                      to="/policy"
                      className={`${defaultLinkClasses} ${
                        isActive("/policy") ? activeLinkClasses : ""
                      }`}
                    >
                      <span>Privacy Policy</span>
                    </Link>
                  </li>
                  <li className="relative" ref={notificationRef}>
                    <button
                      onClick={toggleNotifications}
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 ${
                        showNotifications ? "bg-gray-200" : "hover:bg-gray-100"
                      }`}
                      aria-label="Notifications"
                    >
                      <Bell size={20} className="text-gray-700" />
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center min-w-[18px] h-[18px] px-1"
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </motion.span>
                      )}
                    </button>

                    {/* Enhanced Notification Panel */}
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          <NotificationPanel
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                            onDeleteAll={handleDeleteAllNotifications}
                            onClose={() => setShowNotifications(false)}
                            activeFilter={activeFilter}
                            setActiveFilter={setActiveFilter}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                  <li>
                    <Link
                      to="/userProfile"
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 ${
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
      <div className=" relative top-16 left-0 w-full h-fullz-40">
        {isAuthenticated && user?.banStatus === "banned" && <BanAlert />}
      </div>
    </>
  );
};

export default Navbar;
