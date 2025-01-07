import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="overflow-hidden bg-gradient-to-b from-white to-gray-200">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center h-dvh"
      >
        <div className="relative rounded-b-3xl w-[480px] mt-16 bg-white bg-opacity-80 shadow-xl rounded-xl flex flex-col items-center justify- p-6 backdrop-filter backdrop-blur-2xl ">
          <h2 className="font-black text-3xl bg-clip-text bg-gradient-to-r from-gray-700 to-gray-800 text-transparent mt-">
            Forgot Password
          </h2>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <p className="text-gray-700 mt-3 font-medium">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className=" w-full py-2 px-4 bg-gradient-to-r from-gray-800 to-gray-700 text-white 
                rounded-lg shadow-lg hover:from-gray-700
                 hover:to-gray-800  transition duration-100 mb-12"
                type="submit"
              >
                {isLoading ? (
                  <Loader className="size-6 animate-spin mx-auto" />
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>
            </form>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto my-4"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-gray-700 mt-3 font-medium mb-12">
                If an account exists for {email}, you will receive a password
                reset link shortly.
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white absolute bottom-0 w-full py-3 rounded-b-3xl mt-8 flex flex-col items-center tracking-wider">
            <a href="/login" className="text-clip text-sm font-bold mt-1">
              <ArrowLeft className="h-4 w-4 inline-block -mt-1" /> Back to Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPassword;
