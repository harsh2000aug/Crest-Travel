import React, { useEffect, useState } from "react";
import Header from "../../../reuseable-components/Header";
import Footer from "../../../reuseable-components/Footer";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import "./AllMembershipPlans.css";
import {
  FaCircleExclamation,
  FaPlus,
  FaShop,
  FaUserDoctor,
  FaIdeal,
} from "react-icons/fa6";
import {
  FaHeadphones,
  FaBrain,
  FaMinus,
  FaCoins,
  FaArrowRight,
  FaCrown,
  FaLock,
  FaWineGlass,
  FaBriefcaseMedical,
  FaTag,
} from "react-icons/fa";
import {
  RiExchangeDollarLine,
  RiDiscountPercentLine,
  RiShieldCrossLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { GiPassport, GiJetpack } from "react-icons/gi";
import { BsLuggage, BsFillPersonCheckFill } from "react-icons/bs";
import { MdLuggage, MdFreeCancellation } from "react-icons/md";

const Prestige = () => {
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
                <span>
                  • INSTANT ACTIVATION • MONTHLY FLEXIBILITY • VIP MEMBER
                  CONCIERGE
                </span>
              </div>

              <h1 className="crest-signature-title">
                One Membership
                <br />
                <span>Unlimited Travel Perks</span>
              </h1>

              <p className="crest-signature-description">
                Want to experience luxurious and premium travel services? Buy
                the Crest Travel Club Prestige plan- travel privileges, savings,
                and services now at your fingertips
              </p>

              <div className="crest-signature-features">
                <div className="crest-signature-feature">
                  <div className="crest-feature-icon">
                    <FaCoins />
                  </div>
                  <h4>80</h4>
                  <p>ROOM COINS / MONTH</p>
                </div>
                <div className="crest-signature-feature">
                  <div className="crest-feature-icon">
                    <RiDiscountPercentLine />
                  </div>
                  <h4>Up to 50%</h4>
                  <p>BOOKING SAVINGS</p>
                </div>
                <div className="crest-signature-feature">
                  <div className="crest-feature-icon">
                    <FaHeadphones />
                  </div>
                  <h4>24 / 7</h4>
                  <p>PRIVATE LIAISON</p>
                </div>
              </div>
              <button
                className="crest-signature-cta"
                onClick={() => handleMembershipSelect(21, "Prestige", 79.99)}
              >
                <span>
                  CLICK TO JOIN THE PRESTIGE PLAN WITH A MINIMAL SIGN-UP FEE
                  ($79.99 PER MONTH)
                </span>
                <FaArrowRight />
              </button>
            </div>
            <div className="crest-signature-right">
              <div className="crest-member-card">
                <div className="crest-card-top">
                  <div>
                    <span className="crest-card-small">
                      CREST GLOBAL ACCESS
                    </span>

                    <h3>Prestige Member</h3>
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
                    <strong>$79.99 / MONTH</strong>
                  </div>
                </div>
              </div>

              <div className="crest-insurance-box">
                <div className="crest-insurance-icon">
                  <FaCoins />
                </div>

                <div className="crest-insurance-content">
                  <strong>80 Room Coins</strong>
                  <span>Tier Status • Unlimited Perks</span>
                </div>

                <small>INCLUDED</small>
              </div>

              <div className="crest-price-card">
                <div className="crest-price-top">
                  <div className="crest-price">
                    <span>$79.99</span>
                    <small>/month</small>
                  </div>

                  <span className="crest-minimum-badge">MINIMAL FEE</span>
                </div>

                <p className="crest-price-description">
                  Billed automatically every month. Zero hidden booking fees.
                  Cancel anytime via online portal or support.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="membership-benefits tb-gap">
          <div className="center-text">
            <span>MEMBERSHIP ADVANTAGES</span>
            <h2>Why Prestige Plan?</h2>
            <p>
              With the Prestige plan, you get premium services and exclusive
              member benefits in a single membership designed to make your
              travel more relaxing and rewarding
            </p>
          </div>
          <div className="detailed-cards">
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <BsFillPersonCheckFill />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Quick Sign-Up Process.</h2>
                <p>Immediate credentials and instant portal login</p>
                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaTag />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Amazing Deals & Discounts Daily.</h2>
                <p>Daily updated member-only rates across the globe</p>
                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <MdFreeCancellation />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Easy Membership Cancellation.</h2>
                <p>No cumbersome commitments; manage your pass anytime</p>
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
                <h2>
                  100% Refund eligibility is Subject to Terms & Conditions.
                </h2>
                <p>Transparent protocols safeguard your membership dues</p>
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
                <h2>24/7 Assistance.</h2>
                <p>Dedicated personal travel desk always on standby</p>
                <div className="miniCardLine" />
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaIdeal />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Travel Deals & Status Perks</h2>
                <p>Elevated standing with luxury partners worldwide</p>
                <div className="miniCardLine" />
              </div>
            </div>
          </div>
        </section>

        <section className="membership-benefits tb-gap">
          <div className="center-text">
            <span>HIGH-TOUCH TRAVEL DIRECTORY</span>
            <h2>
              Prestige Membership Plan Is <br /> More Than Just Bookings
            </h2>
            <p>
              Joining Prestige membership on Crest Travel Club not only offers
              you great discounts on flight and hotel bookings, cruises, car
              rentals, but also offers members premium travel services and
              benefits to add more value, flexibility, and convenience to their
              journeys.
            </p>
          </div>
          <div className="detailed-cards">
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaWineGlass />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Unlimited Airport Lounge Access</h2>
                <p>
                  Escape the terminal hustle with complimentary access to over
                  1,400 VIP lounges globally
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaBrain />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Reconfirm.AI</h2>
                <p>
                  Smart AI reservation verification & continuous fare drop
                  protection tracking your routes
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <RiShieldCrossLine />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Flight Insurance Up To 200K</h2>
                <p>
                  Robust coverage of up to $200,000 against unexpected flight
                  disruptions and emergencies
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <GiPassport />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Fast Pass Passport & Visa Services</h2>
                <p>
                  Expedited consular liaison and document clearances tailored
                  for urgent executive departures
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <BsLuggage />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>BagAssure-Family</h2>
                <p>
                  Real-time retrieval assistance and comprehensive compensation
                  protocol for lost luggage
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <FaShop />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Travel Marketplace + Status Max</h2>
                <p>
                  Instant elite status matchmaking across international
                  hospitality and cruise partners
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
                <h2>Room Coin Bundle - 80 Room Coins Monthly</h2>
                <p>
                  Monthly automatic credit balance added to your wallet for
                  flexible travel stay redemption
                </p>
              </div>
            </div>
            <div className="miniCard miniCardNew">
              <div className="miniCardTop">
                <div className="miniCardIcon">
                  <GiJetpack />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Private Jet Service</h2>
                <p>
                  Direct access to empty-leg inventory and chartered heavy jets
                  through our exclusive broker desk
                </p>
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon miniCardIconNew">
                  <FaBriefcaseMedical />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Medi-Jet Service</h2>
                <p>
                  Urgent aeromedical evacuation and repatriation network ready
                  to deploy anywhere globally
                </p>
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon miniCardIconNew">
                  <MdLuggage />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Luggage Storage</h2>
                <p>
                  Secure, premium baggage drop facilities at prime transit hubs
                  and city-center terminals
                </p>
              </div>
            </div>
            <div className="miniCard">
              <div className="miniCardTop">
                <div className="miniCardIcon miniCardIconNew">
                  <FaUserDoctor />
                </div>
              </div>
              <div className="miniCardBody">
                <h2>Doc In A Suitcase - Unlimited</h2>
                <p>
                  24/7 multilingual telemedicine consultations for your whole
                  travel party, wherever you roam
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
              Membership automatically renews every month, ensuring
              uninterrupted access until you choose to cancel
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
                <h3>How To Sign Up For A Prestige Membership Plan?</h3>

                {activeFaq === 0 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 0 && (
                <div className="crestFaqAnswer">
                  <p>
                    Signing up for the Prestige Membership Plan is a simple and
                    quick procedure:
                  </p>

                  <ol>
                    <li>
                      First, create an account on the official Crest Travel Club
                      website
                    </li>
                    <li>Then, choose the Prestige Membership Tier Option</li>
                    <li>After that, pay the Membership Fee ($79.99/month)</li>
                    <li>Complete the membership sign-up process</li>
                    <li>Check the confirmation you received by email or SMS</li>
                    <li>
                      Once done, start exploring the available travel benefits
                      and services included with your membership
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
                <h3>What Is A Prestige Membership Plan?</h3>

                {activeFaq === 1 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 1 && (
                <div className="crestFaqAnswer">
                  <p>
                    The Crest Travel Club Prestige Membership Plan is a premium
                    travel membership that gives members access to a wide range
                    of travel benefits, services, deals, and exclusive
                    privileges. For $79.99/month, Prestige members can access
                    benefits across hotels, flights, vacation rentals, cruises,
                    activities, airport lounges, travel services, Room Coins,
                    and more.
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
              >
                <h3>What Benefits Does Prestige Membership Plan Offer?</h3>

                {activeFaq === 2 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 2 && (
                <div className="crestFaqAnswer">
                  <p>
                    Prestige members receive a wide range of travel services and
                    benefits, such as hotels, vacation rentals, flights, events
                    and tickets, cruises, activities, tours, unlimited airport
                    lounge access, Travel Marketplace + Status Max, Flight
                    Insurance up to $200K, BagAssure – Family, Fast Pass
                    Passport and Visa Service, and 80 Room Coins every month.
                    Members also get access to additional travel services, like
                    Private Jet Service, Medi-Jet Service, Luggage Storage, and
                    curated travel deals, subject to applicable terms and
                    conditions
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}
              >
                <h3>How Much Does Crest Travel Club Prestige Plan Cost?</h3>

                {activeFaq === 3 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 3 && (
                <div className="crestFaqAnswer">
                  <p>
                    The Crest Travel Club Prestige Plan costs $79.99 per month.
                    All members get access to the Prestige benefits and services
                    available under the plan, subject to applicable terms and
                    conditions
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 4 ? null : 4)}
              >
                <h3>How Many Room Coins Do Prestige Members Receive?</h3>

                {activeFaq === 4 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 4 && (
                <div className="crestFaqAnswer">
                  <p>
                    If you are a Prestige member, you receive 80 Room Coins
                    every month as part of your membership benefits. You can use
                    these coins for eligible travel bookings, subject to the
                    applicable terms and conditions
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 5 ? null : 5)}
              >
                <h3>Can Prestige Members Access Private Jet Services?</h3>

                {activeFaq === 5 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 5 && (
                <div className="crestFaqAnswer">
                  <p>
                    Yes, Private Jet service is one of the Prestige membership
                    perks. It offers all eligible members access to enjoy
                    premium private-jet travel services. However, applicable
                    terms and conditions, booking requirements, price, and
                    availability may differ
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 6 ? null : 6)}
              >
                <h3>Do Prestige Members Get Flight Insurance?</h3>

                {activeFaq === 6 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 6 && (
                <div className="crestFaqAnswer">
                  <p>
                    Yes. If you are a Prestige member, you get flight insurance
                    of up to 200K as part of your membership perks, subject to
                    applicable terms and conditions, eligibility criteria, and
                    exclusions. This perk is specifically designed to provide
                    additional financial protection during eligible travel
                    circumstances
                  </p>
                </div>
              )}
            </div>
            <div className="crestFaqBox">
              <div
                className="crestFaqHead"
                onClick={() => setActiveFaq(activeFaq === 7 ? null : 7)}
              >
                <h3>Can I Cancel My Prestige Membership?</h3>

                {activeFaq === 7 ? <FaMinus /> : <FaPlus />}
              </div>

              {activeFaq === 7 && (
                <div className="crestFaqAnswer">
                  <p>
                    Canceling the Prestige Membership is subject to Crest Travel
                    Club’s applicable cancellation terms and conditions.
                    Further, you should go through those rules and regulations
                    carefully, or reach out to the customer service team for any
                    assistance
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
              Ready To Experience Luxury Throughout Your Trip?
            </h1>
            <p className="crest-signature-description">
              Upgrade With Prestige Plan!
            </p>
            <button
              className="crest-signature-cta"
              onClick={() => handleMembershipSelect(21, "Prestige", 79.99)}
            >
              <span>
                CLICK TO JOIN THE PRESTIGE PLAN WITH A MINIMAL SIGN-UP FEE
                ($79.99 PER MONTH)
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

export default Prestige;
