import React, { useState } from "react";
import { FaMapMarkedAlt, FaMoneyBillWave, FaWallet } from "react-icons/fa";
import logo from "../../assets/images/logo.webp";
import heroImage from "../../assets/images/heroImage.jpg";
import road from "../../assets/images/road.jpg";
import hotelshow from "../../assets/images/hotelshow.jpg";
import user1 from "../../assets/images/user1.jpg";
import user2 from "../../assets/images/user2.jpg";
import user3 from "../../assets/images/user3.jpg";
import user4 from "../../assets/images/user4.jpg";
import desertImg from "../../assets/images/desertImg.webp";
import resortImg from "../../assets/images/resortImg.png";
import crestLogo from "../../assets/images/crestLogo.webp";
import partner1 from "../../assets/images/partner1.png";
import partner2 from "../../assets/images/partner2.png";
import partner3 from "../../assets/images/partner3.png";
import partner4 from "../../assets/images/partner4.png";
import partner5 from "../../assets/images/partner5.png";
import partner6 from "../../assets/images/partner6.png";
import partner7 from "../../assets/images/partner7.png";
import partner8 from "../../assets/images/partner8.png";
import partner9 from "../../assets/images/partner9.png";
import partner10 from "../../assets/images/partner10.png";
import partner11 from "../../assets/images/partner11.png";
import partner12 from "../../assets/images/partner12.png";
import partner13 from "../../assets/images/partner13.png";
import partner14 from "../../assets/images/partner14.png";
import partner15 from "../../assets/images/partner15.png";
import partner16 from "../../assets/images/partner16.png";
import partner17 from "../../assets/images/partner17.png";
import partner18 from "../../assets/images/partner18.png";
import partner19 from "../../assets/images/partner19.png";
import partner20 from "../../assets/images/partner20.png";
import partner21 from "../../assets/images/partner21.png";
import partner22 from "../../assets/images/partner22.png";
import partner23 from "../../assets/images/partner23.png";
import partner24 from "../../assets/images/partner24.png";
import partner25 from "../../assets/images/partner25.png";
import partner26 from "../../assets/images/partner26.png";
import partner27 from "../../assets/images/partner27.png";
import partner28 from "../../assets/images/partner28.png";
import partner29 from "../../assets/images/partner29.png";
import partner30 from "../../assets/images/partner30.png";
import partner31 from "../../assets/images/partner31.png";
import partner32 from "../../assets/images/partner32.png";
import partner33 from "../../assets/images/partner33.png";
import partner34 from "../../assets/images/partner34.png";
import partner35 from "../../assets/images/partner35.png";
import partner36 from "../../assets/images/partner36.png";
import partner37 from "../../assets/images/partner37.png";
import partner38 from "../../assets/images/partner38.png";
import partner39 from "../../assets/images/partner39.png";
import partner40 from "../../assets/images/partner40.png";
import partner41 from "../../assets/images/partner41.png";
import partner42 from "../../assets/images/partner42.png";
import partner43 from "../../assets/images/partner43.png";
import partner44 from "../../assets/images/partner44.png";
import partner45 from "../../assets/images/partner45.png";
import partner46 from "../../assets/images/partner46.png";
import partner47 from "../../assets/images/partner47.png";
import partner48 from "../../assets/images/partner48.png";
import partner49 from "../../assets/images/partner49.png";
import partner50 from "../../assets/images/partner50.png";
import partner51 from "../../assets/images/partner51.png";
import partner52 from "../../assets/images/partner52.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./BeforeHome.css";
import { useNavigate } from "react-router-dom";
import Header from "../../reuseable-components/Header";
import Footer from "../../reuseable-components/Footer";
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
  FaSearch,
  FaMedal,
  FaHeadset,
  FaTags,
} from "react-icons/fa";

import { MdAccountCircle, MdConfirmationNumber } from "react-icons/md";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { RiDiscountPercentFill } from "react-icons/ri";
import { Helmet } from "react-helmet-async";

const BeforeHome = ({ personDetails }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const partnerLogos = [
    partner1,
    partner2,
    partner3,
    partner4,
    partner5,
    partner6,
    partner7,
    partner8,
    partner9,
    partner10,
    partner11,
    partner12,
    partner13,
    partner14,
    partner15,
    partner16,
    partner17,
    partner18,
    partner19,
    partner20,
    partner21,
    partner22,
    partner23,
    partner24,
    partner25,
    partner26,
    partner27,
    partner28,
    partner29,
    partner30,
    partner31,
    partner32,
    partner33,
    partner34,
    partner35,
    partner36,
    partner37,
    partner38,
    partner39,
    partner40,
    partner41,
    partner42,
    partner43,
    partner44,
    partner45,
    partner46,
    partner47,
    partner48,
    partner49,
    partner50,
    partner51,
    partner52,
  ];
  return (
    <>
      <Helmet>
        <title>
          Crest Travel Club | Best Travel Club Membership & Discounts
        </title>

        <meta
          name="description"
          content="Crest Club offers travel club membership deals on hotels, resorts, cruises, car rental & flights. Join the best travel reward club and save your hard-earned money."
        />
      </Helmet>

      <section className="tripHero">
        <Header personDetails={personDetails} />
        <div className="tripHero__content">
          <p className="tripHero__tag">Activate VIP Travel Access</p>

          <h1>
            Feel The Luxury In Each <span>Crest Travel Club Membership</span>
          </h1>

          <p className="tripHero__description">
            Crest Travel Club is a travel membership club offering exclusive
            discounts on 5-star hotels, resorts, cruises, car rentals, and
            flights. As one of the best travel club memberships available. This
            Club makes it easy to unlock premium travel benefits, fine dining
            perks, and unbeatable travel club deals — all through a single
            membership.
          </p>

          <div className="tripHero__buttons">
            <button
              className="tripHero__primaryBtn"
              onClick={() => navigate("/join-now")}
            >
              Sign Up Today →
            </button>
          </div>
        </div>
      </section>

      <section className="crest-member-section tb-gap">
        <div className="crest-member-container container">
          <div className="crest-member-image">
            <img src={crestLogo} alt="Crest Travel Club" />
          </div>

          <div className="crest-member-content">
            <span className="crest-member-tag">
              EXCLUSIVE TRAVEL MEMBERSHIP
            </span>

            <h2 className="crest-member-title">
              Save <span>Up to 40-50%</span> On Every Journey
            </h2>

            <p className="crest-member-description">
              Buy a membership to save extra! This is not just a bait, but our
              promise to make your every single penny a worthwhile investment.
              We are just giving what you deserve. So, take a step ahead, buy a
              membership, and join the community of travelers
            </p>

            <div className="crest-member-benefits">
              <div className="crest-member-item">
                <span>✓</span>
                <p>Up to 40-50% Member Discount</p>
              </div>

              <div className="crest-member-item">
                <span>✓</span>
                <p>Exclusive Member-Only Rates</p>
              </div>

              <div className="crest-member-item">
                <span>✓</span>
                <p>Premium Hotels & Resorts</p>
              </div>

              <div className="crest-member-item">
                <span>✓</span>
                <p>Travel Smarter. Live Better.</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/join-now")}
              className="crest-member-btn"
            >
              Become a Member
            </button>
          </div>
        </div>
      </section>

      <section className="travelBenefits tb-gap">
        <div className="container">
          <p className="travelBenefits__subtitle">THE VOYAGE ELITE ADVANTAGE</p>

          <h2 className="travelBenefits__title">
            Travel Better, Spend Smarter
          </h2>

          <div className="travelBenefits__divider">
            <span></span>
            <div className="travelBenefits__diamond"></div>
            <span></span>
          </div>

          <div className="travelBenefits__grid">
            <div className="travelBenefits__card">
              <div className="travelBenefits__icon">
                <FaGem />
              </div>

              <h3>Hidden Gems</h3>

              <p>
                Discover breathtaking, curated destinations that remain
                untouched by mainstream tourism.
              </p>

              <div className="travelBenefits__line"></div>
            </div>

            <div className="travelBenefits__card">
              <div className="travelBenefits__icon">
                <FaShieldAlt />
              </div>

              <h3>Elite Assurance</h3>

              <p>
                Stop overpaying for luxury. Access verified, member-exclusive
                pricing for premier properties.
              </p>

              <div className="travelBenefits__line"></div>
            </div>

            <div className="travelBenefits__card">
              <div className="travelBenefits__icon">
                <FaCrown />
              </div>

              <h3>Smart Luxury</h3>

              <p>
                Maximize your travel investment with sophisticated booking tools
                and unparalleled rewards.
              </p>

              <div className="travelBenefits__line"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="journeySteps tb-gap">
        <div className="journeySteps__container container">
          <div className="journeySteps__left">
            <div className="journeySteps__imageLarge">
              <img src={desertImg} alt="Desert" />
            </div>
            {/* <div className="journeySteps__imageSmall">
              <img src={resortImg} alt="Resort" />
            </div> */}
          </div>
          <div className="journeySteps__right">
            <h2 className="journeySteps__title">
              How To <span>Start</span>
            </h2>

            <div className="journeySteps__card">
              <div className="journeySteps__number">1</div>

              <div className="journeySteps__content">
                <h3>Create Your Account</h3>

                <p>
                  Don’t miss out on grabbing the great deals, fine dining, and
                  great views from your hotel room
                </p>
              </div>

              <div className="journeySteps__icon">
                <MdAccountCircle />
              </div>
            </div>
            <div className="journeySteps__card">
              <div className="journeySteps__number">2</div>

              <div className="journeySteps__content">
                <h3>Search</h3>

                <p>
                  Just like flight booking, search for unlisted fares. This is
                  specifically for members (to view this, a membership purchase
                  is required)
                </p>
              </div>

              <div className="journeySteps__icon">
                <FaSearch />
              </div>
            </div>
            <div className="journeySteps__card">
              <div className="journeySteps__number">3</div>

              <div className="journeySteps__content">
                <h3>Discount (Members Only)</h3>

                <p>
                  Compare prices side-by-side and see the difference for
                  yourself. Who knows, you may get a great discount without
                  spending much
                </p>
              </div>

              <div className="journeySteps__icon">
                <RiDiscountPercentFill />
              </div>
            </div>
            <div className="journeySteps__card">
              <div className="journeySteps__number">4</div>

              <div className="journeySteps__content">
                <h3>Make Purchase</h3>

                <p>
                  After comparing and learning about the great packages, don’t
                  stop yourself from making a purchase
                </p>
              </div>

              <div className="journeySteps__icon">
                <BiSolidPurchaseTag />
              </div>
            </div>
            <div className="journeySteps__card">
              <div className="journeySteps__number">5</div>

              <div className="journeySteps__content">
                <h3>Receive Confirmation</h3>

                <p>
                  As soon as you make the purchase, the confirmation will be
                  sent to your email and message inbox
                </p>
              </div>

              <div className="journeySteps__icon">
                <MdConfirmationNumber />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="partners-section">
        <div className="partners-container">
          <div className="partners-heading">
            <h2>Partner Network</h2>
            <div className="travelBenefits__divider">
              <span></span>
              <div className="travelBenefits__diamond"></div>
              <span></span>
            </div>
          </div>

          <div className="partners-slider-wrapper">
            <Swiper
              modules={[Autoplay]}
              loop={true}
              speed={2000}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              slidesPerView={6}
              spaceBetween={20}
              className="partners-swiper"
              breakpoints={{
                0: {
                  slidesPerView: 2,
                  spaceBetween: 12,
                },
                480: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 4,
                  spaceBetween: 18,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 6,
                  spaceBetween: 20,
                },
              }}
            >
              {partnerLogos.map((logo, index) => (
                <SwiperSlide key={index}>
                  <div className="partner-logo-card">
                    <img src={logo} alt={`Partner ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
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

      <section className="eliteTestimonials tb-gap">
        <div className="container">
          <p className="eliteTestimonials__subtitle">TESTIMONIALS</p>

          <h2 className="eliteTestimonials__title">Voices of the Elite</h2>

          <div className="eliteTestimonials__divider">
            <span></span>
            <div className="eliteTestimonials__diamond"></div>
            <span></span>
          </div>

          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
          >
            <SwiperSlide>
              <div className="eliteTestimonials__card">
                <div className="eliteTestimonials__stars">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>

                <p className="eliteTestimonials__review">
                  "I had been planning for so long to take a nice vacation trip
                  to Hawaii. However, due to my strict budget, I was unable to
                  find a great deal. But thanks to Crest, I finally got an
                  unforgettable vacation within my budget. Highly recommend"
                </p>

                <div className="eliteTestimonials__user">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt=""
                  />

                  <div>
                    <h4>Chris</h4>
                    <span>EXECUTIVE TRAVELER</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="eliteTestimonials__card">
                <div className="eliteTestimonials__stars">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>

                <p className="eliteTestimonials__review">
                  "Initially, I was skeptical about taking the Crest membership
                  as my earlier experience with a different website was not
                  good. But thank god I chose this website and booked my trip.
                  My entire trip went so smoothly. From booking flights to
                  getting a luxury hotel, everything was top-notch"
                </p>

                <div className="eliteTestimonials__user">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt=""
                  />

                  <div>
                    <h4>Megan</h4>
                    <span>GLOBAL MEMBER</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="eliteTestimonials__card">
                <div className="eliteTestimonials__stars">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>

                <p className="eliteTestimonials__review">
                  "If you have a luxury taste, go with the Crest Signature
                  membership and thank me later"
                </p>

                <div className="eliteTestimonials__user">
                  <img
                    src="https://randomuser.me/api/portraits/women/65.jpg"
                    alt=""
                  />

                  <div>
                    <h4>Selina Gomez</h4>
                    <span>ELITE EXPLORER</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="eliteTestimonials__card">
                <div className="eliteTestimonials__stars">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>

                <p className="eliteTestimonials__review">
                  "Without a second thought, I am ready to renew my membership
                  with Crest"
                </p>

                <div className="eliteTestimonials__user">
                  <img
                    src="https://static.vecteezy.com/system/resources/thumbnails/069/180/702/small/confident-man-portrait-home-interior-plants-blurred-background-profile-picture-free-photo.jpg"
                    alt=""
                  />

                  <div>
                    <h4>Jasper Collins</h4>
                    <span>GLOBAL MEMBER</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default BeforeHome;
