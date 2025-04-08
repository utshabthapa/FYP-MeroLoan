"use client";

import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Clock,
  Award,
  Ban,
  ArrowUpRight,
  Info,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const Policy = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p- py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-2 text-blue-600" />
            MeroLoan Policies
          </h1>
          <p className="text-gray-600 mb-8">
            By using MeroLoan, you agree to abide by these rules. Violations may
            result in penalties, account bans, or legal action.
          </p>

          {/* Policy Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === "general"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline-block mr-1" />
              General Rules
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === "credit"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Award className="w-4 h-4 inline-block mr-1" />
              Credit Score System
            </button>
            <button
              onClick={() => setActiveTab("penalties")}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === "penalties"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Ban className="w-4 h-4 inline-block mr-1" />
              Penalties & Legal Actions
            </button>
          </div>

          {/* General Rules Section */}
          {activeTab === "general" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                General Rules
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    1
                  </span>
                  <p>
                    <strong>KYC Verification:</strong> All users must complete
                    identity verification (Aadhaar, PAN, etc.). Fake documents
                    will lead to permanent bans.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    2
                  </span>
                  <p>
                    <strong>Interest Rate Lock:</strong> The agreed interest
                    rate <strong>cannot be changed</strong> mid-contract, even
                    for milestone repayments.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    3
                  </span>
                  <p>
                    <strong>No Harassment:</strong> Lenders/borrowers must
                    communicate respectfully. Threats or spam will result in
                    account suspension.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    4
                  </span>
                  <p>
                    <strong>Account Security:</strong> Users are responsible for
                    maintaining the security of their accounts. Report any
                    suspicious activity immediately.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    5
                  </span>
                  <p>
                    <strong>Loan Purpose:</strong> Loans must not be used for
                    illegal activities. MeroLoan reserves the right to report
                    suspicious transactions to authorities.
                  </p>
                </li>
              </ul>
            </motion.div>
          )}

          {/* Credit Score System Section */}
          {activeTab === "credit" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <Award className="w-5 h-5 mr-2 text-green-500" />
                Credit Score System
              </h2>

              {/* Credit Score Overview */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Credit Score Overview
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium mr-1">Range:</span>
                    0-100 points
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-1">Default Score:</span>
                    50 points (new users)
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-1">Score Tiers:</span>
                    <div className="flex flex-wrap gap-2 mt-">
                      {/* <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                        0-30: Poor
                      </span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                        31-50: Fair
                      </span>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        51-70: Good
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                        71-90: Very Good
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                        91-100: Excellent
                      </span> */}
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        90-100: Excellent
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                        80-89: Very Good
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-300 mr-1"></span>
                        70-79: Good
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
                        60-69: Fair
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-yellow-300 mr-1"></span>
                        50-59: Average
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mr-1"></span>
                        40-49: Below Average
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>
                        30-39: Poor
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                        0-29: Very Poor
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Credit Score Tabs */}
              <div className="mb-6">
                <CreditScoreTabs />
              </div>

              {/* Credit Score Tips */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2 text-purple-500" />
                  Tips to Maintain a Good Credit Score
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Make all repayments on time, even if they're small amounts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Start with smaller loans to build trust before requesting
                      larger amounts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      If you can't repay on time, communicate with your lender
                      in advance
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Regularly lend small amounts to build your lender
                      reputation
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Penalties & Legal Actions Section */}
          {activeTab === "penalties" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <Ban className="w-5 h-5 mr-2 text-red-500" />
                Penalties & Legal Actions
              </h2>

              {/* Late Fees */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-orange-500" />
                  Late Fees
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Late
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credit Score Impact
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Additional Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          1-7 days
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          2% of loan amount
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          -10 points
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Warning notification
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          8-14 days
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          5% of loan amount
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          -20 points
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Account restriction warning
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          15-30 days
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          8% of loan amount
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          -30 points
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Account restrictions
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          30+ days
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          10% of loan amount
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          -50 points
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Legal notice + account freeze
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Account Penalties */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  Account Penalties
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      1
                    </span>
                    <p>
                      <strong>First Default:</strong> Account restrictions for
                      15 days, mandatory credit counseling.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      2
                    </span>
                    <p>
                      <strong>Second Default:</strong> Account freeze for 30
                      days, increased interest rates on future loans.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      3
                    </span>
                    <p>
                      <strong>Third Default:</strong> Permanent account ban,
                      credit bureau reporting, and potential legal action.
                    </p>
                  </li>
                </ul>
              </div>

              {/* Legal Actions */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="font-medium text-red-800 mb-3 flex items-center">
                  <Ban className="w-4 h-4 mr-2" />
                  Legal Actions
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  MeroLoan reserves the right to take legal action against users
                  who engage in fraudulent activities or willful default. This
                  may include:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Filing complaints under Nepal's Debt Recovery Act
                    </span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Reporting to credit bureaus and financial institutions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Pursuing civil action for recovery of funds</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Criminal charges in cases of identity theft or fraud
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Footer Note */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-gray-700 mt-8">
            <Clock className="w-4 h-4 inline-block mr-2 text-blue-600" />
            <strong>Note:</strong> MeroLoan reserves the right to modify
            policies. Users will be notified 30 days in advance of changes.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Credit Score Tabs Component
const CreditScoreTabs = () => {
  const [activeTab, setActiveTab] = useState("lenders");

  return (
    <div>
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("lenders")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "lenders"
              ? "border-b-2 border-green-500 text-green-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <TrendingUp className="w-4 h-4 inline-block mr-1" />
          For Lenders
        </button>
        <button
          onClick={() => setActiveTab("borrowers")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "borrowers"
              ? "border-b-2 border-blue-500 text-blue-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <TrendingDown className="w-4 h-4 inline-block mr-1" />
          For Borrowers
        </button>
      </div>

      {/* Lenders Tab */}
      {activeTab === "lenders" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="font-medium text-green-800 mb-3 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Credit Score Increases for Lenders
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Lending money helps build your credit score. The more you lend, the
            higher your score increases:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lending Amount (Rs.)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Score Increase
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">500 - 999</td>
                  <td className="px-4 py-3 text-sm text-green-600">+1 point</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    1,000 - 4,999
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    +2 points
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    5,000 - 9,999
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    +3 points
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    10,000 - 49,999
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    +5 points
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    50,000 - 99,999
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    +8 points
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    100,000 - 500,000
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    +15 points
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    Less than 500
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    No increase
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-green-50 p-3 rounded-lg text-sm text-gray-700 border border-green-100">
            <Info className="w-4 h-4 inline-block mr-1 text-green-600" />
            <strong>Note:</strong> Credit score increases are applied once the
            loan is successfully disbursed to the borrower.
          </div>
        </motion.div>
      )}

      {/* Borrowers Tab */}
      {activeTab === "borrowers" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="font-medium text-blue-800 mb-3 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Credit Score Changes for Borrowers
          </h3>

          {/* On-Time Repayments */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              On-Time Repayments
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Making repayments on time increases your credit score based on the
              amount:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden border">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repayment Amount (Rs.)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Score Increase
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      500 - 999
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      +1 point
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      1,000 - 4,999
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      +2 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      5,000 - 9,999
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      +3 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      10,000 - 49,999
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      +5 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      50,000 - 99,999
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      +8 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      100,000 - 500,000
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      +12 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      Less than 500
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      No increase
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Late Repayments */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Late Repayments
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Late repayments will decrease your credit score based on the
              number of days late:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden border">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Late
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Score Decrease
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      1 - 7 days
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      -10 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      8 - 14 days
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      -20 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      15 - 30 days
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      -30 points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      More than 30 days
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      -50 points
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 bg-red-50 p-3 rounded-lg text-sm text-gray-700 border border-red-100">
            <AlertCircle className="w-4 h-4 inline-block mr-1 text-red-600" />
            <strong>Warning:</strong> Defaulting on a loan will result in an
            immediate -30 point penalty and account restrictions, in addition to
            the late payment penalties.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Policy;
