"use client";

import { motion } from "framer-motion";
import MagicRings from "@/components/MagicRings";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import ProfileCard from "@/components/ProfileCard";
import LineWaves from "@/components/LineWaves";
import { User, ChevronDown } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex w-full flex-col items-center justify-start max-w-[100vw] overflow-x-hidden">
      
      {/* SECTION 1: The Halo Hero (Takes up full height) */}
      <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center pointer-events-none">
        
        {/* Background Magic Rings Layer - Bound to Hero Section */}
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

        <div className="relative flex items-center justify-center z-10">
          
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
              className="text-[14vw] sm:text-[9vw] font-black tracking-[-0.05em] text-center leading-tight pb-[0.05em] pt-[0.05em]"
            >
              Coming Soon
            </GradientText>
          </motion.div>
        </div>

        {/* Breathing Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 sm:bottom-20 text-[#00f3ff] drop-shadow-[0_0_20px_rgba(0,243,255,0.8)] z-20"
          animate={{ opacity: [0, 1, 0], y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-12 h-12 sm:w-16 sm:h-16" />
        </motion.div>
      </section>

      {/* SECTION 2: About Me */}
      <section className="relative z-10 flex w-full flex-col items-center justify-start px-4 sm:px-8 pt-4 sm:pt-8 pb-32 pointer-events-auto">
        <div className="w-full max-w-3xl mx-auto">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#050505"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1}
            coneSpread={25}
            animated={true}
            colors={['#00f3ff', '#fc42ff', '#42fcff']} // Adjusted to match the cyan/pink theme
          >
            <div className="p-6 sm:p-10 flex flex-col items-center sm:items-start text-center sm:text-left">
              <h2 className="flex items-center justify-center sm:justify-start gap-3 text-3xl sm:text-4xl font-black tracking-[-0.05em] text-white mb-4 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#00f3ff]" />
                ABOUT ME
              </h2>
              <p className="text-white/80 text-sm sm:text-lg leading-relaxed max-w-xl font-medium">
                I’m an Electronics and Communication Engineering student with a deep fascination for the intersection of hardware and intelligent systems. My technical focus lies in Deep Learning and TinyML, specifically working with BERT-based LLMs and Transformers.
                <br /><br />
                When I'm not bridging the gap between life and career, you’ll likely find me immersed in the world of Sekiro or keeping up with the Valorant esports scene. I have a natural habit of diving down rabbit holes to learn "weird" or niche topics—whether it's mastering a complex boss fight, experimenting with creative photography, or exploring the mechanics of a new tabletop game.
              </p>
            </div>
          </BorderGlow>
        </div>
      </section>

      {/* SECTION 3: Profile Card */}
      <section className="relative z-10 flex min-h-[100vh] w-full flex-col items-center justify-center px-4 sm:px-8 py-20 pointer-events-auto overflow-hidden">
        
        {/* Background Line Waves Layer */}
        <div className="absolute inset-0 z-0 pointer-events-auto [mask-image:linear-gradient(to_bottom,transparent_0%,black_40%,black_100%)]">
          <LineWaves
            speed={0.1}
            innerLineCount={12}
            outerLineCount={18}
            warpIntensity={2}
            rotation={-45}
            edgeFadeWidth={0}
            colorCycleSpeed={1}
            brightness={0.1}
            color1="#ffffff"
            color2="#ffffff"
            color3="#ffffff"
            enableMouseInteraction
            mouseInfluence={2}
          />
        </div>

        <div className="relative z-10 w-full max-w-sm mx-auto flex items-center justify-center pointer-events-auto">
          <ProfileCard
            name="Debmalya"
            title="Hesitation is Defeat"
            handle="is.that.debmalya"
            status="Online"
            contactText="Contact Me"
            avatarUrl="/pfp2.png"
            showUserInfo
            enableTilt={true}
            enableMobileTilt
            onContactClick={() => {}}
            behindGlowColor="hsla(183, 100%, 50%, 0.6)"
            behindGlowEnabled
            innerGradient="linear-gradient(145deg,hsla(300, 40%, 45%, 0.5) 0%,hsla(183, 60%, 70%, 0.2) 100%)"
          />
        </div>
      </section>

    </main>
  );
}
