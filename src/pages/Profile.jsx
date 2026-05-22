// src/pages/Profile.jsx
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "/src/utils/firebaseConfig.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserProfileData, resetStats } from "../utils/statsTracker";
import { getCurrentUser, logoutUser, onAuthChange } from "../utils/authService";
import {
  FiTrendingUp, FiMusic, FiHeart, FiActivity, FiPlay, FiTrash2,
} from "react-icons/fi";

const allLanguages = [
  "Hindi","English","Marathi","Telugu","Tamil",
  "Gujarati","Urdu","Kannada","Bengali","Malayalam",
];

const emotionEmojis = {
  Angry:"😠", Disgust:"🤢", Fear:"😨", Happy:"😊",
  Neutral:"😐", Sad:"😢", Surprise:"😮",
};

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "loading@emotune.com",
    memberSince: "N/A",
    profilePic: null,
    selectedLanguages: [],
    stats: {
      totalScans: 0, songsPlayed: 0, mostDetectedEmotion: "Neutral",
      emotionCounts: {}, favoriteSongs: [], recentEmotions: [],
    },
    settings: { autoPlay: true, defaultEmotion: "Neutral" },
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({
          name: data.name || "User",
          email: data.email || currentUser.email,
          memberSince: data.memberSince || "N/A",
          profilePic: data.profilePic || null,
          selectedLanguages: data.selectedLanguages || [],
          stats: data.stats || { totalScans:0, songsPlayed:0, mostDetectedEmotion:"Neutral", emotionCounts:{}, favoriteSongs:[], recentEmotions:[] },
          settings: data.settings || { autoPlay:true, defaultEmotion:"Neutral" },
        });
      } else {
        updateUserProfileData({
          name: currentUser.displayName || "New User",
          email: currentUser.email,
          memberSince: new Date().toLocaleDateString("en-US", { year:"numeric", month:"long" }),
          selectedLanguages: [],
          stats: { totalScans:0, songsPlayed:0, mostDetectedEmotion:"Neutral", emotionCounts:{}, favoriteSongs:[], recentEmotions:[] },
          settings: { autoPlay:true, defaultEmotion:"Neutral" },
        });
      }
    }, (error) => console.error("Firestore error:", error));
    return () => unsubscribe();
  }, [currentUser, navigate]);

  const { name, email, memberSince, profilePic, selectedLanguages, stats, settings } = userData;

  const handleLanguageToggle = (lang) => {
    const newLangs = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : selectedLanguages.length < 5 ? [...selectedLanguages, lang] : selectedLanguages;
    setUserData((prev) => ({ ...prev, selectedLanguages: newLangs }));
  };

  const handleSaveLanguages = async () => {
    await updateUserProfileData({ selectedLanguages });
    setIsEditingLanguages(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => { await updateUserProfileData({ profilePic: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => { await updateUserProfileData({ name }); };

  const handleSettingToggle = async (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    await updateUserProfileData({ settings: newSettings });
  };

  const handleRemoveFavorite = async (songId) => {
    const updatedFavorites = stats.favoriteSongs.filter((s) => s.id !== songId);
    await updateUserProfileData({ stats: { ...stats, favoriteSongs: updatedFavorites } });
  };

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  const handleDeleteAccount = () => {
    if (window.confirm("Delete your account? This action cannot be undone.")) {
      logoutUser(); navigate("/login");
    }
  };

  const getTopEmotions = () =>
    Object.entries(stats.emotionCounts || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const tabs = [
    { id:"profile", label:"Profile", icon:"👤" },
    { id:"stats",   label:"Stats",   icon:"📊" },
    { id:"music",   label:"Music",   icon:"🎵" },
    { id:"settings",label:"Settings",icon:"⚙️" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap');

        .pf-page {
          min-height: calc(100vh - 66px);
          background: #111827;
          font-family: 'DM Mono', monospace;
          color: #e8e4f8;
          position: relative; overflow-x: hidden;
        }

        .pf-orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; animation: pfPulse 10s ease-in-out infinite alternate; z-index: 0; }
        .pf-orb-1 { width: 650px; height: 650px; top: -280px; left: -180px; background: radial-gradient(circle, rgba(100,70,200,0.18) 0%, transparent 70%); }
        .pf-orb-2 { width: 480px; height: 480px; bottom: -190px; right: -140px; background: radial-gradient(circle, rgba(190,70,140,0.14) 0%, transparent 70%); animation-delay: -5s; }
        @keyframes pfPulse { from { transform: scale(1); } to { transform: scale(1.15) translate(18px,-18px); } }

        .pf-content {
          position: relative; z-index: 1;
          max-width: 960px; margin: 0 auto;
          padding: 40px 28px 60px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .pf-content.mounted { opacity: 1; transform: translateY(0); }

        .pf-header { margin-bottom: 36px; }
        .pf-header-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(155,109,255,0.75); margin-bottom: 8px; display: block; }
        .pf-header-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #e8e4f8; letter-spacing: 1px; margin: 0; }

        .pf-tabs {
          display: flex; gap: 4px;
          background: rgba(22,28,52,0.7);
          border: 1px solid rgba(155,109,255,0.12);
          border-radius: 12px; padding: 4px;
          margin-bottom: 28px; width: fit-content;
        }

        .pf-tab {
          padding: 9px 20px; border-radius: 9px;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; border: none; background: none;
          color: rgba(200,185,230,0.55);
          font-family: 'DM Mono', monospace; transition: all 0.2s;
          display: flex; align-items: center; gap: 7px;
        }

        .pf-tab:hover { color: rgba(232,228,248,0.8); }
        .pf-tab.active {
          background: rgba(155,109,255,0.15);
          color: rgba(175,145,255,0.95);
          box-shadow: 0 0 0 1px rgba(155,109,255,0.25);
        }

        .pf-card {
          background: rgba(22,28,52,0.82);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(155,109,255,0.12);
          border-radius: 18px; overflow: hidden;
        }
        .pf-card + .pf-card { margin-top: 14px; }

        .pf-card-header {
          padding: 20px 24px 0;
          display: flex; align-items: center; justify-content: space-between;
        }

        .pf-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 400;
          color: #e8e4f8; letter-spacing: 0.5px;
        }

        .pf-card-body { padding: 18px 24px 24px; }

        .pf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 700px) { .pf-grid-2 { grid-template-columns: 1fr; } }

        .pf-avatar-section {
          display: flex; align-items: center; gap: 22px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(155,109,255,0.1);
        }

        .pf-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          border: 1.5px solid rgba(155,109,255,0.35);
          background: rgba(155,109,255,0.12);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex-shrink: 0; font-size: 24px;
          box-shadow: 0 0 20px rgba(155,109,255,0.12);
        }
        .pf-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .pf-avatar-meta { flex: 1; min-width: 0; }
        .pf-avatar-name { font-size: 18px; font-weight: 500; color: #e8e4f8; margin-bottom: 4px; letter-spacing: 0.3px; }
        .pf-avatar-since { font-size: 11px; color: rgba(155,109,255,0.75); letter-spacing: 1px; }

        .pf-avatar-change-btn {
          padding: 8px 14px;
          background: rgba(155,109,255,0.1);
          border: 1px solid rgba(155,109,255,0.22);
          border-radius: 8px; color: rgba(175,145,255,0.9);
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1px; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
        }
        .pf-avatar-change-btn:hover { background: rgba(155,109,255,0.18); border-color: rgba(155,109,255,0.4); color: #c8a8ff; }

        .pf-field { margin-bottom: 14px; }
        .pf-label { display: block; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(200,185,230,0.5); margin-bottom: 8px; }

        .pf-input {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(155,109,255,0.16);
          border-radius: 10px; color: #e8e4f8;
          font-family: 'DM Mono', monospace; font-size: 13px;
          box-sizing: border-box; outline: none;
          transition: border-color 0.2s, background 0.2s; letter-spacing: 0.3px;
        }
        .pf-input:focus { border-color: rgba(155,109,255,0.45); background: rgba(155,109,255,0.06); }
        .pf-input:disabled { opacity: 0.4; cursor: not-allowed; }

        .pf-select {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(155,109,255,0.2);
          border-radius: 10px; color: #e8e4f8;
          font-family: 'DM Mono', monospace; font-size: 13px;
          box-sizing: border-box; outline: none; cursor: pointer;
        }
        .pf-select option { background: #161c34; }

        .pf-btn-primary {
          padding: 12px 22px;
          background: linear-gradient(135deg, #7c4dff 0%, #c060d0 100%);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'DM Mono', monospace; font-size: 11px;
          font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 6px 20px rgba(124,77,255,0.25);
        }
        .pf-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,77,255,0.35); }

        .pf-btn-secondary {
          padding: 12px 22px;
          background: rgba(155,109,255,0.08);
          border: 1px solid rgba(155,109,255,0.2);
          border-radius: 10px; color: rgba(175,145,255,0.9);
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .pf-btn-secondary:hover { background: rgba(155,109,255,0.15); border-color: rgba(155,109,255,0.35); color: #c8a8ff; }

        .pf-btn-danger {
          padding: 12px 22px;
          background: rgba(220,60,60,0.1);
          border: 1px solid rgba(220,70,70,0.25);
          border-radius: 10px; color: rgba(240,110,110,0.85);
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .pf-btn-danger:hover { background: rgba(220,60,60,0.18); border-color: rgba(220,70,70,0.4); color: rgba(250,130,130,0.95); }

        .pf-stat-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 0; border-bottom: 1px solid rgba(155,109,255,0.08);
        }
        .pf-stat-row:last-of-type { border-bottom: none; }

        .pf-stat-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: rgba(200,185,230,0.7); letter-spacing: 0.5px;
        }

        .pf-stat-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(155,109,255,0.1);
          display: flex; align-items: center; justify-content: center; font-size: 14px;
          color: rgba(175,145,255,0.8);
        }

        .pf-stat-value { font-size: 22px; font-weight: 500; color: #e8e4f8; letter-spacing: -0.5px; }

        .pf-emotion-bar-row { margin-bottom: 12px; }
        .pf-emotion-bar-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .pf-emotion-bar-label { font-size: 12px; color: rgba(200,185,230,0.75); }
        .pf-emotion-bar-count { font-size: 12px; color: rgba(175,145,255,0.85); }
        .pf-emotion-bar-track { height: 4px; background: rgba(155,109,255,0.12); border-radius: 3px; overflow: hidden; }
        .pf-emotion-bar-fill { height: 100%; background: linear-gradient(90deg, #7c4dff, #c060d0); border-radius: 3px; transition: width 0.6s ease; }

        .pf-lang-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }

        .pf-lang-chip {
          padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid rgba(155,109,255,0.14);
          background: rgba(155,109,255,0.06);
          color: rgba(200,185,230,0.75);
          font-size: 12px; cursor: pointer; letter-spacing: 0.3px;
          transition: all 0.2s; text-align: center;
        }
        .pf-lang-chip:hover { border-color: rgba(155,109,255,0.35); color: #e8e4f8; background: rgba(155,109,255,0.1); }
        .pf-lang-chip.selected { border-color: rgba(155,109,255,0.6); background: rgba(155,109,255,0.14); color: rgba(175,145,255,0.95); }

        .pf-lang-display { font-size: 14px; color: rgba(175,145,255,0.9); line-height: 1.8; }
        .pf-lang-none { font-size: 12px; color: rgba(200,185,230,0.4); letter-spacing: 0.5px; }

        .pf-song-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid rgba(155,109,255,0.08);
        }
        .pf-song-row:last-child { border-bottom: none; }

        .pf-song-thumb {
          width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
          background: rgba(155,109,255,0.1); border: 1px solid rgba(155,109,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; overflow: hidden;
        }
        .pf-song-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .pf-song-info { flex: 1; min-width: 0; }
        .pf-song-title { font-size: 13px; color: #dcd8f0; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.2px; }
        .pf-song-artist { font-size: 11px; color: rgba(200,185,230,0.55); }

        .pf-song-actions { display: flex; gap: 6px; flex-shrink: 0; }

        .pf-song-btn {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(155,109,255,0.18);
          background: rgba(155,109,255,0.07);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(175,145,255,0.7); transition: all 0.2s; font-size: 12px;
        }
        .pf-song-btn:hover { background: rgba(155,109,255,0.15); border-color: rgba(155,109,255,0.35); color: #c8a8ff; }
        .pf-song-btn.remove:hover { background: rgba(220,60,60,0.12); border-color: rgba(220,70,70,0.3); color: rgba(240,110,110,0.85); }

        .pf-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 0; border-bottom: 1px solid rgba(155,109,255,0.08);
        }
        .pf-toggle-label { font-size: 13px; color: rgba(200,185,230,0.85); letter-spacing: 0.3px; }
        .pf-toggle-sub { font-size: 11px; color: rgba(200,185,230,0.4); margin-top: 2px; }

        .pf-toggle-switch {
          width: 44px; height: 24px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(155,109,255,0.15);
          cursor: pointer; position: relative;
          transition: background 0.3s, border-color 0.3s; flex-shrink: 0;
        }
        .pf-toggle-switch.on {
          background: rgba(124,77,255,0.28);
          border-color: rgba(124,77,255,0.45);
          box-shadow: 0 0 10px rgba(124,77,255,0.18);
        }
        .pf-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(200,185,230,0.45);
          transition: transform 0.3s, background 0.3s;
        }
        .pf-toggle-switch.on .pf-toggle-thumb {
          transform: translateX(20px);
          background: linear-gradient(135deg, #9b6dff, #e060c0);
        }

        .pf-actions-row { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 4px; }

        .pf-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 40px 20px; }
        .pf-empty-icon { font-size: 28px; opacity: 0.4; }
        .pf-empty-text { font-size: 12px; color: rgba(200,185,230,0.4); letter-spacing: 0.5px; }

        .pf-section-label {
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(200,185,230,0.4); margin-bottom: 14px;
          padding-bottom: 10px; border-bottom: 1px solid rgba(155,109,255,0.08);
        }

        .pf-inline-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; letter-spacing: 1px; color: rgba(175,145,255,0.9);
          background: rgba(155,109,255,0.1); border: 1px solid rgba(155,109,255,0.2);
          border-radius: 4px; padding: 3px 9px;
        }
      `}</style>

      <div className="pf-page">
        <div className="pf-orb pf-orb-1" />
        <div className="pf-orb pf-orb-2" />

        <div className={`pf-content ${mounted ? "mounted" : ""}`}>
          <div className="pf-header">
            <span className="pf-header-eyebrow">Account</span>
            <h1 className="pf-header-title">Your Profile</h1>
          </div>

          <div className="pf-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`pf-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="pf-card">
              <div className="pf-avatar-section">
                <div className="pf-avatar">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(155,109,255,0.55)" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div className="pf-avatar-meta">
                  <div className="pf-avatar-name">{name}</div>
                  <div className="pf-avatar-since">Member since {memberSince}</div>
                </div>
                <label className="pf-avatar-change-btn">
                  Change photo
                  <input type="file" accept="image/*" onChange={handleProfilePicChange} style={{ display:"none" }} />
                </label>
              </div>

              <div className="pf-card-body">
                <div className="pf-grid-2">
                  <div className="pf-field">
                    <label className="pf-label">Full name</label>
                    <input
                      className="pf-input" type="text" value={name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Email address</label>
                    <input className="pf-input" type="email" value={email} disabled />
                  </div>
                </div>
                <div className="pf-actions-row" style={{ marginTop:"8px" }}>
                  <button className="pf-btn-primary" onClick={handleSaveProfile}>Save changes</button>
                </div>
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === "stats" && (
            <>
              <div className="pf-card">
                <div className="pf-card-body">
                  <p className="pf-section-label">Overview</p>
                  <div className="pf-stat-row">
                    <div className="pf-stat-label">
                      <div className="pf-stat-icon"><FiActivity size={14} /></div>
                      Emotion scans
                    </div>
                    <div className="pf-stat-value">{stats.totalScans}</div>
                  </div>
                  <div className="pf-stat-row">
                    <div className="pf-stat-label">
                      <div className="pf-stat-icon"><FiMusic size={14} /></div>
                      Songs played
                    </div>
                    <div className="pf-stat-value">{stats.songsPlayed}</div>
                  </div>
                  <div className="pf-stat-row">
                    <div className="pf-stat-label">
                      <div className="pf-stat-icon"><FiTrendingUp size={14} /></div>
                      Most detected mood
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ fontSize:"22px" }}>{emotionEmojis[stats.mostDetectedEmotion]}</span>
                      <span className="pf-stat-value" style={{ fontSize:"16px" }}>{stats.mostDetectedEmotion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {getTopEmotions().length > 0 && (
                <div className="pf-card">
                  <div className="pf-card-body">
                    <p className="pf-section-label">Emotion breakdown</p>
                    {(() => {
                      const max = Math.max(...getTopEmotions().map(([, c]) => c));
                      return getTopEmotions().map(([emotion, count]) => (
                        <div key={emotion} className="pf-emotion-bar-row">
                          <div className="pf-emotion-bar-meta">
                            <span className="pf-emotion-bar-label">{emotionEmojis[emotion]} {emotion}</span>
                            <span className="pf-emotion-bar-count">{count}×</span>
                          </div>
                          <div className="pf-emotion-bar-track">
                            <div className="pf-emotion-bar-fill" style={{ width:`${(count / max) * 100}%` }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              <div className="pf-card">
                <div className="pf-card-body">
                  <p className="pf-section-label">Data management</p>
                  <button className="pf-btn-danger" onClick={resetStats}>Reset all statistics</button>
                </div>
              </div>
            </>
          )}

          {/* MUSIC TAB */}
          {activeTab === "music" && (
            <>
              <div className="pf-card">
                <div className="pf-card-header">
                  <span className="pf-card-title">Language preferences</span>
                  <button
                    className={isEditingLanguages ? "pf-btn-danger" : "pf-btn-secondary"}
                    style={{ padding:"7px 14px", fontSize:"10px" }}
                    onClick={() => setIsEditingLanguages((v) => !v)}
                  >
                    {isEditingLanguages ? "Cancel" : "Edit"}
                  </button>
                </div>
                <div className="pf-card-body">
                  {isEditingLanguages ? (
                    <>
                      <p style={{ fontSize:"12px", color:"rgba(200,185,230,0.5)", marginBottom:"16px", letterSpacing:"0.3px" }}>
                        Select up to 5 languages · {selectedLanguages.length}/5 selected
                      </p>
                      <div className="pf-lang-grid" style={{ marginBottom:"20px" }}>
                        {allLanguages.map((lang) => (
                          <div
                            key={lang}
                            className={`pf-lang-chip ${selectedLanguages.includes(lang) ? "selected" : ""}`}
                            onClick={() => handleLanguageToggle(lang)}
                          >
                            {lang} {selectedLanguages.includes(lang) && "✓"}
                          </div>
                        ))}
                      </div>
                      <div className="pf-actions-row">
                        <button className="pf-btn-primary" onClick={handleSaveLanguages}>Save languages</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="pf-label">Active languages ({selectedLanguages.length}/5)</p>
                      {selectedLanguages.length > 0 ? (
                        <div className="pf-lang-display">{selectedLanguages.join("  ·  ")}</div>
                      ) : (
                        <div className="pf-lang-none">No languages selected</div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-card-header">
                  <span className="pf-card-title">Saved songs</span>
                  <span className="pf-inline-badge">
                    <FiHeart size={10} /> {stats.favoriteSongs?.length || 0}
                  </span>
                </div>
                <div className="pf-card-body">
                  {stats.favoriteSongs && stats.favoriteSongs.length > 0 ? (
                    stats.favoriteSongs.map((song, idx) => (
                      <div key={idx} className="pf-song-row">
                        <div className="pf-song-thumb">
                          {song.image_url ? <img src={song.image_url} alt={song.title} /> : "♪"}
                        </div>
                        <div className="pf-song-info">
                          <div className="pf-song-title">{song.title}</div>
                          <div className="pf-song-artist">{song.artist}</div>
                        </div>
                        {song.language && <span className="pf-inline-badge">{song.language}</span>}
                        <div className="pf-song-actions">
                          <button className="pf-song-btn" onClick={() => setPlayingSongId(song.id)}>
                            <FiPlay size={11} />
                          </button>
                          <button className="pf-song-btn remove" onClick={() => handleRemoveFavorite(song.id)}>
                            <FiTrash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pf-empty">
                      <div className="pf-empty-icon">♡</div>
                      <p className="pf-empty-text">No saved songs yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <>
              <div className="pf-card">
                <div className="pf-card-body">
                  <p className="pf-section-label">Playback</p>

                  <div className="pf-toggle-row">
                    <div>
                      <div className="pf-toggle-label">Auto-play next song</div>
                      <div className="pf-toggle-sub">Automatically queue next recommendation</div>
                    </div>
                    <div
                      className={`pf-toggle-switch ${settings.autoPlay ? "on" : ""}`}
                      onClick={() => handleSettingToggle("autoPlay")}
                    >
                      <div className="pf-toggle-thumb" />
                    </div>
                  </div>

                  <div className="pf-toggle-row" style={{ borderBottom:"none" }}>
                    <div>
                      <div className="pf-toggle-label">Default emotion</div>
                      <div className="pf-toggle-sub">Fallback mood for recommendations</div>
                    </div>
                  </div>

                  <div className="pf-field" style={{ marginTop:"10px" }}>
                    <select
                      className="pf-select"
                      value={settings.defaultEmotion}
                      onChange={(e) => updateUserProfileData({ settings: { ...settings, defaultEmotion: e.target.value } })}
                    >
                      {Object.keys(emotionEmojis).map((emotion) => (
                        <option key={emotion} value={emotion}>{emotionEmojis[emotion]} {emotion}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-card-body">
                  <p className="pf-section-label">Account</p>
                  <div className="pf-actions-row">
                    <button className="pf-btn-secondary" onClick={handleLogout}>Sign out</button>
                    <button className="pf-btn-danger" onClick={handleDeleteAccount}>Delete account</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
