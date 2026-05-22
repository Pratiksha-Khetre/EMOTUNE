// src/components/SpotifyPlayer.jsx
import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://emo-backend-6.onrender.com";

console.log("🔧 SpotifyPlayer Mode:", import.meta.env.MODE);
console.log("🌐 SpotifyPlayer API:", API_BASE_URL);

const languageFlags = {
  Hindi: "IN",
  English: "GB",
  Marathi: "IN",
  Telugu: "IN",
  Tamil: "IN",
  Gujarati: "IN",
  Urdu: "PK",
  Kannada: "IN",
  Bengali: "BD",
  Malayalam: "IN",
};

const emotions = [
  { name: "Angry", emoji: "😠", color: "#e05050", glow: "rgba(220,60,60,0.3)" },
  {
    name: "Disgust",
    emoji: "🤢",
    color: "#60a050",
    glow: "rgba(80,160,60,0.3)",
  },
  { name: "Fear", emoji: "😨", color: "#6070c0", glow: "rgba(80,90,200,0.3)" },
  {
    name: "Happy",
    emoji: "😊",
    color: "#d4a030",
    glow: "rgba(212,160,40,0.3)",
  },
  {
    name: "Neutral",
    emoji: "😐",
    color: "#8080a0",
    glow: "rgba(100,100,140,0.3)",
  },
  { name: "Sad", emoji: "😢", color: "#5090c0", glow: "rgba(60,120,200,0.3)" },
  {
    name: "Surprise",
    emoji: "😮",
    color: "#c060d0",
    glow: "rgba(180,80,200,0.3)",
  },
];

const getEmotionMeta = (name) =>
  emotions.find((e) => e.name === name) || emotions[4];

const SpotifyPlayer = () => {
  const [selectedEmotion, setSelectedEmotion] = useState("Happy");
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedTracks, setSavedTracks] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [displayLanguages, setDisplayLanguages] = useState([]);

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
    setDisplayLanguages(langs);
    doFetch("Happy", 0, langs);
  }, []);

  const doFetch = async (emotion, offset, languagesToUse) => {
    setLoading(true);
    try {
      const langString = languagesToUse.join(",");
      const url = `${API_BASE_URL}/get_recommendations/?emotion=${emotion}&languages=${langString}&offset=${offset}`;
      const response = await fetch(url);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      if (data.recommendations?.length > 0)
        setSelectedTrack(data.recommendations[0]);
    } catch (err) {
      console.error("[ERROR]", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
    setCurrentOffset(0);
    setSelectedTrack(null);
    doFetch(emotion, 0, getLanguages());
  };

  const handleRefresh = () => {
    const newOffset = currentOffset + 10;
    setCurrentOffset(newOffset);
    doFetch(selectedEmotion, newOffset, getLanguages());
  };

  const handleSave = (trackId) => {
    setSavedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId],
    );
  };

  const currentMood = getEmotionMeta(selectedEmotion);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap');

        :root {
          --mood-color: ${currentMood.color};
          --mood-glow: ${currentMood.glow};
        }

        .sp-page {
          min-height: calc(100vh - 70px);
          background: #080810;
          font-family: 'DM Mono', monospace;
          color: #f0eef8;
          position: relative;
          overflow: hidden;
        }

        .sp-ambient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          transition: all 1.2s ease;
        }

        .sp-ambient-orb-1 {
          position: absolute;
          width: 700px; height: 700px;
          top: -250px; left: -200px;
          border-radius: 50%;
          filter: blur(100px);
          background: radial-gradient(circle, var(--mood-glow) 0%, transparent 70%);
          animation: ambientPulse 10s ease-in-out infinite alternate;
          transition: background 1.2s ease;
        }

        .sp-ambient-orb-2 {
          position: absolute;
          width: 500px; height: 500px;
          bottom: -150px; right: -100px;
          border-radius: 50%;
          filter: blur(80px);
          background: radial-gradient(circle, rgba(99,60,180,0.2) 0%, transparent 70%);
          animation: ambientPulse 12s ease-in-out infinite alternate-reverse;
        }

        @keyframes ambientPulse {
          from { transform: scale(1); opacity: 0.7; }
          to { transform: scale(1.2) translate(20px, -20px); opacity: 1; }
        }

        .sp-noise { position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; opacity: 0.35; z-index: 0; }

        .sp-content {
          position: relative;
          z-index: 1;
          padding: 28px 28px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* MOOD BAR */
        .sp-mood-bar {
          background: rgba(12,12,24,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .sp-mood-label {
          font-size: 10px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(180,170,210,0.45);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .sp-mood-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex: 1;
        }

        .sp-mood-pill {
          padding: 8px 16px;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: rgba(180,170,210,0.6);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .sp-mood-pill:hover {
          border-color: rgba(255,255,255,0.15);
          color: rgba(240,238,248,0.85);
          background: rgba(255,255,255,0.06);
        }

        .sp-mood-pill.active {
          background: rgba(255,255,255,0.06);
          border-color: var(--mood-color);
          color: #f0eef8;
          box-shadow: 0 0 16px var(--mood-glow), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .sp-mood-pill-emoji { font-size: 14px; }

        .sp-lang-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .sp-lang-tag {
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(155,109,255,0.6);
          background: rgba(155,109,255,0.08);
          border: 1px solid rgba(155,109,255,0.15);
          border-radius: 4px;
          padding: 3px 8px;
          white-space: nowrap;
        }

        /* MAIN GRID */
        .sp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 900px) { .sp-grid { grid-template-columns: 1fr; } }

        .sp-panel {
          background: rgba(12,12,24,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .sp-panel-header {
          padding: 20px 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sp-panel-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 400;
          color: #f0eef8;
          letter-spacing: 0.5px;
        }

        .sp-panel-body { padding: 20px 24px 24px; flex: 1; overflow: hidden; display: flex; flex-direction: column; }

        /* PLAYER */
        .sp-iframe-wrap {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.3);
        }

        .sp-track-meta {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px 18px;
        }

        .sp-track-title {
          font-size: 15px;
          font-weight: 500;
          color: #f0eef8;
          margin-bottom: 4px;
          letter-spacing: 0.2px;
        }

        .sp-track-artist {
          font-size: 12px;
          color: rgba(180,170,210,0.55);
          margin-bottom: 10px;
        }

        .sp-track-lang {
          display: inline-block;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(155,109,255,0.7);
          background: rgba(155,109,255,0.08);
          border: 1px solid rgba(155,109,255,0.15);
          border-radius: 4px;
          padding: 3px 8px;
          margin-bottom: 14px;
        }

        .sp-spotify-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(30,215,96,0.1);
          border: 1px solid rgba(30,215,96,0.25);
          border-radius: 6px;
          color: #1ed760;
          text-decoration: none;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition: background 0.2s, transform 0.2s;
        }

        .sp-spotify-btn:hover { background: rgba(30,215,96,0.18); transform: translateY(-1px); }

        .sp-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px 20px;
        }

        .sp-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(155,109,255,0.08);
          border: 1px solid rgba(155,109,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .sp-empty-text {
          font-size: 12px;
          color: rgba(180,170,210,0.4);
          letter-spacing: 1px;
          text-align: center;
        }

        /* TRACK LIST */
        .sp-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .sp-list-count {
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(180,170,210,0.35);
        }

        .sp-refresh-btn {
          padding: 7px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: rgba(180,170,210,0.7);
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sp-refresh-btn:hover:not(:disabled) {
          background: rgba(155,109,255,0.1);
          border-color: rgba(155,109,255,0.3);
          color: rgba(155,109,255,0.9);
        }

        .sp-refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .sp-track-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
          flex: 1;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: rgba(155,109,255,0.2) transparent;
        }

        .sp-track-list::-webkit-scrollbar { width: 3px; }
        .sp-track-list::-webkit-scrollbar-track { background: transparent; }
        .sp-track-list::-webkit-scrollbar-thumb { background: rgba(155,109,255,0.2); border-radius: 2px; }

        .sp-track-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.02);
        }

        .sp-track-row:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.06);
        }

        .sp-track-row.active {
          background: rgba(155,109,255,0.1);
          border-color: rgba(155,109,255,0.25);
          box-shadow: 0 0 20px rgba(124,77,255,0.1);
        }

        .sp-track-num {
          font-size: 11px;
          color: rgba(180,170,210,0.3);
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .sp-track-row.active .sp-track-num {
          color: var(--mood-color);
        }

        .sp-track-info { flex: 1; min-width: 0; }

        .sp-track-row-title {
          font-size: 13px;
          font-weight: 500;
          color: #f0eef8;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.2px;
        }

        .sp-track-row-artist {
          font-size: 11px;
          color: rgba(180,170,210,0.45);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sp-track-row-lang {
          font-size: 10px;
          color: rgba(155,109,255,0.5);
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .sp-save-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        .sp-save-btn:hover { transform: scale(1.2); }

        .sp-list-footer {
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.04);
          margin-top: 12px;
        }

        .sp-list-footer-text {
          font-size: 10px;
          color: rgba(180,170,210,0.3);
          letter-spacing: 1px;
          text-align: center;
        }

        .sp-loading-track {
          height: 58px;
          border-radius: 10px;
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="sp-page">
        <div className="sp-ambient">
          <div className="sp-ambient-orb-1" />
          <div className="sp-ambient-orb-2" />
        </div>
        <div className="sp-noise" />

        <div className="sp-content">
          {/* MOOD BAR */}
          <div className="sp-mood-bar">
            <span className="sp-mood-label">Mood</span>
            <div className="sp-mood-pills">
              {emotions.map((e) => (
                <button
                  key={e.name}
                  className={`sp-mood-pill ${selectedEmotion === e.name ? "active" : ""}`}
                  onClick={() => handleEmotionClick(e.name)}
                  style={
                    selectedEmotion === e.name
                      ? { "--mood-color": e.color, "--mood-glow": e.glow }
                      : {}
                  }
                >
                  <span className="sp-mood-pill-emoji">{e.emoji}</span>
                  {e.name}
                </button>
              ))}
            </div>
            <div className="sp-lang-tags">
              {displayLanguages.map((l) => (
                <span key={l} className="sp-lang-tag">
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* GRID */}
          <div className="sp-grid">
            {/* PLAYER PANEL */}
            <div className="sp-panel">
              <div className="sp-panel-header">
                <span className="sp-panel-title">Now Playing</span>
                {selectedTrack && (
                  <span style={{ fontSize: "20px" }}>{currentMood.emoji}</span>
                )}
              </div>
              <div className="sp-panel-body">
                {selectedTrack ? (
                  <>
                    <div className="sp-iframe-wrap">
                      <iframe
                        style={{
                          width: "100%",
                          height: "360px",
                          border: "none",
                          display: "block",
                        }}
                        src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                    <div className="sp-track-meta">
                      <div className="sp-track-title">
                        {selectedTrack.title}
                      </div>
                      <div className="sp-track-artist">
                        {selectedTrack.artist}
                      </div>
                      {selectedTrack.language && (
                        <div className="sp-track-lang">
                          {selectedTrack.language}
                        </div>
                      )}
                      <a
                        href={selectedTrack.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sp-spotify-btn"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="#1ed760"
                        >
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Open on Spotify
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="sp-empty-state">
                    <div className="sp-empty-icon">{loading ? "⏳" : "♪"}</div>
                    <p className="sp-empty-text">
                      {loading
                        ? "Fetching tracks..."
                        : "Select a song to begin"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RECOMMENDATIONS PANEL */}
            <div className="sp-panel">
              <div className="sp-panel-header">
                <span className="sp-panel-title">Recommendations</span>
                <button
                  className="sp-refresh-btn"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? (
                    "Loading"
                  ) : (
                    <>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M23 4v6h-6M1 20v-6h6" />
                        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
              </div>
              <div className="sp-panel-body">
                <div className="sp-list-header">
                  <span className="sp-list-count">
                    {recommendations.length > 0
                      ? `${currentOffset + 1}–${currentOffset + Math.min(10, recommendations.length)}`
                      : "No tracks"}
                  </span>
                </div>

                {loading ? (
                  <div className="sp-track-list">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="sp-loading-track"
                        style={{ animationDelay: `${i * 0.08}s` }}
                      />
                    ))}
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="sp-empty-state">
                    <div className="sp-empty-icon">∅</div>
                    <p className="sp-empty-text">
                      No songs found for this mood
                    </p>
                  </div>
                ) : (
                  <div className="sp-track-list">
                    {recommendations.slice(0, 10).map((track, idx) => (
                      <div
                        key={`${track.id}-${idx}`}
                        className={`sp-track-row ${selectedTrack?.id === track.id ? "active" : ""}`}
                        onClick={() => setSelectedTrack(track)}
                      >
                        <span className="sp-track-num">
                          {currentOffset + idx + 1}
                        </span>
                        <div className="sp-track-info">
                          <div className="sp-track-row-title">
                            {track.title}
                          </div>
                          <div className="sp-track-row-artist">
                            {track.artist}
                          </div>
                        </div>
                        {track.language && (
                          <span className="sp-track-row-lang">
                            {track.language}
                          </span>
                        )}
                        <button
                          className="sp-save-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(track.id);
                          }}
                        >
                          {savedTracks.includes(track.id) ? "♥" : "♡"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="sp-list-footer">
                  <p className="sp-list-footer-text">
                    Curated for your {selectedEmotion.toLowerCase()} mood
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpotifyPlayer;
