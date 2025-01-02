import React from "react";

const Navbar = () => {
  return (
    <div className="relative flex justify-between mx-auto items-center p-4 bg-gray-100 text-black font-semibold rounded-lg max-w-screen-2xl shadow-lg">
      <div>
        <h1 className="text-2xl font-">MeroLoan</h1>
      </div>
      <div>
        <ul className="flex space-x-4">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
