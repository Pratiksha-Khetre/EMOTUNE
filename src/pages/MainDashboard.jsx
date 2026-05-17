// src/pages/MainDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  incrementScans,
  incrementSongsPlayed,
  recordEmotion,
  addFavoriteSong,
} from "../utils/statsTracker";
import { FiRefreshCw, FiHeart, FiExternalLink } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://emo-backend-6.onrender.com";

console.log("🔧 Mode:", import.meta.env.MODE);
console.log("🌐 VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("📍 Using API:", API_BASE_URL);

const colors = {
  darkBg: "#0f0f1c",
  cardBg: "#1e1e35",
  accentPurple: "#a350ff",
  neonGreen: "#39ff14",
  textLight: "#f0f0f0",
  textGray: "#b0b0c2",
  coralRed: "#ff6b6b",
  barBg: "#15152a",
  inputCardBgVisible: "#3a1f50",
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
  Angry: "😠", Disgust: "🤢", Fear: "😨",
  Happy: "😊", Neutral: "😐", Sad: "😢", Surprise: "😮",
};

const languageFlags = {
  Hindi: "🇮🇳", English: "🇬🇧", Marathi: "🇮🇳", Telugu: "🇮🇳",
  Tamil: "🇮🇳", Gujarati: "🇮🇳", Urdu: "🇵🇰", Kannada: "🇮🇳",
  Bengali: "🇧🇩", Malayalam: "🇮🇳",
};

const floatingEmojis = [
  "🎵","🎶","🎤","🎧","🎸","🎹","🥁","🎺","🎻","🎼",
  "😊","😢","😠","😮","😐","🤢","😨","💜","💚","💙",
  "❤️","🌟","✨","🎭","🎪",
];

function FloatingEmoji({ emoji, delay, duration, startX, startY }) {
  return (
    <div style={{
      position: "absolute", left: `${startX}%`, top: `${startY}%`,
      fontSize: "44px", opacity: "0.55",
      animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      pointerEvents: "none", zIndex: 0,
    }}>
      {emoji}
    </div>
  );
}

// ========== YOUTUBE PLAYER COMPONENT ==========
function YouTubePlayer({ track }) {
  if (!track) return null;

  return (
    <div style={{
      backgroundColor: "rgba(30, 30, 53, 0.8)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      padding: "30px",
      border: "1px solid rgba(163, 80, 255, 0.2)",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px",
      }}>
        <h3 style={{
          color: colors.textLight, margin: "0", fontSize: "20px",
          fontWeight: "900", display: "flex", alignItems: "center", gap: "10px",
        }}>
          🎬 Now Playing
        </h3>
        <a
          href={track.external_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, rgba(255,0,0,0.3) 0%, rgba(200,0,0,0.2) 100%)",
            color: colors.textLight,
            border: "2px solid rgba(255,0,0,0.5)",
            borderRadius: "25px",
            textDecoration: "none",
            fontWeight: "900",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
          }}
        >
          <FiExternalLink size={16} />
          Open on YouTube
        </a>
      </div>

      {/* Track Info */}
      <div style={{
        display: "flex", alignItems: "center", gap: "15px",
        marginBottom: "20px",
        background: "linear-gradient(135deg, rgba(163,80,255,0.1) 0%, rgba(57,255,20,0.1) 100%)",
        padding: "15px", borderRadius: "12px",
        border: "1px solid rgba(163,80,255,0.2)",
      }}>
        {track.image_url && (
          <img
            src={track.image_url}
            alt={track.title}
            style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }}
          />
        )}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{
            color: colors.textLight, fontWeight: "800", fontSize: "15px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            marginBottom: "4px",
          }}>
            {track.title}
          </div>
          <div style={{
            color: colors.textGray, fontSize: "13px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {track.artist}
          </div>
        </div>
        {track.language && (
          <div style={{
            color: colors.neonGreen, fontSize: "12px",
            fontWeight: "700", whiteSpace: "nowrap",
          }}>
            {languageFlags[track.language]} {track.language}
          </div>
        )}
      </div>

      {/* YouTube Embed */}
      <div style={{ borderRadius: "15px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <iframe
          key={track.id}
          style={{ width: "100%", height: "280px", border: "none", borderRadius: "15px" }}
          src={`https://www.youtube.com/embed/${track.id}?autoplay=1&rel=0&modestbranding=1`}
          title={track.title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}

// ========== MAIN DASHBOARD ==========
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
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const videoRef = useRef(null);
  const isStreaming = !!mediaStream;

  const getLanguages = () => {
    const stored = localStorage.getItem("user_languages");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return ["English"]; }
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
      setIsLoadingRecs(true);
      const langs = getLanguages();
      const langString = langs.join(",");
      const url = `${API_BASE_URL}/get_recommendations/?emotion=${emotion}&languages=${langString}&offset=${offset}`;

      console.log("📡 Fetching recommendations:");
      console.log("   URL:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      console.log("📥 Received:", data.returned_count, "tracks from YouTube");

      setRecommendations(data.recommendations || []);
      setCurrentOffset(offset);
      if (data.recommendations?.length > 0) {
        setSelectedTrack(data.recommendations[0]);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setIsLoadingRecs(false);
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
    if (isStreaming) { runAnalysis(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
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

    canvas.toBlob(async (blob) => {
      if (!blob) { setIsAnalyzing(false); return; }

      const formData = new FormData();
      formData.append("file", blob, "webcam_frame.jpeg");

      try {
        const response = await fetch(`${API_BASE_URL}/analyze_emotion/`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.detail?.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        const newEmotion = data.predicted_emotion;
        const confidence = data.confidence;

        if (!newEmotion) throw new Error("No emotion detected. Please try again.");

        setAnalyzedImageSrc(data.processed_image_b64);
        setPredictedEmotion(newEmotion);
        setConfidenceScore(confidence);
        setSelectedEmotion(newEmotion);
        setDetectionMethod("Webcam");

        incrementScans();
        recordEmotion(newEmotion);
        fetchRecommendations(newEmotion, 0);

      } catch (err) {
        alert(`Analysis failed: ${err.message}`);
      } finally {
        setIsAnalyzing(false);
      }
    }, "image/jpeg", 0.9);
  };

  const handleStopWebcam = () => {
    if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
    setAnalyzedImageSrc(null);
  };

  const handleImageUpload = (e) => {
    handleStopWebcam();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE_URL}/analyze_emotion/`, { method: "POST", body: formData })
      .then((r) => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const newEmotion = data.predicted_emotion;
        if (!newEmotion) throw new Error("No emotion detected. Please try again.");

        setAnalyzedImageSrc(data.processed_image_b64);
        setPredictedEmotion(newEmotion);
        setConfidenceScore(data.confidence);
        setSelectedEmotion(newEmotion);
        setDetectionMethod("Image");

        incrementScans();
        recordEmotion(newEmotion);
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
    setDetectionMethod(null);
    setSelectedTrack(null);
    setRecommendations([]);
  };

  const handleToggleFavorite = (track) => {
    const isFav = favoriteSongs.some((s) => s.id === track.id);
    if (isFav) {
      const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
      stats.favoriteSongs = (stats.favoriteSongs || []).filter((s) => s.id !== track.id);
      localStorage.setItem("user_stats", JSON.stringify(stats));
      setFavoriteSongs(stats.favoriteSongs);
    } else {
      addFavoriteSong(track);
      const stats = JSON.parse(localStorage.getItem("user_stats") || "{}");
      setFavoriteSongs(stats.favoriteSongs || []);
    }
  };

  const isFavorite = (trackId) => favoriteSongs.some((s) => s.id === trackId);

  useEffect(() => {
    if (isStreaming && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => console.error("Play error:", err));
    }
  }, [isStreaming, mediaStream]);

  useEffect(() => { return () => { handleStopWebcam(); }; }, []);

  useEffect(() => {
    if (selectedTrack) incrementSongsPlayed();
  }, [selectedTrack]);

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 25%, #1e3a5f 50%, #2d1b4e 75%, #1a0b2e 100%)",
      minHeight: "100vh", padding: "20px",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(20px) rotate(5deg); }
          50% { transform: translateY(-40px) translateX(-20px) rotate(-5deg); }
          75% { transform: translateY(-20px) translateX(10px) rotate(3deg); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Floating Emojis */}
      {floatingEmojis.map((emoji, index) => (
        <FloatingEmoji
          key={index} emoji={emoji} delay={index * 0.5}
          duration={8 + (index % 5)} startX={Math.random() * 100} startY={Math.random() * 100}
        />
      ))}

      {/* MOOD BAR */}
      <div style={{
        backgroundColor: "rgba(21, 21, 42, 0.8)", backdropFilter: "blur(10px)",
        padding: "25px 35px", textAlign: "center", marginBottom: "40px",
        borderRadius: "20px", border: "1px solid rgba(163, 80, 255, 0.2)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)", position: "relative", zIndex: 1,
      }}>
        <div style={{
          background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontSize: "28px", fontWeight: "900", marginBottom: "12px", letterSpacing: "1px",
        }}>
          🎭 Select Your Mood
        </div>

        {userLanguages.length > 0 && (
          <div style={{ color: colors.neonGreen, fontSize: "13px", marginBottom: "18px", fontWeight: "600" }}>
            🌍 Languages: {userLanguages.map((l) => `${languageFlags[l]} ${l}`).join(" • ")}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
          {emotions.map((e) => (
            <button
              key={e.name}
              onClick={() => handleSelectEmotion(e.name)}
              style={{
                padding: "12px 22px", borderRadius: "30px",
                border: selectedEmotion === e.name ? `3px solid ${colors.neonGreen}` : "3px solid transparent",
                background: selectedEmotion === e.name
                  ? "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)"
                  : "rgba(43, 43, 75, 0.5)",
                color: colors.textLight, cursor: "pointer", fontSize: "15px",
                fontWeight: "700", transition: "all 0.3s ease",
                boxShadow: selectedEmotion === e.name ? "0 0 25px rgba(57, 255, 20, 0.5)" : "none",
              }}
            >
              {e.emoji} {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "30px", position: "relative", zIndex: 1,
      }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>

          {/* WEBCAM/UPLOAD */}
          <div style={{
            backgroundColor: "rgba(30, 30, 53, 0.8)", backdropFilter: "blur(10px)",
            borderRadius: "20px", padding: "30px",
            border: "1px solid rgba(163, 80, 255, 0.2)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          }}>
            {isStreaming ? (
              <div>
                <div style={{
                  position: "relative", width: "100%", minHeight: "300px",
                  borderRadius: "15px", overflow: "hidden", backgroundColor: "#000",
                  marginBottom: "20px", border: `4px solid ${colors.neonGreen}`,
                  boxShadow: "0 0 30px rgba(57, 255, 20, 0.4)",
                }}>
                  {analyzedImageSrc ? (
                    <img src={analyzedImageSrc} alt="Analyzed"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <video ref={videoRef}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                      autoPlay playsInline muted />
                  )}
                  <div style={{
                    position: "absolute", top: "12px", left: "12px",
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                    color: colors.textLight, padding: "8px 15px", borderRadius: "20px",
                    fontSize: "13px", fontWeight: "900",
                  }}>🔴 LIVE</div>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <button onClick={handleWebcamClick} disabled={isAnalyzing} style={{
                    flex: 1, padding: "15px",
                    background: isAnalyzing
                      ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
                      : "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
                    color: isAnalyzing ? colors.textLight : "#000",
                    border: "none", borderRadius: "12px", fontWeight: "900",
                    fontSize: "15px", cursor: isAnalyzing ? "not-allowed" : "pointer",
                  }}>
                    {isAnalyzing ? "🔄 Analyzing..." : "🎯 Start Analysis"}
                  </button>
                  <button onClick={handleStopWebcam} style={{
                    flex: 1, padding: "15px",
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                    color: colors.textLight, border: "none", borderRadius: "12px",
                    fontWeight: "900", fontSize: "15px", cursor: "pointer",
                  }}>⏹️ Stop</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "20px" }}>
                <button onClick={handleWebcamClick} style={{
                  flex: 1, padding: "60px 25px",
                  background: "linear-gradient(135deg, rgba(163,80,255,0.2) 0%, rgba(163,80,255,0.1) 100%)",
                  border: "3px dashed rgba(163,80,255,0.5)", borderRadius: "15px",
                  color: colors.textLight, cursor: "pointer", fontSize: "20px",
                  fontWeight: "800", transition: "all 0.3s ease",
                }}>📷 Start Live Scan</button>

                <label style={{
                  flex: 1, padding: "60px 25px",
                  background: "linear-gradient(135deg, rgba(57,255,20,0.2) 0%, rgba(57,255,20,0.1) 100%)",
                  border: "3px dashed rgba(57,255,20,0.5)", borderRadius: "15px",
                  color: colors.textLight, cursor: "pointer", fontSize: "20px",
                  fontWeight: "800", textAlign: "center", transition: "all 0.3s ease",
                }}>
                  📤 Upload Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
              </div>
            )}
          </div>

          {/* EMOTION STATUS */}
          <div style={{
            backgroundColor: "rgba(30, 30, 53, 0.8)", backdropFilter: "blur(10px)",
            borderRadius: "20px", padding: "30px", textAlign: "center",
            border: predictedEmotion ? `3px solid ${colors.neonGreen}` : "1px solid rgba(163,80,255,0.2)",
            boxShadow: predictedEmotion ? "0 0 40px rgba(57,255,20,0.3)" : "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <div style={{ color: colors.neonGreen, fontSize: "14px", marginBottom: "12px", fontWeight: "700", letterSpacing: "1px" }}>
              CURRENT EMOTION
            </div>
            <div style={{ fontSize: "64px", marginBottom: "10px" }}>{emotionEmojis[selectedEmotion]}</div>
            <div style={{
              fontSize: "36px", marginBottom: "10px",
              background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "900",
            }}>{selectedEmotion}</div>

            {predictedEmotion && confidenceScore !== null && (
              <div style={{
                background: "linear-gradient(135deg, rgba(163,80,255,0.2) 0%, rgba(57,255,20,0.2) 100%)",
                padding: "15px", borderRadius: "12px", marginBottom: "15px",
                border: "1px solid rgba(163,80,255,0.3)",
              }}>
                <div style={{ color: colors.neonGreen, fontSize: "13px", marginBottom: "8px", fontWeight: "700" }}>
                  CONFIDENCE SCORE
                </div>
                <div style={{ color: colors.neonGreen, fontSize: "24px", fontWeight: "900" }}>
                  {(confidenceScore * 100).toFixed(1)}%
                </div>
              </div>
            )}

            <p style={{ color: colors.textLight, fontSize: "20px", fontStyle: "italic" }}>
              Your smile is the rhythm — let the music be the melody.
            </p>
            <div style={{ color: colors.textGray, fontSize: "14px", marginTop: "12px", marginBottom: "20px", fontWeight: "600" }}>
              {predictedEmotion ? `✨ Detected via ${detectionMethod}` : "🎯 Manually Selected"}
            </div>
            <button onClick={handleClearMood} style={{
              padding: "12px 25px",
              background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
              color: colors.textLight, border: "none", borderRadius: "25px",
              cursor: "pointer", fontWeight: "900", fontSize: "14px",
            }}>🗑️ Clear Mood</button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>

          {/* SONG LIST */}
          <div style={{
            backgroundColor: "rgba(30, 30, 53, 0.8)", backdropFilter: "blur(10px)",
            borderRadius: "20px", padding: "30px",
            border: "1px solid rgba(163,80,255,0.2)", boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: colors.textLight, margin: "0", fontSize: "20px", fontWeight: "900" }}>
                🎬 YouTube Songs
              </h3>
              <button onClick={handleRefreshSongs} disabled={isRefreshing || isLoadingRecs} style={{
                padding: "8px 18px",
                background: (isRefreshing || isLoadingRecs)
                  ? "linear-gradient(135deg, #5a5a70 0%, #3a3a50 100%)"
                  : "linear-gradient(135deg, #39ff14 0%, #2ecc71 100%)",
                color: (isRefreshing || isLoadingRecs) ? colors.textLight : "#000",
                border: "none", borderRadius: "20px",
                cursor: (isRefreshing || isLoadingRecs) ? "not-allowed" : "pointer",
                fontWeight: "900", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <FiRefreshCw size={14} style={{
                  animation: (isRefreshing || isLoadingRecs) ? "spin 1s linear infinite" : "none"
                }} />
                {(isRefreshing || isLoadingRecs) ? "Loading..." : "Refresh"}
              </button>
            </div>

            {isLoadingRecs ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: colors.textGray }}>
                <div style={{ fontSize: "48px", marginBottom: "15px", animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>Finding songs for your mood...</div>
              </div>
            ) : recommendations.length === 0 ? (
              <div style={{
                padding: "60px 20px", textAlign: "center", color: colors.textGray,
                backgroundColor: colors.inputCardBgVisible, borderRadius: "15px",
              }}>
                <div style={{ fontSize: "64px", marginBottom: "15px" }}>🎧</div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>Select a mood to get recommendations!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recommendations.slice(0, 6).map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => setSelectedTrack(track)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px", borderRadius: "12px", cursor: "pointer",
                      border: selectedTrack?.id === track.id
                        ? `2px solid ${colors.neonGreen}`
                        : "2px solid transparent",
                      background: selectedTrack?.id === track.id
                        ? "linear-gradient(135deg, rgba(57,255,20,0.1) 0%, rgba(163,80,255,0.1) 100%)"
                        : "rgba(255,255,255,0.03)",
                      transition: "all 0.3s ease",
                      boxShadow: selectedTrack?.id === track.id
                        ? "0 0 20px rgba(57,255,20,0.2)" : "none",
                    }}
                  >
                    {/* Thumbnail */}
                    {track.image_url ? (
                      <img src={track.image_url} alt={track.title}
                        style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: "56px", height: "56px", borderRadius: "8px", flexShrink: 0,
                        background: "linear-gradient(135deg, rgba(163,80,255,0.3) 0%, rgba(57,255,20,0.1) 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                      }}>🎵</div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{
                        color: colors.textLight, fontWeight: "700", fontSize: "13px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "3px",
                      }}>{track.title}</div>
                      <div style={{
                        color: colors.textGray, fontSize: "11px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{track.artist}</div>
                      {track.language && (
                        <div style={{ color: colors.neonGreen, fontSize: "10px", fontWeight: "600", marginTop: "2px" }}>
                          {languageFlags[track.language]} {track.language}
                        </div>
                      )}
                    </div>

                    {/* Favorite button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(track); }}
                      style={{
                        background: isFavorite(track.id)
                          ? "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)"
                          : "rgba(0,0,0,0.4)",
                        border: "none", borderRadius: "50%",
                        width: "36px", height: "36px", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.3s ease",
                      }}
                    >
                      <FiHeart size={16}
                        color={isFavorite(track.id) ? "#fff" : "#ff6b6b"}
                        fill={isFavorite(track.id) ? "#fff" : "none"}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* YOUTUBE PLAYER */}
          {selectedTrack && <YouTubePlayer track={selectedTrack} />}
        </div>
      </div>
    </div>
  );
}
