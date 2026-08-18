import React, { useEffect } from "react";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import { FaEnvelope, FaPhoneAlt, FaComments } from "react-icons/fa";
const CustomerServices = () => {
  useEffect(() => {
    // Canonical URL
    const canonicalUrl = "https://www.cresttravelclub.com/customer-service";

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);

    // Remove canonical when leaving the page
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');

      if (canonical) {
        canonical.remove();
      }
    };
  }, []);

  return (
    <>
      <div className="head-banner1">
        <HeaderInner />
        <div className="banner-text">
          <h1>Customer Service</h1>
          <p>Need help? We are available 24*7</p>
        </div>
      </div>
      <section className="contact-section tb-gap">
        <div className="container">
          <div className="contact-container">
            <div className="contact-card">
              <div className="contact-icon">
                <FaEnvelope />
              </div>

              <div className="contact-content">
                <h3>Email Us</h3>
                <a href="mailto:contact@cresttravelclub.com">
                  contact@cresttravelclub.com
                </a>
                <p>Quick responses within 24 hours.</p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <FaPhoneAlt />
              </div>

              <div className="contact-content">
                <h3>Call Us</h3>
                <a href="tel:+18883779065">+1 (888) 377-9065</a>
                <p>Quick responses within 24 hours.</p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <FaComments />
              </div>

              <div className="contact-content">
                <h3>Live Chat</h3>
                <span>Chat with our travel experts</span>
                <p>Instant support from our team.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default CustomerServices;
