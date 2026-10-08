import React, { useEffect, useState } from "react";
import Header from "../../../reuseable-components/Header";
import Footer from "../../../reuseable-components/Footer";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import "./AllMembershipPlans.css";
import {
  FaMoneyBillWave,
  FaRegCircleXmark,
  FaBed,
  FaPlaneUp,
  FaTicket,
  FaUpload,
  FaCircleExclamation,
  FaPlus,
} from "react-icons/fa6";
import {
  FaGem,
  FaEyeSlash,
  FaHeadphones,
  FaShip,
  FaBrain,
  FaMinus,
  FaCoins,
  FaPlaneDeparture,
  FaCheckCircle,
  FaShieldAlt,
  FaArrowRight,
  FaCrown,
  FaLock,
} from "react-icons/fa";
import {
  RiExchangeDollarLine,
  RiRefreshLine,
  RiDiscountPercentLine,
  RiShieldCrossLine,
} from "react-icons/ri";
import { TbShieldSearch } from "react-icons/tb";
import { HiHomeModern } from "react-icons/hi2";
import { PiCallBellBold } from "react-icons/pi";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Signature = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(0);

  const handleMembershipSelect = (membershipId, membershipName, price) => {
    navigate("/checkout", {
      state: {
        membershipId,
        membershipName,
        price,
      },
    });
  };

  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return (
    <div>
      {isLoggedIn ? <HeaderInner /> : <Header />}
      <main className="container">
        <section className="crest-signature-section tb-gap">
          <div className="crest-signature-container">
            <div className="crest-signature-left">
              <div className="crest-signature-badge">
                <FaCrown />
                <span>OFFICIAL CREST SIGNATURE MEMBERSHIP</span>
              </div>

              <h1 className="crest-signature-title">
                Pay Less,
                <br />
                <span>Travel More!</span>
              </h1>

              <p className="crest-signature-description">
                Want to book a luxury trip while spending less? Start with a
                Signature Plan membership—your first step to the world of
                travel.
              </p>

              <div className="crest-signature-features">
                <div className="crest-signature-feature">
                  <div className="crest-feature-icon">
                    <FaPlaneDeparture />
                  </div>
                  <h4>Unlisted Fares</h4>
                  <p>Private inventory access</p>
                </div>
                <div className="crest-signature-feature">
                  <div className="crest-feature-icon">
                    <FiRefreshCw />
                  </div>
                  <h4>Reconfirm.AI</h4>
                  <p>Automated stay audits</p>
                </div>
                <div className="crest-signature-feature">
                  <div className="crest-feature-icon">
                    <FaCheckCircle />
                  </div>
                  <h4>40–50% Savings</h4>
                  <p>Below retail rates</p>
                </div>
                <div className="crest-signature-feature">
                  <div className="crest-feature-icon">
                    <FaCoins />
                  </div>
                  <h4>40–Room Coins</h4>
                  <p>Instant welcome bundle</p>
                </div>
              </div>
              <button
                className="crest-signature-cta"
                onClick={() => handleMembershipSelect(13, "Signature", 39.99)}
              >
                <span>
                  CLICK TO JOIN THE SIGNATURE PLAN WITH A MINIMAL SIGN-UP FEE
                  ($39.99 PER MONTH)
                </span>
                <FaArrowRight />
              </button>
              <div className="crest-signature-points">
                <div>
                  <FaCheckCircle />
                  <span>Instant account activation</span>
                </div>
                <div>
                  <FaCheckCircle />
                  <span>Cancel anytime</span>
                </div>
                <div>
                  <FaCheckCircle />
                  <span>Backed by Crest VIP Concierge</span>
                </div>
              </div>
            </div>
            <div className="crest-signature-right">
              <div className="crest-member-card">
                <div className="crest-card-top">
                  <div>
                    <span className="crest-card-small">
                      CREST GLOBAL ACCESS
                    </span>

                    <h3>Signature Member</h3>
                  </div>

                  <FaCrown className="crest-card-crown" />
                </div>

                <div className="crest-card-number">
                  <span className="crest-card-chip"></span>

                  <span>•••• •••• •••• 8842</span>
                </div>

                <div className="crest-card-bottom">
                  <div>
                    <span>MEMBERSHIP STATUS</span>
                    <strong>ACTIVE • VERIFIED TIER</strong>
                  </div>

                  <div>
                    <span>RENEWAL TIER</span>
                    <strong>$39.99 / MONTH</strong>
                  </div>
                </div>
              </div>

              <div className="crest-insurance-box">
                <div className="crest-insurance-icon">
                  <FaShieldAlt />
                </div>

                <div className="crest-insurance-content">
                  <strong>200K Insurance</strong>
                  <span>Automatic Flight Policy</span>
                </div>

                <small>INCLUDED</small>
              </div>

              <div className="crest-price-card">
                <div className="crest-price-top">
                  <div className="crest-price">
                    <span>$39.99</span>
                    <small>/month</small>
                  </div>

                  <span className="crest-minimum-badge">MINIMAL FEE</span>
                </div>

                <p className="crest-price-description">
                  Billed automatically every month. Zero hidden booking fees.
                  Cancel anytime via online portal or support.
                </p>

                <div className="crest-price-note">
                  <FaCoins />
                  <span>
                    Includes initial 40-Room Coin bundle credited on signup
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="membership-benefits tb-gap">
          <div className="center-text">
            <span>MEMBERSHIP ADVANTAGES</span>
            <h2>
              Why Become A Signature <br /> Member?
            </h2>
            <p>Reasons to join Crest Travel Club with Signature membership:</p>
          </div>
          <div className="detailed-cards">
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaMoneyBillWave />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Minimal sign-up fee ($39.99/mo)</h2>
                <p>
                  Unrivaled high-tier travel privileges delivered without an
                  onerous upfront initiation charge.
                </p>
                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaGem />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Easy cancellation</h2>
                <p>
                  Full control over your membership cycle. Cancel anytime
                  directly through your member portal or directly with support
                </p>
                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaRegCircleXmark />
                </div>
              </div>

              <div className="miniCardBody">
                <h2>Numerous luxury perks, including a room coin bundle</h2>

                <p>
                  Claim VIP hotel stays, room upgrades, and a dedicated 40-Room
                  Coin allocation instantly deposited into your ledger
                </p>

                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <RiExchangeDollarLine />
                </div>
              </div>

              <div className="miniCardBody">
                <h2>A refund can be claimed, but terms and conditions apply</h2>

                <p>
                  Transparent satisfaction guarantees safeguarding your journey
                  according to verified club charter terms
                </p>

                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaEyeSlash />
                </div>
              </div>

              <div className="miniCardBody">
                <h2>Access to unlisted fares and hidden gems</h2>

                <p>
                  Unlock chartered repositioning legs, unpublished resort rates,
                  and private sanctuaries off the public market
                </p>

                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaHeadphones />
                </div>
              </div>

              <div className="miniCardBody">
                <h2>24/7 dedicated concierge support</h2>

                <p>
                  Direct access to professional personal travel advisors ready
                  around the clock for itinerary shaping and assistance
                </p>

                <div className="miniCardLine" />
              </div>
            </div>
          </div>
        </section>
        <section className="membership-benefits tb-gap">
          <div className="center-text">
            <span>MEMBERSHIP DEEP DIVE</span>
            <h2>
              What Are The Benefits of <br /> Joining Signature Membership?
            </h2>
            <p>
              If you’re skeptical about joining a travel club and wondering what
              difference it actually makes in planning a trip, start with a
              Signature plan
            </p>
          </div>
          <div className="joining-benefits">
            <div className="numberone">
              <h5>FOUNDATIONAL PRIVILEGE</h5>
              <h3>
                Signature Membership requires a minimal joining fee of
                $39.99/per month. That means you get direct access to their
                unlisted fares and places.
              </h3>
              <p>
                The joining fee isn't just for access to the perks; it also gets
                you through the walls for daily discounts. That means you’re not
                paying to be a member but signing up for huge savings on
                traveling around the world.
              </p>
              <div className="disc_price">
                <div className="disc_price_one">
                  <h4>40-50%</h4>
                  <p>Average savings across resort and flight bookings</p>
                </div>
                <div className="disc_price_one">
                  <h4>$200K</h4>
                  <p>Complimentary automatic flight protection policy</p>
                </div>
              </div>
            </div>
            <div className="numbertwo">
              <div className="numbertwo_top">
                <div className="its_icon">
                  <RiRefreshLine />
                </div>
                <h3>
                  With the Signature membership plan, you get numerous perks,
                  including hotel, flight, and car rental bookings and AI
                  confirmation
                </h3>
                <p>
                  Leverage continuous automated Reconfirm.AI auditing across
                  every booked itinerary to assure confirmed check-ins without
                  friction
                </p>
              </div>
              <div className="numbertwo_top">
                <div className="its_icon">
                  <TbShieldSearch />
                </div>
                <h3>
                  Signature membership also includes flight insurance up to 200K
                  and travel-related awards you can use for future trips
                </h3>
                <p>
                  With each trip, you can save 40-50% off regular booking prices
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="membership-benefits tb-gap">
          <div className="center-text">
            <span>COMPLETE PACKAGE INCLUSIONS</span>
            <h2>
              What Perks Are Covered in <br /> the Signature Membership Plan?
            </h2>
            <p>
              These are the perks you’ll get in the Signature Membership Plan:
            </p>
          </div>
          <div className="detailed-cards">
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaBed />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Premium Hotel Bookings</h2>
                <p>
                  Curated access to luxury suites and boutique 5-star properties
                  worldwide
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaPlaneUp />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Flights Reservations</h2>
                <p>
                  Global commercial itineraries and empty-leg repositioning
                  routes
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaTicket />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Travel-Related Activities</h2>
                <p>
                  Private tours, bespoke excursions, and sommelier- guided
                  culinary outings
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <HiHomeModern />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Vacation Rental</h2>
                <p>
                  Private chalets, beach villas, and secluded estates vetted for
                  absolute comfort
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaShip />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Cruises Reservation</h2>
                <p>
                  Luxury ocean suites and river yacht expeditions with member
                  onboard credits
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaCoins />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Room Coins Rewards</h2>
                <p>
                  Includes 40-Room-Coin bundle credited instantly upon
                  activation for room redemptions
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <PiCallBellBold />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Dedicated Travel Services</h2>
                <p>
                  End-to-end guidance from travel experts mapped specifically to
                  your schedule
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <RiDiscountPercentLine />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Discounted Bookings</h2>
                <p>
                  40-50% off regular prices across club preferred partner
                  properties and flights
                </p>
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon miniCardIconNew">
                  <FaUpload />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Status Max Access</h2>
                <p>
                  Access to unlock top-tier privileges through Status Max match
                  and accelerated loyalty tiers
                </p>
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon miniCardIconNew">
                  <RiShieldCrossLine />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Flight Insurance Up to 200K</h2>
                <p>
                  Emergency transit protection and compensation policy attached
                  automatically to tickets
                </p>
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon miniCardIconNew">
                  <FaBrain />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Reconfirm.AI Every Hotel Reservation</h2>
                <p>
                  Automated AI verification of reservations proactively contacts
                  hotel desk systems before arrival to confirm room category and
                  privileges
                </p>
              </div>
            </div>
          </div>
          <div className="imp_notice">
            <p>
              <strong>
                <FaCircleExclamation />
                DIRECT MEMBER NOTICE:
              </strong>{" "}
              You don’t need to enter your financial details every time to pay
              the Signature Membership fee. The system will automatically deduct
              the membership fee every month from your account unless you
              request to stop automatic payments directly.
            </p>
          </div>
        </section>
        <section className="membership-benefits tb-gap">
          <div className="center-text">
            <span>GOT QUESTIONS?</span>
            <h2>Frequently Asked Questions</h2>
            <p>
              Essential details regarding your Crest Signature Membership Plan.
            </p>
          </div>
          <div className="crestFaq">
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
              >
                <h3>How Can I Sign Up For Signature Membership Plan?</h3>

                {activeFaq === 0 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 0 && (
                <div className="crestFaqAnswer">
                  <p>
                    You can sign up for the Signature membership plan by
                    creating an account. Here are the steps:
                  </p>

                  <ol>
                    <li>
                      Create an account on the Official Crest Travel Club
                      Website.
                    </li>
                    <li>Choose the Signature Membership Tier Option.</li>
                    <li>Pay the Membership Fee ($39.99/per month).</li>
                    <li>
                      Get instant confirmation and account activation details
                      via SMS and email.
                    </li>
                    <li>
                      Get access to unlisted fares, packages, and discounts.
                    </li>
                  </ol>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
              >
                <h3>How Much Is The Signature Membership Fee?</h3>

                {activeFaq === 1 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 1 && (
                <div className="crestFaqAnswer">
                  <p>
                    You pay $39.99 per month to activate the Signature
                    membership plan. The amount will be deducted automatically
                    from your account every month. To pause, stop, cancel, or
                    change automatic renewal, you need to contact the Crest
                    Customer Support team.
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
              >
                <h3>What Benefits Do I Get In The Signature Plan?</h3>

                {activeFaq === 2 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 2 && (
                <div className="crestFaqAnswer">
                  <p>
                    You will get the baseline travel discounts and coverages
                    with the Signature plan. Benefits include the 40–Room–Coin
                    bundle, flight insurance up to $200K, full travel expense
                    coverage, personalized vacation planning, and loyalty &
                    upgrades.
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}
              >
                <h3>
                  Can I Get A Luxury Stay In The Signature Membership Plan?
                </h3>

                {activeFaq === 3 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 3 && (
                <div className="crestFaqAnswer">
                  <p>
                    Yes, with the Signature membership plan, you can get luxury
                    stays in hotels, villas, and other private properties in the
                    Crest Travel Club network. Additionally, you’ll get 40–50%
                    discounts and member-only rates.
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 4 ? null : 4)}
              >
                <h3>Can I Transfer My Signature Membership Plan?</h3>

                {activeFaq === 4 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 4 && (
                <div className="crestFaqAnswer">
                  <p>
                    No, you can’t transfer your Signature membership plan. The
                    club doesn’t offer a facility that allows members to
                    transfer their membership plan. For more information,
                    contact Crest customer service.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="crest-signature-memb">
          <div className="crest-signature-left">
            <div className="crest-signature-badge">
              <FaLock />
              <span>INSTANT WORLDWIDE ACTIVATION</span>
            </div>
            <h1 className="crest-signature-title">
              Begin Your Private Journey Today.
            </h1>
            <p className="crest-signature-description">
              Join thousands of members enjoying 40-50% savings, unlisted
              airfares, 40 Room Coins, and 24/7 dedicated concierge assistance
            </p>
            <button
              className="crest-signature-cta"
              onClick={() => handleMembershipSelect(13, "Signature", 39.99)}
            >
              <span>
                CLICK TO JOIN THE SIGNATURE PLAN WITH A MINIMAL SIGN-UP FEE
                ($39.99 PER MONTH)
              </span>
              <FaArrowRight />
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Signature;
