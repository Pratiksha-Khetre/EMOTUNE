// src/pages/LanguageSelection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const allLanguages = [
  { name: "Hindi", script: "हिंदी" },
  { name: "English", script: "English" },
  { name: "Marathi", script: "मराठी" },
  { name: "Telugu", script: "తెలుగు" },
  { name: "Tamil", script: "தமிழ்" },
  { name: "Gujarati", script: "ગુજરાતી" },
  { name: "Urdu", script: "اردو" },
  { name: "Kannada", script: "ಕನ್ನಡ" },
  { name: "Bengali", script: "বাংলা" },
  { name: "Malayalam", script: "മലയാളം" },
];

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const toggleLanguage = (language) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) return prev.filter((l) => l !== language);
      if (prev.length < 5) return [...prev, language];
      return prev;
    });
  };

  const handleProceed = () => {
    if (selectedLanguages.length > 0) {
      localStorage.setItem("user_languages", JSON.stringify(selectedLanguages));
      localStorage.setItem("languages_set", "true");
      navigate("/main");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap');

        .etl-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Mono', monospace;
        }

        .etl-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
          animation: etlPulse 9s ease-in-out infinite alternate;
        }
        .etl-orb-1 { width: 600px; height: 600px; top: -200px; left: -180px; background: radial-gradient(circle, rgba(100,70,200,0.26) 0%, transparent 70%); }
        .etl-orb-2 { width: 450px; height: 450px; bottom: -150px; right: -140px; background: radial-gradient(circle, rgba(190,70,140,0.2) 0%, transparent 70%); animation-delay: -4s; }

        @keyframes etlPulse {
          from { transform: scale(1); opacity: 0.7; }
          to { transform: scale(1.15) translate(12px, -12px); opacity: 1; }
        }

        .etl-container {
          position: relative; z-index: 10;
          width: 100%; max-width: 760px;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .etl-container.mounted { opacity: 1; transform: translateY(0); }

        .etl-header { text-align: center; margin-bottom: 48px; }

        .etl-eyebrow {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(155, 109, 255, 0.8); margin-bottom: 12px; display: block;
        }

        .etl-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 46px; font-weight: 300;
          color: #e8e4f8; letter-spacing: 1px;
          margin: 0 0 12px; line-height: 1.1;
        }

        .etl-subtitle {
          font-size: 13px; color: rgba(200, 185, 230, 0.65);
          letter-spacing: 0.8px; line-height: 1.8;
        }

        .etl-counter {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(155, 109, 255, 0.1);
          border: 1px solid rgba(155, 109, 255, 0.25);
          border-radius: 30px; padding: 8px 18px; margin-top: 18px;
          font-size: 11px; color: rgba(180, 148, 255, 0.95); letter-spacing: 1px;
        }

        .etl-counter-dots { display: flex; gap: 5px; align-items: center; }

        .etl-counter-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(155, 109, 255, 0.2);
          transition: background 0.3s, transform 0.3s;
        }

        .etl-counter-dot.filled {
          background: linear-gradient(135deg, #9b6dff, #e060c0);
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(155, 109, 255, 0.5);
        }

        .etl-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px; margin-bottom: 32px;
        }

        @media (min-width: 560px) {
          .etl-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }

        .etl-lang-item {
          background: rgba(22, 28, 52, 0.8);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(155, 109, 255, 0.12);
          border-radius: 14px; padding: 18px 20px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex; flex-direction: column; gap: 4px;
          position: relative; overflow: hidden;
        }

        .etl-lang-item:hover {
          border-color: rgba(155, 109, 255, 0.4);
          background: rgba(22, 28, 60, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .etl-lang-item.selected {
          border-color: rgba(155, 109, 255, 0.7);
          background: rgba(124, 77, 255, 0.14);
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(155, 109, 255, 0.2), 0 8px 32px rgba(124, 77, 255, 0.18);
        }

        .etl-lang-name {
          font-size: 14px; font-weight: 500;
          color: #d8d4f0;
          letter-spacing: 0.5px;
          display: flex; align-items: center; justify-content: space-between;
          transition: color 0.25s;
        }

        .etl-lang-item.selected .etl-lang-name { color: #c8a8ff; }

        .etl-lang-script {
          font-size: 16px; color: rgba(200, 185, 230, 0.5);
          transition: color 0.25s;
          font-family: 'Cormorant Garamond', serif;
        }

        .etl-lang-item.selected .etl-lang-script { color: rgba(155, 109, 255, 0.7); }

        .etl-check {
          width: 18px; height: 18px; border-radius: 50%;
          background: linear-gradient(135deg, #7c4dff, #c060d0);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #fff; flex-shrink: 0;
          box-shadow: 0 0 10px rgba(124, 77, 255, 0.4);
          animation: checkPop 0.2s ease;
        }

        @keyframes checkPop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .etl-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; }

        .etl-btn-proceed {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #7c4dff 0%, #c060d0 100%);
          border: none; border-radius: 14px;
          color: #fff; font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 28px rgba(124, 77, 255, 0.3);
          position: relative; overflow: hidden;
        }

        .etl-btn-proceed::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0.12); opacity: 0; transition: opacity 0.2s;
        }
        .etl-btn-proceed:hover::before { opacity: 1; }
        .etl-btn-proceed:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(124, 77, 255, 0.4); }
        .etl-btn-proceed:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }

        .etl-max-note {
          font-size: 11px; color: rgba(155, 109, 255, 0.8); letter-spacing: 1px; text-align: center;
        }
      `}</style>

      <div className="etl-page">
        <div className="etl-orb etl-orb-1" />
        <div className="etl-orb etl-orb-2" />

        <div className={`etl-container ${mounted ? "mounted" : ""}`}>
          <div className="etl-header">
            <span className="etl-eyebrow">Personalization</span>
            <h1 className="etl-title">Choose your languages</h1>
            <p className="etl-subtitle">Select up to 5 languages to shape your sonic experience</p>
            <div className="etl-counter">
              <div className="etl-counter-dots">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`etl-counter-dot ${i < selectedLanguages.length ? "filled" : ""}`} />
                ))}
              </div>
              <span>{selectedLanguages.length} / 5 selected</span>
            </div>
          </div>

          <div className="etl-grid">
            {allLanguages.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.name);
              return (
                <div
                  key={lang.name}
                  className={`etl-lang-item ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleLanguage(lang.name)}
                >
                  <div className="etl-lang-name">
                    <span>{lang.name}</span>
                    {isSelected && <div className="etl-check">✓</div>}
                  </div>
                  <div className="etl-lang-script">{lang.script}</div>
                </div>
              );
            })}
          </div>

          <div className="etl-actions">
            <button
              className="etl-btn-proceed"
              onClick={handleProceed}
              disabled={selectedLanguages.length === 0}
            >
              {selectedLanguages.length === 0
                ? "Select at least one language"
                : `Continue with ${selectedLanguages.length} language${selectedLanguages.length > 1 ? "s" : ""}`}
            </button>
            {selectedLanguages.length === 5 && (
              <p className="etl-max-note">Maximum selection reached</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LanguageSelection;
