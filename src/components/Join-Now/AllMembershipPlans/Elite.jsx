import React, { useEffect, useState } from "react";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Header from "../../../reuseable-components/Header";
import Footer from "../../../reuseable-components/Footer";
import "./AllMembershipPlans.css";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaAngleDown,
  FaAngleUp,
  FaCircleInfo,
  FaGaugeHigh,
  FaGem,
  FaKey,
  FaMagnifyingGlassLocation,
  FaPiggyBank,
  FaPlane,
  FaPlaneDeparture,
  FaRegCircleCheck,
  FaRegClock,
  FaRegStar,
  FaUpload,
} from "react-icons/fa6";
import { BsLuggage } from "react-icons/bs";
import { MdAirlineSeatReclineExtra } from "react-icons/md";
import {
  RiCustomerService2Line,
  RiMoneyDollarBoxLine,
  RiMoneyDollarCircleLine,
  RiShieldUserLine,
  RiVerifiedBadgeLine,
  RiWifiLine,
} from "react-icons/ri";

/* ---------- DATA ---------- */

// TODO: put the real Elite membership id from your backend here
const MEMBERSHIP_ID = null;
const MEMBERSHIP_NAME = "Elite";
const MEMBERSHIP_PRICE = 59.99;

const HERO_CHIPS = [
  { icon: <FaRegClock />, text: "Nominal Monthly Commitment" },
  { icon: <MdAirlineSeatReclineExtra />, text: "Unlimited Airport Lounge Included" },
  { icon: <RiMoneyDollarCircleLine />, text: "60 Room Coins / Mo" },
];

const PERKS = [
  {
    icon: <RiMoneyDollarBoxLine />,
    title: "Member-Only Pricing Access",
    text: "Access to member-only pricing across premier boutique stays, partner resorts, and tailored itineraries globally.",
  },
  {
    icon: <RiShieldUserLine />,
    title: "Airport & Travel Perks",
    text: "Comprehensive airport privileges that include entitlement to an Accidental Death or Dismemberment Benefit during eligible journeys.",
  },
  {
    icon: <FaGaugeHigh />,
    title: "Fast Passport & Visa Services",
    text: "Accelerated diplomatic courier handling and priority consular scheduling for stress-free international documentation.",
  },
  {
    icon: <BsLuggage />,
    title: "BagAssure Coverage",
    text: "Dedicated loss and delay protection designed exclusively for the primary Elite Member across commercial and private routes.",
  },
  {
    icon: <RiCustomerService2Line />,
    title: "24/7 Dedicated Assistance",
    text: "Always-on travel desk support with immediate liaison response for real-time adjustments, emergencies, and concierge requests.",
  },
];

const PILLARS = [
  {
    num: "01",
    icon: <FaUpload />,
    title: "Upgraded Perks",
    text: "With the Elite Membership Plan activation, you’ll automatically sign up for the upgraded perks, such as Fast Pass Passport and Visa Services, Member Engagement Service (Curated Deals), an individual BagAssure coverage, etc.",
    foot: "SUPERIOR TIER LEVEL",
  },
  {
    num: "02",
    icon: <FaPiggyBank />,
    title: "Higher Room Coins",
    text: "In the Elite Membership plan, the member gets 60 room coins that have real-dollar value. This will help reduce the cost of eligible hotel stays. That means you can stretch your travel budget and extend your vacation.",
    foot: "REAL-DOLLAR OFFSET",
  },
  {
    num: "03",
    icon: <FaPlane />,
    title: "Airport-Related Services",
    text: "The Elite Membership plan includes major airport-related services, including free, unlimited entry to Airport Lounges. Along with flight coverage insurance of up to 200K, you also get BagAssure coverage. However, the coverage is for an individual only. Additionally, you don’t need to worry about passport and Visa Services.",
    foot: "200K COVERAGE SUITE",
  },
];

const REASONS = [
  {
    title: "Elevated Experience",
    text: "Elite members get an elevated travel experience across every destination touchpoint.",
  },
  {
    title: "Designed for Luxury",
    text: "It's ideal for those looking for a more luxurious, uncompromised trip.",
  },
  {
    title: "Nominal Cost Structure",
    text: "The fee is nominal: $59.99 per month for a fully loaded luxury hospitality suite.",
  },
  {
    title: "Airport Lounge Access",
    text: "Free entry to the airport lounge every time you plan a trip using the Elite membership plan.",
  },
  {
    title: "Stacked Property Discounts",
    text: "Additional discounts on top of member-only rates, helping you get more premium properties at a reasonable price.",
  },
  {
    title: "Frictionless Membership Cancellation",
    text: "Easy cancellation and a full refund if you request it on time and no services have been used. (Only for the club membership; for trip cancellation and refunds, check the rules beforehand).",
  },
  {
    title: "Generous Travel Credits",
    text: "High travel credit rewards and loyalty points accrued on every booked itinerary.",
  },
  {
    title: "Curated Booking Folios",
    text: "Access to hidden gems and sophisticated smart luxury booking tools.",
  },
  {
    title: "Reconfirm AI Protection",
    text: "Reconfirm AI perk with every hotel booking made using the Elite membership plan.",
  },
];

const TESTIMONIALS = [
  {
    name: "Mei-Ling Zhou",
    role: "Upgraded from Signature",
    quote:
      "I joined the Crest with the Signature Membership plan and already decided to be a long-term, loyal member of the club. However, the perks I was getting with the entry-level membership plan weren't enough for me. So I decided to upgrade and purchase the Elite membership. And this is one of the best decisions I've made so far. I get unlimited Airport Lounge Access for free with just the difference of $20.",
  },
  {
    name: "Jonathan",
    role: "Verified Elite Member",
    quote:
      "I would like to appreciate the efforts put in by the Crest team in planning my trip. I hate planning things and always look forward to having experts do it for me. With that in mind, I came across the Crest Website. At first, I was skeptical, especially when I saw the perks they offer in their membership plan. I thought, 'Who gives such premium perks for a nominal membership fee?' But, folks, everything you have read is 100% true—and I am living proof of it.",
  },
];

const FAQS = [
  {
    q: "Is It True I Get Upgraded Perks In Elite Membership Plan?",
    a: "Yes, with the Elite Membership plan, you get upgraded perks, including BagAssure and Flight Insurance Coverage, unlimited complimentary airport lounge entry, and Fast Pass Passport & Visa Services.",
  },
  {
    q: "How Much Does The Elite Membership Plan Cost?",
    a: "The Elite Membership plan costs $59.99 per month. It includes 60 Room Coins monthly, unlimited airport lounge access, and the upgraded perks of the plan, subject to applicable terms and conditions.",
  },
  {
    q: "What Is The Member Engagement Service (Curated Deals) In The Elite Membership Perk?",
    a: "Member Engagement Services feature curated deals, private flash tariffs, and limited-edition travel folios reserved only for higher tiers, giving Elite members access to hand-picked offers for their trips.",
  },
];

/* ---------- COMPONENT ---------- */

const Elite = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(0);
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleMembershipSelect = () => {
    navigate("/checkout", {
      state: {
        membershipId: MEMBERSHIP_ID,
        membershipName: MEMBERSHIP_NAME,
        price: MEMBERSHIP_PRICE,
      },
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="pt-page pt-elite">
      {isLoggedIn ? <HeaderInner /> : <Header />}

      <main>
        {/* ================= HERO ================= */}
        <section className="pt-section pt-el-hero">
          <div className="pt-wrap pt-hero-grid">
            <div className="pt-hero-left">
              <div className="pt-el-pillrow">
                <span className="pt-pill">
                  <FaRegStar /> TIER FOLIO • SOVEREIGN HORIZON
                </span>
                <span className="pt-el-pill-dot" />
                <span className="pt-el-pill-text">PRESTIGE SUB-TIER PORTFOLIO</span>
              </div>

              <h1 className="pt-hero-title">
                Premium Services,
                <em>Nominal Fee!</em>
              </h1>

              <p className="pt-hero-text">
                Want premium travel services at a nominal fee? Check the Elite
                Membership Plan and book your trip today.
              </p>

              <div className="pt-el-chips">
                {HERO_CHIPS.map((c) => (
                  <span className="pt-el-chip" key={c.text}>
                    {c.icon} {c.text}
                  </span>
                ))}
              </div>

              <button
                className="pt-btn pt-btn-black pt-el-cta"
                onClick={handleMembershipSelect}
              >
                JOIN THE ELITE MEMBERSHIP PLAN AT JUST $59.99/PER MONTH{" "}
                <FaArrowRight />
              </button>

              <p className="pt-el-hero-note">
                <span className="pt-pill-dot" />
                Immediate passport folio unlock &amp; bag assurance dispatch
                upon enrollment
              </p>
            </div>

            <div className="pt-hero-right">
              <div className="pt-pass">
                <div className="pt-pass-top">
                  <div>
                    <small className="pt-pass-eyebrow">CREST TRAVEL CLUB</small>
                    <h3 className="pt-pass-title">ELITE MEMBER</h3>
                  </div>
                  <span className="pt-pass-badge">
                    <FaRegCircleCheck /> VIP
                  </span>
                </div>

                <div className="pt-pass-chip">
                  <span className="pt-chip pt-chip-tan">
                    <RiWifiLine />
                  </span>
                  <span className="pt-pass-dots">•••• •••• •••• 4098</span>
                </div>

                <div className="pt-pass-bottom">
                  <div>
                    <small>ALLOCATION PRIVILEGE</small>
                    <h3>60 Room Coins Monthly</h3>
                  </div>
                  <div className="pt-pass-price">
                    <small>MONTHLY DUES</small>
                    <strong>
                      $59.99<em>/mo</em>
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-el-tag">
                <span className="pt-icon-box pt-icon-box-peach pt-icon-box-sm">
                  <FaPlaneDeparture />
                </span>
                <div>
                  <strong>Priority Sky Lounge</strong>
                  <span>Global Access Pass Included</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PERKS ================= */}
        <section className="pt-section pt-bg-sand">
          <div className="pt-wrap">
            <div className="pt-head pt-head-left pt-el-head-perks">
              <span className="pt-eyebrow pt-eyebrow-icon">
                <FaGem /> PRIVILEGE FOLIO
              </span>
              <h2 className="pt-h2">
                What Are The Perks Of An Elite Membership Plan?
              </h2>
              <p className="pt-lead">
                Here are the perks of an Elite Membership Plan:
              </p>
            </div>

            <div className="pt-el-grid">
              {PERKS.map((p) => (
                <div className="pt-el-card" key={p.title}>
                  <div className="pt-icon-box pt-icon-box-sand">{p.icon}</div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}

              <div className="pt-el-card pt-el-card-dark">
                <div className="pt-icon-box pt-icon-box-navy">
                  <RiMoneyDollarCircleLine />
                </div>
                <span className="pt-el-label">ELEVATED CURRENCY</span>
                <h3>Increased Room Coin Bundle</h3>
                <p>
                  Higher allocation compared to the Signature Plan, giving you a
                  full 60 Room Coins monthly to spend on verified hotel
                  accommodations.
                </p>
              </div>
            </div>

            <div className="pt-el-wide">
              <div className="pt-icon-box pt-icon-box-sand">
                <FaKey />
              </div>
              <div className="pt-el-wide-text">
                <h3>Key To Member Engagement Services</h3>
                <p>
                  Unlock specialized Member Engagement Services featuring
                  curated deals, private flash tariffs, and limited-edition
                  travel folios reserved only for higher tiers.
                </p>
              </div>
              <span className="pt-el-badge">BESPOKE ACCESS</span>
            </div>

            <div className="pt-note pt-el-note-bar">
              <FaCircleInfo className="pt-note-icon" />
              <p>
                <b>Note:</b> Without an active membership plan, you won’t be
                able to access any of the above-mentioned perks or any other
                travel-related services offered by Crest Travel Club.
              </p>
            </div>
          </div>
        </section>

        {/* ================= WORTH JOINING ================= */}
        <section className="pt-section pt-bg-ivory">
          <div className="pt-wrap">
            <div className="pt-split">
              <div>
                <span className="pt-eyebrow">PILLAR EVALUATION</span>
                <h2 className="pt-h2">
                  How is the Elite Membership Plan Worth Joining?
                </h2>
              </div>
              <p className="pt-split-text">
                The value of a travel club and its membership plan depends on
                the benefits it offers. When you buy an entry-level membership
                plan, you get basic travel benefits, but when you move up a
                level, you unlock more premium benefits. This statement fits the
                Elite Membership plan perfectly. How? Here are the benefits that
                describe the value of joining the Elite Membership Plan:
              </p>
            </div>

            <div className="pt-pillars">
              {PILLARS.map((p) => (
                <div className="pt-pillar" key={p.num}>
                  <div className="pt-pillar-top">
                    <span className="pt-pillar-num">{p.num}</span>
                    <span className="pt-pillar-icon">{p.icon}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <div className="pt-pillar-foot">
                    <FaRegCircleCheck /> {p.foot}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-banner">
              <div className="pt-icon-box pt-icon-box-brown pt-icon-box-lg">
                <FaMagnifyingGlassLocation />
              </div>
              <div>
                <h3>Bespoke Suitability for Every Travel Frequency</h3>
                <p>
                  The Elite Membership Plan suits frequent travelers. But that
                  doesn’t mean occasional travelers won’t benefit. In fact, if
                  you don’t know how to plan a trip or want guidance, this plan
                  is perfect for you. Here you’ll get hand-picked offers. Other
                  than that, 24/7 guidance is available in all membership plans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= REASONS ================= */}
        <section className="pt-section pt-bg-stone-light">
          <div className="pt-wrap">
            <div className="pt-head pt-head-left pt-el-head-reasons">
              <span className="pt-eyebrow">COMPARATIVE SUPREMACY</span>
              <h2 className="pt-h2">
                Why Choose The Elite Plan Over The Other Plan?
              </h2>
              <p className="pt-lead">
                We’ve already discussed the benefits and perks. But why choose
                the Elite Plan over the other plan? Here are the reasons:
              </p>
            </div>

            <div className="pt-dir-grid">
              {REASONS.map((r, i) => (
                <div className="pt-dir-card" key={r.title}>
                  <span className="pt-dir-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="pt-el-quote">
              “This list should be enough to show why the club charges $59.99
              and what you get in return.”
            </p>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="pt-section pt-bg-ivory">
          <div className="pt-wrap">
            <div className="pt-head pt-head-left pt-el-head-trust">
              <span className="pt-eyebrow">VERIFIED MEMBER ACCOUNTS</span>
              <h2 className="pt-h2">What Are The Real Sources of Trust?</h2>
              <p className="pt-lead">
                If you’re still skeptical about the Crest Travel Club and its
                membership plan, including Elite, you can read the reviews below
                and on independent review websites. Here's what Elite Members
                have to say about the club:
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
                    <RiVerifiedBadgeLine />
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
              <span className="pt-eyebrow">CLEAR GUIDANCE</span>
              <h2 className="pt-h2">Frequently Asked Questions</h2>
            </div>

            <div className="pt-faq">
              {FAQS.map((f, i) => {
                const open = activeFaq === i;
                return (
                  <div className={`pt-faq-item ${open ? "is-open" : ""}`} key={f.q}>
                    <button
                      type="button"
                      className="pt-faq-head"
                      aria-expanded={open}
                      onClick={() => setActiveFaq(open ? null : i)}
                    >
                      <h3>{f.q}</h3>
                      {open ? <FaAngleUp /> : <FaAngleDown />}
                    </button>
                    {open && (
                      <div className="pt-faq-answer">
                        <p>{f.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="pt-section pt-cta-section">
          <div className="pt-wrap">
            <div className="pt-cta">
              <span className="pt-cta-eyebrow">BEGIN YOUR ELEVATED JOURNEY</span>
              <h2 className="pt-cta-title">
                Get the Elite Membership Plan Today!
              </h2>
              <p className="pt-cta-sub">
                Premium Perks &amp; Concierge Privilege at{" "}
                <b>$59.99/Month</b>
              </p>
              <button
                className="pt-btn pt-btn-light"
                onClick={handleMembershipSelect}
              >
                JOIN ELITE PLAN NOW
              </button>
              <p className="pt-cta-foot">
                Monthly Automatic Renewal • Cancel Anytime Hassle-Free • 24/7
                Dedicated Assistance
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Elite;