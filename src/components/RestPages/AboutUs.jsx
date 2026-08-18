import React, { useEffect } from "react";
import "./RestPages.css";
import { useNavigate } from "react-router-dom";
import Header from "../../reuseable-components/Header";
import Footer from "../../reuseable-components/Footer";
import HeaderInner from "../../reuseable-components/HeaderInner";
const AboutUs = () => {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <>
      <section className="about-page">
        {isLoggedIn ? <HeaderInner /> : <Header />}
        <div className="hero-about">
          <div className="overlay">
            <span class="tm-badge">ABOUT US</span>
            <h1>About Crest Travel Club</h1>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="about-section">
          <div className="about-content">
            <h2>Discover a Better Way to Travel with Crest Travel Club</h2>

            <p>
              Crest Travel Club was created for travelers who want more than
              ordinary vacations. We believe that travel should be about
              unforgettable experiences, discovering new destinations, and
              creating lasting memories—not overpaying for accommodations and
              travel services.
            </p>

            <p>
              Our mission is to provide members with exclusive access to premium
              travel opportunities, luxury resorts, hotels, vacation homes, and
              handpicked accommodations around the world. Through our trusted
              global travel network, members can unlock exceptional value and
              enjoy significant savings compared to traditional booking
              platforms, while still experiencing the comfort, quality, and
              service they deserve.
            </p>

            <p>
              Whether you're planning a relaxing beach getaway, an exciting city
              escape, a family vacation, a romantic retreat, or a business trip,
              Crest Travel Club helps you travel smarter. Our carefully curated
              collection of travel options gives members the flexibility to
              explore destinations worldwide while enjoying exclusive
              member-only pricing and benefits
            </p>

            <p></p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?q=80&w=864&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Travel"
          />
        </div>

        <div className="stats">
          <div className="container stat-grid">
            <div>
              <h3>100+</h3>
              <p>Countries Covered</p>
            </div>

            <div>
              <h3>Thousands</h3>
              <p>Hotels & Resorts</p>
            </div>

            <div>
              <h3>Best Value</h3>
              <p>Exclusive Member Deals</p>
            </div>

            <div>
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>

        <div className="features">
          <h2>Why Choose Crest Travel Club?</h2>

          <div className="feature-grid">
            <div className="card">
              <span>🏨</span>
              <h4>Premium Hotels</h4>
              <p>Stay at trusted accommodations worldwide.</p>
            </div>

            <div className="card">
              <span>⭐</span>
              <h4>Member Benefits</h4>
              <p>Enjoy travel perks designed for frequent explorers.</p>
            </div>

            <div className="card">
              <span>✈️</span>
              <h4>Easy Booking</h4>
              <p>Simple, secure and hassle-free reservations.</p>
            </div>

            <div className="card">
              <span>🤝</span>
              <h4>Support</h4>
              <p>Friendly travel experts ready to help.</p>
            </div>
          </div>
        </div>

        <div className="cta tb-gap">
          <h2>Ready for Your Next Adventure?</h2>

          <p>
            Join Crest Travel Club today and unlock exclusive travel
            experiences.
          </p>

          <button onClick={() => navigate("/join-now")}>Join Now</button>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutUs;
