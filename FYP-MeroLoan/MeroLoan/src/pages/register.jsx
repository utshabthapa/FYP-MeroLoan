import React from "react";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";

const Register = () => {
  return (
    <div className="overflow-hidden bg-gradient-to-b from-gray-50 to-gray-300">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center h-dvh"
      >
        <div className="relative rounded-b-3xl w-3/12 h-[620px] mt-16 bg-white bg-opacity-50 shadow-lg rounded-xl flex flex-col items-center justify- p-6 backdrop-blur-2xl backdrop-filter">
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
          <form className="mt- w-full">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-2 py-2 text-sm border rounded-lg border-gray-300 mt-3"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-2 py-2 text-sm  border rounded-lg border-gray-300 mt-3"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-2 py-2 text-sm  border rounded-lg border-gray-300 mt-3 "
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-2 py-2 text-sm  border rounded-lg border-gray-300 mt-3"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-2 py-2 text-sm  border rounded-lg border-gray-300 mt-3"
            />
            <div className=" mt-4">
              <input type="checkbox" className="mr-2" />
              <label className="text-gray-700 text-sm">
                I agree to the Terms and Conditions
              </label>
            </div>
            <button className="w-full bg-gray-800 px-2 py-2 text-sm  rounded-lg text-white my-4">
              Register
            </button>
          </form>
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white absolute bottom-0 w-full py-3 rounded-b-3xl mt-8 flex flex-col items-center tracking-wider">
            <p className="text-sm">Already have an account? </p>
            <a href="/login" className="text-clip text-sm font-bold">
              Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
