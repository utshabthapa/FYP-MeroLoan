import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };
  return (
    <div className="overflow-hidden bg-gradient-to-b from-white to-gray-200">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="flex items-center justify-center h-dvh"
      >
        <div className="relative rounded-b-3xl w-[500px] mt-16 bg-white bg-opacity-80 shadow-xl rounded-xl flex flex-col items-center justify- p-6 backdrop-filter backdrop-blur-2xl ">
          <h1>Dashboard</h1>
          <div className="space-y-6">
            <motion.div
              className="p-4 bg-gray-100 bg-opacity-50 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Profile Information
              </h3>
              <p className="text-gray-800">Name: {user.name}</p>
              <p className="text-gray-800">Email: {user.email}</p>
            </motion.div>
            <motion.div
              className="p-4 bg-gray-100 bg-opacity-50 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Account Activity
              </h3>
              <p className="text-gray-800">
                <span className="font-bold">Joined: </span>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-800">
                <span className="font-bold">Last Login: </span>

                {formatDate(user.lastLogin)}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white 
				font-bold rounded-lg shadow-lg hover:from-gray-600 hover:to-gray-700
				"
            >
              Logout
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
