import React from "react";
import Navbar from "@/components/navbar";

const Register = () => {
  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center h-dvh">
        <div className="w-4/12 h-[800px] mt-16 bg-white shadow-lg border rounded-lg flex flex-col items-center justify-center p-6 ">
          <h1 className="font-extrabold text-3xl text-gray-800">
            Create an Account
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            Join Meroloan today and explore our services
          </p>
          <div className="w-28 h-28 mt-6 rounded-full bg-gray-200">
            {/* Image */}
          </div>
          <p className="font-medium text-gray-500 text-sm mt-3">
            Upload profile picture (optional)
          </p>
          <form className="mt-8 w-full">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-2 border rounded-lg border-gray-300 mt-6"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-2 border rounded-lg border-gray-300 mt-6"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded-lg border-gray-300 mt-6 "
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded-lg border-gray-300 mt-6"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 border rounded-lg border-gray-300 mt-6"
            />
            <div className=" mt-6">
              <input type="checkbox" className="mr-2" />
              <label className="text-gray-700">
                I agree to the Terms and Conditions
              </label>
            </div>
            <button className="w-full bg-gray-800 p-2 rounded-lg text-white mt-4">
              Register
            </button>
          </form>
          <p className="text-gray-500 mt-6">Already have an account? </p>
          <a href="/login" className="text-gray-800">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
