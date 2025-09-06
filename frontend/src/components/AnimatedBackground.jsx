import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {
    // Particles loaded callback
  }, []);

  return (
    <div className="animated-background">
      {/* Animated Gradient Background */}
      <div className="gradient-bg"></div>
      
      {/* Floating Geometric Shapes */}
      <div className="floating-shapes">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`floating-shape shape-${i + 1}`}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Particle System */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: { value: "transparent" },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: { enable: true, mode: "push" },
              onHover: { enable: true, mode: "repulse" },
              resize: true,
            },
            modes: {
              push: { quantity: 8 }, // Increased for more particles
              repulse: { distance: 200, duration: 0.4 },
            },
          },
          particles: {
            color: { value: ["#ffffff", "#e9ecef", "#adb5bd", "#232428", "#181a1e"] },
            links: {
              color: "#e9ecef",
              distance: 120,
              enable: true,
              opacity: 0.4, // Increased for more visible links
              width: 1.2,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: false,
              speed: 1.2, // Increased for faster movement
              straight: false,
            },
            number: {
              density: { enable: true, area: 700 },
              value: 120, // Increased for more particles
            },
            opacity: { value: 0.85 }, // Increased for more visible particles
            shape: { type: ["circle", "polygon"] },
            size: { value: { min: 2, max: 8 } },
          },
          detectRetina: true,
        }}
      />

      {/* Neural Network Lines */}
      <div className="neural-network">
        <svg className="neural-svg" viewBox="0 0 1000 1000">
          {[...Array(20)].map((_, i) => (
            <motion.line
              key={i}
              x1={Math.random() * 1000}
              y1={Math.random() * 1000}
              x2={Math.random() * 1000}
              y2={Math.random() * 1000}
              stroke="url(#gradient)"
              strokeWidth="0.5"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Digital Rain Effect */}
      <div className="digital-rain">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="rain-column"
            style={{
              left: `${i * 2}%`,
              animationDelay: `${i * 0.1}s`,
            }}
            animate={{
              y: [0, window.innerHeight + 100],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(20)].map((_, j) => (
              <div key={j} className="rain-char">
                {Math.random().toString(36).charAt(7)}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
