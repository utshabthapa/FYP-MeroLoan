import Navbar from "@/components/navbar";
import React from "react";
import heroImage from "../assets/landingPageMain.png";

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <div className="flex items-center justify h-dvh max-w-screen-2xl mx-auto">
        <div className="  w-1/2 flex flex-col justify-center ">
          <h1 className="text-6xl font-extrabold">
            Simple, Fast and Secure Loans at Your Fingertips
          </h1>
          <p className=" mt-8 font-semibold text-gray-500 text-left ">
            Experience hassle-free loans with dynamic interest rates and <br />
            personalized recommendations
          </p>
          <div className="flex mt-14">
            <button>
              <a
                href="/register"
                className="w-48 bg-gray-800 py-4 px-6 rounded-lg text-white mt-4"
              >
                Get Started Now
              </a>
              <button className="ml-4">
                <a
                  href="/login"
                  className="text-gray-800 font-semibold px-6 py-4 border border-gray-300 rounded-lg"
                >
                  Learn More
                </a>
              </button>
            </button>
          </div>
        </div>
        <div className="w-1/2  p-14">
          <img src={heroImage} alt="" className="w-full" />
        </div>
      </div>
      <div className="w-full bg-gray-100 h-[600px] flex flex-col items-center justify-center">
        <div>
          <h2 className="text-4xl font-extrabold text-center">
            Connecting borrowers and lenders with <br /> transparency,
            flexibility and security
          </h2>
        </div>
        <div className="flex mt-14 space-x-12">
          <div className="w-72 h-56 bg-white"></div>
          <div className="w-72 h-56 bg-white"></div>
          <div className="w-72 h-56 bg-white"></div>
          <div className="w-72 h-56 bg-white"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
