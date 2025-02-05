import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import {
  Camera,
  CheckCircle,
  FileText,
  CreditCard,
  CheckCircle2,
  CheckCircle2Icon,
  LucideCheckCircle,
  LucideCheckCircle2,
  CheckCircleIcon,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

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

ActivityItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

const UserProfile = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate(); // Initialize useNavigate
  const { user, updateProfilePicture } = useAuthStore();
  console.log("User kyc id:", user.kycId);

  if (!user) {
    return <div>Loading...</div>; // Handle the case where user is not yet loaded
  }

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        setPreviewImage(URL.createObjectURL(file));

        // Upload new image to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "UserImages_Preset");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dqejmq2px/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        const uploadedImage = data.secure_url;
        const publicId = data.public_id;

        const userId = user?._id;
        if (!userId) {
          toast.error("User ID not found!");
          return;
        }

        // Update profile picture with new image URL
        await updateProfilePicture(uploadedImage, publicId, userId);
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to update profile picture");
      } finally {
        setIsUploading(false);
      }
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
          <div className="space-y-6 relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p- rounded-xl shadow-sm border border-gray-200"
            >
              <div className="w-full h-32 absolute rounded-t-xl  bg-gray-900"></div>
              <div className="flex flex-col items-center">
                <div className="relative group mt-14">
                  <div
                    className="w-36 h-36 rounded-full overflow-hidden border-4 border-white cursor-pointer"
                    onClick={handleImageClick}
                    role="button"
                    aria-label="Change profile picture"
                  >
                    <img
                      src={
                        previewImage ||
                        user?.image ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                      aria-label="User profile picture"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
                <p className=" text-xs font-medium text-gray-500">
                  Click to change profile picture
                </p>
                <p className="mt-2 font-semibold text-2xl text-center text-gray-700 flex items-center justify-center">
                  {user?.name}
                  {user?.kycStatus === "approved" && (
                    <CheckCircle2
                      className="ml-1 text-white bg-green-400 rounded-full p-"
                      size={22}
                    />
                  )}
                </p>
                {/* KYC Status and Verification Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200 mb-4 mt-2"
                >
                  <div className="flex flex-col items-center">
                    {user?.kycStatus === "approved" ? (
                      <div className="text-green-600">KYC Approved</div>
                    ) : user?.kycStatus === "rejected" ? (
                      <div className="text-red-600">KYC Rejected</div>
                    ) : user?.kycStatus === "pending" ? (
                      <div className="text-yellow-600">KYC Pending</div>
                    ) : (
                      <div className="text-gray-500">Apply for KYC</div>
                    )}

                    {(user?.kycStatus === "notApplied" ||
                      user?.kycStatus === "rejected") && (
                      <button
                        onClick={() => navigate(`/kyc-form/${user?._id}`)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full"
                      >
                        Apply for KYC Verification
                      </button>
                    )}
                  </div>
                </motion.div>
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
                    {user?.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user?.phone || "+977 9841234567"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user?.address || "Kathmandu, Nepal"}
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
