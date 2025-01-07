import React from "react";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";

const Login = () => {
  return (
    <div className="overflow-hidden bg-gradient-to-b from-gray-50 to-gray-300">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center h-dvh"
      >
        <div className="relative rounded-b-3xl w-3/12 h-[430px] mt-16 bg-white bg-opacity-50 shadow-lg rounded-xl flex flex-col items-center justify- p-6 backdrop-blur-2xl backdrop-filter">
          <h1 className="font-black text-3xl bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 text-transparent mt-6">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            Enter your credentials to access your account
          </p>
          <form className="mt-6 w-full font-semibold text-gray-700">
            <label className="text-sm  " htmlFor="">
              Email
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-2 py-2 text-sm  border rounded-lg border-gray-300 mt-1 mb-4 "
              />
            </label>
            <label className="mt-4" htmlFor="">
              Password
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-2 py-2 text-sm  border rounded-lg border-gray-300 mt-1"
              />
            </label>
            <button className="w-full bg-gray-800 px-2 py-2 text-sm  rounded-lg text-white my-4">
              Login
            </button>
          </form>
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white absolute bottom-0 w-full py-3 rounded-b-3xl mt-8 flex flex-col items-center tracking-wider">
            <p className="text-sm">Don't have an account? </p>
            <a href="/register" className="text-clip text-sm font-bold">
              Register
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
