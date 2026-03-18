"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";
import PixelCard from "@/components/PixelCard";

interface Track {
  src: string;
  title: string;
  artist: string;
}

interface AudioPlayerProps {
  tracks: Track[];
}

export default function AudioPlayer({ tracks }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Initialize Web Audio API
  const initAudioVisualizer = () => {
    if (!audioCtxRef.current && audioRef.current) {
      // @ts-ignore
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 128; // lower fftSize matches beat energy better occasionally
      
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
        audioRef.current.play().catch(e => {
            console.error("Auto-play prevented", e);
            setIsPlaying(false);
        });
    }
  }, [currentTrackIndex]); // eslint-disable-line

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      // Clear visualizer to 0 gracefully
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
       canvas.width = canvas.clientWidth;
       canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const margin = 45; // Canvas extends beyond player box
      const innerW = w - (margin * 2);
      const innerH = h - (margin * 2);
      
      const barWidth = 6;
      const baseGap = 4;
      
      // Calculate exact segments to prevent gaps at edges
      const hSegments = Math.max(1, Math.floor((innerW + baseGap) / (barWidth + baseGap)));
      const hGap = hSegments > 1 ? (innerW - hSegments * barWidth) / (hSegments - 1) : 0;
      
      const vSegments = Math.max(1, Math.floor((innerH + baseGap) / (barWidth + baseGap)));
      const vGap = vSegments > 1 ? (innerH - vSegments * barWidth) / (vSegments - 1) : 0;

      const maxMag = 40; // Max reach in px

      // Rotating gradient for the bars
      const time = Date.now() * 0.002;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.max(w, h);
      
      const gradient = ctx.createLinearGradient(
        cx + Math.cos(time) * radius, cy + Math.sin(time) * radius,
        cx - Math.cos(time) * radius, cy - Math.sin(time) * radius
      );
      gradient.addColorStop(0, 'rgba(0, 243, 255, 0.9)');
      gradient.addColorStop(0.5, 'rgba(252, 66, 255, 0.9)');
      gradient.addColorStop(1, 'rgba(0, 243, 255, 0.9)');

      // Draw Top/Bottom
      let x = margin;
      for (let i = 0; i < hSegments; i++) {
        // Mirrored spectrum
        const normalizedIdx = Math.abs((i - hSegments/2) / (hSegments/2));
        const dataIndex = Math.floor(Math.pow(normalizedIdx, 1.2) * (bufferLength * 0.6)); 
        const mag = (dataArray[dataIndex] / 255) * maxMag;
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = i % 2 === 0 ? "rgba(0, 243, 255, 0.8)" : "rgba(252, 66, 255, 0.8)";
        
        // Top edge
        ctx.fillRect(x, margin - mag, barWidth, mag);
        
        // Bottom edge
        ctx.fillRect(x, h - margin, barWidth, mag);
        
        x += barWidth + hGap;
      }

      // Draw Left/Right
      let y = margin;
      for (let i = 0; i < vSegments; i++) {
        const normalizedIdx = Math.abs((i - vSegments/2) / (vSegments/2));
        const dataIndex = Math.floor(Math.pow(normalizedIdx, 1.2) * (bufferLength * 0.6));
        const mag = (dataArray[dataIndex] / 255) * maxMag;

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = i % 2 === 0 ? "rgba(252, 66, 255, 0.8)" : "rgba(0, 243, 255, 0.8)";
        
        // Left
        ctx.fillRect(margin - mag, y, mag, barWidth);
        
        // Right
        ctx.fillRect(w - margin, y, mag, barWidth);

        y += barWidth + vGap;
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    initAudioVisualizer();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(volume > 0 ? volume : 0.8);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full max-w-md relative p-[2px] rounded-none bg-gradient-to-br from-[#00f3ff]/50 via-transparent to-[#fc42ff]/50 shadow-[0_0_30px_rgba(0,243,255,0.15)] group transition-all duration-500 my-10">
      
      {/* Visulizer Canvas extends 45px outside the player */}
      <canvas 
        ref={canvasRef} 
        className="absolute -inset-[45px] w-[calc(100%+90px)] h-[calc(100%+90px)] z-[-1] pointer-events-none" 
      />

      <PixelCard
        variant="pink"
        gap={12}
        speed={45}
        colors="#00f3ff,#fc42ff,#1a1a2e"
        className="bg-[#050505]/95 backdrop-blur-3xl rounded-none p-6 flex flex-col gap-6 relative overflow-hidden z-10 w-full"
      >
        
        {/* Fake ambient glow inside */}
        <div className={`absolute inset-0 opacity-10 transition-opacity duration-700 pointer-events-none ${isPlaying ? 'opacity-30' : 'opacity-0'}`}>
            <div className="w-full h-full bg-gradient-to-tr from-[#00f3ff] to-[#fc42ff] blur-[50px] mix-blend-screen" />
        </div>

        <audio 
          ref={audioRef} 
          src={currentTrack.src} 
          crossOrigin="anonymous" // needed if any weird local caching prevents cors
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext} // auto-play next tracks
        />

        {/* Track Info */}
        <div className="flex items-center gap-5 relative z-10">
          <div className={`w-20 h-20 rounded-2xl bg-[#111] grid place-items-center shadow-[0_0_20px_rgba(252,66,255,0.2)] border border-white/10 transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
            <Music className={`w-8 h-8 text-white transition-all duration-500 ${isPlaying ? 'scale-110 drop-shadow-[0_0_15px_#00f3ff] text-[#00f3ff]' : ''}`} />
          </div>
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <h3 className="text-white font-black text-2xl tracking-tighter truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentTrack.title}</h3>
            <p className="text-[#fc42ff] font-bold text-xs tracking-widest uppercase opacity-80 mt-1 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-3 relative z-10 w-full mt-2">
          <input 
            type="range" 
            min="0" max="100" 
            value={progress || 0} 
            onChange={handleSeek}
            className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#00f3ff] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(0,243,255,1)] cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            style={{
               background: `linear-gradient(to right, #fc42ff ${progress}%, rgba(255,255,255,0.05) ${progress}%)`
            }}
          />
          <div className="flex justify-between text-white/40 text-[11px] font-mono font-bold tracking-widest">
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between relative z-10">
          
          <div className="flex items-center gap-3 w-24">
            <button onClick={toggleMute} className="text-white/50 hover:text-[#00f3ff] transition-colors focus:outline-none">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={isMuted ? 0 : volume} 
              onChange={handleVolume}
              className="w-full h-[3px] bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#fc42ff] [&::-webkit-slider-thumb]:rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              style={{
                 background: `linear-gradient(to right, #00f3ff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.05) ${(isMuted ? 0 : volume) * 100}%)`
              }}
            />
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handlePrev} className="text-white/40 hover:text-white transition-colors focus:outline-none hover:scale-110 active:scale-95">
              <SkipBack className="fill-current w-6 h-6" />
            </button>
            <button 
              onClick={togglePlay} 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f3ff] to-[#fc42ff] flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,243,255,0.5)] focus:outline-none hover:scale-110 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="fill-current w-7 h-7 ml-[1px]" /> : <Play className="fill-current w-7 h-7 ml-1" />}
            </button>
            <button onClick={handleNext} className="text-white/40 hover:text-white transition-colors focus:outline-none hover:scale-110 active:scale-95">
              <SkipForward className="fill-current w-6 h-6" />
            </button>
          </div>
        </div>
        
      </PixelCard>
    </div>
  );
}
