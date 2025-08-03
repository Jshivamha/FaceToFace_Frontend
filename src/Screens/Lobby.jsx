import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSocket } from "../Context/SocketProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Lobby() {
  const [Email, setEmail] = useState("");
  const [Room, setRoom] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!Email || !Room) {
      toast.error("Both fields are required");
      return;
    }
    socket.emit("room:join", { Email, Room });
    socket.on("room:join", () => {
      navigate(`/room/${Room}`, { state: { Email, Room } });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-8 bg-gray-900/50 backdrop-blur-sm shadow-xl border border-gray-800"
      >
        <h1 className="text-3xl font-bold mb-2 text-center text-white">
          Join a Room
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Enter your email and room ID to start your call.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-200"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Room ID</label>
            <input
              value={Room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-200"
              placeholder="e.g. team-standup"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-2.5 rounded-lg bg-white text-black font-medium shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            Join Room
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
