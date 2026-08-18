import React from "react";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";

const TravelTales = () => {
  return (
    <>
      <div className="head-banner3">
        <HeaderInner />
        <div className="banner-text">
          <h1>Travel Tales</h1>
          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Travel Tales helps you discover amazing destinations, book with
            ease, and create unforgettable memories on every journey.
          </p>
        </div>
      </div>

      <section className="voyage-journal tb-gap">
        <div className="container">
          <div className="voyage-heading">
            <span>TRAVEL INSPIRATION</span>
            <h2>Stories That Spark Wanderlust</h2>
            <p>
              Explore breathtaking destinations, travel guides, and
              unforgettable adventures from around the globe.
            </p>
          </div>

          <div className="voyage-grid">
            <div className="voyage-card">
              <div className="voyage-image">
                <img
                  src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <span className="story-date">Nov 12, 2026</span>

                <h3>Winter Escapes Across Europe</h3>
                <p>
                  Discover magical Christmas markets, snowy villages, and cozy
                  mountain retreats.
                </p>
              </div>
            </div>

            <div className="voyage-card">
              <div className="voyage-image">
                <img
                  src="https://images.unsplash.com/photo-1548013146-72479768bada"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <span className="story-date">Dec 12, 2026</span>
                <h3>Hidden Gems of Mallorca</h3>
                <p>
                  Secret beaches, dramatic cliffs, and charming coastal towns.
                </p>
              </div>
            </div>

            <div className="voyage-card">
              <div className="voyage-image">
                <img
                  src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <span className="story-date">Jan 08, 2026</span>
                <h3>London Through a Traveler's Eyes</h3>
                <p>
                  Iconic landmarks, hidden cafes, and unforgettable city walks.
                </p>
              </div>
            </div>

            <div className="voyage-card">
              <div className="voyage-image">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <span className="story-date">Feb 21, 2026</span>
                <h3>Dream Ski Adventures</h3>
                <p>Experience breathtaking slopes and luxury alpine resorts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default TravelTales;
