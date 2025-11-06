import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, Heart } from "lucide-react";
// FIX: The previous code had a redundant and conflicting import for FiRefreshCw and FiHeart.
// I've kept the working import from 'react-icons/fi' and commented out the unnecessary 'lucide-react' one for cleanup.
// import { FiRefreshCw, FiHeart } from "react-icons/fi"; // Keeping this one

const API_BASE_URL = "http://127.0.0.1:8000";
import { FiRefreshCw, FiHeart } from "react-icons/fi"; // Kept for functionality

// Emotion-based theme colors
const emotionThemes = {
  Angry: {
    primary: "#ff4444",
    secondary: "#ff6b6b",
    gradient: "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)",
    particles: "#ff6b6b",
    glow: "rgba(255, 68, 68, 0.3)",
  },
  Disgust: {
    primary: "#8b9467",
    secondary: "#a8b888",
    gradient: "linear-gradient(135deg, #8b9467 0%, #6b7347 100%)",
    particles: "#a8b888",
    glow: "rgba(139, 148, 103, 0.3)",
  },
  Fear: {
    primary: "#6b5b95",
    secondary: "#8b7ab8",
    gradient: "linear-gradient(135deg, #6b5b95 0%, #4b3b75 100%)",
    particles: "#8b7ab8",
    glow: "rgba(107, 91, 149, 0.3)",
  },
  Happy: {
    primary: "#ffd700",
    secondary: "#ffed4e",
    gradient: "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
    particles: "#ffed4e",
    glow: "rgba(255, 215, 0, 0.3)",
  },
  Neutral: {
    primary: "#a350ff",
    secondary: "#d957ff",
    gradient: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    particles: "#d957ff",
    glow: "rgba(163, 80, 255, 0.3)",
  },
  Sad: {
    primary: "#4a90e2",
    secondary: "#6ba3e8",
    gradient: "linear-gradient(135deg, #4a90e2 0%, #2a70c2 100%)",
    particles: "#6ba3e8",
    glow: "rgba(74, 144, 226, 0.3)",
  },
  Surprise: {
    primary: "#ff69b4",
    secondary: "#ff8dc7",
    gradient: "linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)",
    particles: "#ff8dc7",
    glow: "rgba(255, 105, 180, 0.3)",
  },
};

const colors = {
  darkBg: "#1a1a2e",
  cardBg: "rgba(30, 30, 53, 0.85)", // Original, but we'll use a new blended style
  accentPurple: "#a350ff",
  neonGreen: "#39ff14",
  textLight: "#f0f0f0",
  textGray: "#b0b0c2",
  coralRed: "#ff6b6b",
  barBg: "rgba(21, 21, 42, 0.85)",
  inputCardBgVisible: "rgba(58, 31, 80, 0.6)",
};

const emotions = [
  { name: "Angry", emoji: "😠" },
  { name: "Disgust", emoji: "🤢" },
  { name: "Fear", emoji: "😨" },
  { name: "Happy", emoji: "😊" },
  { name: "Neutral", emoji: "😐" },
  { name: "Sad", emoji: "😢" },
  { name: "Surprise", emoji: "😮" },
];

const emotionEmojis = {
  Angry: "😠",
  Disgust: "🤢",
  Fear: "😨",
  Happy: "😊",
  Neutral: "😐",
  Sad: "😢",
  Surprise: "😮",
};

const languageFlags = {
  Hindi: "🇮🇳",
  English: "🇬🇧",
  Marathi: "🇮🇳",
  Telugu: "🇮🇳",
  Tamil: "🇮🇳",
  Gujarati: "🇮🇳",
  Urdu: "🇵🇰",
  Kannada: "🇮🇳",
  Bengali: "🇧🇩",
  Malayalam: "🇮🇳",
};

// Floating Particles Component
function FloatingParticles({ emotion }) {
  const theme = emotionThemes[emotion];
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = theme.particles;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = theme.particles;
            ctx.globalAlpha = 0.1 * (1 - distance / 100);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [emotion, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export default function MainDashboard() {
  const [selectedEmotion, setSelectedEmotion] = useState("Neutral");
  const [predictedEmotion, setPredictedEmotion] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analyzedImageSrc, setAnalyzedImageSrc] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [detectionMethod, setDetectionMethod] = useState(null);
  const [userLanguages, setUserLanguages] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  const videoRef = useRef(null);
  const isStreaming = !!mediaStream;
  const currentTheme = emotionThemes[selectedEmotion];

  const getLanguages = () => {
    const stored = localStorage.getItem("user_languages");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return ["English"];
      }
    }
    return ["English"];
  };

  useEffect(() => {
    const langs = getLanguages();
    setUserLanguages(langs);

    const stats = localStorage.getItem("user_stats");
    if (stats) {
      const parsedStats = JSON.parse(stats);
      setFavoriteSongs(parsedStats.favoriteSongs || []);
    }
  }, []);

  const fetchRecommendations = async (emotion, offset = 0) => {
    try {
      const langs = getLanguages();
      const langString = langs.join(",");
      const url = `${API_BASE_URL}/get_recommendations/?emotion=${emotion}&languages=${langString}&offset=${offset}`;

      const response = await fetch(url);
      const data = await response.json();

      setRecommendations(data.recommendations || []);
      setCurrentOffset(offset);
      if (data.recommendations?.length > 0) {
        setSelectedTrack(data.recommendations[0]);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  const handleSelectEmotion = (emotionName) => {
    handleStopWebcam();
    setSelectedEmotion(emotionName);
    setPredictedEmotion(null);
    setConfidenceScore(null);
    setDetectionMethod(null);
    fetchRecommendations(emotionName, 0);
  };

  const handleWebcamClick = async () => {
    if (isStreaming) {
      runAnalysis();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setMediaStream(stream);
    } catch (err) {
      alert("Could not access webcam. Check permissions.");
    }
  };

  const runAnalysis = async () => {
    if (!isStreaming || isAnalyzing) return;

    setIsAnalyzing(true);
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      alert("Webcam not ready");
      setIsAnalyzing(false);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setIsAnalyzing(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "webcam_frame.jpeg");

        try {
          const response = await fetch(`${API_BASE_URL}/analyze_emotion/`, {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          const newEmotion = data.predicted_emotion;
          const confidence = data.confidence;

          setAnalyzedImageSrc(data.processed_image_b64);
          setPredictedEmotion(newEmotion);
          setConfidenceScore(confidence);
          setSelectedEmotion(newEmotion);
          setDetectionMethod("Webcam");

          fetchRecommendations(newEmotion, 0);
        } catch (err) {
          alert(`Analysis failed: ${err.message}`);
        } finally {
          setIsAnalyzing(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleStopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setMediaStream(null);
    setAnalyzedImageSrc(null);
  };

  const handleImageUpload = (e) => {
    handleStopWebcam();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE_URL}/analyze_emotion/`, {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        const newEmotion = data.predicted_emotion;
        const confidence = data.confidence;

        setAnalyzedImageSrc(data.processed_image_b64);
        setPredictedEmotion(newEmotion);
        setConfidenceScore(confidence);
        setSelectedEmotion(newEmotion);
        setDetectionMethod("Image");

        fetchRecommendations(newEmotion, 0);
      })
      .catch((err) => alert(`Upload failed: ${err.message}`));
  };

  const handleRefreshSongs = async () => {
    setIsRefreshing(true);
    try {
      const newOffset = currentOffset + 5;
      await fetchRecommendations(selectedEmotion, newOffset);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearMood = () => {
    handleStopWebcam();
    setSelectedEmotion("Neutral");
    setPredictedEmotion(null);
    setConfidenceScore(null);
    setSelectedTrack(null);
    setRecommendations([]);
  };

  const handleToggleFavorite = (track) => {
    const isFavorite = favoriteSongs.some((s) => s.id === track.id);

    if (isFavorite) {
      const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
      stats.favoriteSongs = (stats.favoriteSongs || []).filter(
        (s) => s.id !== track.id
      );
      localStorage.setItem("user_stats", JSON.stringify(stats));
      setFavoriteSongs(stats.favoriteSongs);
    } else {
      const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
      stats.favoriteSongs = stats.favoriteSongs || [];
      stats.favoriteSongs.push(track);
      localStorage.setItem("user_stats", JSON.stringify(stats));
      setFavoriteSongs(stats.favoriteSongs);
    }
  };

  const isFavorite = (trackId) => {
    return favoriteSongs.some((s) => s.id === trackId);
  };

  useEffect(() => {
    if (isStreaming && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => console.error("Play error:", err));
    }
  }, [isStreaming, mediaStream]);

  useEffect(() => {
    return () => {
      handleStopWebcam();
    };
  }, []);

  // --- NEW CARD STYLE OBJECT FOR REUSE ---
  const blendedCardStyle = {
    // Replaced a dark, opaque color with a more transparent one based on the current theme
    backgroundColor: `${currentTheme.primary}10`, // 10% opacity of the primary color
    backdropFilter: "blur(15px)",
    borderRadius: "20px",
    padding: "30px",
    // Adjusted box shadow to be less black and more glow-focused
    border: `1px solid ${currentTheme.primary}40`,
    boxShadow: `0 0 50px ${currentTheme.glow}, inset 0 0 10px ${currentTheme.primary}10`, // Added an inset for a subtle inner glow
    transition: "all 0.5s ease",
  };

  const songCardStyle = (index) => ({
    display: "flex",
    alignItems: "center",
    padding: "15px",
    borderRadius: "10px",
    cursor: "pointer",
    // Highlight the selected track
    background:
      selectedTrack?.id === recommendations[index]?.id
        ? `${currentTheme.primary}30`
        : "transparent",
    borderLeft: `5px solid ${currentTheme.primary}00`,
    transition: "all 0.3s ease",
    "&:hover": {
      background: `${currentTheme.primary}20`,
      borderLeft: `5px solid ${currentTheme.primary}`,
    },
  });
  // --- END NEW CARD STYLE OBJECT ---

  return (
    <div
      style={{
        // MAIN BG: Kept the radial/linear gradient
        background: `radial-gradient(circle at 20% 50%, ${currentTheme.glow} 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${currentTheme.glow} 0%, transparent 50%), linear-gradient(135deg, #0a0a15 0%, #1a1a2e 50%, #0f0f1c 100%)`,
        minHeight: "100vh",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <FloatingParticles emotion={selectedEmotion} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* MOOD BAR (already looks good, slight adjustment to barBg for more transparency) */}
        <div
          style={{
            backgroundColor: `${currentTheme.primary}10`, // Use theme-based transparency here too
            backdropFilter: "blur(20px)",
            padding: "25px 35px",
            borderBottom: `3px solid ${currentTheme.primary}`,
            textAlign: "center",
            marginBottom: "40px",
            borderRadius: "20px",
            border: `1px solid ${currentTheme.primary}40`,
            boxShadow: `0 10px 40px ${currentTheme.glow}, 0 0 60px ${currentTheme.glow}`,
            transition: "all 0.5s ease",
          }}
        >
          <div
            style={{
              background: currentTheme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "12px",
              letterSpacing: "1px",
            }}
          >
            🎭 Select Your Mood
          </div>

          {userLanguages.length > 0 && (
            <div
              style={{
                color: colors.neonGreen,
                fontSize: "13px",
                marginBottom: "18px",
                fontWeight: "600",
              }}
            >
              🌍 Languages:{" "}
              {userLanguages.map((l) => `${languageFlags[l]} ${l}`).join(" • ")}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            {emotions.map((e) => {
              const isSelected = selectedEmotion === e.name;
              const btnTheme = emotionThemes[e.name];
              return (
                <button
                  key={e.name}
                  onClick={() => handleSelectEmotion(e.name)}
                  style={{
                    padding: "12px 22px",
                    borderRadius: "30px",
                    border: isSelected
                      ? `3px solid ${btnTheme.primary}`
                      : "3px solid transparent",
                    background: isSelected
                      ? btnTheme.gradient
                      : `${btnTheme.primary}20`, // Blending button background
                    color: colors.textLight,
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                    boxShadow: isSelected
                      ? `0 0 25px ${btnTheme.glow}`
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = `${btnTheme.primary}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = `${btnTheme.primary}20`;
                    }
                  }}
                >
                  {e.emoji} {e.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
          }}
        >
          {/* LEFT */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "25px" }}
          >
            {/* WEBCAM/UPLOAD - APPLYING BLENDED STYLE */}
            <div style={blendedCardStyle}>
              {isStreaming ? (
                <div>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      minHeight: "300px",
                      borderRadius: "15px",
                      overflow: "hidden",
                      backgroundColor: "#000",
                      marginBottom: "20px",
                      border: `4px solid ${currentTheme.primary}`,
                      boxShadow: `0 0 30px ${currentTheme.glow}`,
                    }}
                  >
                    {analyzedImageSrc ? (
                      <img
                        src={analyzedImageSrc}
                        alt="Analyzed"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scaleX(-1)",
                        }}
                        autoPlay
                        playsInline
                        muted
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background:
                          "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                        color: colors.textLight,
                        padding: "8px 15px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "900",
                        boxShadow: "0 5px 20px rgba(255, 107, 107, 0.5)",
                      }}
                    >
                      🔴 LIVE
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <button
                      onClick={handleWebcamClick}
                      disabled={isAnalyzing}
                      style={{
                        flex: 1,
                        padding: "15px",
                        background: isAnalyzing
                          ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
                          : currentTheme.gradient,
                        color: isAnalyzing ? colors.textLight : "#000",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "900",
                        fontSize: "15px",
                        cursor: isAnalyzing ? "not-allowed" : "pointer",
                        boxShadow: isAnalyzing
                          ? "none"
                          : `0 5px 20px ${currentTheme.glow}`,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {isAnalyzing ? "🔄 Analyzing..." : "🎯 Start Analysis"}
                    </button>
                    <button
                      onClick={handleStopWebcam}
                      style={{
                        flex: 1,
                        padding: "15px",
                        background:
                          "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                        color: colors.textLight,
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "900",
                        fontSize: "15px",
                        cursor: "pointer",
                        boxShadow: "0 5px 20px rgba(255, 107, 107, 0.4)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "translateY(-2px)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "translateY(0)")
                      }
                    >
                      ⏹️ Stop
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "20px" }}>
                  <button
                    onClick={handleWebcamClick}
                    style={{
                      flex: 1,
                      padding: "60px 25px",
                      background: `linear-gradient(135deg, ${currentTheme.primary}40 0%, ${currentTheme.primary}20 100%)`,
                      border: `3px dashed ${currentTheme.primary}80`,
                      borderRadius: "15px",
                      color: colors.textLight,
                      cursor: "pointer",
                      fontSize: "20px",
                      fontWeight: "800",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = `linear-gradient(135deg, ${currentTheme.primary}60 0%, ${currentTheme.primary}40 100%)`;
                      e.target.style.borderColor = currentTheme.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = `linear-gradient(135deg, ${currentTheme.primary}40 0%, ${currentTheme.primary}20 100%)`;
                      e.target.style.borderColor = `${currentTheme.primary}80`;
                    }}
                  >
                    📷 Start Live Scan
                  </button>
                  <label
                    style={{
                      flex: 1,
                      padding: "60px 25px",
                      background:
                        "linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.1) 100%)",
                      border: "3px dashed rgba(57, 255, 20, 0.5)",
                      borderRadius: "15px",
                      color: colors.textLight,
                      cursor: "pointer",
                      fontSize: "20px",
                      fontWeight: "800",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, rgba(57, 255, 20, 0.3) 0%, rgba(57, 255, 20, 0.2) 100%)";
                      e.target.style.borderColor = colors.neonGreen;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.1) 100%)";
                      e.target.style.borderColor = "rgba(57, 255, 20, 0.5)";
                    }}
                  >
                    📤 Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* EMOTION STATUS - APPLYING BLENDED STYLE */}
            <div
              style={{
                // Use the common blended style
                ...blendedCardStyle,
                textAlign: "center",
                // Override/enhance dynamic border/shadow based on prediction
                border: predictedEmotion
                  ? `3px solid ${currentTheme.primary}`
                  : `1px solid ${currentTheme.primary}40`,
                boxShadow: predictedEmotion
                  ? `0 0 50px ${currentTheme.glow}, inset 0 0 10px ${currentTheme.primary}10`
                  : blendedCardStyle.boxShadow,
              }}
            >
              <div
                style={{
                  color: currentTheme.primary,
                  fontSize: "14px",
                  marginBottom: "12px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                CURRENT EMOTION
              </div>
              <div style={{ fontSize: "64px", marginBottom: "10px" }}>
                {emotionEmojis[selectedEmotion]}
              </div>
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "10px",
                  background: currentTheme.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "900",
                }}
              >
                {selectedEmotion}
              </div>

              {predictedEmotion && confidenceScore !== null && (
                <div
                  style={{
                    // This internal div uses a stronger version of the theme
                    background: `linear-gradient(135deg, ${currentTheme.primary}40 0%, ${currentTheme.primary}20 100%)`,
                    padding: "15px",
                    borderRadius: "12px",
                    marginBottom: "15px",
                    border: `1px solid ${currentTheme.primary}60`,
                  }}
                >
                  <div
                    style={{
                      color: currentTheme.primary,
                      fontSize: "13px",
                      marginBottom: "8px",
                      fontWeight: "700",
                    }}
                  >
                    CONFIDENCE SCORE
                  </div>
                  <div
                    style={{
                      color: currentTheme.primary,
                      fontSize: "24px",
                      fontWeight: "900",
                    }}
                  >
                    {(confidenceScore * 100).toFixed(1)}%
                  </div>
                </div>
              )}

              <div
                style={{
                  color: colors.textGray,
                  fontSize: "14px",
                  marginTop: "12px",
                  marginBottom: "20px",
                  fontWeight: "600",
                }}
              >
                {predictedEmotion
                  ? `✨ Detected via ${detectionMethod}`
                  : "🎯 Manually Selected"}
              </div>
              <button
                onClick={handleClearMood}
                style={{
                  padding: "12px 25px",
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                  color: colors.textLight,
                  border: "none",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontWeight: "900",
                  fontSize: "14px",
                  boxShadow: "0 5px 20px rgba(255, 107, 107, 0.4)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.transform = "translateY(0)")
                }
              >
                🗑️ Clear Mood
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "25px" }}
          >
            {/* TOP 5 SONGS - APPLYING BLENDED STYLE */}
            <div style={blendedCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    color: colors.textLight,
                    margin: "0",
                    fontSize: "20px",
                    fontWeight: "900",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  🎵 Songs {currentOffset + 1} - {currentOffset + 5}
                </h3>
                <button
                  onClick={handleRefreshSongs}
                  disabled={isRefreshing}
                  style={{
                    padding: "8px 18px",
                    background: isRefreshing
                      ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
                      : currentTheme.gradient,
                    color: isRefreshing ? colors.textLight : "#000",
                    border: "none",
                    borderRadius: "20px",
                    cursor: isRefreshing ? "not-allowed" : "pointer",
                    fontWeight: "900",
                    fontSize: "13px",
                    opacity: isRefreshing ? 0.6 : 1,
                    boxShadow: isRefreshing
                      ? "none"
                      : `0 5px 15px ${currentTheme.glow}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    !isRefreshing &&
                    (e.target.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    !isRefreshing &&
                    (e.target.style.transform = "translateY(0)")
                  }
                >
                  <FiRefreshCw size={14} />
                  {isRefreshing ? "Loading..." : "Refresh"}
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: colors.textGray,
                    // Update background here to match the new blended look
                    backgroundColor: `${currentTheme.primary}08`, // Very subtle background
                    borderRadius: "15px",
                    border: `1px dashed ${currentTheme.primary}40`,
                  }}
                >
                  {selectedEmotion === "Neutral" ? (
                    <p>Select a mood or use the webcam/upload to find songs!</p>
                  ) : (
                    <p>
                      We couldn't find songs for the **{selectedEmotion}** mood
                      in your selected languages. Try refreshing!
                    </p>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {recommendations.map((track, index) => (
                    <div
                      key={track.id}
                      style={{
                        // Using a function to handle dynamic hover/selection styling
                        ...songCardStyle(index),
                        // Inline pseudo-class styles for hover effect (better done with CSS/styled-components, but for inline style consistency, we'll use onMouseEnter/onMouseLeave)
                      }}
                      onClick={() => setSelectedTrack(track)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${currentTheme.primary}20`;
                        e.currentTarget.style.borderLeft = `5px solid ${currentTheme.primary}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          selectedTrack?.id === track.id
                            ? `${currentTheme.primary}30`
                            : "transparent";
                        e.currentTarget.style.borderLeft =
                          selectedTrack?.id === track.id
                            ? `5px solid ${currentTheme.primary}`
                            : `${currentTheme.primary}00`;
                      }}
                    >
                      <span
                        style={{
                          color: colors.textGray,
                          marginRight: "15px",
                          fontWeight: "900",
                        }}
                      >
                        {currentOffset + index + 1}
                      </span>
                      <div style={{ flexGrow: 1 }}>
                        <div
                          style={{
                            color: colors.textLight,
                            fontWeight: "700",
                            fontSize: "16px",
                          }}
                        >
                          {track.title}
                        </div>
                        <div
                          style={{
                            color: currentTheme.secondary,
                            fontSize: "13px",
                          }}
                        >
                          {track.artist} -{" "}
                          {languageFlags[track.language] || "🎶"}{" "}
                          {track.language}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(track);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: isFavorite(track.id)
                            ? colors.coralRed
                            : colors.textGray,
                          transition: "all 0.3s ease",
                          padding: "5px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        <FiHeart
                          size={20}
                          fill={
                            isFavorite(track.id)
                              ? colors.coralRed
                              : "transparent"
                          }
                          stroke={colors.coralRed}
                          strokeWidth={isFavorite(track.id) ? "0" : "2"}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SELECTED TRACK PLAYER */}
            <div style={blendedCardStyle}>
              <h3
                style={{
                  color: colors.textLight,
                  fontSize: "20px",
                  fontWeight: "900",
                  marginBottom: "20px",
                }}
              >
                🎧 Now Playing
              </h3>
              {selectedTrack ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <img
                      src={selectedTrack.album_art}
                      alt="Album Art"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "10px",
                        boxShadow: `0 0 15px ${currentTheme.primary}80`,
                      }}
                    />
                    <div>
                      <h4
                        style={{
                          color: colors.textLight,
                          margin: "0 0 5px 0",
                          fontSize: "22px",
                          fontWeight: "900",
                        }}
                      >
                        {selectedTrack.title}
                      </h4>
                      <p
                        style={{
                          color: currentTheme.secondary,
                          margin: "0",
                          fontSize: "16px",
                          fontWeight: "700",
                        }}
                      >
                        {selectedTrack.artist}
                      </p>
                      <p
                        style={{
                          color: colors.textGray,
                          margin: "5px 0 0 0",
                          fontSize: "13px",
                        }}
                      >
                        {selectedTrack.album} (
                        {languageFlags[selectedTrack.language]}{" "}
                        {selectedTrack.language})
                      </p>
                    </div>
                  </div>
                  <audio
                    controls
                    src={selectedTrack.preview_url}
                    style={{
                      width: "100%",
                      background: "none",
                      filter:
                        "invert(1) sepia(1) saturate(5) hue-rotate(180deg)",
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div
                  style={{
                    padding: "30px 20px",
                    textAlign: "center",
                    color: colors.textGray,
                    backgroundColor: `${currentTheme.primary}08`,
                    borderRadius: "15px",
                    border: `1px dashed ${currentTheme.primary}40`,
                  }}
                >
                  Click on a song recommendation to play a preview!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
