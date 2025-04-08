"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
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
import { useLandingStore } from "@/store/landingStore";
import { Link } from "react-router";

import heroImage from "../assets/landingPageMain.png";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="w-full h-56 m-4 border border-gray-800 rounded-lg bg-white p-6 hover:shadow-xl transition-shadow">
    <Icon className="w-12 h-12 text-gray-800 mb-4" />
    <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StatCard = ({ title, value, isLoading }) => (
  <div className="w-72 h-56 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center border border-gray-200">
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-10 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </div>
    ) : (
      <>
        <h3 className="text-4xl font-bold text-gray-900 mb-4">{value}</h3>
        <p className="text-gray-700 font-semibold">{title}</p>
      </>
    )}
  </div>
);

const LandingPage = () => {
  const { landingStats, isLoading, error, fetchLandingStats } =
    useLandingStore();

  useEffect(() => {
    fetchLandingStats();
  }, [fetchLandingStats]);

  const formatValue = (value, prefix = "", suffix = "") => {
    if (!value && value !== 0) return `${prefix}0${suffix}`;

    // Format large numbers with K, M, B suffixes
    if (value >= 1000000000) {
      return `${prefix}${(value / 1000000000).toFixed(1)}B${suffix}`;
    } else if (value >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`;
    } else if (value >= 1000) {
      return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`;
    }

    return `${prefix}${value}${suffix}`;
  };

  const stats = [
    {
      title: "Active Users",
      value: formatValue(landingStats?.totalUsers),
    },
    {
      title: "Total Loans Funded",
      value: formatValue(landingStats?.totalLoans),
    },
    {
      title: "Total Money Flow",
      value: formatValue(landingStats?.totalMoneyFlow, "₹"),
    },
    {
      title: "Total Transactions",
      value: formatValue(landingStats?.totalTransactions),
    },
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
        <div className="flex flex-col md:flex-row items-center justify-between min-h-screen max-w-7xl mx-auto px-6 py-12">
          <div className="w-full md:w-1/2 flex flex-col justify-center mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
              Peer-to-Peer Lending Made Simple and Secure
            </h1>
            <p className="mt-8 text-xl text-gray-600 leading-relaxed">
              Join thousands of users who trust our platform for P2P lending.
              Whether you're looking to invest or borrow, we've got you covered
              with transparent rates and secure transactions.
            </p>
            <div className="flex items-center mt-14 space-x-4">
              <Link
                href="/register"
                className="text-white font-normal px-8 py-2 border-2 border-gray-900 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Get Started Now
              </Link>
              <Link
                href="/about"
                className="text-gray-900 font-semibold px-8 py-2 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-14">
            <img
              src={heroImage}
              alt="P2P Lending Platform"
              className="w-full rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-4xl font-extrabold text-center mb-14 text-gray-900">
              Trusted by Thousands of Users
            </h2>
            {error ? (
              <div className="text-center text-red-500 mb-8">
                Error loading stats: {error}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-6">
                {stats.map((stat, index) => (
                  <StatCard key={index} {...stat} isLoading={isLoading} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Key Features Section */}
        <div className="w-full bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-center mb-14 text-gray-900">
              Why Choose Our Platform?
            </h2>
            <div className="flex flex-wrap justify-center">
              {keyFeatures.map((feature, index) => (
                <div key={index} className="w-full md:w-1/3 px-4">
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="w-full bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-center mb-14 text-gray-900">
              Platform Benefits
            </h2>
            <div className="flex flex-wrap justify-center">
              {benefits.map((benefit, index) => (
                <div key={index} className="w-full md:w-1/3 px-4">
                  <FeatureCard {...benefit} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto text-center px-6">
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Ready to Start Your P2P Lending Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join our community of lenders and borrowers today
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <Link
                href="/signup"
                className="bg-white text-gray-900 hover:bg-gray-100 py-3 px-8 rounded-lg font-semibold transition-colors"
              >
                Create Account
              </Link>
              <Link
                href="/contact"
                className="text-white border-2 border-white hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
