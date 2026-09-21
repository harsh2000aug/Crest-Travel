import React, { useEffect, useState } from "react";
import "./header.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/foot-logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { phoneNumberAndMail } from "../store/Services/AllApi";

const Footer = () => {
  const location = useLocation();
  const [mailAndPhone, setMailAndPhone] = useState();
  useEffect(() => {
    const numbersAndMail = async () => {
      try {
        const response = await phoneNumberAndMail();
        setMailAndPhone(response?.data);
      } catch (error) {}
    };
    numbersAndMail();
  }, []);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <footer className="luxFooter">
      <div className="luxFooter__container container">
        <div className="luxFooter__left">
          {/* <img src={logo} alt="Logo" className="luxFooter__logo" /> */}
          <p className="luxFooter__text">
            Crest Travel Club is a premium travel membership offering members
            access to travel benefits, hotel and flight options, airport lounge
            access, Room Coins, travel services and exclusive travel
            opportunities. Explore our membership plans and discover the
            benefits available with Signature, Elite and Prestige.
          </p>
          <Link to="https://www.facebook.com/cresttravelclub/" target="_blank">
            <FaFacebookF />
          </Link>
          <Link to="https://www.instagram.com/cresttravelclub/" target="_blank">
            <FaInstagram />
          </Link>
          <Link to="https://www.pinterest.com/cresttravelclub/" target="_blank">
            <FaPinterestP />
          </Link>
          <Link to="https://www.youtube.com/@CrestTravelClub" target="_blank">
            <FaYoutube />
          </Link>
          <Link
            to="https://www.linkedin.com/company/crest-travel-club/"
            target="_blank"
          >
            <FaLinkedinIn />
          </Link>
          <Link to="https://x.com/cresttravelclub" target="_blank">
            <FaXTwitter />
          </Link>
          <Link to="https://www.tiktok.com/@cresttravelclub" target="_blank">
            <FaTiktok />
          </Link>
          <p className="luxFooter__copyright">
            © 2026 Crest Travel Club. All rights reserved.
          </p>
        </div>
        <div className="luxFooter__column">
          <h4>COMPANY</h4>
          <Link to="/about-us">About Us</Link>
          <Link to="/join-now">Membership</Link>
          <Link to="/blogs">Blogs</Link>
        </div>
        <div className="luxFooter__column">
          <h4>LEGAL</h4>
          <Link
            to="/terms-and-conditions"
            state={{ previousPage: location.pathname }}
          >
            Terms and Conditions
          </Link>
          <Link
            to="/privacy-policy"
            state={{ previousPage: location.pathname }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/refund-and-cancellation-policies"
            state={{ previousPage: location.pathname }}
          >
            Refund and Cancellation Policies
          </Link>
        </div>

        <div className="luxFooter__column">
          <h4>CONTACT</h4>

          <a href={`mailto:${mailAndPhone?.email || ""}`}>
            {mailAndPhone?.email}
          </a>

          {isLoggedIn ? (
            <>
              <a href={`tel:${mailAndPhone?.before_phone_no || ""}`}>
                {mailAndPhone?.before_phone_no}
              </a>

              <a href={`tel:${mailAndPhone?.after_phone_no || ""}`}>
                {mailAndPhone?.after_phone_no}
              </a>
            </>
          ) : (
            <a href={`tel:${mailAndPhone?.before_phone_no || ""}`}>
              {mailAndPhone?.before_phone_no}
            </a>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${mailAndPhone?.address?.line1},
              ${mailAndPhone?.address?.city}, 
              ${mailAndPhone?.address?.postalCode}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {mailAndPhone?.address?.line1} <br /> {mailAndPhone?.address?.city}{" "}
            {mailAndPhone?.address?.postalCode}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
