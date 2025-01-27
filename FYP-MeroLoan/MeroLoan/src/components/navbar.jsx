import React from "react";

const Navbar = () => {
  return (
    <div className="sticky top-0 z-50 border-b-2 bg-white">
      <div className="flex justify-between mx-auto items-center p-4 bg-white text-black font-semibold rounded-lg max-w-screen-2xl">
        <div>
          <h1 className="text-2xl">MeroLoan</h1>
        </div>
        <div>
          <ul className="flex space-x-6">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/signup">Sign Up</a>
            </li>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                href="/login"
              >
                Apply for a loan
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
