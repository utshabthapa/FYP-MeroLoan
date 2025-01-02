import React from "react";
import Navbar from "@/components/navbar";

const Login = () => {
  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center h-dvh">
        <div className="w-3/12 h-[500px] mt-16 bg-white shadow-lg border rounded-lg flex flex-col items-center justify-center p-6 ">
          <h1 className="font-extrabold text-3xl text-gray-800">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            Please enter your credentials to log in
          </p>

          <form className="mt-8 w-full relative">
            <label htmlFor="" className="">
              <p className="text-gray-600 mt- font-medium">Email</p>

              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full p-2 border rounded-lg border-gray-300 mt-2 "
              />
            </label>
            <label htmlFor="" className="">
              <p className="text-gray-600 mt-6 font-medium">Password</p>

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-2 border rounded-lg border-gray-300 mt-2"
              />
            </label>
            <div className="flex items-center justify-end mt-6">
              <a
                href="/forgot-password"
                className="text-gray-800 mt- text-sm font-semibold"
              >
                Forgot Password?
              </a>
            </div>

            <button className="w-full bg-gray-800 p-2 rounded-lg text-white mt-8">
              Login
            </button>
          </form>
          <p className="text-gray-500 mt-6">
            Don't have an account?{" "}
            <a href="/register" className="text-gray-800 font-semibold">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
