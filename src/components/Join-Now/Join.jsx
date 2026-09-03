import React, { useEffect, useState } from "react";
import "./Join.css";
import { priceShow } from "../../store/Services/AllApi";
import Loader from "../../reuseable-components/Loader/Loader";
import Header from "../../reuseable-components/Header";
import Footer from "../../reuseable-components/Footer";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaGem,
  FaShieldAlt,
  FaCrown,
  FaPlane,
  FaLock,
  FaConciergeBell,
  FaGlobe,
  FaTrophy,
  FaCheckCircle,
  FaCheck,
  FaStar,
  FaMedal,
  FaHeadset,
  FaTags,
} from "react-icons/fa";
import HeaderInner from "../../reuseable-components/HeaderInner";
const Join = () => {
  const navigate = useNavigate();
  const [priceSave, setPriceSave] = useState("");
  const [loading, setLoading] = useState(false);

  const priceHandler = async (amount) => {
    try {
      setLoading(true);
      const res = await priceShow({
        body: {
          amount,
        },
      });
      if (res?.success && res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleMembershipSelect = (membershipId, membershipName, price) => {
    navigate("/checkout", {
      state: {
        membershipId,
        membershipName,
        price,
      },
    });
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    // SEO Meta Data
    document.title = "Join Crest Travel Club | Membership Plans & Pricing";

    const metaDescription =
      "Compare Crest Travel Club membership packages — Signature, Elite, and Prestige. Choose your plan and start saving on hotels, flights, cruises & more.";

    let description = document.querySelector('meta[name="description"]');

    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }

    description.setAttribute("content", metaDescription);

    // Canonical URL
    const canonicalUrl = "https://www.cresttravelclub.com/join-now";

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);

    // Cleanup when leaving the page
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');

      if (canonical) {
        canonical.remove();
      }
    };
  }, []);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <>
      {loading && <Loader />}
      <section className="pricing-section">
        {isLoggedIn ? <HeaderInner /> : <Header />}
        {/* <section className="membershipPlans tb-gap">
          <div className="container">
            <p className="membershipPlans__subtitle">ELITE TIERS</p>
            <h2 className="membershipPlans__title">Choose Your Experience</h2>
            <p className="membershipPlans__description">
              Invest in a lifestyle of discovery with our carefully structured
              membership programs.
            </p>
            <div className="membershipPlans__cards">
              <div className="membershipPlans__card">
                <div className="membershipPlans__icon">
                  <FaGem />
                </div>

                <h3>Signature</h3>

                <span className="membershipPlans__badge">$39.99 / Month</span>

                <ul className="membershipPlans__features">
                  <li>
                    <FaCheck /> Hotels
                  </li>
                  <li>
                    <FaCheck /> Flights
                  </li>
                  <li>
                    <FaCheck /> Activities
                  </li>
                  <li>
                    <FaCheck /> Vacation Rental
                  </li>
                  <li>
                    <FaCheck /> Cruises
                  </li>
                  <li>
                    <FaCheck /> Ride Center
                  </li>
                  <li>
                    <FaCheck /> Tours
                  </li>
                  <li>
                    <FaCheck /> Events and Tickets
                  </li>
                  <li>
                    <FaCheck /> Reconfirm.AI Every Hotel Reservation
                  </li>
                  <li>
                    <FaCheck /> Flight Insurance (200K)
                  </li>
                  <li>
                    <FaCheck /> Daily Discounts
                  </li>
                  <li>
                    <FaCheck /> Travel Marketplace + Status Max
                  </li>
                  <li>
                    <FaCheck /> Room Coin Bundle – 40 Room Coins Monthly
                  </li>
                </ul>

                <button
                  onClick={() => handleMembershipSelect(1, "Signature", 39.99)}
                >
                  Select Plan →
                </button>
              </div>
              <div className="membershipPlans__card membershipPlans__card--active">
                <div className="membershipPlans__topBadge">MOST DESIRED</div>

                <div className="membershipPlans__icon">
                  <FaGlobe />
                </div>

                <h3>Elite</h3>

                <span className="membershipPlans__badge membershipPlans__badge--gold">
                  $59.99 / Month
                </span>

                <ul className="membershipPlans__features">
                  <li>
                    <FaCheck /> Hotels
                  </li>
                  <li>
                    <FaCheck /> Flights
                  </li>
                  <li>
                    <FaCheck /> Activities
                  </li>
                  <li>
                    <FaCheck /> Vacation Rental
                  </li>
                  <li>
                    <FaCheck /> Cruises
                  </li>
                  <li>
                    <FaCheck /> Ride Center
                  </li>
                  <li>
                    <FaCheck /> Tours
                  </li>
                  <li>
                    <FaCheck /> Events and Tickets
                  </li>
                  <li>
                    <FaCheck /> Reconfirm.AI Every Hotel Reservation
                  </li>
                  <li>
                    <FaCheck /> Flight Insurance (200K)
                  </li>
                  <li>
                    <FaCheck /> Daily Discounts
                  </li>
                  <li>
                    <FaCheck /> Travel Marketplace + Status Max
                  </li>
                  <li className="new-feature">
                    <FaCheck /> Airport Lounge Access – Unlimited
                  </li>

                  <li className="new-feature">
                    <FaCheck /> BagAssure – Individual
                  </li>

                  <li className="new-feature">
                    <FaCheck /> Fast Pass Passport & Visa Service
                  </li>
                  <li className="new-feature">
                    <FaCheck /> Room Coin Bundle – 60 Room Coins Monthly
                  </li>
                  <li className="new-feature">
                    <FaCheck /> Member Engagement Service (Curated Deals)
                  </li>
                </ul>

                <button
                  className="membershipPlans__activeBtn"
                  onClick={() => handleMembershipSelect(2, "Elite", 59.99)}
                >
                  Select Plan →
                </button>
              </div>
              <div className="membershipPlans__card">
                <div className="membershipPlans__icon">
                  <FaTrophy />
                </div>

                <h3>Prestige</h3>

                <span className="membershipPlans__badge">$79.99 / Month</span>

                <ul className="membershipPlans__features">
                  <li>
                    <FaCheck /> Hotels
                  </li>
                  <li>
                    <FaCheck /> Flights
                  </li>
                  <li>
                    <FaCheck /> Activities
                  </li>
                  <li>
                    <FaCheck /> Vacation Rental
                  </li>
                  <li>
                    <FaCheck /> Cruises
                  </li>
                  <li>
                    <FaCheck /> Ride Center
                  </li>
                  <li>
                    <FaCheck /> Tours
                  </li>
                  <li>
                    <FaCheck /> Events and Tickets
                  </li>
                  <li>
                    <FaCheck /> Reconfirm.AI Every Hotel Reservation
                  </li>
                  <li>
                    <FaCheck /> Airport Lounge Access – Unlimited
                  </li>
                  <li>
                    <FaCheck /> Flight Insurance (200K)
                  </li>
                  <li>
                    <FaCheck /> Daily Discounts
                  </li>
                  <li>
                    <FaCheck /> Travel Marketplace + Status Max
                  </li>
                  <li>
                    <FaCheck /> Fast Pass Passport & Visa Service
                  </li>
                  <li>
                    <FaCheck /> Member Engagement Service (Curated Deals)
                  </li>
                  <li className="new-feature">
                    <FaCheck /> BagAssure – Family
                  </li>

                  <li className="new-feature">
                    <FaCheck /> Room Coin Bundle – 80 Room Coins Monthly
                  </li>

                  <li className="new-feature">
                    <FaCheck /> Luggage Storage
                  </li>
                  <li className="new-feature">
                    <FaCheck /> Private Jet Service
                  </li>
                  <li className="new-feature">
                    <FaCheck /> Medi-Jet Service
                  </li>
                  <li className="new-feature">
                    <FaCheck /> Doc In A Suitcase – Unlimited Vacations
                  </li>
                </ul>

                <button
                  onClick={() => handleMembershipSelect(3, "Prestige", 79.99)}
                >
                  Select Plan →
                </button>
              </div>
            </div>
          </div>
        </section> */}

        <section className="travelClubGuide">
          <div className="travelClubGuide__container">
            {/* Introduction */}
            <div className="travelClubGuide__intro">
              {/* <span className="travelClubGuide__eyebrow">
                TRAVEL CLUB GUIDE
              </span> */}

              <h1 className="travelClubGuide__title">
                Unlock Travel Potential :{" "}
                <span>Join the Crest Travel Club Today!</span>
              </h1>

              <p>
                When you think of joining a travel club, what comes to mind
                first? Which plan is best to choose? Which benefits the most,
                and how can you trust the club with your money? These are the
                common questions that need to be addressed.
              </p>

              <p>
                Because when you choose a travel club to join, you're not paying
                money for a subscription but for their services as well. So,
                choosing the right one is essential. A wrong decision can ruin
                your entire trip or travel experience.
              </p>
            </div>

            {/* Why Sign Up */}
            {/* <div className="travelClubGuide__contentBlock">
              <div className="travelClubGuide__content">
                <h3>Why Sign Up Is Required?</h3>

                <p>
                  Before choosing a subscription plan, review the travel club's
                  website and check what they are offering. Then choose the plan
                  that best fits your travel needs.
                </p>

                <p>
                  However, a travel club like Crest Travel Club does not
                  explicitly disclose its unlisted fares to non-members. That
                  means you must sign up to view the discounted fare list.
                </p>

                <p>
                  But that doesn't mean you can't check how much savings they
                  promise and what benefits each membership plan offers. You can
                  check the details for free, but to get them, you must sign up.
                </p>
              </div>
            </div> */}

            <div className="travelClubGuide__contentBlock">
              <div className="travelClubGuide__content">
                <h3>Why Trust Crest Travel Club?</h3>

                <p>
                  All policies, rules, and regulations are clearly stated on
                  their website. The travel club also offers membership
                  cancellation and refunds. However, you must meet certain rules
                  and submit the request within a set timeframe.
                </p>

                <p>
                  In addition, the club offers 40-50% member discount and helps
                  you save up to 70% even on personalized vacation packages.
                </p>

                <div className="travelClubGuide__trustGrid">
                  <div>
                    <FaShieldAlt />
                    <strong>Clear Policies</strong>
                    <span>
                      Membership rules and regulations are clearly stated.
                    </span>
                  </div>

                  <div>
                    <FaLock />
                    <strong>Membership Protection</strong>
                    <span>
                      Cancellation and refund options are available subject to
                      applicable rules.
                    </span>
                  </div>

                  <div>
                    <FaTags />
                    <strong>Member Savings</strong>
                    <span>
                      Members can access advertised discounts and travel
                      savings.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Plans */}
            <div className="travelClubGuide__contentBlock">
              <div className="travelClubGuide__content">
                <h3>What Are The Membership Plans Of Crest Travel Club?</h3>

                <p>
                  As mentioned on the official Crest website, the travel club
                  has split its membership plans into three categories:
                  Signature, Elite, and Prestige. Each plan outlines the
                  benefits the club offers its members.
                </p>

                <p>
                  Here is the breakdown of the benefits each member will receive
                  under their chosen subscription plan:
                </p>

                <div className="travelClubGuide__planGrid">
                  <div className="travelClubGuide__planCard">
                    <div className="travelClubGuide__planIcon">
                      <FaMedal />
                    </div>

                    <h4>Signature</h4>
                    <p>
                      Designed for travelers looking for essential travel
                      benefits with an affordable membership.
                    </p>
                  </div>

                  <div className="travelClubGuide__planCard travelClubGuide__planCard--featured">
                    <div className="travelClubGuide__planIcon">
                      <FaGem />
                    </div>

                    <h4>Elite</h4>
                    <p>
                      A balanced membership offering additional rewards and
                      premium travel privileges.
                    </p>
                  </div>

                  <div className="travelClubGuide__planCard">
                    <div className="travelClubGuide__planIcon">
                      <FaCrown />
                    </div>

                    <h4>Prestige</h4>
                    <p>
                      The premium option for travelers looking for enhanced
                      benefits and luxury travel services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Choosing a Plan */}
            <div className="travelClubGuide__contentBlock">
              <div className="travelClubGuide__content">
                <h3>Which Subscription Plan Is Good To Choose?</h3>

                <p>
                  The best plan depends entirely on your requirements and
                  preferences. However, if you are a solo traveler, you can go
                  with a Signature Plan. It might have limited benefits, but it
                  suits a single traveler. The sign-up cost is lower and offers
                  huge daily discounts.
                </p>

                <div className="travelClubGuide__highlight">
                  <FaCheckCircle />

                  <span>
                    Choose the membership that best matches your travel
                    frequency, budget, and preferred benefits.
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Plan */}
            <div className="travelClubGuide__contentBlock travelClubGuide__contentBlock--accent">
              <div className="travelClubGuide__content">
                <h3>Why Is the Signature Plan Good for a Solo Traveler?</h3>

                <p>
                  Despite its limited benefits, the Signature plan is the best
                  fit for a solo traveler. It removes the stress of mapping out
                  the whole trip and booking alone. It offers huge daily
                  discounts and a permit to register for a loyalty program and
                  to upgrade it.
                </p>

                <p>
                  Here are the reasons why the Signature Plan is good for a solo
                  traveler:
                </p>

                <ul className="travelClubGuide__benefitList">
                  <li>
                    <FaCheck />
                    <span>
                      The joining fee is lower compared to other plans.
                    </span>
                  </li>

                  <li>
                    <FaCheck />
                    <span>
                      Offers a daily discount and flight insurance coverage up
                      to 200K.
                    </span>
                  </li>

                  <li>
                    <FaCheck />
                    <span>
                      Allows you to create a personalized vacation plan.
                    </span>
                  </li>

                  <li>
                    <FaCheck />
                    <span>
                      Covers all travel-related expenses, including flights,
                      hotels, cruises, and car rentals.
                    </span>
                  </li>

                  <li>
                    <FaCheck />
                    <span>
                      Provides 40 monthly reward credits to offset or book
                      accommodations in the form of a 40-room-coin bundle.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Trust */}
          </div>
        </section>

        <section className="mp-section tb-gap">
          <div className="container">
            <div className="mp-heading">
              <span className="crest-member-tag">MEMBERSHIP</span>
              <h2>
                Choose The Perfect <span>Membership</span>
              </h2>
              <div className="travelBenefits__divider">
                <span></span>
                <div className="travelBenefits__diamond"></div>
                <span></span>
              </div>
            </div>
            <div className="mp-pricing-wrapper">
              <div className="mp-card mp-signature">
                <div className="mp-plan-top">
                  <div className="mp-icon signature-icon">
                    <FaMedal />
                  </div>

                  <h3>Signature</h3>

                  <p>Perfect for getting started</p>

                  <div className="mp-price">
                    <h2>$39.99</h2>
                    <span>/ Month</span>
                  </div>
                </div>

                <div className="mp-divider"></div>

                <ul className="mp-feature-list">
                  <li>
                    <FaCheck /> Hotels
                  </li>

                  <li>
                    <FaCheck /> Flights
                  </li>

                  <li>
                    <FaCheck /> Activities
                  </li>

                  <li>
                    <FaCheck /> Vacation Rental
                  </li>

                  <li>
                    <FaCheck /> Cruises
                  </li>

                  <li>
                    <FaCheck /> Ride Center
                  </li>

                  <li>
                    <FaCheck /> Tours
                  </li>

                  <li>
                    <FaCheck /> Events and Tickets
                  </li>

                  <li>
                    <FaCheck /> Reconfirm.AI Every Hotel Reservation
                  </li>

                  <li>
                    <FaCheck />
                    Flight Insurance (200K)
                  </li>

                  <li>
                    <FaCheck />
                    Daily Discounts
                  </li>

                  <li>
                    <FaCheck />
                    Travel Marketplace + Status Max
                  </li>

                  <li>
                    <FaCheck />
                    Room Coin Bundle - 40 Room Coins Monthly
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Airport Lounge Access - Unlimited
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      BagAssure - Individual
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Fast Pass Passport and Visa Service
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Member Engagement Service (Curated Deals)
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Luggage Storage
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Private Jet Service
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Medi-Jet Service
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Doc In A Suitcase - Unlimited Vacations
                    </span>
                  </li>
                </ul>

                <button
                  className="mp-btn"
                  onClick={() => handleMembershipSelect(13, "Signature", 39.99)}
                >
                  Choose Signature
                </button>
              </div>
              <div className="mp-card mp-featured">
                <div className="mp-popular">MOST POPULAR</div>

                <div className="mp-plan-top">
                  <div className="mp-icon elite-icon">
                    <FaGem />
                  </div>

                  <h3>Elite</h3>

                  <p>More rewards. More privileges.</p>

                  <div className="mp-price">
                    <h2>$59.99</h2>
                    <span>/ Month</span>
                  </div>
                </div>

                <div className="mp-divider"></div>

                <ul className="mp-feature-list">
                  <li>
                    <FaCheck /> Hotels
                  </li>

                  <li>
                    <FaCheck /> Flights
                  </li>

                  <li>
                    <FaCheck /> Activities
                  </li>

                  <li>
                    <FaCheck /> Vacation Rental
                  </li>

                  <li>
                    <FaCheck /> Cruises
                  </li>

                  <li>
                    <FaCheck /> Ride Center
                  </li>

                  <li>
                    <FaCheck /> Tours
                  </li>

                  <li>
                    <FaCheck /> Events and Tickets
                  </li>

                  <li>
                    <FaCheck /> Reconfirm.AI Every Hotel Reservation
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Airport Lounge Access - Unlimited
                    </span>
                  </li>

                  <li>
                    <FaCheck /> Flight Insurance (200K)
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> BagAssure - Individual
                    </span>
                  </li>

                  <li>
                    <FaCheck /> Daily Discounts
                  </li>

                  <li>
                    <FaCheck /> Travel Marketplace + Status Max
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Fast Pass Passport and Visa Service
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Room Coin Bundle - 60 Room Coins Monthly
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Member Engagement Service (Curated Deals)
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Luggage Storage
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Private Jet Service
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Medi-Jet Service
                    </span>
                  </li>

                  <li className="locked">
                    <span>
                      <FaLock />
                      Doc In A Suitcase - Unlimited Vacations
                    </span>
                  </li>
                </ul>

                <button
                  className="mp-btn"
                  onClick={() => handleMembershipSelect(20, "Elite", 59.99)}
                >
                  Choose Elite
                </button>
              </div>
              <div className="mp-card mp-signature">
                <div className="mp-plan-top">
                  <div className="mp-icon signature-icon">
                    <FaCrown />
                  </div>

                  <h3>Prestige</h3>

                  <p>Ultimate luxury. Unlimited benefits.</p>

                  <div className="mp-price">
                    <h2>$79.99</h2>
                    <span>/ Month</span>
                  </div>
                </div>
                <div className="mp-divider"></div>
                <ul className="mp-feature-list">
                  <li>
                    <FaCheck /> Hotels
                  </li>

                  <li>
                    <FaCheck /> Flights
                  </li>

                  <li>
                    <FaCheck /> Activities
                  </li>

                  <li>
                    <FaCheck /> Vacation Rental
                  </li>

                  <li>
                    <FaCheck /> Cruises
                  </li>

                  <li>
                    <FaCheck /> Ride Center
                  </li>

                  <li>
                    <FaCheck /> Tours
                  </li>

                  <li>
                    <FaCheck /> Events and Tickets
                  </li>

                  <li>
                    <FaCheck /> Reconfirm.AI Every Hotel Reservation
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Airport Lounge Access - Unlimited
                    </span>
                  </li>

                  <li>
                    <FaCheck /> Flight Insurance (200K)
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> BagAssure - Family
                    </span>
                  </li>

                  <li>
                    <FaCheck /> Daily Discounts
                  </li>

                  <li>
                    <FaCheck /> Travel Marketplace + Status Max
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Fast Pass Passport and Visa Service
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Room Coin Bundle - 80 Room Coins Monthly
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Member Engagement Service (Curated Deals)
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Luggage Storage
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Private Jet Service
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Medi-Jet Service
                    </span>
                  </li>

                  <li className="new-feature">
                    <span>
                      <FaCheck /> Doc In A Suitcase - Unlimited Vacations
                    </span>
                  </li>
                </ul>
                <button
                  className="mp-btn"
                  onClick={() => handleMembershipSelect(21, "Prestige", 79.99)}
                >
                  Choose Prestige
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="membership-info-section">
          <div className="container">
            <p className="membership-info-text">
              Crest Travel Club has divided its membership plans into three
              categories: Signature, Elite, and Prestige. Each membership offers
              great travel-related services and benefits. However, to access the
              biggest discounts, offers, and perks, purchase the higher
              membership plan. The higher your plan is, the more perks you will
              receive, such as unlimited airport lounge access, BagAssure, room
              coin bundles, etc. So, don’t waste your time and immediately
              contact Crest Travel Club customer service.
            </p>
          </div>
        </section>
      </section>
      <Footer />
    </>
  );
};

export default Join;
