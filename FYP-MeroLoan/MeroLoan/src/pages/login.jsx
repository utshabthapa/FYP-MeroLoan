import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Input from "@/components/input";
import { Loader, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    localStorage.setItem("token", response.data.token);
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
        <div className="relative rounded-b-3xl w-[480px] mt-16 bg-white bg-opacity-80 shadow-xl rounded-xl flex flex-col items-center justify- p-6 backdrop-filter backdrop-blur-2xl ">
          <h1 className="font-black text-3xl bg-clip-text bg-gradient-to-r from-gray-700 to-gray-800 text-transparent mt-6">
            Welcome Back
          </h1>
          <p className="text-gray-700 mt-2 font-medium">
            Enter your credentials to access your account
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-4 w-full font-semibold text-gray-700"
          >
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
            <div className="flex items-center mb-">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            {error && (
              <p className="text-red-500 font-semibold mb-2">{error}</p>
            )}
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
                "Login"
              )}
            </motion.button>
          </form>
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white absolute bottom-0 w-full py-3 rounded-b-3xl mt-8 flex flex-col items-center tracking-wider">
            <p className="text-sm">Don't have an account? </p>
            <a href="/signup" className="text-clip text-sm font-bold mt-1">
              Sign Up
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
