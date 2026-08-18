import React, { useState } from "react";
import logo from "../assets/images/logo.webp";
import "./header.css";
import { CiWallet } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { CiUser, CiSearch } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import {
  login,
  memberSignup,
  newMemberDetails,
} from "../store/Services/AllApi";
import { useSetAtom } from "jotai";
import { tokenAtom } from "../atoms/userAtom";
const Header = ({ personDetails }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const darkHeaderRoutes = ["/join-now", "/checkout"];
  const showDarkHeader = darkHeaderRoutes.includes(location.pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken"),
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    control,
    formState: { errors: signupErrors, isSubmitting: signupSubmitting },
  } = useForm({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      membershipType: "Free",
    },
  });
  const setToken = useSetAtom(tokenAtom);
  const handleNewMemberDetails = async (email) => {
    try {
      const res = await newMemberDetails({
        body: {
          email: email,
        },
      });
    } catch (error) {
      console.error("Error fetching new member details:", error);
    }
  };
  const onSubmit = async (data) => {
    try {
      const res = await login({
        body: {
          username: data.email,
          password: data.password,
        },
      });

      console.log("Login response:", res);

      const signin = res?.data?.signin;

      // API returned 200 but login failed
      if (!signin?.success) {
        toast.error(signin?.message || "Invalid email address or password");
        return;
      }

      // Login successful
      setToken(data.email);
      handleNewMemberDetails(data.email);
      localStorage.setItem("accessToken", signin.token);
      localStorage.setItem("Email", data.email);

      setIsLoggedIn(true);
      toast.success("Logged in successfully");
      setShowLogin(false);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const onSignup = async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      membershipType: "Free",
    };
    try {
      const res = await memberSignup({
        body: payload,
      });
      localStorage.setItem("accessToken", res.token);
      localStorage.setItem("firstName", res.data.firstName);
      localStorage.setItem("lastName", res.data.lastName);
      setIsLoggedIn(true);
      toast.success(res.message);
      setShowSignup(false);
      navigate("/home");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {showLogin && (
        <div className="travel-login-overlay">
          <div className="travel-login-modal signup-modal">
            <button
              type="button"
              className="travel-login-close-btn"
              onClick={() => setShowLogin(false)}
            >
              <FaTimes />
            </button>

            <div className="travel-login-logo-area">
              <img src={logo} alt="Travel Club" />

              <h2>Welcome Back</h2>

              <p>
                Sign in and unlock exclusive hotel, resort and flight discounts.
              </p>
            </div>

            <form
              className="travel-login-form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="travel-login-input-group">
                <input
                  type="text"
                  placeholder="Email Address or Username"
                  {...register("email", {
                    required: "Email or Username is required",
                    pattern: {
                      value:
                        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                />

                {errors.email && (
                  <span className="travel-login-error">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div className="travel-login-input-group travel-login-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                <button
                  type="button"
                  className="travel-login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

                {errors.password && (
                  <span className="travel-login-error">
                    {errors.password.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="travel-login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login Now"}
              </button>
            </form>

            <p
              style={{ textAlign: "center", marginTop: "20px", color: "#000" }}
            >
              Don't have a account?{" "}
              <b
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
              >
                Create one
              </b>
            </p>
          </div>
        </div>
      )}
      {showSignup && (
        <div className="travel-login-overlay">
          <div className="travel-login-modal signup-modal">
            <button
              type="button"
              className="travel-login-close-btn"
              onClick={() => setShowSignup(false)}
            >
              <FaTimes />
            </button>

            <div className="travel-login-logo-area">
              <h2>Create Account</h2>
              <p>Become a member today.</p>
            </div>

            <form
              className="travel-login-form"
              onSubmit={handleSignupSubmit(onSignup)}
            >
              <div className="signup-row">
                <div className="travel-login-input-group">
                  <input
                    placeholder="First Name"
                    {...registerSignup("firstName", {
                      required: "First Name is required",
                      minLength: {
                        value: 2,
                        message: "Minimum 2 characters required",
                      },
                    })}
                  />

                  {signupErrors.firstName && (
                    <span className="travel-login-error">
                      {signupErrors.firstName.message}
                    </span>
                  )}
                </div>

                <div className="travel-login-input-group">
                  <input
                    placeholder="Last Name"
                    {...registerSignup("lastName", {
                      required: "Last Name is required",
                    })}
                  />

                  {signupErrors.lastName && (
                    <span className="travel-login-error">
                      {signupErrors.lastName.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="travel-login-input-group">
                <input
                  type="email"
                  placeholder="Email"
                  {...registerSignup("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
                      message: "Enter a valid email",
                    },
                  })}
                />

                {signupErrors.email && (
                  <span className="travel-login-error">
                    {signupErrors.email.message}
                  </span>
                )}
              </div>
              <div className="travel-login-input-group">
                <input
                  type="tel"
                  placeholder="Phone"
                  maxLength={10}
                  {...registerSignup("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10 digit mobile number",
                    },
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                    },
                  })}
                />

                {signupErrors.phone && (
                  <span className="travel-login-error">
                    {signupErrors.phone.message}
                  </span>
                )}
              </div>
              <div className="travel-login-input-group travel-login-password-wrapper">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  {...registerSignup("password", {
                    required: "Password is required",
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/,
                      message:
                        "Password must be like Harsh@2023 (uppercase, lowercase, number & special character)",
                    },
                  })}
                />

                <button
                  type="button"
                  className="travel-login-password-toggle"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                >
                  {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

                {signupErrors.password && (
                  <span className="travel-login-error">
                    {signupErrors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={signupSubmitting}
                className="travel-login-submit-btn"
              >
                {signupSubmitting ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                marginTop: 20,
                color: "#000",
              }}
            >
              Already have an account?{" "}
              <b
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
              >
                Login
              </b>
            </p>
          </div>
        </div>
      )}
      <header className={showDarkHeader ? "dark-header" : ""}>
        <div className="container">
          <div className="flex al-center space-bw">
            <div
              className="logo"
              onClick={() => {
                navigate(isLoggedIn ? "/home" : "/");
                setMenuOpen(false);
              }}
            >
              <img src={logo} alt="logo" />
            </div>

            <div className="member-login">
              <div
                className={`member-menu ${menuOpen ? "active bg-color" : ""}`}
              >
                <ul
                  className={`${
                    location.pathname === "/home" ? "" : "inner-page"
                  }`}
                >
                  <li>
                    <Link
                      to={isLoggedIn ? "/home" : "/"}
                      onClick={() => setMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/whats-included"
                      onClick={() => setMenuOpen(false)}
                    >
                      What's Included
                    </Link>
                  </li>

                  <li>
                    <Link to="/about-us" onClick={() => setMenuOpen(false)}>
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="header-btns">
              {!isLoggedIn && (
                <button
                  type="button"
                  className="member-log"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogin(true);
                  }}
                >
                  Member Login →
                </button>
              )}

              {!isLoggedIn && (
                <button type="button" onClick={() => navigate("/join-now")}>
                  Join Now →
                </button>
              )}
            </div>

            <div
              className="mobile-menu-icon"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
