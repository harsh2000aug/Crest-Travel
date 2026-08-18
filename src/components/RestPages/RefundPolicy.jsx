import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Header from "../../reuseable-components/Header";
import Footer from "../../reuseable-components/Footer";
import { Helmet } from "react-helmet-async";

const RefundPolicy = () => {
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
    <div>
      <Helmet>
        {/* Meta Title */}
        <title>Refund & Cancellation Policy | Crest Travel Club</title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Learn how refunds and membership cancellations work at Crest Travel Club, including timelines, eligibility, and how to cancel your plan."
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href="https://www.cresttravelclub.com/refund-and-cancellation-policies"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Refund & Cancellation Policy | Crest Travel Club"
        />

        <meta
          property="og:description"
          content="Learn how refunds and membership cancellations work at Crest Travel Club, including timelines, eligibility, and how to cancel your plan."
        />

        <meta
          property="og:url"
          content="https://www.cresttravelclub.com/refund-and-cancellation-policies"
        />

        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta
          name="twitter:title"
          content="Refund & Cancellation Policy | Crest Travel Club"
        />

        <meta
          name="twitter:description"
          content="Learn how refunds and membership cancellations work at Crest Travel Club, including timelines, eligibility, and how to cancel your plan."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="tp-page">
        {isLoggedIn ? <HeaderInner /> : <Header />}
        <section className="tp-hero">
          <div className="tp-hero-content">
            <span className="tp-badge">LEGAL INFORMATION</span>

            <h1>
              Refund and Cancellation <span>Policies</span>
            </h1>

            <p>
              Please review our refund policy carefully before purchasing any
              membership plan through our platform.
            </p>
          </div>
        </section>
      </div>

      <section className="tp-section-card" id="introduction">
        <div className="tp-number">01</div>

        <div className="tp-content">
          <h2>Introduction & Acceptance</h2>

          <p>
            This Refund & Cancellation Policy governs all matters relating to
            refunds, membership cancellations, subscription renewals, and travel
            booking cancellations in connection with the services offered by
            CrestTravelClub.com.
          </p>

          <div className="tp-highlight">
            <h4>Policy at a Glance</h4>

            <ul>
              <li>
                Membership is a monthly subscription that renews automatically
                until you cancel.
              </li>

              <li>
                Cancelling stops future renewals; it does not, by itself,
                generate a refund.
              </li>

              <li>
                A 100% refund of the current month's fee is available within 15
                calendar days of purchase or renewal, provided no benefit has
                been used and a written request is submitted in time.
              </li>

              <li>
                Refunds for hotels, flights, and other travel bookings are
                governed by the cancellation rules of the relevant supplier.
              </li>

              <li>
                Approved refunds are normally processed within 7–14 business
                days.
              </li>
            </ul>
          </div>

          <p>
            By purchasing, renewing, or booking through CrestTravelClub.com, you
            acknowledge that you have read, understood, and agreed to be bound
            by this Policy together with our Terms & Conditions. If you do not
            agree, you should not purchase or renew a membership or make any
            booking through our platform.
          </p>
        </div>
      </section>

      <section className="tp-section-card" id="definitions">
        <div className="tp-number">02</div>

        <div className="tp-content">
          <h2>Definitions</h2>

          <p>
            The following terms have the meanings set out below wherever they
            appear in this Policy.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Membership & Billing</h4>

              <ul>
                <li>
                  <strong>Membership</strong> — the recurring monthly
                  subscription plan entitling access to Membership Benefits.
                </li>

                <li>
                  <strong>Billing Cycle</strong> — the monthly period for which
                  the Membership fee has been paid.
                </li>

                <li>
                  <strong>Guarantee Period</strong> — the 15 calendar days
                  beginning on the date of purchase or renewal.
                </li>
              </ul>
            </div>

            <div className="tp-info-box">
              <h4>Benefits & Suppliers</h4>

              <ul>
                <li>
                  <strong>Membership Benefits</strong> — member pricing,
                  discounts, vouchers, credits, concierge assistance, reward
                  points, and promotional offers.
                </li>

                <li>
                  <strong>Supplier</strong> — any third-party travel provider,
                  including airlines, hotels, cruise lines, and tour operators.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="subscription-model">
        <div className="tp-number">03</div>

        <div className="tp-content">
          <h2>Membership & Subscription Model</h2>

          <p>CrestTravelClub.com operates on a monthly subscription model.</p>

          <div className="tp-highlight">
            Membership renews automatically at the end of each Billing Cycle
            unless cancelled by the Member prior to the next renewal date.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="auto-renewal">
        <div className="tp-number">04</div>

        <div className="tp-content">
          <h2>Automatic Renewal & Billing Authorization</h2>

          <p>
            By purchasing a Membership, you expressly authorize us to charge the
            recurring Membership fee to your selected payment method at the
            start of each Billing Cycle, and you agree that such charges will
            continue until cancelled in accordance with this Policy.
          </p>

          <div className="tp-warning">
            It is your responsibility to keep your payment details accurate and
            up to date. Failed payments may result in suspension of Membership
            Benefits until payment is successfully completed.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="cancelling">
        <div className="tp-number">05</div>

        <div className="tp-content">
          <h2>Cancelling Your Membership</h2>

          <p>
            You may cancel the automatic renewal of your Membership at any time
            through your account dashboard. Upon cancellation:
          </p>

          <ul>
            <li>
              your Membership remains active until the end of the current paid
              Billing Cycle;
            </li>

            <li>no further renewal charges will be applied; and</li>

            <li>
              access to Membership Benefits ceases at the end of the current
              Billing Cycle.
            </li>
          </ul>

          <div className="tp-warning">
            Cancelling your Membership only prevents future renewals. It does
            not, by itself, generate a refund for the current Billing Cycle.
            Refunds are available only as set out in Section 6.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="guarantee">
        <div className="tp-number">06</div>

        <div className="tp-content">
          <h2>15-Day Money-Back Guarantee</h2>

          <p>
            A Member is entitled to a 100% refund of the current month's
            Membership fee only if all of the following conditions are
            satisfied.
          </p>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>Timing</h4>

              <ul>
                <li>
                  Cancelled within 15 calendar days of purchase or renewal.
                </li>

                <li>
                  A written refund request is sent to
                  contact@cresttravelclub.com within the same 15-day period.
                </li>
              </ul>
            </div>

            <div className="tp-info-box">
              <h4>Unused Benefits</h4>

              <ul>
                <li>No Membership Benefit has been used during the cycle.</li>

                <li>No booking has been made using Membership Benefits.</li>

                <li>
                  No discount, coupon, reward, or complimentary service has been
                  redeemed.
                </li>
              </ul>
            </div>
          </div>

          <div className="tp-highlight">
            Where any one of the above conditions is not met, the Membership fee
            for the current Billing Cycle is non-refundable.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="request-procedure">
        <div className="tp-number">07</div>

        <div className="tp-content">
          <h2>Refund Request Procedure</h2>

          <p>
            To submit a valid refund request, the Member must complete both of
            the following steps within the Guarantee Period.
          </p>

          <ul>
            <li>Cancel the Membership from the online account dashboard.</li>

            <li>
              Email contact@cresttravelclub.com stating the registered email
              address, membership ID, payment reference, and reason for the
              request.
            </li>
          </ul>

          <div className="tp-warning">
            Failure to complete both steps within the Guarantee Period may delay
            or invalidate the refund request.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="after-guarantee">
        <div className="tp-number">08</div>

        <div className="tp-content">
          <h2>Refunds After the Guarantee Period</h2>

          <p>
            After 15 calendar days from the date of purchase or renewal,
            Membership fees become non-refundable.
          </p>

          <div className="tp-highlight">
            Cancellation after this period will only stop the next automatic
            renewal; the fee already paid for the current Billing Cycle will not
            be refunded, and the Membership remains active until the end of that
            cycle.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="benefits-used">
        <div className="tp-number">09</div>

        <div className="tp-content">
          <h2>Use of Membership Benefits</h2>

          <p>
            If any Membership Benefit has been used during a Billing Cycle —
            including member pricing, discounts, vouchers, travel credits,
            concierge assistance, reward points, or any other privilege — the
            fee for that cycle is non-refundable, regardless of when
            cancellation occurs.
          </p>
        </div>
      </section>

      <section className="tp-section-card" id="promotional">
        <div className="tp-number">10</div>

        <div className="tp-content">
          <h2>Promotional Memberships</h2>

          <p>
            Memberships purchased under promotional campaigns, discounted
            offers, coupon campaigns, or limited-time sales may be designated as
            non-refundable where stated at the time of purchase.
          </p>

          <div className="tp-warning">
            Any such non-refundable designation forms part of the terms of that
            promotion and prevails over the 15-Day Guarantee described in
            Section 6.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="third-party-bookings">
        <div className="tp-number">11</div>

        <div className="tp-content">
          <h2>Third-Party Travel Bookings</h2>

          <p>
            Hotels, flights, holiday packages, cruises, activities, visas,
            transfers, and other travel services booked through
            CrestTravelClub.com are provided by third-party Suppliers and are
            subject to the cancellation, refund, and amendment rules of the
            relevant Supplier.
          </p>

          <div className="tp-highlight">
            CrestTravelClub.com acts solely as a facilitator between the Member
            and the Supplier and cannot override, waive, or modify Supplier
            policies. Review the applicable Supplier terms before confirming any
            booking.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="supplier-charges">
        <div className="tp-number">12</div>

        <div className="tp-content">
          <h2>Supplier Charges & Deductions</h2>

          <p>
            Where a refund is available for a travel booking, the following
            amounts may be deducted from the refundable sum.
          </p>

          <ul>
            <li>Supplier cancellation charges and airline penalties.</li>

            <li>Hotel retention charges.</li>

            <li>Visa fees and government taxes.</li>

            <li>Payment gateway and transaction processing fees.</li>

            <li>Any other non-recoverable amounts imposed by the Supplier.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="no-shows">
        <div className="tp-number">13</div>

        <div className="tp-content">
          <h2>No-Shows</h2>

          <div className="tp-warning">
            Failure to use a confirmed booking without prior cancellation may
            result in complete forfeiture of the booking amount in accordance
            with the applicable Supplier's rules. No refund will be payable by
            the Company in respect of no-shows.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="amendments">
        <div className="tp-number">14</div>

        <div className="tp-content">
          <h2>Booking Amendments</h2>

          <p>
            Changes to passenger names, travel dates, destinations, or other
            booking details are subject to Supplier approval, availability, and
            applicable amendment fees.
          </p>

          <div className="tp-highlight">
            The Company does not guarantee that any requested amendment will be
            accepted by the Supplier.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="processing-time">
        <div className="tp-number">15</div>

        <div className="tp-content">
          <h2>Refund Processing Time</h2>

          <p>
            Approved refunds are normally processed within seven (7) to fourteen
            (14) business days after approval, or after receipt of the relevant
            funds from the Supplier, whichever is later.
          </p>

          <div className="tp-highlight">
            Banking and payment provider timelines may vary and are outside the
            Company's control.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="payment-method">
        <div className="tp-number">16</div>

        <div className="tp-content">
          <h2>Refund Payment Method</h2>

          <p>
            Refunds will normally be credited to the original payment method
            used for the transaction. Where a refund to the original payment
            method is not possible, the Company may, at its discretion, use an
            alternative lawful payment method.
          </p>
        </div>
      </section>

      <section className="tp-section-card" id="fraud-abuse">
        <div className="tp-number">17</div>

        <div className="tp-content">
          <h2>Fraud, Abuse & Chargebacks</h2>

          <div className="tp-warning">
            Fraudulent transactions, abuse of this Policy, or improper
            chargebacks may result in the suspension or permanent termination of
            Membership and, where appropriate, legal action.
          </div>

          <ul>
            <li>
              The Company reserves the right to contest any chargeback it
              reasonably believes to be improper.
            </li>

            <li>The Company may recover associated costs.</li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="suspension-termination">
        <div className="tp-number">18</div>

        <div className="tp-content">
          <h2>Suspension & Termination by the Company</h2>

          <p>
            The Company reserves the right to suspend or terminate any
            Membership obtained or used through fraud, abuse, misuse, inaccurate
            information, or violation of the Terms & Conditions.
          </p>

          <div className="tp-warning">
            No refund will be payable in respect of a Membership suspended or
            terminated under this Section.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="force-majeure">
        <div className="tp-number">19</div>

        <div className="tp-content">
          <h2>Force Majeure</h2>

          <p>
            Refunds and refund timelines may be affected by events beyond the
            Company's reasonable control, including natural disasters,
            pandemics, strikes, civil unrest, government restrictions, or
            airline operational disruptions.
          </p>

          <div className="tp-highlight">
            The Company shall not be liable for any delay or failure in
            processing refunds attributable to such events.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="limitation-liability">
        <div className="tp-number">20</div>

        <div className="tp-content">
          <h2>Limitation of Liability</h2>

          <p>
            To the maximum extent permitted by applicable law, the Company's
            total liability arising out of or in connection with this Policy
            shall be limited to the amount actually paid by the Member for the
            affected Membership or service.
          </p>
        </div>
      </section>

      <section className="tp-section-card" id="statutory-rights">
        <div className="tp-number">21</div>

        <div className="tp-content">
          <h2>Statutory Consumer Rights</h2>

          <div className="tp-highlight">
            Nothing in this Policy excludes, restricts, or modifies any
            mandatory rights or remedies available to you under applicable
            consumer protection laws. Where any provision conflicts with such
            mandatory rights, those rights prevail to the extent of the
            conflict.
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="severability">
        <div className="tp-number">22</div>

        <div className="tp-content">
          <h2>Severability</h2>

          <p>
            If any provision of this Policy is held to be invalid, illegal, or
            unenforceable, that provision shall be enforced to the maximum
            extent permissible, and the remaining provisions shall continue in
            full force and effect.
          </p>
        </div>
      </section>

      <section className="tp-section-card" id="policy-changes">
        <div className="tp-number">23</div>

        <div className="tp-content">
          <h2>Changes to This Policy</h2>

          <p>
            The Company reserves the right to amend this Policy at any time.
            Revised versions become effective when published on
            CrestTravelClub.com, and the "Last Updated" date at the top of this
            document will be revised accordingly.
          </p>

          <ul>
            <li>
              Continued use of the Membership after publication constitutes
              acceptance of the revised Policy.
            </li>
          </ul>
        </div>
      </section>

      <section className="tp-section-card" id="contact">
        <div className="tp-number">24</div>

        <div className="tp-content">
          <h2>Contact Information</h2>

          <p>
            All refund and cancellation requests, together with any questions
            about this Policy, should be directed to our member support team.
          </p>

          <div className="tp-highlight">
            Email: contact@cresttravelclub.com
            <br />
            Website: https://www.cresttravelclub.com
          </div>
        </div>
      </section>

      <section className="tp-section-card" id="faq">
        <div className="tp-number">25</div>

        <div className="tp-content">
          <h2>Frequently Asked Questions</h2>

          <div className="tp-grid">
            <div className="tp-info-box">
              <h4>
                Q. I cancelled my membership. Will I automatically receive a
                refund?
              </h4>

              <p>
                No. Cancelling only stops future renewals. To request a refund
                within the eligible 15-day Guarantee Period, you must also email
                contact@cresttravelclub.com with your registered email address,
                membership ID, and payment reference.
              </p>
            </div>

            <div className="tp-info-box">
              <h4>Q. Can I get a refund after using any membership benefit?</h4>

              <p>
                No. Once any membership benefit has been used — including member
                pricing, discounts, vouchers, credits, or concierge assistance —
                the current billing period becomes non-refundable.
              </p>
            </div>

            <div className="tp-info-box">
              <h4>Q. What happens if I cancel after 15 days?</h4>

              <p>
                Your membership remains active until the end of the paid billing
                period and will not renew for the following month. The fee
                already paid for the current period is not refunded.
              </p>
            </div>

            <div className="tp-info-box">
              <h4>
                Q. Are refunds for flights and hotels handled the same way as
                membership fees?
              </h4>

              <p>
                No. Travel bookings are governed by the cancellation and refund
                rules of the airline, hotel, or other supplier. Supplier
                penalties, taxes, and processing fees may be deducted from any
                eligible refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
