import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import {
  Camera,
  CheckCircle,
  FileText,
  CreditCard,
  CheckCircle2,
  Edit2,
  X,
  Save,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import defaultUser from "../assets/userProfile.png";

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

const EditableField = ({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {isEditing ? (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 p-2 block w-full rounded-md border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
      />
    ) : (
      <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
        {value}
      </p>
    )}
  </div>
);

const UserProfile = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { user, updateProfilePicture, logout, updateUserProfile } =
    useAuthStore();

  React.useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name,
        phone: user.phone || "+977 9841234567",
        address: user.address || "Kathmandu, Nepal",
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <div>Loading...</div>;
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

  const handleSaveProfile = async () => {
    if (editedUser.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    const userId = user?._id;
    if (!userId) {
      toast.error("User ID not found!");
      return;
    }
    try {
      console.log("Profile saved...", userId);
      console.log("Saving profile...", editedUser);
      await updateUserProfile(editedUser, userId);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
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
      <div className="max-w-7xl mx-auto  pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Left Column */}
          <div className="space-y-6 relative">
            <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-full h-32 absolute top-0 left-0 rounded-t-xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900"></div>
              <div className="flex flex-col items-center">
                <div className="relative mt-14">
                  <div
                    className="w-36 h-36 rounded-full overflow-hidden border-4 border-white cursor-pointer relative"
                    onClick={handleImageClick}
                    role="button"
                    aria-label="Change profile picture"
                  >
                    <img
                      src={previewImage || user?.image || defaultUser}
                      alt="Profile"
                      className={`w-full h-full object-cover bg-white rounded-full transition-opacity ${
                        isUploading ? "opacity-50" : "opacity-100"
                      }`}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
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
                <p className="text-xs font-medium text-gray-500 mt-2">
                  Click to change profile picture
                </p>
                <p className="mt-2 font-semibold text-2xl text-center text-gray-700 flex items-center">
                  {user?.name}
                  {user?.kycStatus === "approved" && (
                    <CheckCircle2
                      className="ml-1 text-white bg-green-400 rounded-full"
                      size={22}
                    />
                  )}
                </p>

                {/* KYC Status */}
                <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200 mb-4 mt-2">
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
                        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                      >
                        Apply for KYC Verification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full"
            >
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 py-3 rounded-full shadow-sm border border-gray-200 w-full text-white font-medium">
                <button className="w-full">Logout</button>
              </div>
            </motion.button>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <button
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <EditableField
                  label="Full Name"
                  value={editedUser.name}
                  isEditing={isEditing}
                  onChange={(value) =>
                    setEditedUser({ ...editedUser, name: value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <p className="mt-1 p-2 block w-full rounded-md border border-gray-300 bg-gray-50">
                    {user?.email}
                  </p>
                </div>
                <EditableField
                  label="Phone Number"
                  value={editedUser.phone}
                  isEditing={isEditing}
                  onChange={(value) => {
                    // Allow only numeric input and ensure length doesn't exceed 10
                    if (/^\d{0,10}$/.test(value)) {
                      setEditedUser({ ...editedUser, phone: value });
                    }
                  }}
                />

                <EditableField
                  label="Address"
                  value={editedUser.address}
                  isEditing={isEditing}
                  onChange={(value) =>
                    setEditedUser({ ...editedUser, address: value })
                  }
                />
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
