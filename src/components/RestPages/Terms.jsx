import React, { useEffect } from "react";
import Footer from "../../reuseable-components/Footer";
import HeaderInner from "../../reuseable-components/HeaderInner";
import { useLocation } from "react-router-dom";
import Header from "../../reuseable-components/Header";

const Terms = () => {
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
            <span className="tp-badge">LEGAL INFORMATION</span>

            <h1>
              Terms &<span> Conditions</span>
            </h1>
          </div>
        </section>
      </div>
      <section className="tp-section-card" id="overview">
        <div className="tp-number">01</div>

        <div className="tp-content">
          <h2>Overview</h2>

          <p>
            This website is operated by <b>Crest Travel Club</b>. Throughout the
            site, the terms "we", "us" and "our" refer to{" "}
            <b>Crest Travel Club</b>. Crest Travel Club offers this website,
            including all information and products available from this site to
            you, the user, conditioned upon your acceptance of all terms,
            conditions, policies, and notices stated here.
          </p>

          <p>
            By visiting our site and purchasing products from us, you engage in
            our "Service" and agree to be bound by the following Terms of
            Service, including those additional terms and policies referenced
            herein and/or available by hyperlink. These Terms apply to all users
            of the site, including browsers, vendors, customers, merchants, and
            contributors of content.
          </p>

          <div className="tp-highlight">
            <h4>Important</h4>

            <p>
              If you do not agree to all the terms and conditions of this
              agreement, then you may not access the website or use any
              services.
            </p>
          </div>

          <ul>
            <li>
              Any new features or tools added to the store are also subject to
              these Terms of Service.
            </li>

            <li>
              We reserve the right to update, change, or replace any part of
              these Terms by posting updates to our website.
            </li>

            <li>
              It is your responsibility to check this page periodically for
              changes.
            </li>

            <li>
              Continued use of the site after changes are posted constitutes
              acceptance of those changes.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="online-store-terms">
        <div className="tp-number">02</div>

        <div className="tp-content">
          <h2>Online Store Terms</h2>

          <p>
            By agreeing to these Terms of Service, you represent that you are at
            least the age of majority in your state or province of residence,
            and that you have given us your consent to allow any of your minor
            dependents to use this site.
          </p>

          <div className="tp-warning">
            You may not use our products for any illegal or unauthorized
            purpose.
          </div>

          <ul>
            <li>
              A breach or violation of any of the Terms will result in an
              immediate termination of your Services.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="general-conditions">
        <div className="tp-number">03</div>

        <div className="tp-content">
          <h2>General Conditions</h2>

          <p>
            We reserve the right to refuse service to anyone for any reason at
            any time.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Data Transmission</h4>

              <p>
                Your content (not including credit card information) may be
                transferred unencrypted and may involve transmissions over
                various networks and changes to conform to technical
                requirements. Credit card information is always encrypted during
                transfer.
              </p>
            </div>

            <div className="tp-info-box">
              <h4>Use Restrictions</h4>

              <p>
                You agree not to reproduce, duplicate, copy, sell, resell, or
                exploit any portion of the Service without express written
                permission from us.
              </p>
            </div>
          </div>

          <ul>
            <li>
              The headings used in this agreement are included for convenience
              only and will not limit or otherwise affect these Terms.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="accuracy-of-information">
        <div className="tp-number">04</div>

        <div className="tp-content">
          <h2>Accuracy, Completeness and Timeliness of Information</h2>

          <p>
            We are not responsible if information made available on this site is
            not accurate, complete, or current. Material on this site is
            provided for general information only and should not be relied upon
            as the sole basis for making decisions.
          </p>

          <div className="tp-highlight">
            This site may contain historical information, which is provided for
            reference only and is not current.
          </div>

          <ul>
            <li>Any reliance on material on this site is at your own risk.</li>

            <li>
              We reserve the right to modify the contents of this site at any
              time, but have no obligation to update information.
            </li>

            <li>It is your responsibility to monitor changes to our site.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="modifications">
        <div className="tp-number">05</div>

        <div className="tp-content">
          <h2>Modifications to the Service and Prices</h2>

          <p>
            Prices for our products are subject to change without notice. We
            reserve the right at any time to modify or discontinue the Service,
            or any part of it, without notice.
          </p>

          <div className="tp-warning">
            We shall not be liable to you or any third-party for any
            modification, price change, suspension, or discontinuance of the
            Service.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="products-services">
        <div className="tp-number">06</div>

        <div className="tp-content">
          <h2>Products or Services</h2>

          <p>
            Certain products or services may be available exclusively online.
            These may have limited quantities and are subject to return or
            exchange only according to our Return Policy.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Product Display</h4>

              <p>
                We make every effort to display product colors and images
                accurately, but cannot guarantee your monitor's display will be
                accurate.
              </p>
            </div>

            <div className="tp-info-box">
              <h4>Availability</h4>

              <p>
                We reserve the right to limit sales of products or Services to
                any person, geographic region, or jurisdiction on a case-by-case
                basis.
              </p>
            </div>
          </div>

          <ul>
            <li>
              All descriptions and pricing are subject to change at any time
              without notice.
            </li>

            <li>
              We reserve the right to discontinue any product at any time.
            </li>

            <li>
              Any offer for a product or service is void where prohibited.
            </li>

            <li>
              We do not warrant that products, services, or information will
              meet your expectations, or that errors will be corrected.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="billing-accuracy">
        <div className="tp-number">07</div>

        <div className="tp-content">
          <h2>Accuracy of Billing and Account Information</h2>

          <p>
            We reserve the right to refuse any order you place with us. We may
            limit or cancel quantities purchased per person, household, or
            order, including orders placed under the same account, credit card,
            or billing/shipping address.
          </p>

          <div className="tp-highlight">
            We reserve the right to limit or prohibit orders that, in our sole
            judgment, appear to be placed by dealers, resellers, or
            distributors.
          </div>

          <ul>
            <li>
              You agree to provide current, complete, and accurate purchase and
              account information.
            </li>

            <li>
              You agree to promptly update your account information, including
              email address and payment details.
            </li>

            <li>
              If we cancel or change an order, we may attempt to notify you via
              the contact information provided.
            </li>

            <li>Please review our Returns Policy for more detail.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="third-party-links">
        <div className="tp-number">08</div>

        <div className="tp-content">
          <h2>Third-Party Links</h2>

          <p>
            Certain content, products, and services available via our Service
            may include materials from third-parties. Third-party links may
            direct you to websites not affiliated with us.
          </p>

          <div className="tp-warning">
            We are not responsible for examining or evaluating third-party
            content, and we are not liable for any harm or damages related to
            transactions with third-parties.
          </div>

          <ul>
            <li>
              Review third-party policies and practices carefully before
              engaging in any transaction.
            </li>

            <li>
              Complaints regarding third-party products should be directed to
              the third-party.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="user-comments">
        <div className="tp-number">09</div>

        <div className="tp-content">
          <h2>User Comments, Feedback and Other Submissions</h2>

          <p>
            If you send us comments, suggestions, or other materials, you agree
            that we may edit, copy, publish, distribute, translate, and
            otherwise use them in any medium without restriction.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Our Obligations</h4>

              <p>
                We are under no obligation to keep comments confidential, pay
                compensation for them, or respond to them. We may, but have no
                obligation to, monitor, edit, or remove content we determine to
                be unlawful or objectionable.
              </p>
            </div>

            <div className="tp-info-box">
              <h4>Your Responsibilities</h4>

              <p>
                Your comments must not violate any third-party right and must
                not contain unlawful, abusive, or obscene material, or any virus
                or malware. You may not misrepresent your identity.
              </p>
            </div>
          </div>

          <ul>
            <li>You are solely responsible for any comments you make.</li>

            <li>
              We take no responsibility and assume no liability for comments
              posted by you or any third-party.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="personal-information">
        <div className="tp-number">10</div>

        <div className="tp-content">
          <h2>Personal Information</h2>

          <p>
            Your submission of personal information through the store is
            governed by our Privacy Policy.
          </p>
        </div>
      </section>

      <section className="tp-section-card" id="errors-inaccuracies">
        <div className="tp-number">11</div>

        <div className="tp-content">
          <h2>Errors, Inaccuracies and Omissions</h2>

          <p>
            Occasionally there may be information on our site that contains
            typographical errors, inaccuracies, or omissions related to product
            descriptions, pricing, promotions, offers, shipping charges, transit
            times, and availability.
          </p>

          <div className="tp-highlight">
            We reserve the right to correct any errors, inaccuracies, or
            omissions, and to change or update information or cancel orders at
            any time without prior notice, including after an order has been
            submitted.
          </div>

          <ul>
            <li>
              We undertake no obligation to update, amend, or clarify
              information except as required by law.
            </li>

            <li>
              No specified update or refresh date should be taken to indicate
              that all information has been modified or updated.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="prohibited-uses">
        <div className="tp-number">12</div>

        <div className="tp-content">
          <h2>Prohibited Uses</h2>

          <p>
            In addition to other prohibitions set forth in these Terms, you are
            prohibited from using the site or its content for any of the
            following purposes.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Unlawful Conduct</h4>

              <ul>
                <li>Any unlawful purpose</li>

                <li>Soliciting unlawful acts</li>

                <li>Violating regulations or laws</li>

                <li>Infringing intellectual property rights</li>

                <li>Submitting false or misleading information</li>
              </ul>
            </div>

            <div className="tp-info-box">
              <h4>Platform Abuse</h4>

              <ul>
                <li>Harassment or discrimination</li>

                <li>Uploading viruses or malicious code</li>

                <li>Collecting or tracking personal information</li>

                <li>Spamming, phishing, or scraping</li>

                <li>Circumventing security features</li>
              </ul>
            </div>
          </div>

          <div className="tp-warning">
            We reserve the right to terminate your use of the Service for
            violating any of the prohibited uses.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="disclaimer-liability">
        <div className="tp-number">13</div>

        <div className="tp-content">
          <h2>Disclaimer of Warranties; Limitation of Liability</h2>

          <p>
            We do not guarantee, represent, or warrant that your use of the
            Service will be uninterrupted, timely, secure, or error-free, or
            that results obtained from the Service will be accurate or reliable.
          </p>

          <div className="tp-warning">
            Your use of, or inability to use, the Service is at your sole risk.
            The Service is provided "as is" and "as available" without
            warranties of any kind.
          </div>

          <ul>
            <li>Lost profits or lost revenue.</li>

            <li>Lost savings or loss of data.</li>

            <li>Replacement costs.</li>

            <li>
              Any errors or omissions in content, or loss resulting from use of
              the Service.
            </li>
          </ul>

          <div className="tp-highlight">
            Some states or jurisdictions do not allow the exclusion or
            limitation of liability for consequential or incidental damages, so
            our liability shall be limited to the maximum extent permitted by
            law.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="indemnification">
        <div className="tp-number">14</div>

        <div className="tp-content">
          <h2>Indemnification</h2>

          <p>
            You agree to indemnify, defend, and hold harmless{" "}
            <b>Crest Travel Club</b> and our parent, subsidiaries, affiliates,
            partners, officers, directors, agents, and employees from any claim
            or demand, including reasonable attorneys' fees, made by any
            third-party.
          </p>

          <ul>
            <li>Your breach of these Terms of Service.</li>

            <li>The documents these Terms incorporate by reference.</li>

            <li>Your violation of any law or the rights of a third-party.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="severability">
        <div className="tp-number">15</div>

        <div className="tp-content">
          <h2>Severability</h2>

          <p>
            In the event that any provision of these Terms of Service is
            determined to be unlawful, void, or unenforceable, that provision
            shall nonetheless be enforceable to the fullest extent permitted by
            applicable law.
          </p>

          <div className="tp-highlight">
            The unenforceable portion shall be severed from these Terms, and
            such determination shall not affect the validity of any remaining
            provisions.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="termination">
        <div className="tp-number">16</div>

        <div className="tp-content">
          <h2>Termination</h2>

          <p>
            These Terms of Service are effective unless and until terminated by
            either you or us. You may terminate at any time by notifying us that
            you no longer wish to use our Services.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Our Rights</h4>

              <p>
                If we suspect you have failed to comply with any term of these
                Terms, we may terminate this agreement at any time without
                notice and deny you access to our Services.
              </p>
            </div>

            <div className="tp-info-box">
              <h4>After Termination</h4>

              <p>
                Obligations and liabilities incurred prior to termination shall
                survive, and you will remain liable for all amounts due up to
                the date of termination.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="entire-agreement">
        <div className="tp-number">17</div>

        <div className="tp-content">
          <h2>Entire Agreement</h2>

          <p>
            The failure of us to exercise or enforce any right or provision of
            these Terms shall not constitute a waiver of such right or
            provision.
          </p>

          <div className="tp-highlight">
            These Terms of Service and any policies posted by us constitute the
            entire agreement between you and us, superseding any prior or
            contemporaneous agreements, whether oral or written.
          </div>

          <ul>
            <li>
              Any ambiguities in the interpretation of these Terms shall not be
              construed against the drafting party.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="governing-law">
        <div className="tp-number">18</div>

        <div className="tp-content">
          <h2>Governing Law</h2>

          <p>
            These Terms of Service and any separate agreements whereby we
            provide you Services shall be governed by and construed in
            accordance with the laws of the United States.
          </p>
        </div>
      </section>

      <section className="tp-section-card" id="changes-to-terms">
        <div className="tp-number">19</div>

        <div className="tp-content">
          <h2>Changes to Terms of Service</h2>

          <p>
            You can review the most current version of the Terms of Service at
            any time on this page.
          </p>

          <div className="tp-warning">
            We reserve the right, at our sole discretion, to update, change, or
            replace any part of these Terms by posting updates to our website.
          </div>

          <ul>
            <li>
              It is your responsibility to check our website periodically for
              changes.
            </li>

            <li>
              Continued use of or access to our website following the posting of
              any changes constitutes acceptance of those changes.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="contact-information">
        <div className="tp-number">20</div>

        <div className="tp-content">
          <h2>Contact Information</h2>

          <p>
            Questions about the Terms of Service should be sent to us using the
            contact information below.
          </p>

          <div className="tp-highlight">
            Phone: <a href="tel:+18883779065">+1 (888) 377-9065</a>
            <br />
            Email:{" "}
            <a href="mailto:contact@cresttravelclub.com">
              contact@cresttravelclub.com
            </a>
            <br />
            Address:{" "}
            <a>
              Trian Inc <br />
              47 Eliot Street, NATICK, MA,
              <br /> USA 01760
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Terms;
