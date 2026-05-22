// src/pages/MainDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  incrementScans,
  incrementSongsPlayed,
  recordEmotion,
  addFavoriteSong,
} from "../utils/statsTracker";
import { FiRefreshCw, FiHeart, FiExternalLink } from "react-icons/fi";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://emo-backend-6.onrender.com";

const emotions = [
  { name: "Angry",   emoji: "😠", color: "#e06060", glow: "rgba(220,80,80,0.2)"    },
  { name: "Disgust", emoji: "🤢", color: "#6ab060", glow: "rgba(90,170,70,0.2)"    },
  { name: "Fear",    emoji: "😨", color: "#7080d0", glow: "rgba(90,100,210,0.2)"   },
  { name: "Happy",   emoji: "😊", color: "#e0b040", glow: "rgba(220,170,50,0.2)"   },
  { name: "Neutral", emoji: "😐", color: "#9090b0", glow: "rgba(120,115,160,0.2)"  },
  { name: "Sad",     emoji: "😢", color: "#60a0d0", glow: "rgba(70,130,210,0.2)"   },
  { name: "Surprise",emoji: "😮", color: "#d070e0", glow: "rgba(190,90,210,0.2)"   },
];

const emotionEmojis = {
  Angry:"😠", Disgust:"🤢", Fear:"😨", Happy:"😊",
  Neutral:"😐", Sad:"😢", Surprise:"😮",
};

const getEmotionMeta = (name) => emotions.find((e) => e.name === name) || emotions[4];

// ===== YOUTUBE PLAYER — no autoplay =====
function YouTubePlayer({ track }) {
  if (!track) return null;
  return (
    <div className="md-panel">
      <div className="md-panel-header">
        <span className="md-panel-title">Now Playing</span>
        <a
          href={track.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="md-yt-link"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#e05050">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Open on YouTube
        </a>
      </div>
      <div className="md-panel-body">
        <div className="md-now-playing-meta">
          {track.image_url && (
            <img src={track.image_url} alt={track.title} className="md-now-playing-thumb" />
          )}
          <div className="md-now-playing-info">
            <div className="md-now-playing-title">{track.title}</div>
            <div className="md-now-playing-artist">{track.artist}</div>
          </div>
          {track.language && <span className="md-inline-badge">{track.language}</span>}
        </div>
        <div className="md-iframe-wrap">
          {/* autoplay=0 — user must press play */}
          <iframe
            key={track.id}
            style={{ width: "100%", height: "240px", border: "none", display: "block" }}
            src={`https://www.youtube.com/embed/${track.id}?autoplay=0&rel=0&modestbranding=1`}
            title={track.title}
            allowFullScreen
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function MainDashboard() {
  const [selectedEmotion, setSelectedEmotion]   = useState("Neutral");
  const [predictedEmotion, setPredictedEmotion] = useState(null);
  const [confidenceScore, setConfidenceScore]   = useState(null);
  const [mediaStream, setMediaStream]           = useState(null);
  const [isAnalyzing, setIsAnalyzing]           = useState(false);
  const [recommendations, setRecommendations]   = useState([]);
  const [analyzedImageSrc, setAnalyzedImageSrc] = useState(null);
  const [selectedTrack, setSelectedTrack]       = useState(null);
  const [detectionMethod, setDetectionMethod]   = useState(null);
  const [userLanguages, setUserLanguages]       = useState([]);
  const [currentOffset, setCurrentOffset]       = useState(0);
  const [isRefreshing, setIsRefreshing]         = useState(false);
  const [favoriteSongs, setFavoriteSongs]       = useState([]);
  const [isLoadingRecs, setIsLoadingRecs]       = useState(false);
  const [mounted, setMounted]                   = useState(false);

  const videoRef = useRef(null);
  const isStreaming = !!mediaStream;
  const currentMood = getEmotionMeta(selectedEmotion);

  const getLanguages = () => {
    const stored = localStorage.getItem("user_languages");
    if (stored) { try { return JSON.parse(stored); } catch (e) { return ["English"]; } }
    return ["English"];
  };

  useEffect(() => {
    setMounted(true);
    setUserLanguages(getLanguages());
    const stats = localStorage.getItem("user_stats");
    if (stats) {
      const p = JSON.parse(stats);
      setFavoriteSongs(p.favoriteSongs || []);
    }
  }, []);

  const fetchRecommendations = async (emotion, offset = 0) => {
    try {
      setIsLoadingRecs(true);
      const langs = getLanguages();
      const url = `${API_BASE_URL}/get_recommendations/?emotion=${emotion}&languages=${langs.join(",")}&offset=${offset}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setCurrentOffset(offset);
      // Do NOT auto-select track — user clicks to play
      setSelectedTrack(null);
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
    if (!video || video.readyState < 2) { alert("Webcam not ready"); setIsAnalyzing(false); return; }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) { setIsAnalyzing(false); return; }
      const formData = new FormData();
      formData.append("file", blob, "webcam_frame.jpeg");
      try {
        const response = await fetch(`${API_BASE_URL}/analyze_emotion/`, { method: "POST", body: formData });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.detail?.message || `Server error: ${response.status}`);
        }
        const data = await response.json();
        const newEmotion = data.predicted_emotion;
        if (!newEmotion) throw new Error("No emotion detected. Please try again.");
        setAnalyzedImageSrc(data.processed_image_b64);
        setPredictedEmotion(newEmotion);
        setConfidenceScore(data.confidence);
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
    if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
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
      .then((r) => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); })
      .then((data) => {
        const newEmotion = data.predicted_emotion;
        if (!newEmotion) throw new Error("No emotion detected.");
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
    try { await fetchRecommendations(selectedEmotion, currentOffset + 5); }
    catch (err) { console.error("Refresh failed:", err); }
    finally { setIsRefreshing(false); }
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
  useEffect(() => { if (selectedTrack) incrementSongsPlayed(); }, [selectedTrack]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap');

        :root {
          --md-mood: ${currentMood.color};
          --md-glow: ${currentMood.glow};
        }

        .md-page {
          min-height: calc(100vh - 66px);
          background: #111827;
          font-family: 'DM Mono', monospace;
          color: #e8e4f8;
          position: relative;
          overflow-x: hidden;
        }

        .md-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .md-orb-1 {
          position: absolute; border-radius: 50%; filter: blur(110px);
          width: 650px; height: 650px; top: -240px; left: -180px;
          background: radial-gradient(circle, var(--md-glow) 0%, transparent 70%);
          animation: mdPulse 10s ease-in-out infinite alternate;
          transition: background 1.4s ease;
        }
        .md-orb-2 {
          position: absolute; border-radius: 50%; filter: blur(100px);
          width: 480px; height: 480px; bottom: -140px; right: -110px;
          background: radial-gradient(circle, rgba(100,70,200,0.16) 0%, transparent 70%);
          animation: mdPulse 13s ease-in-out infinite alternate-reverse;
        }
        @keyframes mdPulse {
          from { transform: scale(1); opacity: 0.6; }
          to { transform: scale(1.2) translate(18px, -18px); opacity: 0.9; }
        }
        @keyframes mdSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .md-content {
          position: relative; z-index: 1;
          padding: 24px 24px 48px;
          max-width: 1400px; margin: 0 auto;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .md-content.mounted { opacity: 1; transform: translateY(0); }

        /* MOOD BAR */
        .md-mood-bar {
          background: rgba(22, 28, 52, 0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(155, 109, 255, 0.14);
          border-radius: 16px; padding: 16px 22px;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
        }

        .md-mood-label {
          font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(200, 185, 230, 0.6); white-space: nowrap; flex-shrink: 0;
        }

        .md-mood-pills { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }

        .md-mood-pill {
          padding: 7px 14px; border-radius: 30px;
          border: 1.5px solid rgba(155, 109, 255, 0.14);
          background: rgba(155, 109, 255, 0.06);
          color: rgba(200, 185, 230, 0.7);
          font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.5px;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .md-mood-pill:hover {
          border-color: rgba(155, 109, 255, 0.35);
          color: #e8e4f8;
          background: rgba(155, 109, 255, 0.12);
        }
        .md-mood-pill.active {
          border-color: var(--md-mood);
          color: #f0eef8;
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 0 14px var(--md-glow);
        }
        .md-mood-pill-emoji { font-size: 14px; }

        .md-lang-tags { display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }
        .md-lang-tag {
          font-size: 10px; letter-spacing: 1px;
          color: rgba(175, 140, 255, 0.9);
          background: rgba(155, 109, 255, 0.12);
          border: 1px solid rgba(155, 109, 255, 0.22);
          border-radius: 4px; padding: 3px 9px; white-space: nowrap;
        }

        /* MAIN GRID — left wider for capture, right narrower for recommendations */
        .md-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        @media (max-width: 900px) { .md-grid { grid-template-columns: 1fr; } }

        .md-col { display: flex; flex-direction: column; gap: 14px; }

        /* PANEL */
        .md-panel {
          background: rgba(22, 28, 52, 0.82);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(155, 109, 255, 0.13);
          border-radius: 18px; overflow: hidden;
        }

        .md-panel-header {
          padding: 18px 22px 0;
          display: flex; align-items: center; justify-content: space-between;
        }

        .md-panel-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; font-weight: 400;
          color: #e8e4f8; letter-spacing: 0.5px;
        }

        .md-panel-body { padding: 16px 22px 22px; }

        /* WEBCAM */
        .md-capture-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .md-capture-btn {
          padding: 36px 14px; border-radius: 14px;
          border: 1.5px dashed rgba(155, 109, 255, 0.2);
          background: rgba(155, 109, 255, 0.05);
          color: rgba(200, 185, 230, 0.7);
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; text-align: center;
          transition: all 0.2s; display: flex;
          flex-direction: column; align-items: center; gap: 10px;
        }
        .md-capture-btn:hover {
          border-color: rgba(155, 109, 255, 0.5);
          background: rgba(155, 109, 255, 0.1);
          color: rgba(180, 148, 255, 0.95);
        }

        .md-capture-icon {
          width: 42px; height: 42px; border-radius: 50%;
          background: rgba(155, 109, 255, 0.12);
          border: 1px solid rgba(155, 109, 255, 0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .md-live-wrap {
          position: relative; border-radius: 14px; overflow: hidden;
          background: #0d1020; margin-bottom: 14px;
          border: 1.5px solid rgba(155, 109, 255, 0.3);
          box-shadow: 0 0 28px var(--md-glow);
          aspect-ratio: 4/3;
        }

        .md-live-badge {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          display: flex; align-items: center; gap: 5px;
          background: rgba(210, 50, 50, 0.9);
          border-radius: 20px; padding: 4px 10px;
          font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
          color: #fff; font-weight: 500;
        }

        .md-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #fff;
          animation: liveBlink 1.2s ease-in-out infinite;
        }
        @keyframes liveBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .md-live-actions { display: flex; gap: 10px; }

        .md-btn-analyze {
          flex: 1; padding: 12px;
          background: linear-gradient(135deg, #7c4dff 0%, #c060d0 100%);
          border: none; border-radius: 10px;
          color: #fff; font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 6px 20px rgba(124, 77, 255, 0.25);
        }
        .md-btn-analyze:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124, 77, 255, 0.35); }
        .md-btn-analyze:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .md-btn-stop {
          flex: 1; padding: 12px;
          background: rgba(220, 60, 60, 0.1);
          border: 1.5px solid rgba(220, 70, 70, 0.3);
          border-radius: 10px; color: rgba(240, 110, 110, 0.9);
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .md-btn-stop:hover { background: rgba(220, 60, 60, 0.18); color: rgba(250, 130, 130, 1); }

        /* EMOTION DISPLAY */
        .md-emotion-display {
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 22px; text-align: center; gap: 8px;
        }

        .md-emotion-eyebrow {
          font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(200, 185, 230, 0.45);
        }

        .md-emotion-emoji { font-size: 48px; line-height: 1; }

        .md-emotion-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 300;
          color: #e8e4f8; letter-spacing: 2px;
          transition: color 0.6s ease;
        }

        .md-emotion-source {
          font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(155, 109, 255, 0.7);
          display: flex; align-items: center; gap: 6px;
        }

        .md-emotion-source-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(155, 109, 255, 0.6);
        }

        .md-confidence-bar-wrap {
          width: 100%; max-width: 190px;
          background: rgba(155, 109, 255, 0.1);
          border-radius: 4px; height: 4px; overflow: hidden;
          margin: 4px 0;
        }

        .md-confidence-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c4dff, #c060d0);
          border-radius: 4px; transition: width 0.6s ease;
        }

        .md-confidence-value {
          font-size: 12px; color: rgba(175, 145, 255, 0.85); letter-spacing: 1px;
        }

        .md-emotion-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px; font-style: italic;
          color: rgba(200, 185, 230, 0.5);
          max-width: 240px; line-height: 1.6; margin-top: 4px;
        }

        .md-btn-clear {
          margin-top: 6px; padding: 9px 20px;
          background: rgba(155, 109, 255, 0.07);
          border: 1px solid rgba(155, 109, 255, 0.18);
          border-radius: 8px;
          color: rgba(200, 185, 230, 0.65);
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .md-btn-clear:hover { border-color: rgba(220, 70, 70, 0.4); color: rgba(240, 110, 110, 0.8); background: rgba(220, 60, 60, 0.08); }

        /* SONG LIST */
        .md-list-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }

        .md-list-meta {
          font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(200, 185, 230, 0.45);
        }

        .md-refresh-btn {
          padding: 7px 13px;
          background: rgba(155, 109, 255, 0.08);
          border: 1px solid rgba(155, 109, 255, 0.2);
          border-radius: 8px;
          color: rgba(175, 145, 255, 0.85);
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .md-refresh-btn:hover:not(:disabled) { background: rgba(155, 109, 255, 0.15); border-color: rgba(155, 109, 255, 0.4); color: #c8a8ff; }
        .md-refresh-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .md-track-list { display: flex; flex-direction: column; gap: 5px; }

        .md-track-row {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 13px; border-radius: 10px; cursor: pointer;
          border: 1px solid transparent;
          background: rgba(155, 109, 255, 0.04);
          transition: all 0.2s ease;
        }
        .md-track-row:hover { background: rgba(155, 109, 255, 0.1); border-color: rgba(155, 109, 255, 0.15); }
        .md-track-row.active {
          background: rgba(155, 109, 255, 0.13);
          border-color: rgba(155, 109, 255, 0.32);
          box-shadow: 0 0 16px rgba(124, 77, 255, 0.1);
        }

        .md-track-thumb {
          width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
          background: rgba(155, 109, 255, 0.1);
          border: 1px solid rgba(155, 109, 255, 0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; overflow: hidden;
        }
        .md-track-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .md-track-info { flex: 1; min-width: 0; }
        .md-track-row-title { font-size: 13px; color: #dcd8f0; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.2px; }
        .md-track-row-artist { font-size: 11px; color: rgba(200, 185, 230, 0.55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .md-fav-btn {
          background: none; border: none; cursor: pointer;
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s; flex-shrink: 0;
          font-size: 14px; color: rgba(200, 185, 230, 0.35);
        }
        .md-fav-btn:hover { transform: scale(1.2); color: rgba(200, 80, 100, 0.7); }
        .md-fav-btn.saved { color: #e06070; }

        /* SHIMMER */
        .md-shimmer {
          height: 62px; border-radius: 10px;
          background: linear-gradient(90deg, rgba(155,109,255,0.04) 25%, rgba(155,109,255,0.08) 50%, rgba(155,109,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* EMPTY */
        .md-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; padding: 48px 20px;
        }
        .md-empty-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(155, 109, 255, 0.08);
          border: 1px solid rgba(155, 109, 255, 0.15);
          display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .md-empty-text { font-size: 12px; color: rgba(200, 185, 230, 0.45); letter-spacing: 0.5px; text-align: center; line-height: 1.7; }

        /* NOW PLAYING */
        .md-now-playing-meta {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          background: rgba(155, 109, 255, 0.07);
          border: 1px solid rgba(155, 109, 255, 0.14);
          border-radius: 12px; margin-bottom: 12px;
        }
        .md-now-playing-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
        .md-now-playing-info { flex: 1; min-width: 0; }
        .md-now-playing-title { font-size: 14px; color: #e0dcf4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; letter-spacing: 0.2px; }
        .md-now-playing-artist { font-size: 12px; color: rgba(200, 185, 230, 0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .md-iframe-wrap { border-radius: 12px; overflow: hidden; border: 1px solid rgba(155, 109, 255, 0.12); }

        .md-yt-link {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 13px;
          background: rgba(230, 60, 60, 0.1);
          border: 1px solid rgba(230, 70, 70, 0.25);
          border-radius: 8px;
          color: rgba(245, 100, 100, 0.9); text-decoration: none;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1.5px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .md-yt-link:hover { background: rgba(230, 60, 60, 0.18); color: rgba(255, 120, 120, 1); }

        .md-inline-badge {
          font-size: 10px; letter-spacing: 1px;
          color: rgba(175, 145, 255, 0.9);
          background: rgba(155, 109, 255, 0.12);
          border: 1px solid rgba(155, 109, 255, 0.22);
          border-radius: 4px; padding: 3px 8px;
          white-space: nowrap; flex-shrink: 0;
        }
      `}</style>

      <div className="md-page">
        <div className="md-ambient">
          <div className="md-orb-1" />
          <div className="md-orb-2" />
        </div>

        <div className={`md-content ${mounted ? "mounted" : ""}`}>
          {/* MOOD BAR */}
          <div className="md-mood-bar">
            <span className="md-mood-label">Mood</span>
            <div className="md-mood-pills">
              {emotions.map((e) => (
                <button
                  key={e.name}
                  className={`md-mood-pill ${selectedEmotion === e.name ? "active" : ""}`}
                  onClick={() => handleSelectEmotion(e.name)}
                  style={selectedEmotion === e.name ? { "--md-mood": e.color, "--md-glow": e.glow } : {}}
                >
                  <span className="md-mood-pill-emoji">{e.emoji}</span>
                  {e.name}
                </button>
              ))}
            </div>
            {userLanguages.length > 0 && (
              <div className="md-lang-tags">
                {userLanguages.map((l) => (
                  <span key={l} className="md-lang-tag">{l}</span>
                ))}
              </div>
            )}
          </div>

          {/* GRID */}
          <div className="md-grid">
            {/* LEFT */}
            <div className="md-col">
              <div className="md-panel">
                <div className="md-panel-header">
                  <span className="md-panel-title">Detect Emotion</span>
                </div>
                <div className="md-panel-body">
                  {isStreaming ? (
                    <>
                      <div className="md-live-wrap">
                        {analyzedImageSrc ? (
                          <img src={analyzedImageSrc} alt="Analyzed" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        ) : (
                          <video
                            ref={videoRef}
                            style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:"block" }}
                            autoPlay playsInline muted
                          />
                        )}
                        <div className="md-live-badge">
                          <div className="md-live-dot" /> Live
                        </div>
                      </div>
                      <div className="md-live-actions">
                        <button className="md-btn-analyze" onClick={handleWebcamClick} disabled={isAnalyzing}>
                          {isAnalyzing ? "Analyzing..." : "Analyze"}
                        </button>
                        <button className="md-btn-stop" onClick={handleStopWebcam}>Stop</button>
                      </div>
                    </>
                  ) : (
                    <div className="md-capture-grid">
                      <button className="md-capture-btn" onClick={handleWebcamClick}>
                        <div className="md-capture-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                        </div>
                        Live Scan
                      </button>
                      <label className="md-capture-btn">
                        <div className="md-capture-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        Upload Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display:"none" }} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="md-panel">
                <div className="md-emotion-display">
                  <span className="md-emotion-eyebrow">Current mood</span>
                  <div className="md-emotion-emoji">{emotionEmojis[selectedEmotion]}</div>
                  <div className="md-emotion-name">{selectedEmotion}</div>

                  {predictedEmotion && confidenceScore !== null && (
                    <>
                      <div className="md-confidence-bar-wrap">
                        <div className="md-confidence-bar-fill" style={{ width: `${(confidenceScore * 100).toFixed(0)}%` }} />
                      </div>
                      <span className="md-confidence-value">{(confidenceScore * 100).toFixed(1)}% confidence</span>
                    </>
                  )}

                  <div className="md-emotion-source">
                    <div className="md-emotion-source-dot" />
                    {predictedEmotion ? `Detected via ${detectionMethod}` : "Manually selected"}
                  </div>

                  <p className="md-emotion-quote">
                    "Your smile is the rhythm — let the music be the melody."
                  </p>

                  <button className="md-btn-clear" onClick={handleClearMood}>Clear mood</button>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="md-col">
              <div className="md-panel">
                <div className="md-panel-header">
                  <span className="md-panel-title">Recommendations</span>
                  <button
                    className="md-refresh-btn"
                    onClick={handleRefreshSongs}
                    disabled={isRefreshing || isLoadingRecs}
                  >
                    <FiRefreshCw
                      size={10}
                      style={{ animation: (isRefreshing || isLoadingRecs) ? "mdSpin 1s linear infinite" : "none" }}
                    />
                    {isRefreshing || isLoadingRecs ? "Loading" : "Refresh"}
                  </button>
                </div>
                <div className="md-panel-body">
                  <div className="md-list-header">
                    <span className="md-list-meta">
                      {recommendations.length > 0
                        ? `${recommendations.slice(0, 6).length} tracks for ${selectedEmotion.toLowerCase()}`
                        : "Select a mood to load tracks"}
                    </span>
                  </div>

                  {isLoadingRecs ? (
                    <div className="md-track-list">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="md-shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="md-empty">
                      <div className="md-empty-icon">♪</div>
                      <p className="md-empty-text">
                        Select a mood above or scan your face<br />to discover music
                      </p>
                    </div>
                  ) : (
                    <div className="md-track-list">
                      {recommendations.slice(0, 6).map((track, idx) => (
                        <div
                          key={`${track.id}-${idx}`}
                          className={`md-track-row ${selectedTrack?.id === track.id ? "active" : ""}`}
                          onClick={() => setSelectedTrack(track)}
                        >
                          <div className="md-track-thumb">
                            {track.image_url ? <img src={track.image_url} alt={track.title} /> : "♪"}
                          </div>
                          <div className="md-track-info">
                            <div className="md-track-row-title">{track.title}</div>
                            <div className="md-track-row-artist">{track.artist}</div>
                          </div>
                          {track.language && <span className="md-inline-badge">{track.language}</span>}
                          <button
                            className={`md-fav-btn ${isFavorite(track.id) ? "saved" : ""}`}
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(track); }}
                          >
                            <FiHeart size={14} fill={isFavorite(track.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedTrack && <YouTubePlayer track={selectedTrack} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
