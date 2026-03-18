"use client";

import { motion } from "framer-motion";
import MagicRings from "@/components/MagicRings";
import GradientText from "@/components/GradientText";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden">
      
      {/* Background Magic Rings Layer */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <div className="w-full h-full relative">
          <MagicRings
            color="#fc42ff"
            colorTwo="#42fcff"
            ringCount={10}
            speed={2}
            attenuation={10}
            lineThickness={4}
            baseRadius={0.23}
            radiusStep={0.08}
            scaleRate={0.1}
            opacity={0.8}
            blur={0}
            noiseAmount={0.1}
            rotation={0}
            ringGap={1.5}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse={false}
            mouseInfluence={0}
            hoverScale={1.0}
            parallax={0}
            clickBurst={false}
          />
        </div>
      </div>

      {/* SECTION 1: The Halo Hero (Sticky full viewport) */}
      <section className="relative z-10 flex h-screen w-full flex-col items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          
          {/* Main Text */}
          <motion.div
            className="z-10 drop-shadow-[0_0_40px_rgba(0,243,255,0.4)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
              delay: 0.2,
            }}
          >
            <GradientText
              colors={["#42fcff", "#fc42ff", "#42fcff"]}
              animationSpeed={8}
              showBorder={false}
              className="text-[14vw] sm:text-[9vw] font-black tracking-[-0.05em] text-center leading-none"
            >
              Coming Soon
            </GradientText>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
