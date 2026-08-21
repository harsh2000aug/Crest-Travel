import React, { useEffect } from "react";
import {
  FaHotel,
  FaGem,
  FaPlane,
  FaShip,
  FaCar,
  FaUmbrellaBeach,
  FaShieldAlt,
  FaGift,
  FaCoins,
  FaPassport,
  FaStore,
  FaCouch,
  FaCheckCircle,
  FaCheck,
  FaGlobe,
  FaTrophy,
  FaMedal,
  FaHeadset,
  FaTags,
  FaLock,
  FaCrown,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../reuseable-components/Header";
import Footer from "../../reuseable-components/Footer";
const IncludingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    // SEO Meta Title
    document.title = "What's Included | Crest Travel Club Membership Perks";

    // SEO Meta Description
    const metaDescription =
      "See everything included with Crest Travel Club membership — hotel & flight discounts, airport lounge access, flight insurance, BagAssure & more.";

    let description = document.querySelector('meta[name="description"]');

    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }

    description.setAttribute("content", metaDescription);

    // Canonical URL
    const canonicalUrl = "https://www.cresttravelclub.com/whats-included";

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
  return (
    <>
      <div className="tm-membership-page">
        <Header />
        <section className="tm-hero-section">
          <div className="tm-hero-overlay">
            <span className="tm-badge">WHAT'S INCLUDED</span>
            <h1>
              Discover Everything Included With Your Crest Travel Club
              Membership
            </h1>
          </div>
        </section>
      </div>

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

              <button onClick={() => navigate("/join-now")}>
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
                onClick={() => navigate("/join-now")}
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

              <button onClick={() => navigate("/join-now")}>
                Select Plan →
              </button>
            </div>
          </div>
        </div>
      </section> */}

      <section className="crestIncluded">
        <div className="crestIncluded__container">
          {/* Introduction */}
          <div className="crestIncluded__intro">
            {/* <h2>
              Premium Travel Benefits,
              <span> Built Around You</span>
            </h2> */}

            <p>
              Crest Travel Club was built to make premium travel more accessible
              through membership combining discounted access across hotels,
              flights, cruises, and car rentals with real travel protection and
              dedicated support, all in one plan. No piecing together deals
              across different sites for every trip — just one dependable source
              of savings, ready whenever you are.
            </p>

            <p>
              Every membership includes the same core foundation; higher tiers
              add more Room Coins and stronger baggage coverage. Below, you'll
              find exactly what each benefit means and how it works.
            </p>
          </div>

          {/* Book Anything */}
          <div className="crestIncluded__section">
            <div className="crestIncluded__sectionHeader">
              <span className="crestIncluded__icon">
                <FaGlobe />
              </span>
              <div>
                <span>01</span>
                <h3>Book Anything</h3>
              </div>
            </div>

            <div className="crestIncluded__grid">
              <div className="crestIncluded__item">
                <FaHotel />
                <h4>Exclusive Access Properties</h4>
                <p>
                  Members get access to a curated selection of hotels, resorts,
                  and vacation rentals that aren't publicly listed — visible
                  only once you have an active membership.
                </p>
              </div>

              <div className="crestIncluded__item">
                <FaPlane />
                <h4>Unlisted Fares</h4>
                <p>
                  Beyond public pricing, Crest Travel Club offers unlisted fares
                  on flights and stays — rates that stay hidden from non-members
                  and are only unlocked with an active subscription.
                </p>
              </div>

              <div className="crestIncluded__item">
                <FaTags />
                <h4>Discounted Bookings Across a Global Network</h4>
                <p>
                  Through partnerships with hotels, luxury properties, cruise
                  lines, and vehicle rental companies worldwide, members get
                  consistent discounted pricing across nearly every part of a
                  trip — not just one category.
                </p>
              </div>
            </div>
          </div>

          {/* Travel Protection */}
          <div className="crestIncluded__section crestIncluded__section--dark">
            <div className="crestIncluded__sectionHeader">
              <span className="crestIncluded__icon">
                <FaShieldAlt />
              </span>
              <div>
                <span>02</span>
                <h3>Travel Protection</h3>
              </div>
            </div>

            <div className="crestIncluded__grid">
              <div className="crestIncluded__item">
                <FaShieldAlt />
                <h4>Comprehensive Travel Insurance</h4>
                <p>
                  Every membership includes travel protection covering emergency
                  medical expenses, lost or delayed baggage, and travel delays —
                  so an unexpected disruption doesn't derail your trip
                  financially.
                </p>
              </div>

              <div className="crestIncluded__item">
                <FaHeadset />
                <h4>24/7 Medical Emergency Assistance</h4>
                <p>
                  Members have access to round-the-clock medical assistance
                  while traveling, giving you a direct line to support if a
                  medical emergency happens far from home.
                </p>
              </div>
            </div>
          </div>

          {/* Exclusive Access */}
          <div className="crestIncluded__section">
            <div className="crestIncluded__sectionHeader">
              <span className="crestIncluded__icon">
                <FaGem />
              </span>
              <div>
                <span>03</span>
                <h3>Exclusive Access</h3>
              </div>
            </div>

            <div className="crestIncluded__grid">
              <div className="crestIncluded__item">
                <FaCouch />
                <h4>Airport Lounge Access</h4>
                <p>
                  Elite and Prestige members get unlimited airport lounge access
                  — a benefit not included in the Signature plan. A typical
                  single-visit lounge pass can cost $30–50, making this
                  especially valuable for frequent flyers.
                </p>
              </div>

              <div className="crestIncluded__item">
                <FaCrown />
                <h4>Elite Property Access</h4>
                <p>
                  Even at the entry-level Signature tier, members unlock access
                  to elite properties. Higher tiers unlock additional perks and
                  deeper discounts on top of that same access.
                </p>
              </div>
            </div>
          </div>

          {/* Personalized Support */}
          <div className="crestIncluded__section crestIncluded__section--gold">
            <div className="crestIncluded__sectionHeader">
              <span className="crestIncluded__icon">
                <FaHeadset />
              </span>
              <div>
                <span>04</span>
                <h3>Personalized Support</h3>
              </div>
            </div>

            <div className="crestIncluded__support">
              <FaHeadset />
              <div>
                <h4>A Dedicated Travel Consultant</h4>
                <p>
                  Members can work directly with a personal travel consultant to
                  build a personalized itinerary — from choosing hotels to
                  planning the full shape of a trip — rather than piecing it
                  together alone.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="crestTestimonials">
            <div className="crestTestimonials__heading">
              <span>MEMBER EXPERIENCES</span>
              <h2>What Travelers Say About Their Membership</h2>
              <p>
                These testimonial-style examples are placeholders and should be
                replaced with verified member reviews before publication.
              </p>
            </div>

            {/* Signature */}
            <div className="crestTestimonials__plan">
              <div className="crestTestimonials__planTitle">
                <FaMedal />
                <h3>Signature</h3>
              </div>

              <div className="crestTestimonials__grid">
                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>The lounge access alone has made a difference</h4>
                  <p>
                    I travel a few times a year and the unlimited airport lounge
                    access has been one of my favorite parts of Signature. Being
                    able to sit somewhere comfortable, have a quiet place to
                    work, and avoid the chaos of the terminal makes travel days
                    much easier.
                  </p>
                  <small>Lilani Lomax</small>
                </article>

                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>It made planning our vacation much simpler</h4>
                  <p>
                    I signed up mainly because I wanted better options for
                    hotels and flights, but I ended up using several of the
                    other benefits too. The curated travel deals were especially
                    useful because I didn't have to spend hours searching
                    through different sites.
                  </p>
                  <small>Jacob D Rawlinsom</small>
                </article>

                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>The travel assistance was a pleasant surprise</h4>
                  <p>
                    What I liked most about Signature wasn't just the booking
                    options. Having access to visa and passport assistance,
                    travel support, lounge access and other travel services in
                    one membership made the whole process feel more organized.
                  </p>
                  <small>Leopoldo De Jesus Lopez Ruiz</small>
                </article>
              </div>
            </div>

            {/* Elite */}
            <div className="crestTestimonials__plan crestTestimonials__plan--elite">
              <div className="crestTestimonials__planTitle">
                <FaGem />
                <h3>Elite</h3>
              </div>

              <div className="crestTestimonials__grid">
                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>The extra Room Coins made Elite worthwhile for me</h4>
                  <p>
                    I upgraded to Elite because I travel often enough to
                    actually use the membership. The additional Room Coins were
                    a big reason for the upgrade, and I've also enjoyed having
                    lounge access and the travel assistance benefits available
                    when I need them.
                  </p>
                  <small>Zachary Sybouts</small>
                </article>

                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>
                    I upgraded after seeing how much I was actually using the
                    benefits
                  </h4>
                  <p>
                    I originally looked at the lower tier, but after comparing
                    what I would use throughout the year, Elite made more sense
                    for me. Between hotels, flights, lounge access and the
                    additional travel services, I felt like I was getting more
                    practical value.
                  </p>
                  <small>KATHLEEN G ALBRECHT</small>
                </article>

                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>The convenience is what keeps me on Elite</h4>
                  <p>
                    For me, the biggest benefit isn't one particular perk. It's
                    having so many travel-related services available through one
                    membership. That convenience is what made the upgrade
                    worthwhile.
                  </p>
                  <small>ADALINE CLAVELLI</small>
                </article>
              </div>
            </div>

            {/* Prestige */}
            <div className="crestTestimonials__plan crestTestimonials__plan--prestige">
              <div className="crestTestimonials__planTitle">
                <FaCrown />
                <h3>Prestige</h3>
              </div>

              <div className="crestTestimonials__grid">
                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>Prestige fits the way our family travels</h4>
                  <p>
                    We chose Prestige because we wanted something that worked
                    for the whole family. Having family BagAssure, the larger
                    monthly Room Coin allocation and the travel services
                    included made more sense for us.
                  </p>
                  <small>MRS LILIAN BERGER LANTIGUA</small>
                </article>

                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>
                    It's the convenience of having everything in one place
                  </h4>
                  <p>
                    Prestige is less about one particular feature for me and
                    more about the overall travel experience. I like having
                    access to hotels, flights, activities, lounges, travel
                    assistance and the higher Room Coin allowance under one
                    membership.
                  </p>
                  <small>Charles Pate JR</small>
                </article>

                <article className="crestTestimonials__card">
                  <span className="crestTestimonials__quote">“</span>
                  <h4>
                    The higher tier makes sense when you actually travel a lot
                  </h4>
                  <p>
                    I travel frequently enough that the additional Prestige
                    benefits are useful rather than just nice-to-have extras.
                    The family coverage, larger Room Coin bundle and premium
                    travel services were the main reasons I chose Prestige.
                  </p>
                  <small>THYLLIS LANTZY</small>
                </article>
              </div>
            </div>
          </div>
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

              <button className="mp-btn" onClick={() => navigate("/join-now")}>
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

              <button className="mp-btn" onClick={() => navigate("/join-now")}>
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
              <button className="mp-btn" onClick={() => navigate("/join-now")}>
                Choose Prestige
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="tm-plan-wrapper">
        <div className="tm-section-heading">
          <span>OUR MEMBERSHIPS</span>

          <h2>Signature Membership</h2>

          <p>Everything you need to save on every trip.</p>
        </div>

        <div className="tm-feature-grid">
          <div className="tm-feature-card">
            <FaHotel />
            <h4>Hotel Savings</h4>
            <p>Save up to 70% on hotels worldwide.</p>
          </div>

          <div className="tm-feature-card">
            <FaPlane />
            <h4>Flight Deals</h4>
            <p>Exclusive airfare prices for members.</p>
          </div>

          <div className="tm-feature-card">
            <FaShip />
            <h4>Cruise Offers</h4>
            <p>Incredible cruise discounts every month.</p>
          </div>

          <div className="tm-feature-card">
            <FaCar />
            <h4>Car Rentals</h4>
            <p>Rent vehicles at member pricing.</p>
          </div>

          <div className="tm-feature-card">
            <FaUmbrellaBeach />
            <h4>Activities</h4>
            <p>Book tours & adventures at lower prices.</p>
          </div>

          <div className="tm-feature-card">
            <FaShieldAlt />
            <h4>Travel Insurance</h4>
            <p>Complimentary protection on bookings.</p>
          </div>

          <div className="tm-feature-card">
            <FaGift />
            <h4>Shopping Discounts</h4>
            <p>Discounts across hundreds of brands.</p>
          </div>

          <div className="tm-feature-card">
            <FaCoins />
            <h4>Travel Rewards</h4>
            <p>Earn reward coins on every purchase.</p>
          </div>
        </div>
      </section>

      <section className="tm-voyager-section">
        <div className="tm-section-heading light">
          <span>UPGRADE</span>

          <h2>Elite Membership</h2>

          <p>Includes everything in Elite plus premium travel perks.</p>
        </div>

        <div className="tm-premium-grid">
          <div className="tm-premium-card">
            <FaCouch />
            <h3>Airport Lounge</h3>

            <p>Relax in premium airport lounges around the world.</p>
          </div>

          <div className="tm-premium-card">
            <FaCheckCircle />
            <h3>Best Price Promise</h3>

            <p>If you find a better price, we'll refund the difference.</p>
          </div>

          <div className="tm-premium-card">
            <FaStore />
            <h3>Travel Marketplace</h3>

            <p>Shop premium travel products at exclusive prices.</p>
          </div>

          <div className="tm-premium-card">
            <FaPassport />
            <h3>Visa Assistance</h3>

            <p>Fast passport & visa assistance for international travel.</p>
          </div>
        </div>
      </section>

      <section className="tm-explorer-section">
        <div className="tm-section-heading">
          <span>ULTIMATE MEMBERSHIP</span>

          <h2>Prestige Membership</h2>

          <p>
            Everything in Voyager plus exclusive VIP travel assistance and
            personalized services.
          </p>
        </div>

        <div className="tm-premium-grid">
          <div className="tm-premium-card explorer">
            <h3>🧑‍💼 Personal Travel Advisor</h3>

            <p>
              Dedicated experts help you plan every journey from start to
              finish.
            </p>
          </div>

          <div className="tm-premium-card explorer">
            <h3>🏥 Travel Doctor</h3>

            <p>
              Get medical guidance and assistance while traveling anywhere in
              the world.
            </p>
          </div>

          <div className="tm-premium-card explorer">
            <h3>✈️ Private Air Assistance</h3>

            <p>
              Emergency transportation support whenever unexpected situations
              arise.
            </p>
          </div>

          <div className="tm-premium-card explorer">
            <h3>⚖️ Legal Support</h3>

            <p>
              Professional legal assistance in selected international
              destinations.
            </p>
          </div>
        </div>
      </section>

      <section className="tm-comparison-section">
        <div className="tm-section-heading">
          <span>COMPARE</span>

          <h2>Membership Comparison</h2>

          <p>Find the perfect membership for your travel lifestyle.</p>
        </div>

        <div className="tm-table-wrapper">
          <table className="tm-comparison-table">
            <thead>
              <tr>
                <th>Features</th>
                <th>Signature</th>
                <th>Elite</th>
                <th>Prestige</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Hotel Discounts</td>
                <td>✔</td>
                <td>✔</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Flight Discounts</td>
                <td>✔</td>
                <td>✔</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Cruise Deals</td>
                <td>✔</td>
                <td>✔</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Car Rentals</td>
                <td>✔</td>
                <td>✔</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Airport Lounge</td>
                <td>—</td>
                <td>✔</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Best Price Promise</td>
                <td>—</td>
                <td>✔</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Visa Assistance</td>
                <td>—</td>
                <td>✔</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Travel Doctor</td>
                <td>—</td>
                <td>—</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Travel Advisor</td>
                <td>—</td>
                <td>—</td>
                <td>✔</td>
              </tr>

              <tr>
                <td>Legal Support</td>
                <td>—</td>
                <td>—</td>
                <td>✔</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="tm-final-cta">
        <h2>Ready to Travel Smarter?</h2>

        <p>
          Join thousands of travelers already saving on every trip with our
          premium memberships.
        </p>

        <button onClick={() => navigate("/join-now")}>
          Become a Member Today
        </button>
      </section>
      <Footer />
    </>
  );
};

export default IncludingPage;
