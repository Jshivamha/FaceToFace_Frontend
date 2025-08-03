import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const MagneticCursor = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth follow using spring animation
  const cursorX = useSpring(mouse.x, { stiffness: 100, damping: 15 });
  const cursorY = useSpring(mouse.y, { stiffness: 100, damping: 15 });

  useEffect(() => {
    const move = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Detect hover on magnetic elements
  useEffect(() => {
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const magneticElements = document.querySelectorAll(".magnetic");
    magneticElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      magneticElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[1000]"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Outer Ring */}
      <div
        className={`w-12 h-12 rounded-full border-2 border-white transition-all duration-200 ease-out ${
          isHovering ? "scale-125 border-gray-300" : ""
        }`}
      />
      {/* Dot */}
      <div
        className={`w-2 h-2 rounded-full bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
          isHovering ? "scale-150" : ""
        }`}
      />
    </motion.div>
  );
};

export default MagneticCursor;
