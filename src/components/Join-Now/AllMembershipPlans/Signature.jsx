import React, { useEffect } from "react";
import Header from "../../../reuseable-components/Header";
import Footer from "../../../reuseable-components/Footer";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import "./AllMembershipPlans.css";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBed,
  FaBrain,
  FaBuilding,
  FaCertificate,
  FaCheck,
  FaCircleInfo,
  FaCoins,
  FaEyeSlash,
  FaGem,
  FaHeadphones,
  FaLock,
  FaMoneyBills,
  FaPercent,
  FaPiggyBank,
  FaPlane,
  FaPlaneDeparture,
  FaRegCircleCheck,
  FaRegCircleQuestion,
  FaRegCircleXmark,
  FaRegClock,
  FaRegStar,
  FaShieldHalved,
  FaShip,
  FaTicket,
  FaUpload,
  FaArrowRightArrowLeft,
} from "react-icons/fa6";
import { BsStarFill } from "react-icons/bs";
import { HiHomeModern } from "react-icons/hi2";
import { PiCallBellBold } from "react-icons/pi";
import { TbShieldSearch } from "react-icons/tb";
import {
  RiExchangeDollarLine,
  RiRefreshLine,
  RiShieldCrossLine,
} from "react-icons/ri";

/* ---------- DATA ---------- */

const MEMBERSHIP_ID = 13;
const MEMBERSHIP_NAME = "Signature";
const MEMBERSHIP_PRICE = 39.99;

const HERO_FEATURES = [
  { icon: <FaPlaneDeparture />, title: "Unlisted Fares", text: "Private inventory access" },
  { icon: <FaBrain />, title: "Reconfirm.AI", text: "Automated stay audits" },
  { icon: <FaPiggyBank />, title: "40–50% Savings", text: "Below retail rates" },
  { icon: <FaCoins />, title: "40–Room Coins", text: "Instant welcome bundle" },
];

const REASONS = [
  {
    icon: <FaMoneyBills />,
    tag: "01 / LOW ENTRY",
    title: "Minimal sign-up fee ($39.99/mo).",
    text: "Unrivaled high-tier travel privileges delivered without an onerous upfront initiation charge.",
  },
  {
    icon: <FaGem />,
    tag: "02 / SUITE COINS",
    title: "Numerous luxury perks, including a room coin bundle.",
    text: "Claim VIP hotel stays, room upgrades, and a dedicated 40–Room Coin allocation instantly deposited into your ledger.",
  },
  {
    icon: <FaRegCircleXmark />,
    tag: "03 / NO LOCK-IN",
    title: "Easy cancellation.",
    text: "Full control over your membership cycle. Cancel anytime directly through your member portal or directly with support.",
  },
  {
    icon: <RiExchangeDollarLine />,
    tag: "04 / GUARANTEED",
    title: "A refund can be claimed, but terms and conditions apply.",
    text: "Transparent satisfaction guarantees safeguarding your journey according to verified club charter terms.",
  },
  {
    icon: <FaEyeSlash />,
    tag: "05 / EXCLUSIVE FARES",
    title: "Access to unlisted fares and hidden gems.",
    text: "Unlock chartered repositioning legs, unpublished resort rates, and private sanctuaries off the public market.",
  },
  {
    icon: <FaHeadphones />,
    tag: "06 / WHITE GLOVE",
    title: "24/7 dedicated concierge support.",
    text: "Direct access to professional personal travel advisors ready around the clock for itinerary shaping and assistance.",
  },
];

const PERKS = [
  {
    icon: <FaBed />,
    title: "Premium Hotel Bookings",
    text: "Curated access to luxury suites and boutique 5-star properties worldwide.",
  },
  {
    icon: <FaPlane />,
    title: "Flights Reservations",
    text: "Global commercial itineraries and empty-leg repositioning routes.",
  },
  {
    icon: <FaTicket />,
    title: "Travel-Related Activities",
    text: "Private tours, bespoke excursions, and sommelier-guided culinary outings.",
  },
  {
    icon: <HiHomeModern />,
    title: "Vacation Rental",
    text: "Private chalets, beach villas, and secluded estates vetted for absolute comfort.",
  },
  {
    icon: <FaShip />,
    title: "Cruises Reservation",
    text: "Luxury ocean suites and river yacht expeditions with member onboard credits.",
  },
  {
    icon: <FaCoins />,
    title: "Room Coins Rewards",
    text: "Includes 40-Room-Coin bundle credited instantly upon activation for room redemptions.",
    featured: true,
    tag: "06 • FEATURED",
    foot: "40 COINS INCLUDED",
    mono: true,
  },
  {
    icon: <PiCallBellBold />,
    title: "Dedicated Travel Services",
    text: "End-to-end guidance from travel experts mapped specifically to your schedule.",
  },
  {
    icon: <FaPercent />,
    title: "Discounted Bookings",
    text: "40-50% off regular prices across club preferred partner properties and flights.",
    foot: "40-50% OFF",
    mono: true,
  },
  {
    icon: <FaUpload />,
    title: "Status Max Access",
    text: "Access to unlock top-tier privileges through Status Max match and accelerated loyalty tiers.",
  },
  {
    icon: <RiShieldCrossLine />,
    title: "Flight Insurance Up to 200K",
    text: "Emergency transit protection and compensation policy attached automatically to tickets.",
    foot: "UP TO $200,000",
    mono: true,
  },
];

const TESTIMONIALS = [
  {
    name: "Victoria Vence",
    role: "International Journey",
    quote:
      "I was looking for a travel club that could help me in planning a trip, but my budget was not much. During my research, I came across the Crest website. When I checked its membership plan, I found the Signature Plan fit my budget perfectly. I immediately signed up and got the best deals on my first international trip.",
  },
  {
    name: "Marcus Throne",
    role: "Luxury Escapes",
    quote:
      "If your budget is low and you don’t want to pay a fortune yet are looking for a luxurious trip, then you should join Crest Travel Club. Its Signature Membership plan has the best deals with numerous perks. The entire process, from joining the club to planning a trip, you can get guidance from a travel expert.",
  },
  {
    name: "Luxas Jonathan",
    role: "Cabo Gateway",
    quote:
      "I recently came back from my Cabo trip with a lot of happy memories. Since my childhood, I have wanted to visit this place, but every time I freaked out when mapping the trip. Thanks to Crest Travel Club, which helped me plan my trip so easily and offered numerous perks with their Signature plan. With the minimal joining fee, I unlocked the mega savings.",
  },
];

const FAQS = [
  {
    icon: <FaRegCircleQuestion />,
    q: "How Can I Sign Up For Signature Membership Plan?",
    a: (
      <>
        <p>
          You can sign up for the Signature membership plan by creating an
          account. Here are the steps:
        </p>
        <ol>
          <li>Create an account on the Official Crest Travel Club Website.</li>
          <li>Choose the Signature Membership Tier Option.</li>
          <li>Pay the Membership Fee ($39.99/per month).</li>
          <li>
            Get instant confirmation and account activation details via SMS and
            email.
          </li>
          <li>Get access to unlisted fares, packages, and discounts.</li>
        </ol>
      </>
    ),
  },
  {
    icon: <FaMoneyBills />,
    q: "How Much Is The Signature Membership Fee?",
    a: (
      <p>
        You pay $39.99 per month to activate the Signature membership plan. The
        amount will be deducted automatically from your account every month. To
        pause, stop, cancel, or change automatic renewal, you need to contact
        the Crest Customer Support team.
      </p>
    ),
  },
  {
    icon: <FaCertificate />,
    q: "What Benefits Do I Get In The Signature Plan?",
    a: (
      <p>
        You will get the baseline travel discounts and coverages with the
        Signature plan. Benefits include the 40–Room–Coin bundle, flight
        insurance up to $200K, full travel expense coverage, personalized
        vacation planning, and loyalty &amp; upgrades.
      </p>
    ),
  },
  {
    icon: <FaBuilding />,
    q: "Can I Get A Luxury Stay In The Signature Membership Plan?",
    a: (
      <p>
        Yes, with the Signature membership plan, you can get luxury stays in
        hotels, villas, and other private properties in the Crest Travel Club
        network. Additionally, you’ll get 40–50% discounts and member-only
        rates.
      </p>
    ),
  },
  {
    icon: <FaArrowRightArrowLeft />,
    q: "Can I Transfer My Signature Membership Plan?",
    a: (
      <p>
        No, you can’t transfer your Signature membership plan. The club doesn’t
        offer a facility that allows members to transfer their membership plan.
        For more information, contact Crest customer service.
      </p>
    ),
  },
];

/* ---------- COMPONENT ---------- */

const Signature = () => {
  const navigate = useNavigate();

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
    <div className="pt-page pt-sig">
      {isLoggedIn ? <HeaderInner /> : <Header />}

      <main>
        {/* ================= HERO ================= */}
        <section className="pt-section pt-bg-ivory pt-hero">
          <div className="pt-wrap pt-hero-grid">
            <div className="pt-hero-left">
              <div className="pt-pill">
                <BsStarFill />
                OFFICIAL CREST SIGNATURE MEMBERSHIP
              </div>

              <h1 className="pt-hero-title">
                Pay Less,
                <em>Travel More!</em>
              </h1>

              <p className="pt-hero-text">
                Want to book a luxury trip while spending less? Start with a
                Signature Plan membership—your first step to the world of
                travel.
              </p>

              <div className="pt-features">
                {HERO_FEATURES.map((f) => (
                  <div className="pt-feature" key={f.title}>
                    {f.icon}
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                ))}
              </div>

              <button
                className="pt-btn pt-btn-black pt-btn-wide"
                onClick={handleMembershipSelect}
              >
                <span>
                  CLICK TO JOIN THE SIGNATURE PLAN WITH A MINIMAL SIGN-UP FEE
                  ($39.99 PER MONTH)
                </span>
                <FaArrowRight />
              </button>

              <ul className="pt-points">
                <li>
                  <FaRegCircleCheck /> Instant account activation
                </li>
                <li>
                  <FaRegCircleCheck /> Cancel online anytime
                </li>
                <li>
                  <FaRegCircleCheck /> Backed by Crest VIP Concierge
                </li>
              </ul>
            </div>

            <div className="pt-hero-right">
              <div className="pt-panel">
                <div className="pt-mc">
                  <div className="pt-mc-top">
                    <div>
                      <small>CREST GLOBAL ACCESS</small>
                      <h3>Signature Member</h3>
                    </div>
                    <FaGem />
                  </div>

                  <div className="pt-mc-number">
                    <span className="pt-chip pt-chip-peach" />
                    <span>•••• •••• •••• 8842</span>
                  </div>

                  <div className="pt-mc-bottom">
                    <div>
                      <small>MEMBERSHIP STATUS</small>
                      <strong>ACTIVE • VERIFIED TIER</strong>
                    </div>
                    <div>
                      <small>RENEWAL TIER</small>
                      <strong>$39.99 / MONTH</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-ins">
                  <span className="pt-ins-icon">
                    <FaShieldHalved />
                  </span>
                  <div>
                    <strong>200K Insurance</strong>
                    <span>Automatic Flight Policy</span>
                  </div>
                  <small>INCLUDED</small>
                </div>

                <div className="pt-price">
                  <div className="pt-price-top">
                    <div>
                      <strong>$39.99</strong>
                      <span> / month</span>
                    </div>
                    <em>MINIMAL FEE</em>
                  </div>
                  <p>
                    Billed automatically every month. Zero hidden booking fees.
                    Cancel anytime via online portal or support.
                  </p>
                  <div className="pt-price-note">
                    <FaRegClock />
                    Includes initial 40–Room Coin bundle credited on signup
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY SIGNATURE ================= */}
        <section className="pt-section pt-bg-sand">
          <div className="pt-wrap">
            <div className="pt-head">
              <span className="pt-eyebrow">MEMBERSHIP ADVANTAGES</span>
              <h2 className="pt-h2 pt-h2-narrow">Why Become A Signature Member?</h2>
              <p className="pt-lead">
                Reasons to join Crest Travel Club with Signature membership:
              </p>
            </div>

            <div className="pt-rs-grid">
              {REASONS.map((r) => (
                <div className="pt-rs-card" key={r.tag}>
                  <div className="pt-rs-top">
                    <div className="pt-icon-box pt-icon-box-sand">{r.icon}</div>
                    <span className="pt-mono">{r.tag}</span>
                  </div>
                  <div className="pt-rs-body">
                    <h3>{r.title}</h3>
                    <p>{r.text}</p>
                  </div>
                  <span className="pt-rs-line" />
                </div>
              ))}
            </div>

            <div className="pt-quote">
              <div className="pt-icon-box pt-icon-box-peach pt-icon-box-lg">
                <FaShieldHalved />
              </div>
              <div>
                <span className="pt-quote-label">CLUB SUMMARY STATEMENT</span>
                <p>
                  “Whether you want a luxury vacation or are looking for a
                  hidden gem, Crest Signature membership has a lot to offer.
                  With a minimal sign-up fee, you can access unlisted fares and
                  several perks, including a room coin bundle.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DEEP DIVE ================= */}
        <section className="pt-section pt-bg-ivory">
          <div className="pt-wrap">
            <div className="pt-head pt-head-left">
              <span className="pt-eyebrow">MEMBERSHIP DEEP DIVE</span>
              <h2 className="pt-h2 pt-h2-narrow">
                What Are The Benefits of Joining Signature Membership?
              </h2>
              <p className="pt-lead">
                If you’re skeptical about joining a travel club and wondering
                what difference it actually makes in planning a trip, start with
                a Signature plan.
              </p>
            </div>

            <div className="pt-dive">
              <div className="pt-dive-main">
                <span className="pt-dive-label">FOUNDATIONAL PRIVILEGE</span>
                <h3>
                  Signature Membership requires a minimal joining fee of
                  $39.99/per month. That means you get direct access to their
                  unlisted fares and places.
                </h3>
                <p>
                  The joining fee isn't just for access to the perks; it also
                  gets you through the walls for daily discounts. That means
                  you’re not paying to be a member but signing up for huge
                  savings on traveling around the world.
                </p>
                <div className="pt-dive-stats">
                  <div>
                    <strong>40-50%</strong>
                    <span>Average savings across resort and flight bookings</span>
                  </div>
                  <div>
                    <strong>$200K</strong>
                    <span>Complimentary automatic flight protection policy</span>
                  </div>
                </div>
              </div>

              <div className="pt-dive-side">
                <div className="pt-dive-card">
                  <div className="pt-icon-box pt-icon-box-peach pt-icon-box-sm">
                    <RiRefreshLine />
                  </div>
                  <h3>
                    With the Signature membership plan, you get numerous perks,
                    including hotel, flight, and car rental bookings and AI
                    confirmation.
                  </h3>
                  <p>
                    Leverage continuous automated Reconfirm.AI auditing across
                    every booked itinerary to assure confirmed check-ins without
                    friction.
                  </p>
                </div>
                <div className="pt-dive-card">
                  <div className="pt-icon-box pt-icon-box-peach pt-icon-box-sm">
                    <TbShieldSearch />
                  </div>
                  <h3>
                    Signature membership also includes flight insurance up to
                    200K and travel-related awards you can use for future trips.
                  </h3>
                  <p>
                    With each trip, you can save 40–50% off regular booking
                    prices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PERKS ================= */}
        <section className="pt-section pt-bg-sand">
          <div className="pt-wrap">
            <div className="pt-head">
              <span className="pt-eyebrow">COMPLETE PACKAGE INCLUSIONS</span>
              <h2 className="pt-h2 pt-h2-narrow">
                What Perks Are Covered in the Signature Membership Plan?
              </h2>
              <p className="pt-lead">
                These are the perks you’ll get in the Signature Membership Plan:
              </p>
            </div>

            <div className="pt-perk-grid">
              {PERKS.map((p, i) => (
                <div
                  className={`pt-perk ${p.featured ? "pt-perk-featured" : ""}`}
                  key={p.title}
                >
                  <div className="pt-perk-top">
                    <div className="pt-icon-box pt-icon-box-sand pt-icon-box-sm">
                      {p.icon}
                    </div>
                    <span className="pt-mono">
                      {p.tag || String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <span className={`pt-perk-foot ${p.mono ? "pt-mono" : ""}`}>
                    {p.foot || "VERIFIED PERK"}
                  </span>
                </div>
              ))}

              <div className="pt-perk pt-perk-dark">
                <div className="pt-icon-box pt-icon-box-peach pt-icon-box-lg">
                  <FaBrain />
                </div>
                <div className="pt-perk-dark-body">
                  <span className="pt-perk-dark-label">
                    PERK 11 • PATENTED TECHNOLOGY
                  </span>
                  <h3>Reconfirm.AI Every Hotel Reservation</h3>
                  <p>
                    Automated AI verification of reservations proactively
                    contacts hotel desk systems before arrival to confirm room
                    category and privileges.
                  </p>
                </div>
                <span className="pt-perk-dark-badge">LIVE AI VERIFICATION</span>
              </div>
            </div>

            <div className="pt-note pt-note-soft">
              <FaCircleInfo className="pt-note-icon" />
              <div>
                <strong>DIRECT MEMBER NOTICE</strong>
                <p>
                  Note: You don’t need to enter your financial details every
                  time to pay the Signature Membership fee. The system will
                  automatically deduct the membership fee every month from your
                  account unless you request to stop automatic payments
                  directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="pt-section pt-bg-ivory">
          <div className="pt-wrap">
            <div className="pt-head">
              <span className="pt-eyebrow">VERIFIED EXPERIENCES</span>
              <h2 className="pt-h2">What Our Members Say</h2>
              <p className="pt-lead">
                Real stories from globetrotters using the Signature Membership
                Plan.
              </p>
            </div>

            <div className="pt-tm-grid">
              {TESTIMONIALS.map((t) => (
                <article className="pt-tm-card" key={t.name}>
                  <div className="pt-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaRegStar key={i} />
                    ))}
                  </div>
                  <p className="pt-tm-quote">“{t.quote}”</p>
                  <div className="pt-tm-foot">
                    <div>
                      <strong>{t.name}</strong>
                      <small className="pt-tm-role">{t.role}</small>
                    </div>
                    <b className="pt-tm-badge">
                      <FaRegCircleCheck /> Verified Member
                    </b>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="pt-section pt-bg-sand">
          <div className="pt-wrap">
            <div className="pt-head">
              <span className="pt-eyebrow">GOT QUESTIONS?</span>
              <h2 className="pt-h2">Frequently Asked Questions</h2>
              <p className="pt-lead">
                Essential details regarding your Crest Signature Membership
                Plan.
              </p>
            </div>

            <div className="pt-faq">
              {FAQS.map((f) => (
                <div className="pt-faq-item is-open" key={f.q}>
                  <div className="pt-faq-head">
                    <h3>{f.q}</h3>
                    {f.icon}
                  </div>
                  <div className="pt-faq-answer">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="pt-section pt-cta-section">
          <div className="pt-wrap">
            <div className="pt-cta">
              <div className="pt-cta-pill">
                <FaLock />
                INSTANT WORLDWIDE ACTIVATION
              </div>

              <h2 className="pt-cta-title">Begin Your Private Journey Today.</h2>
              <p className="pt-cta-text">
                Join thousands of members enjoying 40–50% savings, unlisted
                airfares, 40 Room Coins, and 24/7 dedicated concierge
                assistance.
              </p>

              <div className="pt-cta-box">
                <div className="pt-cta-box-price">
                  <div>
                    <strong>$39.99</strong>
                    <span> / month</span>
                  </div>
                  <small>Automatic deduction • Cancel anytime</small>
                </div>
                <button
                  className="pt-btn pt-btn-black pt-btn-cta"
                  onClick={handleMembershipSelect}
                >
                  CLICK TO JOIN THE SIGNATURE PLAN WITH A MINIMAL SIGN-UP FEE
                  ($39.99 PER MONTH).
                </button>
              </div>

              <ul className="pt-cta-points pt-cta-points-small">
                <li>
                  <FaCheck /> No Long-Term Contracts
                </li>
                <li>
                  <FaCheck /> Automatic Monthly Billing
                </li>
                <li>
                  <FaCheck /> 200K Travel Insurance Policy Included
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

export default Signature;