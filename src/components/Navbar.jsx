// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { getCurrentUser, logoutUser } from "../utils/authService";

const styles = {
  color: {
    accentPurple: "#8a2be2",
    textGray: "#a0a0a0",
    textLight: "#f0f0f0",
  },
  navbar: {
    backgroundColor: "#1e1e1e",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: "0 30px",
    height: "70px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "3px",
    color: "#8a2be2",
    textShadow: `0 0 10px rgba(138, 43, 226, 0.6)`,
    textDecoration: "none",
  },
  linkContainer: {
    display: "flex",
    alignItems: "center",
  },
  navLink: {
    color: "#a0a0a0",
    textDecoration: "none",
    padding: "8px 12px",
    margin: "0 8px",
    fontWeight: "600",
    transition: "color 0.3s",
    cursor: "pointer",
  },
  profileIcon: (hasImage) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: hasImage ? "transparent" : "#8a2be2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "20px",
    marginLeft: "15px",
    transition: "all 0.3s",
    border: "2px solid #8a2be2",
    color: "white",
    overflow: "hidden",
  }),
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  dropdown: {
    position: "absolute",
    top: "75px",
    right: "30px",
    backgroundColor: "#1e1e35",
    borderRadius: "15px",
    padding: "20px",
    width: "280px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    zIndex: 1000,
  },
  dropdownItem: {
    padding: "12px",
    color: "#f0f0f0",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

const NavBar = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userData, setUserData] = useState({
    name: "User",
    email: "user@emotune.com",
    profilePic: null,
  });

  useEffect(() => {
    if (!currentUser || !isAuthenticated) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || "User",
            email: data.email || currentUser.email,
            profilePic: data.profilePic || null,
          });
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAuthenticated]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleNavigateToProfile = () => {
    setShowProfileDropdown(false);
    navigate("/profile");
  };

  return (
    <nav style={styles.navbar}>
      {/* Left Links */}
      <div style={styles.linkContainer}>
        {isAuthenticated && (
          <>
            <Link to="/main" style={styles.navLink}>
              Home
            </Link>
            <Link to="/language" style={styles.navLink}>
              Languages
            </Link>
          </>
        )}
      </div>

      {/* Center Logo */}
      <Link to="/" style={styles.logoText}>
        E M O T U N E
      </Link>

      {/* Right Icons */}
      <div style={styles.linkContainer}>
        {isAuthenticated ? (
          <>
            {/* Profile Icon */}
            <div
              style={styles.profileIcon(userData.profilePic)}
              onClick={handleProfileClick}
              title="Profile"
            >
              {userData.profilePic ? (
                <img
                  src={userData.profilePic}
                  alt="Profile"
                  style={styles.profileImage}
                />
              ) : (
                "👤"
              )}
            </div>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div style={styles.dropdown}>
                {/* User Info */}
                <div
                  style={{
                    marginBottom: "15px",
                    textAlign: "center",
                    borderBottom: "1px solid #2b2b45",
                    paddingBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#f0f0f0",
                      fontWeight: "700",
                      marginBottom: "5px",
                    }}
                  >
                    {userData.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#b0b0c2" }}>
                    {userData.email}
                  </div>
                </div>

                {/* View Profile */}
                <div
                  style={styles.dropdownItem}
                  onClick={handleNavigateToProfile}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(138, 43, 226, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span style={{ fontSize: "18px" }}>👤</span>
                  <span>View Profile</span>
                </div>

                {/* Change Languages */}
                <div
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate("/language");
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(138, 43, 226, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span style={{ fontSize: "18px" }}>🌐</span>
                  <span>Change Languages</span>
                </div>

                {/* Dashboard */}
                <div
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate("/main");
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(138, 43, 226, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span style={{ fontSize: "18px" }}>🏠</span>
                  <span>Home</span>
                </div>

                {/* Logout */}
                <div
                  style={{
                    borderTop: "1px solid #2b2b45",
                    marginTop: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <div
                    style={{ ...styles.dropdownItem, color: "#ff6b6b" }}
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(255, 107, 107, 0.2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span style={{ fontSize: "18px" }}>🚪</span>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link to="/login" style={styles.navLink}>
            Login
          </Link>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showProfileDropdown && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </nav>
  );
};

export default NavBar;
