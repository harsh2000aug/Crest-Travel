import React, { useEffect, useState } from "react";
import Header from "../../../reuseable-components/Header";
import Footer from "../../../reuseable-components/Footer";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import "./AllMembershipPlans.css";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaWineGlass,
  FaRobot,
  FaPlane,
  FaShop,
  FaLock,
  FaStar,
  FaGem,
  FaBriefcaseMedical,
  FaHeadphones,
  FaRegCircleXmark,
  FaRegIdCard,
  FaCircleInfo,
  FaBuilding,
  FaShip,
  FaCompass,
  FaCar,
  FaPlaneDeparture,
  FaPercent,
  FaMasksTheater,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa6";
import { BsLuggage, BsShieldCheck, BsStarFill } from "react-icons/bs";
import {
  RiUserFollowLine,
  RiPriceTag3Line,
  RiCalendarCheckLine,
  RiVerifiedBadgeLine,
  RiCustomerService2Line,
  RiCoupon3Line,
  RiMoneyDollarCircleLine,
  RiShieldCrossLine,
  RiShieldLine,
  RiRefreshLine,
  RiWifiLine,
} from "react-icons/ri";
import prestigeimg1 from "../../../assets/images/prestige-img1.png";
import prestigeimg2 from "../../../assets/images/prestige_img2.png";
import prestigeimg3 from "../../../assets/images/prestige_img3.png";

/* ---------- DATA ---------- */

const MEMBERSHIP_ID = 21;
const MEMBERSHIP_NAME = "Prestige";
const MEMBERSHIP_PRICE = 79.99;

const WHY_CARDS = [
  {
    icon: <RiUserFollowLine />,
    label: "01 • ONBOARDING",
    title: "Quick Sign-Up Process.",
    text: "Immediate credentials and instant portal login.",
  },
  {
    icon: <RiPriceTag3Line />,
    label: "02 • CURATION",
    title: "Amazing Deals & Discounts Daily.",
    text: "Daily updated member-only rates across the globe.",
  },
  {
    icon: <RiCalendarCheckLine />,
    label: "03 • AUTONOMY",
    title: "Easy Membership Cancellation.",
    text: "No cumbersome commitments; manage your pass anytime.",
  },
  {
    icon: <RiVerifiedBadgeLine />,
    label: "04 • ASSURANCE",
    title: "100% Refund eligibility is Subject to Terms & Conditions.",
    text: "Transparent protocols safeguard your membership dues.",
  },
  {
    icon: <RiCustomerService2Line />,
    label: "05 • SUPPORT",
    title: "24/7 Assistance.",
    text: "Dedicated personal travel desk always on standby.",
  },
  {
    icon: <RiCoupon3Line />,
    label: "06 • PRIVILEGES",
    title: "Travel Deals & Status Perks.",
    text: "Elevated standing with luxury partners worldwide.",
  },
];

const DIRECTORY = [
  {
    icon: <FaWineGlass />,
    title: "Unlimited Airport Lounge Access",
    text: "Escape the terminal hustle with complimentary access to over 1,400 VIP lounges globally.",
  },
  {
    icon: <FaRobot />,
    title: "Reconfirm.AI",
    tag: "SMART AI",
    text: "Smart AI reservation verification & continuous fare drop protection tracking your routes.",
  },
  {
    icon: <RiShieldLine />,
    title: "Flight Insurance Up To 200K",
    text: "Robust coverage of up to $200,000 against unexpected flight disruptions and emergencies.",
  },
  {
    icon: <FaRegIdCard />,
    title: "Fast Pass Passport & Visa Services",
    text: "Expedited consular liaison and document clearances tailored for urgent executive departures.",
  },
  {
    icon: <BsLuggage />,
    title: "BagAssure-Family",
    text: "Real-time retrieval assistance and comprehensive compensation protocol for lost luggage.",
  },
  {
    icon: <FaShop />,
    title: "Travel Marketplace + Status Max",
    text: "Instant elite status matchmaking across international hospitality and cruise partners.",
  },
  {
    icon: <RiMoneyDollarCircleLine />,
    title: "Room Coin Bundle - 80 Room Coins Monthly",
    text: "Monthly automatic credit balance added to your wallet for flexible travel stay redemption.",
  },
  {
    icon: <FaPlane />,
    title: "Private Jet Service",
    text: "Direct access to empty-leg inventory and chartered heavy jets through our exclusive broker desk.",
  },
  {
    icon: <FaBriefcaseMedical />,
    title: "Medi-Jet Service",
    text: "Urgent aeromedical evacuation and repatriation network ready to deploy anywhere globally.",
  },
  {
    icon: <FaLock />,
    title: "Luggage Storage",
    text: "Secure, premium baggage drop facilities at prime transit hubs and city-center terminals.",
  },
  {
    icon: <RiShieldCrossLine />,
    title: "Doc In A Suitcase - Unlimited Vacations",
    text: "24/7 multilingual telemedicine consultations for your whole travel party, wherever you roam.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sam Keth",
    role: "SOLO TRAVELER • NEW YORK JOURNEY",
    quote:
      "Last year I planned a solo trip to New York. So, the plan was instant, and I was about to travel alone. I explored various platforms, including websites, third-party websites, Instagram, and all to check the flight prices and hotel options, but everything looked too expensive. Then, after checking a lot, I came across a Prestige Membership plan on Crest Travel Club. I was amazed as they were offering luxurious and premium travel services. Hence, I immediately joined the membership, and my entire journey went so smoothly. I completely enjoyed their smooth flight and hotel booking process while enjoying other perks applicable under the membership.",
  },
  {
    name: "Joseph Smith",
    role: "ANNIVERSARY GETAWAY",
    quote:
      "My husband and I wanted to do something different for our anniversary this time, so we started looking at a short vacation. Firstly, we thought of confirming the flight and hotel for our stay. So, I directly used my Prestige Plan. With this membership, I really don't have to worry about my finances, as it manages my travel expenses so well. When we reached our destination, we enjoyed everything, including sightseeing, fun activities, etc. We genuinely enjoyed it without any hassle.",
  },
  {
    name: "Chloe Watson",
    role: "GLOBAL EXPLORER",
    quote:
      "I love exploring different places all around the world. Last year I visited France, London, and Denmark. The experience was so thrilling, but my travel expenses... were enough to make me see stars. Literally, my complete bank balance was shaken last year. Then, I decided not to plan and execute my trip using some random website for flight and hotel booking. So, this time, when I went to Scotland, I planned my trip using the Prestige plan. And I'm thankful to the Crest Travel Club for offering an amazing and luxurious travel experience with this membership. It literally saves a lot. I am now going to use it every time I plan my trip.",
  },
];

const FAQS = [
  {
    q: "What Is A Prestige Membership Plan?",
    a: (
      <p>
        The Crest Travel Club Prestige Membership Plan is a premium travel
        membership that gives members access to a wide range of travel benefits,
        services, deals, and exclusive privileges. For $79.99/month, Prestige
        members can access benefits across hotels, flights, vacation rentals,
        cruises, activities, airport lounges, travel services, Room Coins, and
        more.
      </p>
    ),
  },
  {
    q: "How To Sign Up For A Prestige Membership Plan?",
    a: (
      <>
        <p>
          Signing up for the Prestige Membership Plan is a simple and quick
          procedure:
        </p>
        <ol>
          <li>
            First, create an account on the official Crest Travel Club website
          </li>
          <li>Then, choose the Prestige Membership Tier Option</li>
          <li>After that, pay the Membership Fee ($79.99/month)</li>
          <li>Complete the membership sign-up process</li>
          <li>Check the confirmation you received by email or SMS</li>
          <li>
            Once done, start exploring the available travel benefits and
            services included with your membership
          </li>
        </ol>
      </>
    ),
  },
  {
    q: "What Benefits Does Prestige Membership Plan Offer?",
    a: (
      <p>
        Prestige members receive a wide range of travel services and benefits,
        such as hotels, vacation rentals, flights, events and tickets, cruises,
        activities, tours, unlimited airport lounge access, Travel Marketplace +
        Status Max, Flight Insurance up to $200K, BagAssure – Family, Fast Pass
        Passport and Visa Service, and 80 Room Coins every month. Members also
        get access to additional travel services, like Private Jet Service,
        Medi-Jet Service, Luggage Storage, and curated travel deals, subject to
        applicable terms and conditions.
      </p>
    ),
  },
  {
    q: "How Much Does Crest Travel Club Prestige Plan Cost?",
    a: (
      <p>
        The Crest Travel Club Prestige Plan costs $79.99 per month. All members
        get access to the Prestige benefits and services available under the
        plan, subject to applicable terms and conditions.
      </p>
    ),
  },
  {
    q: "How Many Room Coins Do Prestige Members Receive?",
    a: (
      <p>
        If you are a Prestige member, you receive 80 Room Coins every month as
        part of your membership benefits. You can use these coins for eligible
        travel bookings, subject to the applicable terms and conditions.
      </p>
    ),
  },
  {
    q: "Can Prestige Members Access Private Jet Services?",
    a: (
      <p>
        Yes, Private Jet service is one of the Prestige membership perks. It
        offers all eligible members access to enjoy premium private-jet travel
        services. However, applicable terms and conditions, booking
        requirements, price, and availability may differ.
      </p>
    ),
  },
  {
    q: "Do Prestige Members Get Flight Insurance?",
    a: (
      <p>
        Yes. If you are a Prestige member, you get flight insurance of up to
        200K as part of your membership perks, subject to applicable terms and
        conditions, eligibility criteria, and exclusions. This perk is
        specifically designed to provide additional financial protection during
        eligible travel circumstances.
      </p>
    ),
  },
  {
    q: "Can I Cancel My Prestige Membership?",
    a: (
      <p>
        Canceling the Prestige Membership is subject to Crest Travel Club’s
        applicable cancellation terms and conditions. Further, you should go
        through those rules and regulations carefully, or reach out to the
        customer service team for any assistance.
      </p>
    ),
  },
];

/* ---------- COMPONENT ---------- */

const Prestige = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const handleMembershipSelect = () => {
    navigate("/checkout", {
      state: {
        membershipId: MEMBERSHIP_ID,
        membershipName: MEMBERSHIP_NAME,
        price: MEMBERSHIP_PRICE,
      },
    });
  };

  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="pt-page">
      {isLoggedIn ? <HeaderInner /> : <Header />}

      <main>
        {/* ================= HERO ================= */}
        <section className="pt-section pt-bg-sand pt-hero">
          <div className="pt-hero-grid container">
            <div className="pt-hero-left">
              <div className="pt-pill">
                <span className="pt-pill-dot" />
                INSTANT ACTIVATION • MONTHLY FLEXIBILITY • VIP MEMBER CONCIERGE
              </div>

              <h1 className="pt-hero-title">
                One Membership.
                <em>Unlimited Travel Perks.</em>
              </h1>

              <p className="pt-hero-text">
                Want to experience luxurious and premium travel services? Buy
                the Crest Travel Club Prestige plan- travel privileges, savings,
                and services now at your fingertips.
              </p>

              <div className="pt-hero-actions">
                <button
                  className="pt-btn pt-btn-black"
                  onClick={handleMembershipSelect}
                >
                  JOIN NOW - JUST $79.99/MONTH <FaArrowRight />
                </button>
                <span className="pt-hero-concierge">
                  <BsShieldCheck /> Tier 1 Global Concierge Included
                </span>
              </div>

              <div className="pt-stats">
                <div>
                  <strong>80</strong>
                  <span>ROOM COINS / MO</span>
                </div>
                <div>
                  <strong>Up to 50%</strong>
                  <span>BOOKING SAVINGS</span>
                </div>
                <div>
                  <strong>24 / 7</strong>
                  <span>PRIVATE LIAISON</span>
                </div>
              </div>
            </div>

            <div className="pt-hero-right">
              <div className="pt-pass">
                <div className="pt-pass-top">
                  <div className="pt-pass-brand">
                    <FaGem />
                    <div>
                      <strong>CREST TRAVEL CLUB</strong>
                      <span>PRESTIGE PASS</span>
                    </div>
                  </div>
                  <span className="pt-pass-badge">
                    <BsShieldCheck /> VIP TIER VERIFIED
                  </span>
                </div>

                <div className="pt-pass-chip">
                  <span className="pt-chip" />
                  <RiWifiLine className="pt-contactless" />
                </div>

                <div className="pt-pass-bottom">
                  <div>
                    <small>MEMBER INCLUSIONS</small>
                    <h3>80 Room Coins Included Monthly</h3>
                    <p>
                      Tier Status • <u>Unlimited Perks</u>
                    </p>
                  </div>
                  <div className="pt-pass-price">
                    <strong>$79.99</strong>
                    <span>/ MONTH</span>
                  </div>
                </div>
              </div>

              <div className="pt-aviation-tag">
                <FaPlaneDeparture />
                <div>
                  <strong>PRIVATE AVIATION READY</strong>
                  <span>Charter perks on request</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY PRESTIGE ================= */}
        <section className="pt-section pt-bg-ivory">
          <div className="container">
            <div className="pt-head">
              <span className="pt-eyebrow">EXCLUSIVE MEMBERSHIP CORE</span>
              <h2 className="pt-h2">Why Prestige Plan?</h2>
              <p className="pt-lead">
                With the Prestige plan, you get premium services and exclusive
                member benefits in a single membership designed to make your
                travel more relaxing and rewarding.
              </p>
            </div>

            <div className="pt-why-grid">
              {WHY_CARDS.map((c) => (
                <div className="pt-why-card" key={c.label}>
                  <div className="pt-icon-box">{c.icon}</div>
                  <div className="pt-why-body">
                    <span className="pt-why-label">{c.label}</span>
                    <h3>{c.title}</h3>
                  </div>
                  <p>{c.text}</p>
                </div>
              ))}

              <div className="pt-why-card pt-why-dark">
                <div className="pt-why-dark-top">
                  <div className="pt-icon-box pt-icon-box-navy">
                    <RiMoneyDollarCircleLine />
                  </div>
                  <span className="pt-why-badge">INCLUDED MONTHLY</span>
                </div>
                <div>
                  <span className="pt-why-label">07 • CURRENCY RESERVE</span>
                  <h3>80 Room Coins Monthly.</h3>
                  <p>
                    Receive a monthly allotment deposited straight into your
                    Crest account to redeem towards stays and luxury retreats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PORTFOLIO ================= */}
        <section className="pt-section pt-bg-sand">
          <div className="container">
            <div className="pt-head pt-head-left">
              <span className="pt-eyebrow">COMPREHENSIVE PORTFOLIO</span>
              <h2 className="pt-h2">
                One Membership - A World Of Travel Privileges
              </h2>
              <p className="pt-lead">
                Prestige Plan is designed to provide a luxurious and premium
                travel experience to every traveler. From family vacations and
                solo escapes to worldwide adventures, this plan offers access
                to:
              </p>
            </div>

            <div className="pt-portfolio">
              {/* Sanctuaries */}
              <div className="pt-pf-card pt-pf-photo">
                <img
                  src={prestigeimg1}
                  alt="Luxury seaside villa with infinity pool"
                />
                <div className="pt-pf-text">
                  <span className="pt-pf-label">
                    <FaBuilding /> SANCTUARIES
                  </span>
                  <p>
                    Hotel options/locations and travel stays designed to fit
                    your trip.
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="pt-pf-card pt-pf-price">
                <div className="pt-pf-price-top">
                  <span className="pt-pf-label">PRICING ADVANTAGE</span>
                  <FaPercent />
                </div>
                <div className="pt-pf-big">40%–50%</div>
                <div className="pt-pf-big-sub">Discount Benchmark</div>
                <div className="pt-pf-note">
                  <strong>
                    Saves up to 40%-50% on eligible booking prices.
                  </strong>
                  <span>Applied automatically across our curated network.</span>
                </div>
              </div>

              {/* Aviation */}
              <div className="pt-pf-card pt-pf-photo">
                <img src={prestigeimg2} alt="Private jet cabin interior" />
                <div className="pt-pf-text">
                  <span className="pt-pf-label">
                    <FaPlane /> AVIATION
                  </span>
                  <p>
                    A hassle-free flight search and booking process, along with
                    other perks available with the membership.
                  </p>
                </div>
              </div>

              {/* Voyages */}
              <div className="pt-pf-card pt-pf-photo">
                <img src={prestigeimg3} alt="Luxury yacht at sunset" />
                <div className="pt-pf-text">
                  <span className="pt-pf-label">
                    <FaShip /> VOYAGES
                  </span>
                  <p>Find the best cruise options for your upcoming trip.</p>
                </div>
              </div>

              {/* Culture */}
              <div className="pt-pf-card pt-pf-culture">
                <div className="pt-icon-box pt-icon-box-sand">
                  <FaMasksTheater />
                </div>
                <div className="pt-pf-text">
                  <span className="pt-pf-label">CURATED CULTURE</span>
                  <p>
                    Discover events, entertainment, and unique experiences to
                    make the journey more memorable.
                  </p>
                </div>
                <small>
                  Access exclusive tickets and gala admissions worldwide.
                </small>
              </div>

              {/* Stack */}
              <div className="pt-pf-stack">
                <div className="pt-pf-card pt-pf-mini">
                  <span className="pt-pf-label">
                    <FaCompass /> ADVENTURES
                  </span>
                  <p>
                    Explore exciting destinations with fun and thrilling
                    activities and tours.
                  </p>
                </div>
                <div className="pt-pf-card pt-pf-mini">
                  <span className="pt-pf-label">
                    <FaCar /> MOBILITY
                  </span>
                  <p>
                    Enjoy a comfortable journey with convenient transportation
                    options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DIRECTORY ================= */}
        <section className="pt-section pt-bg-ivory">
          <div className="container">
            <div className="pt-head pt-head-left">
              <span className="pt-eyebrow">HIGH-TOUCH TRAVEL DIRECTORY</span>
              <h2 className="pt-h2">
                Prestige Membership Plan Is More Than Just Bookings
              </h2>
              <p className="pt-lead">
                Joining Prestige membership on Crest Travel Club not only offers
                you great discounts on flight and hotel bookings, cruises, car
                rentals, but also offers members premium travel services and
                benefits to add more value, flexibility, and convenience to
                their journeys.
              </p>
            </div>

            <div className="pt-dir-grid">
              {DIRECTORY.map((d) => (
                <div className="pt-dir-card" key={d.title}>
                  <div className="pt-icon-box pt-icon-box-sm">{d.icon}</div>
                  <div>
                    <h3>
                      {d.title}
                      {d.tag && <em className="pt-dir-tag">{d.tag}</em>}
                    </h3>
                    <p>{d.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-note">
              <FaCircleInfo className="pt-note-icon" />
              <p>
                <span>NOTE:</span> Membership automatically renews every month,
                ensuring uninterrupted access until you choose to cancel.
              </p>
              {/* change the route below to your real Terms page */}
              <button
                className="pt-btn pt-btn-black pt-btn-sm"
                onClick={() => navigate("/terms-and-conditions")}
              >
                REVIEW TERMS
              </button>
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="pt-section pt-bg-sand">
          <div className="container">
            <div className="pt-head">
              <span className="pt-eyebrow">MEMBER ACCOUNTS</span>
              <h2 className="pt-h2">Testimonials</h2>
              <p className="pt-lead">
                Real narratives from travelers who made the Prestige transition.
              </p>
            </div>

            <div className="pt-tm-grid">
              {TESTIMONIALS.map((t) => (
                <article className="pt-tm-card" key={t.name}>
                  <div className="pt-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="pt-tm-quote">"{t.quote}"</p>
                  <div className="pt-tm-foot">
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                    <RiVerifiedBadgeLine />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="pt-section pt-bg-ivory">
          <div className="container">
            <div className="pt-head">
              <span className="pt-eyebrow">CLARITY & DISCRETION</span>
              <h2 className="pt-h2">Frequently Asked Questions</h2>
              <p className="pt-lead">
                Complete clarity regarding membership, activation, privileges,
                and cancellation.
              </p>
            </div>

            <div className="pt-faq">
              {FAQS.map((f, i) => {
                const open = activeFaq === i;
                return (
                  <div
                    className={`pt-faq-item ${open ? "is-open" : ""}`}
                    key={f.q}
                  >
                    <button
                      type="button"
                      className="pt-faq-head"
                      aria-expanded={open}
                      onClick={() => setActiveFaq(open ? null : i)}
                    >
                      <h3>{f.q}</h3>
                      {open ? <FaAngleUp /> : <FaAngleDown />}
                    </button>
                    {open && <div className="pt-faq-answer">{f.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="pt-section pt-bg-stone pt-cta-section">
          <div className="container">
            <div className="pt-cta">
              <div className="pt-cta-pill">
                <BsStarFill />
                EXCLUSIVE TRAVEL PERKS. PREMIUM REWARDS—MORE TRAVEL CHOICES.
              </div>

              <h2 className="pt-cta-title">
                Ready To Experience Luxury Throughout Your Trip?
              </h2>
              <p className="pt-cta-italic">Upgrade With Prestige Plan!</p>

              <div className="pt-cta-price">Grab It Now - $79.99/month</div>

              <button
                className="pt-btn pt-btn-gold"
                onClick={handleMembershipSelect}
              >
                JOIN PRESTIGE PLAN TODAY <FaArrowRight />
              </button>

              <ul className="pt-cta-points">
                <li>
                  <RiRefreshLine /> Monthly Automatic Renewal
                </li>
                <li className="pt-dot">•</li>
                <li>
                  <FaRegCircleXmark /> Cancel Anytime Hassle-Free
                </li>
                <li className="pt-dot">•</li>
                <li>
                  <FaHeadphones /> 24/7 Dedicated Concierge
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Prestige;
