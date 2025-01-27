import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Camera, CheckCircle, FileText, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";

const ActivityItem = ({ icon: Icon, title, description, date }) => (
  <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className="rounded-full p-2 bg-gray-100">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
    <span className="text-sm text-gray-500">{date}</span>
  </div>
);

const UserProfile = () => {
  const { user } = useAuthStore();
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      // Here you would typically handle the file upload to your backend
    }
  };

  const recentActivity = [
    {
      icon: CheckCircle,
      title: "Loan Application Approved",
      description: "Your loan application #12345 has been approved",
      date: "2 days ago",
    },
    {
      icon: FileText,
      title: "Documents Updated",
      description: "You updated your verification documents",
      date: "5 days ago",
    },
    {
      icon: CreditCard,
      title: "Loan Payment",
      description: "Monthly payment of NPR 25,000 completed",
      date: "1 week ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Left Column - Profile Picture and Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div
                    className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <img
                      src={
                        previewImage ||
                        user.profilePicture ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Click to change profile picture
                </p>
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified Account
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Personal Information and Activity */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user.phone || "+977 9841234567"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user.address || "Kathmandu, Nepal"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
