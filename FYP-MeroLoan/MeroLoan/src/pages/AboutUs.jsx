"use client";

import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Target,
  Heart,
  Lightbulb,
  Zap,
  CheckCircle,
  Code,
  Palette,
  Layout,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const milestones = [
    {
      year: "2024",
      month: "November",
      title: "Project Inception",
      description:
        "MeroLoan was conceptualized with the goal of creating an accessible P2P lending platform.",
    },
    {
      year: "2024",
      month: "December",
      title: "Development Begins",
      description:
        "Started building the core platform architecture and user interfaces.",
    },
    {
      year: "2025",
      month: "January",
      title: "Alpha Version",
      description:
        "Completed the first working version with basic lending and borrowing functionality.",
    },
    {
      year: "2025",
      month: "March",
      title: "Beta Launch",
      description:
        "Released the beta version to a small group of test users for feedback.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gray-900 text-white py-28 mt-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.9)), url('https://images.unsplash.com/photo-1621953910048-93d1a4577dae?q=80&w=1920&auto=format')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About MeroLoan
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300">
            A fresh approach to peer-to-peer lending built from the ground up by
            a single developer with a vision.
          </p>
        </div>
      </motion.div>

      {/* Our Story Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Story
              </h2>
              <p className="text-gray-600 mb-4">
                MeroLoan was born in November 2024 from a simple observation:
                peer-to-peer lending could be more efficient, transparent, and
                accessible. As a developer with a passion for fintech, I set out
                to build a solution from scratch.
              </p>
              <p className="text-gray-600 mb-4">
                This platform represents my vision of what modern financial
                services should be - straightforward, user-focused, and built
                with cutting-edge technology. Every line of code, every design
                element, and every feature has been carefully crafted by a
                single pair of hands.
              </p>
              <p className="text-gray-600">
                MeroLoan aims to connect lenders and borrowers directly,
                eliminating unnecessary intermediaries and making the lending
                process beneficial for everyone involved.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?q=80&w=1600&auto=format"
                alt="Coding workspace"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Our Mission & Values */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Mission & Vision
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              variants={fadeIn}
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
            >
              <Target className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">Mission</h3>
              <p className="text-gray-600">
                To create a transparent and efficient platform that connects
                lenders and borrowers directly, democratizing access to capital
                and financial opportunity.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
            >
              <Lightbulb className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">Vision</h3>
              <p className="text-gray-600">
                To build a financial ecosystem where anyone can access capital
                for personal growth or business development, regardless of
                traditional banking barriers.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
            >
              <Heart className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">Values</h3>
              <p className="text-gray-600">
                Transparency, innovation, simplicity, and user empowerment guide
                every aspect of MeroLoan's development and operation.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Core Values */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Guiding Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeIn} className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Security First
                </h3>
                <p className="text-gray-600">
                  Built with bank-grade security measures and data protection to
                  ensure safe transactions for all users.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-start">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Complete Transparency
                </h3>
                <p className="text-gray-600">
                  Clear and upfront about all fees, terms, and processes with no
                  hidden surprises for users.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-start">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Community Focus
                </h3>
                <p className="text-gray-600">
                  Designed to foster connections between people with capital and
                  those who need it, creating mutual benefit.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-start">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Constant Innovation
                </h3>
                <p className="text-gray-600">
                  Continuously improving the platform based on user feedback and
                  technological advancements.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* The Founder Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            The Founder
          </h2>

          <div className="flex flex-col md:flex-row items-center bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="md:w-1/3">
              <img
                src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000&auto=format"
                alt="Founder"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-2/3 p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Solo Founder & Developer
              </h3>
              <p className="text-gray-600 mb-6">
                MeroLoan is the result of one person's vision and execution. As
                the founder, CEO, developer, and designer, I've built this
                platform from the ground up since November 2024. Every aspect of
                MeroLoan - from the backend architecture to the user interface -
                has been personally crafted with a focus on creating the best
                possible user experience.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <Code className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Full-Stack Development</span>
                </div>
                <div className="flex items-center">
                  <Palette className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-gray-700">UI/UX Design</span>
                </div>
                <div className="flex items-center">
                  <Layout className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-700">System Architecture</span>
                </div>
              </div>

              <p className="text-gray-600">
                With a background in fintech and a passion for creating
                meaningful solutions, I've dedicated myself to building a
                platform that addresses the real needs of both lenders and
                borrowers in today's financial landscape.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Our Journey */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Project Timeline
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>

            {/* Timeline items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-1/2 ${
                      index % 2 === 0 ? "pr-12 text-right" : "pl-12"
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {milestone.description}
                    </p>
                  </div>
                  <div className="z-10 flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="w-1/2">
                    {index % 2 === 1 && (
                      <div className="pl-12">
                        <p className="text-sm font-medium text-blue-600">
                          {milestone.month} {milestone.year}
                        </p>
                      </div>
                    )}
                    {index % 2 === 0 && (
                      <div className="pr-12 text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {milestone.month} {milestone.year}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Future Plans */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Looking Forward
          </h2>

          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <img
                src="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1600&auto=format"
                alt="Future vision"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="md:w-1/2 md:pl-10">
              <p className="text-gray-600 mb-4">
                MeroLoan is just getting started. As a solo founder, I have
                ambitious plans for the platform's future, including:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1" />
                  <span className="text-gray-700">
                    Expanding the risk assessment algorithm to enable more
                    precise matching
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1" />
                  <span className="text-gray-700">
                    Introducing advanced portfolio management tools for lenders
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1" />
                  <span className="text-gray-700">
                    Building a mobile application to increase accessibility
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1" />
                  <span className="text-gray-700">
                    Creating educational resources for financial literacy
                  </span>
                </li>
              </ul>
              <p className="text-gray-600 mt-4">
                The goal remains the same: to create the most user-friendly,
                transparent, and effective P2P lending platform possible.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-16 bg-gray-900 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.9)), url('https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1920&auto=format')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Join The Journey</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Be among the first to experience a new approach to peer-to-peer
            lending. Whether you're looking to invest or borrow, MeroLoan is
            built with you in mind.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/register"
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
      </motion.div>
    </div>
  );
};

export default AboutPage;
