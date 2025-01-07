import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Input from "../components/Input";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useAuthStore();

  const { signup, error, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signup(email, password, name);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="overflow-hidden bg-gradient-to-b from-white to-gray-200">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center h-dvh"
      >
        <div className="relative rounded-b-3xl w-[480px]  mt-16 bg-white bg-opacity-80 shadow-lg rounded-xl flex flex-col items-center justify- p-6 backdrop-blur-2xl backdrop-filter">
          <h1 className="font-black text-3xl bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 text-transparent">
            Create an Account
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            Join Meroloan today and explore our services
          </p>
          <div className="w-20 h-20 mt-6 rounded-full bg-gray-200">
            {/* Image */}
          </div>
          <p className="font-medium text-gray-500 text-sm mt-3">
            Upload profile picture (optional)
          </p>
          <form onSubmit={handleSubmit} className="mt- w-full">
            <Input
              icon={User}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter you Name"
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
            <div className=" mt-4">
              <input type="checkbox" className="mr-2" />
              <label className="text-gray-700 text-sm">
                I agree to the Terms and Conditions
              </label>
            </div>
            <motion.button
              className="mt-5 w-full py-2 px-4 bg-gradient-to-r from-gray-800 to-gray-700 text-white 
					 rounded-lg shadow-lg hover:from-gray-700
						hover:to-gray-800  transition duration-100 mb-16"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className=" animate-spin mx-auto" size={24} />
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
