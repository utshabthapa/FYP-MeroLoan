import React from "react";
import Navbar from "@/components/Navbar";
import heroImage from "../assets/landingPageMain.png";
import {
  Shield,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  LineChart,
  UserPlus,
  Lock,
} from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="w-full h-56 m-4 border border-gray-800 rounded-lg bg-white p-6 hover:shadow-xl transition-shadow">
    <Icon className="w-12 h-12 text-gray-800 mb-4" />
    <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StatCard = ({ title, value }) => (
  <div className="w-72 h-56 bg-white rounded-lg shadow-md p hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center border border-gray-200">
    <h3 className="text-4xl font-bold text-gray-900 mb-4">{value}</h3>
    <p className="text-gray-700 font-semibold">{title}</p>
  </div>
);

const LandingPage = () => {
  const stats = [
    { title: "Active Users", value: "50,000+" },
    { title: "Total Loans Funded", value: "$25M+" },
    { title: "Average ROI", value: "12.5%" },
    { title: "Success Rate", value: "98%" },
  ];

  const keyFeatures = [
    {
      icon: Users,
      title: "Direct P2P Matching",
      description:
        "Connect directly with verified lenders or borrowers based on your specific requirements and preferences.",
    },
    {
      icon: TrendingUp,
      title: "Dynamic Interest Rates",
      description:
        "Competitive interest rates determined by our AI-driven risk assessment system and market conditions.",
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description:
        "Bank-grade security with encrypted transactions and verified identity checks for all users.",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Quick Approval",
      description:
        "Get loan approval within 24 hours with our streamlined verification process.",
    },
    {
      icon: LineChart,
      title: "Portfolio Diversification",
      description:
        "Lenders can spread investments across multiple loans to minimize risk.",
    },
    {
      icon: CheckCircle,
      title: "Flexible Terms",
      description:
        "Choose from various loan terms and repayment schedules that suit your needs.",
    },
    {
      icon: DollarSign,
      title: "Competitive Returns",
      description:
        "Earn higher returns compared to traditional savings accounts.",
    },
    {
      icon: UserPlus,
      title: "Community Trust",
      description:
        "Build your credit score and trust rating within our community.",
    },
    {
      icon: Lock,
      title: "Data Privacy",
      description:
        "Your financial information is protected with advanced encryption.",
    },
  ];

  return (
    <>
      <div className="">
        <Navbar />

        {/* Hero Section */}
        <div className="flex items-center justify-between h-dvh max-w-7xl mx-auto px-">
          <div className="w-1/2 flex flex-col justify-center">
            <h1 className="text-6xl font-extrabold text-gray-900">
              Peer-to-Peer Lending Made Simple and Secure
            </h1>
            <p className="mt-8 text-xl text-gray-600 leading-relaxed">
              Join thousands of users who trust our platform for P2P lending.
              Whether you're looking to invest or borrow, we've got you covered
              with transparent rates and secure transactions.
            </p>
            <div className="flex items-center mt-14 space-x-4 ">
              <a
                href="/register"
                className="text-white font-normal px-8 py-2 border-2 border-gray-900 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Get Started Now
              </a>
              <a
                href="/login"
                className="text-gray-900 font-semibold px-8 py-2 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="w-1/2 pl-14 ">
            <img
              src={heroImage}
              alt="P2P Lending Platform"
              className="w-full rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-4xl font-extrabold text-center mb-14 text-gray-900">
              Trusted by Thousands of Users
            </h2>
            <div className="flex justify-between space-x-">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="w-full bg-white py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-14 text-gray-900">
              Why Choose Our Platform?
            </h2>
            <div className="flex justify-between">
              {keyFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="w-full bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-14 text-gray-900">
              Platform Benefits
            </h2>
            <div className="flex flex-wrap   max-w-7xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="w-1/3 flex justify-center">
                  <FeatureCard {...benefit} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full bg-gray-900 py-20">
          <div className="max-w-screen-2xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Ready to Start Your P2P Lending Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join our community of lenders and borrowers today
            </p>
            <div className="flex justify-center items-center space-x-6">
              <a
                href="/signup"
                className="bg-white text-gray-900 hover:bg-gray-100 py-3 px-8 rounded-lg font-semibold transition-colors"
              >
                Create Account
              </a>
              <a
                href="/contact"
                className="text-white border-2 border-white hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
