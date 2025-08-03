import React, { useState, useEffect, useCallback} from "react";
import { ParallaxBanner, ParallaxProvider } from "react-scroll-parallax";
import { useNavigate } from "react-router-dom"; 

import { TypeAnimation } from "react-type-animation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ChevronDown,
  Video,
  MessageCircle,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";

const TRANSITION_MS = 1200; // circle reveal duration

const Home = () => {
  // phase: 'intro' -> 'transition' -> 'content'
  const [phase, setPhase] = useState("intro");
  const { scrollYProgress } = useScroll();

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);

  // lock scroll while NOT in content phase
  useEffect(() => {
    const lock = phase !== "content";
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [phase]);

  const startTransition = useCallback(() => {
    if (phase !== "intro") return;
    setPhase("transition");

    setTimeout(() => {
      setPhase("content");
      // make sure we start at the top
      window.scrollTo({ top: 0, behavior: "instant" });
    }, TRANSITION_MS);
  }, [phase]);

  // Trigger by scroll / touch / key
  useEffect(() => {
    if (phase === "content") return;

    const dismissAndBlock = (e) => {
      if (e?.preventDefault) e.preventDefault();
      startTransition();
    };

    const onWheel = (e) => Math.abs(e.deltaY) > 5 && dismissAndBlock(e);
    const onScroll = (e) => dismissAndBlock(e);
    const onTouchMove = (e) => dismissAndBlock(e);
    const onKeyDown = (e) => {
      if (["Space", "Enter", "ArrowDown", "Escape", "KeyS"].includes(e.code)) {
        dismissAndBlock(e);
      } else {
        // any key triggers too
        if (/^Key|Digit|Numpad/.test(e.code)) dismissAndBlock(e);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase, startTransition]);

  const navigate = useNavigate()

   const handleGetStarted = () => {
    
    navigate("/lobby");
  };


  return (
    <ParallaxProvider>
      {/* ---------- Intro (BLACK) ---------- */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.section
            key="intro"
            className="fixed inset-0 z-[60] bg-black text-white flex items-center justify-center cursor-pointer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            onClick={startTransition}
          >
            <div className="text-center">
              <motion.h1
                className="text-4xl md:text-7xl font-extrabold"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Welcome to <span className="text-white border-b-2 border-white">VidConnect</span>
              </motion.h1>

              {/* Animated hint */}
              <motion.div
                className="mt-10 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.p
                  className="text-gray-400 text-sm md:text-base"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Press any key / scroll / click to continue
                </motion.p>
                <motion.div
                  className="text-gray-500"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChevronDown size={24} />
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ---------- White Circular Reveal (from bottom) ---------- */}
      <AnimatePresence>
        {phase === "transition" && (
          <motion.div
            key="white-circle"
            className="fixed inset-0 z-[55] bg-white pointer-events-none"
            initial={{ clipPath: "circle(0% at 50% 100%)" }}
            animate={{ clipPath: "circle(150% at 50% 100%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: TRANSITION_MS / 1000, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* ---------- Main Content ---------- */}
      <motion.main
        className="relative"
        style={{
          opacity: phase === "content" ? 1 : 0,
          pointerEvents: phase === "content" ? "auto" : "none",
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Hero Section */}
        <div className="relative min-h-screen overflow-hidden bg-black">
          <ParallaxBanner
            layers={[
              { children: <div className="absolute inset-0 bg-black" />, speed: -20 },
              {
                children: (
                  <div className="absolute inset-0 opacity-10">
                    <div className="h-full w-full bg-black" />
                  </div>
                ),
                speed: -10,
              },
            ]}
            className="h-screen"
          />

          {/* Hero Content */}
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
            style={{ y: textY }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              Experience{" "}
              <span className="text-gray-200">
                <TypeAnimation
                  sequence={[
                    "Crystal Clear Video Calls",
                    3000,
                    "Seamless Connectivity",
                    3000,
                    "Next-Gen Design",
                    3000,
                  ]}
                  wrapper="span"
                  repeat={Infinity}
                  speed={50}
                />
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              The future of video communication with smooth animations, responsive
              design, and a clean, professional interface.
            </motion.p>

            <motion.button
              onClick={handleGetStarted}
              className="cursor-pointer px-8 py-4 bg-white text-black font-bold rounded-full shadow-xl transition-all duration-200 transform hover:scale-105 hover:bg-gray-100"
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-500"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={32} />
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="bg-black text-white py-24 px-8 md:px-16">
          <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-12 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Why Choose VidConnect?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Video, title: "4K Video", desc: "Experience HD calls" },
              { icon: MessageCircle, title: "Messaging", desc: "Chat with ease" },
              { icon: Shield, title: "Security", desc: "End-to-end encryption" },
              { icon: Users, title: "Conferences", desc: "100+ Participants" },
              { icon: Zap, title: "Fast", desc: "Low latency experience" },
              { icon: Star, title: "Premium", desc: "Crystal audio quality" },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl shadow-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:bg-gray-800/50 transition-all duration-200 transform hover:scale-105"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <f.icon className="w-12 h-12 text-white mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          </div>
        </section>
      </motion.main>
    </ParallaxProvider>
  );
};

export default Home;
