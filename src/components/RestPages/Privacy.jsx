import React, { useEffect } from "react";
import Footer from "../../reuseable-components/Footer";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Header from "../../reuseable-components/Header";
import { useLocation } from "react-router-dom";

const Privacy = () => {
  const location = useLocation();
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
      <div className="tp-page">
        {isLoggedIn ? <HeaderInner /> : <Header />}
        <section className="tp-hero">
          <div className="tp-hero-content">
            <span className="tp-badge">PRIVACY & DATA PROTECTION</span>

            <h1>
              Privacy
              <span> Policy</span>
            </h1>
          </div>
        </section>
      </div>

      <section className="tp-section-card" id="overview">
        <div className="tp-number">01</div>

        <div className="tp-content">
          <h2>Privacy Policy Overview</h2>

          <p>
            We are committed to protecting and respecting your privacy. This
            Privacy Policy explains how Crest Travel Club collects, processes,
            stores, and safeguards the personal information you provide while
            using our website and services.
          </p>

          <div className="tp-highlight">
            Your personal information is collected only for legitimate business
            purposes and handled in accordance with applicable privacy and data
            protection laws.
          </div>

          <ul>
            <li>Protect your personal information.</li>

            <li>Explain how your information is collected.</li>

            <li>Describe how your data is processed.</li>

            <li>Outline your privacy rights.</li>

            <li>Maintain transparency in data handling.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="collection">
        <div className="tp-number">02</div>

        <div className="tp-content">
          <h2>Collecting & Processing Personal Information</h2>

          <p>
            Crest Travel Club acts as the Data Controller for the personal
            information collected through our services. We only collect
            information necessary to provide, improve, and support our travel
            membership services.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Why We Process Data</h4>

              <ul>
                <li>To create and manage your membership.</li>

                <li>To fulfil contractual obligations.</li>

                <li>To process payments securely.</li>

                <li>To provide customer support.</li>

                <li>To comply with legal obligations.</li>
              </ul>
            </div>

            <div className="tp-info-box">
              <h4>Legal Basis</h4>

              <ul>
                <li>Your consent.</li>

                <li>Performance of a contract.</li>

                <li>Legitimate business interests.</li>

                <li>Legal and regulatory compliance.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="processing">
        <div className="tp-number">03</div>

        <div className="tp-content">
          <h2>How We Collect Your Information</h2>

          <p>
            Personal information is collected directly from you when you
            interact with our services, as well as automatically through
            approved technologies.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Information You Provide</h4>

              <ul>
                <li>Registration details</li>

                <li>Customer support requests</li>

                <li>Membership information</li>

                <li>Communication history</li>
              </ul>
            </div>

            <div className="tp-info-box">
              <h4>Automatically Collected</h4>

              <ul>
                <li>Cookies</li>

                <li>Analytics</li>

                <li>Website usage</li>

                <li>Tracking technologies</li>
              </ul>
            </div>
          </div>

          <div className="tp-warning">
            Third-party cookies are only placed after obtaining your consent
            through our privacy preferences.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="sharing">
        <div className="tp-number">04</div>

        <div className="tp-content">
          <h2>Sharing Personal Information</h2>

          <p>
            We work with carefully selected third-party service providers to
            operate our website and deliver our travel services. These providers
            only receive the information necessary to perform their services.
          </p>

          <div className="tp-highlight">
            Service providers are contractually required to protect your
            personal information and use it only for authorized purposes.
          </div>

          <ul>
            <li>Website hosting providers.</li>

            <li>Analytics providers.</li>

            <li>Advertising partners.</li>

            <li>Payment processors.</li>

            <li>Customer support tools.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="rights">
        <div className="tp-number">05</div>

        <div className="tp-content">
          <h2>Your Privacy Rights</h2>

          <p>
            Depending on your location and applicable privacy laws, you may have
            various rights regarding your personal information. We are committed
            to helping you exercise these rights whenever applicable.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Your Rights</h4>

              <ul>
                <li>Access your personal information.</li>

                <li>Correct inaccurate information.</li>

                <li>Request deletion of your data.</li>

                <li>Restrict data processing.</li>

                <li>Object to certain processing activities.</li>
              </ul>
            </div>

            <div className="tp-info-box">
              <h4>Additional Rights</h4>

              <ul>
                <li>Withdraw consent.</li>

                <li>Data portability.</li>

                <li>Request processing details.</li>

                <li>Lodge complaints with authorities.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="transfer">
        <div className="tp-number">07</div>

        <div className="tp-content">
          <h2>Location & International Data Transfers</h2>

          <p>
            Your personal information may be processed by trusted third-party
            providers located in different countries. We ensure reasonable
            safeguards are in place before transferring personal information
            internationally.
          </p>

          <div className="tp-warning">
            Data protection laws may vary depending on the country where your
            information is processed.
          </div>

          <ul>
            <li>Secure international transfers.</li>

            <li>Approved third-party providers.</li>

            <li>Confidentiality agreements.</li>

            <li>Industry-standard security practices.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="security">
        <div className="tp-number">08</div>

        <div className="tp-content">
          <h2>Security of Your Information</h2>

          <p>
            We implement technical and organizational safeguards designed to
            protect your personal information against unauthorized access,
            disclosure, alteration, or destruction.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Our Protection</h4>

              <ul>
                <li>Secure infrastructure.</li>

                <li>Encrypted communication.</li>

                <li>Access controls.</li>

                <li>Regular monitoring.</li>
              </ul>
            </div>

            <div className="tp-info-box">
              <h4>Your Responsibility</h4>

              <ul>
                <li>Create strong passwords.</li>

                <li>Do not share credentials.</li>

                <li>Log out from shared devices.</li>

                <li>Protect your account.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="third-party">
        <div className="tp-number">09</div>

        <div className="tp-content">
          <h2>Third-Party Websites</h2>

          <p>
            Our website may contain links to third-party websites. We do not
            control or assume responsibility for the privacy practices or
            content of those websites.
          </p>

          <div className="tp-highlight">
            We encourage you to review the privacy policy of every website you
            visit.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="children">
        <div className="tp-number">10</div>

        <div className="tp-content">
          <h2>Children's Privacy</h2>

          <p>
            Our services are not intended for children. We do not knowingly
            collect personal information from individuals under the applicable
            minimum age.
          </p>

          <div className="tp-warning">
            If you believe a child has provided personal information, please
            contact us immediately so appropriate action can be taken.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="updates">
        <div className="tp-number">11</div>

        <div className="tp-content">
          <h2>Changes to This Privacy Policy</h2>

          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in legal, technical, or business requirements.
          </p>

          <ul>
            <li>Updated versions will be posted here.</li>

            <li>Material changes may be communicated separately.</li>

            <li>Continued use indicates acceptance.</li>
          </ul>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Privacy;
