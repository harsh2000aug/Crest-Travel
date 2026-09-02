import React from "react";
import "./header.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/foot-logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const location = useLocation();
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
          <a href="mailto:contact@cresttravelclub.com">
            contact@cresttravelclub.com
          </a>
          <a href="tel:+18883779065">+1 (888) 377-9065</a>
          <a>
            Trian Inc <br />
            47 Eliot Street, NATICK, MA,
            <br /> USA 01760
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
