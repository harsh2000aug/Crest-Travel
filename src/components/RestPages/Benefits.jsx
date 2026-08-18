import React from "react";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";

const Benefits = () => {
  return (
    <>
      <div className="head-banner2">
        <HeaderInner />
        <div className="banner-text">
          <h1>Member Benefit Details</h1>
          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Thank you for being part of our community. We are thrilled to offer
            these benefits to make your travel more comfortable, rewarding, and
            memorable
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
                  src="https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <h2>Travel Marketplace</h2>
                <p>
                  Get ready for your next adventure with deep discounts! Save
                  25% or more on a curated collection of travel goods when you
                  shop through Travel Marketplace.
                </p>
              </div>
            </div>

            <div className="voyage-card">
              <div className="voyage-image">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <h2>StatusMax</h2>
                <p>
                  Unlock elite status instantly with your favorite airlines,
                  hotels, and car rental brands - VIP treatment, upgrades and
                  exclusive perks on every journey.
                </p>
              </div>
            </div>

            <div className="voyage-card">
              <div className="voyage-image">
                <img
                  src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <h2>Flight Insurance</h2>
                <p>
                  The insurance is provided to you at no additional cost by
                  Insider Travel Club that issued your ticket. As the ticket
                  holder, you are covered for accidental ...
                </p>
              </div>
            </div>

            <div className="voyage-card">
              <div className="voyage-image">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
                  alt=""
                />
              </div>

              <div className="voyage-content">
                <h2>Room Coins</h2>
                <p>
                  Your Room Coins can be used on most pre-paid hotel bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Benefits;
