import React, { useEffect, useState } from "react";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import { crestBenefits } from "../../store/Services/AllApi";

const Benefits = () => {
  const [crestBenefitsData, setCrestBenefitsData] = useState([]);
  const [selectedBenefit, setSelectedBenefit] = useState(null);

  useEffect(() => {
    const fetchCrestBenefits = async () => {
      try {
        const response = await crestBenefits({
          body: {
            clubid: 249402,
            language: "EN",
            tierid: localStorage.getItem("tierId"),
          },
        });

        setCrestBenefitsData(response?.benefits);
      } catch (error) {
        console.error("Error fetching crest benefits:", error);
      }
    };

    fetchCrestBenefits();
  }, []);

  const handleTutorialClick = (benefit) => {
    if (!benefit?.video) {
      return;
    }

    setSelectedBenefit(benefit);
  };

  const closeTutorialPopup = () => {
    setSelectedBenefit(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeTutorialPopup();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeTutorialPopup();
      }
    };

    if (selectedBenefit) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedBenefit]);

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
            {crestBenefitsData?.map((itm) => (
              <div className="voyage-card" key={itm?.id}>
                <div className="voyage-image">
                  <img src={itm?.thumbnail} alt={itm?.name || "Benefit"} />
                </div>

                <div className="voyage-content">
                  <h2>{itm?.name}</h2>

                  <p>
                    {itm?.description
                      ? itm.description.split(" ").slice(0, 15).join(" ") +
                        (itm.description.split(" ").length > 15 ? "..." : "")
                      : ""}
                  </p>

                  <div className="crest-benefit-action-buttons">
                    <button
                      type="button"
                      className="crest-benefit-know-more-btn"
                      onClick={() => {
                        console.log("Know More clicked:", itm);
                      }}
                    >
                      Know More
                    </button>
                    <button
                      type="button"
                      className={`crest-benefit-tutorial-btn ${!itm?.video ? "crest-benefit-tutorial-btn-disabled" : ""}`}
                      disabled={!itm?.video}
                      onClick={() => handleTutorialClick(itm)}
                    >
                      Tutorial
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {selectedBenefit && (
        <div
          className="crest-benefit-video-overlay"
          onClick={handleOverlayClick}
        >
          <div className="crest-benefit-video-modal">
            <button
              type="button"
              className="crest-benefit-video-close"
              onClick={closeTutorialPopup}
              aria-label="Close tutorial"
            >
              &times;
            </button>

            <div className="crest-benefit-video-header">
              <h2>{selectedBenefit?.name}</h2>
            </div>

            <div className="crest-benefit-video-wrapper">
              <video
                className="crest-benefit-video-player"
                controls
                autoPlay
                playsInline
              >
                <source src={selectedBenefit?.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Benefits;
