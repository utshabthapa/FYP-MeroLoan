import Navbar from "@/components/navbar";
import React from "react";
import heroImage from "../assets/landingPageMain.png";

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <img src={heroImage} alt="" className="w-32 h-32" />
    </div>
  );
};

export default LandingPage;
