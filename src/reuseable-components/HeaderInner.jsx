import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.webp";
import { CiWallet, CiUser } from "react-icons/ci";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { changePassword } from "../store/Services/AllApi";
import { toast } from "react-toastify";
import { RiLockPasswordLine } from "react-icons/ri";

const HeaderInner = () => {
  const personDetails = JSON.parse(localStorage.getItem("personDetails")) || {};
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const darkHeaderRoutes = [
    "/my-bookings",
    "/profile-details",
    "/hotel",
    "/hotel-details",
    "/hotel-results",
    "/checkout",
    "/join-now",
    "/flight-result",
    "/flight-booking",
    "/car-result",
    "/car-book",
    "/activities",
    "/activity-details",
    "/vacation-list",
    "/activity-book",
  ];

  const showDarkHeader = darkHeaderRoutes.includes(location.pathname);

  const handleLogout = () => {
    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("userFinal");
    // localStorage.removeItem("Email");
    // localStorage.removeItem("personDetails");
    // localStorage.removeItem("roomCountToStore");
    // localStorage.removeItem("adultCountToStore");
    // localStorage.removeItem("childCountToStore");
    // localStorage.removeItem("hotelToken");
    // localStorage.removeItem("sessionId");
    // sessionStorage.removeItem("flightBookingData");
    localStorage.clear();
    sessionStorage.clear();
    setShowProfile(false);
    window.location.replace("/");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please enter both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    const email = localStorage.getItem("Email");

    if (!email) {
      setPasswordError("User email not found. Please login again.");
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await changePassword({
        body: {
          email: email,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
      });
      setShowChangePassword(false);
      toast.success(response?.message || "Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordError(
        error?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  return (
    <>
      <header className={showDarkHeader ? "dark-header" : ""}>
        <div className="container">
          <div className="flex al-center space-bw">
            <div className="logo" onClick={() => navigate("/home")}>
              <img src={logo} alt="Crest Travel Club" />
            </div>

            <div className="member-login">
              <div
                className={`member-menu ${menuOpen ? "active bg-color" : ""}`}
              >
                <ul
                  className={location.pathname === "/home" ? "" : "inner-page"}
                >
                  <li>
                    <Link to="/home" onClick={() => setMenuOpen(false)}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/benefits" onClick={() => setMenuOpen(false)}>
                      Benefits
                    </Link>
                  </li>

                  <li>
                    <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                      My Bookings
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/customer-service"
                      onClick={() => setMenuOpen(false)}
                    >
                      Customer Service
                    </Link>
                  </li>

                  <li>
                    <Link to="/travel-tales" onClick={() => setMenuOpen(false)}>
                      Travel Tales
                    </Link>
                  </li>

                  {/* ===================== */}
                  {/* MY COINS */}
                  {/* ===================== */}

                  <li
                    className="my-coins"
                    onClick={() => {
                      setShowCoins((prev) => !prev);
                      setShowProfile(false);
                    }}
                  >
                    <CiWallet />
                    <p>My Coins</p>
                  </li>

                  {showCoins && (
                    <div className="coins-dropdown">
                      <div className="coin-item">
                        <div className="coin-icon room">R</div>

                        <div className="coin-info">
                          <h4>Room Coins</h4>
                        </div>

                        <span className="coin-value">0.00</span>
                      </div>

                      <div className="coin-item">
                        <div className="coin-icon trip">T</div>

                        <div className="coin-info">
                          <h4>Trip Coins</h4>
                        </div>

                        <span className="coin-value">0</span>
                      </div>
                    </div>
                  )}

                  {/* ===================== */}
                  {/* PROFILE */}
                  {/* ===================== */}

                  <li
                    className="my-coins"
                    onClick={() => {
                      setShowProfile((prev) => !prev);
                      setShowCoins(false);
                    }}
                  >
                    <CiUser />

                    <p>
                      {`${personDetails?.firstname
                        ?.charAt(0)
                        .toUpperCase()}${personDetails?.lastname
                        ?.charAt(0)
                        .toUpperCase()}`}
                    </p>
                  </li>

                  {showProfile && (
                    <div className="profile-dropdown">
                      {/* PROFILE TOP */}
                      <div className="profile-top">
                        <div className="profile-avatar">
                          {`${personDetails?.firstname
                            ?.charAt(0)
                            .toUpperCase()}${personDetails?.lastname
                            ?.charAt(0)
                            .toUpperCase()}`}
                        </div>

                        <div className="profile-info">
                          <h4>
                            {personDetails?.firstname} {personDetails?.lastname}
                          </h4>

                          <p>High Flyer</p>
                        </div>
                      </div>

                      {/* PROFILE DETAILS */}
                      <div className="profile-menu">
                        <div
                          className="menu-item"
                          onClick={() => {
                            navigate("/profile-details");
                            setShowProfile(false);
                          }}
                        >
                          <CiUser />
                          <span>Profile Details</span>
                        </div>
                      </div>

                      {/* CHANGE PASSWORD */}
                      <div className="profile-menu">
                        <div
                          className="menu-item"
                          onClick={() => {
                            setShowChangePassword(true);
                            setShowProfile(false);
                          }}
                        >
                          <RiLockPasswordLine />
                          <span>Change Password</span>
                        </div>
                      </div>

                      {/* LOGOUT */}
                      <div className="profile-menu">
                        <div className="menu-item" onClick={handleLogout}>
                          <IoIosLogOut />
                          <span>Logout</span>
                        </div>
                      </div>
                    </div>
                  )}
                </ul>
              </div>

              {/* MOBILE MENU */}
              <div
                className="mobile-menu-icon"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <FaTimes /> : <FaBars />}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showChangePassword && (
        <div className="change-password-overlay">
          <div className="change-password-modal">
            {/* CLOSE BUTTON */}
            <button
              className="change-password-close"
              onClick={closeChangePassword}
            >
              <FaTimes />
            </button>

            <h2>Change Password</h2>

            <p className="change-password-subtitle">
              Enter your new password below.
            </p>

            <form onSubmit={handleChangePassword}>
              {/* NEW PASSWORD */}
              <div className="password-field">
                <label>New Password</label>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="password-field">
                <label>Confirm Password</label>

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* ERROR */}
              {passwordError && (
                <p className="password-error">{passwordError}</p>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="change-password-btn"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderInner;
