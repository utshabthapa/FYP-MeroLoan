import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Input from "../components/Input";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Loader, Lock, Mail, MapPin, Phone, User, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultUser from "../assets/userProfile.png";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { signup, error, isLoading } = useAuthStore();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let uploadedImage = null;
    let publicId = null;

    try {
      if (image) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "UserImages_Preset");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dqejmq2px/image/upload",
          {
            method: "PUT",
            body: formData,
          }
        );
        const data = await response.json();
        uploadedImage = data.secure_url;
        publicId = data.public_id;
        setIsUploading(false);
      }

      await signup(
        email,
        password,
        name,
        address,
        phone,
        uploadedImage,
        publicId
      );
      navigate("/verify-email");
    } catch (error) {
      setIsUploading(false);
      console.log(error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-200">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center h-dvh"
      >
        <div className="relative rounded-b-3xl w-[480px] mt-16 bg-white bg-opacity-80 shadow-lg rounded-xl flex flex-col items-center justify- p-6 backdrop-blur-2xl backdrop-filter">
          <h1 className="font-black text-3xl bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 text-transparent">
            Create an Account
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            Join Meroloan today and explore our services
          </p>

          <div className="relative w-20 h-20 mt-6 group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {isUploading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader className="animate-spin text-gray-500" size={24} />
                </div>
              ) : (
                <img
                  src={imagePreview || defaultUser}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full">
              <Upload className="text-white" size={24} />
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          </div>
          <p className="font-medium text-gray-500 text-sm mt-3">
            Upload profile picture (optional)
          </p>

          <form onSubmit={handleSubmit} className="mt-6 w-full">
            <Input
              icon={User}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your Name"
            />
            <Input
              icon={MapPin}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your Address"
            />
            <Input
              icon={Phone}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your Phone Number"
              maxLength={10}
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
            <Input
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <Input
              icon={Lock}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            {error && (
              <p className="text-red-500 font-semibold mt-2">{error}</p>
            )}
            <div className="mt-4">
              <input type="checkbox" className="mr-2" required />
              <label className="text-gray-700 text-sm">
                I agree to the Terms and Conditions
              </label>
            </div>
            <motion.button
              className="mt-5 w-full py-2 px-4 bg-gradient-to-r from-gray-800 to-gray-700 text-white 
              rounded-lg shadow-lg hover:from-gray-700
              hover:to-gray-800 transition duration-100 mb-16"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || isUploading}
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={24} />
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white absolute bottom-0 w-full py-3 rounded-b-3xl mt-8 flex flex-col items-center tracking-wider">
            <p className="text-sm">Already have an account? </p>
            <a href="/login" className="text-clip text-sm font-bold mt-1">
              Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
