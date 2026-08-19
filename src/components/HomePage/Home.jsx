import React, { useEffect } from "react";
import MainForm from "../main-form/MainForm";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import vac1 from "../../assets/images/vac1.jpg";
import vac2 from "../../assets/images/vac2.jpg";
import vac3 from "../../assets/images/vac3.jpg";
import vac4 from "../../assets/images/vac4.jpg";
import vac5 from "../../assets/images/vac5.jpg";
import vac6 from "../../assets/images/vac6.jpg";
import hotel1 from "../../assets/images/hotel1.jpg";
import hotel2 from "../../assets/images/hotel2.jpg";
import hotel3 from "../../assets/images/hotel3.jpg";
import hotel4 from "../../assets/images/hotel4.jpg";
import hotel5 from "../../assets/images/hotel5.jpg";
import hotel6 from "../../assets/images/hotel6.jpg";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import "./Home.css";
import { sessionCreate } from "../../store/Services/AllApi";
import { Helmet } from "react-helmet-async";

const Home = () => {
  useEffect(() => {
    const handleSession = async () => {
      try {
        const res = await sessionCreate({});
        const sessionId = res?.data?.session?.result?.id;
        if (sessionId) {
          localStorage.setItem("sessionId", sessionId);
        }
      } catch (error) {
        console.error("Session creation failed:", error);
      }
    };
    handleSession();
  }, []);

  return (
    <>
      <Helmet>
        {/* Meta Title */}
        <title>Crest Travel Club | Save on Hotels, Flights & More</title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Join Crest Travel Club and unlock exclusive savings on hotels, resorts, cruises, car rentals, flights, and more with a flexible travel membership."
        />

        {/* Canonical */}
        <link rel="canonical" href="https://www.cresttravelclub.com/" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Crest Travel Club | Save on Hotels, Flights & More"
        />

        <meta
          property="og:description"
          content="Join Crest Travel Club and unlock exclusive savings on hotels, resorts, cruises, car rentals, flights, and more with a flexible travel membership."
        />

        <meta property="og:url" content="https://www.cresttravelclub.com/" />

        <meta property="og:type" content="website" />

        <meta property="og:site_name" content="Crest Travel Club" />

        {/* Open Graph Image */}
        <meta
          property="og:image"
          content="https://www.cresttravelclub.com/og-image.jpg"
        />

        <meta property="og:image:alt" content="Crest Travel Club" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />

        <meta
          name="twitter:title"
          content="Crest Travel Club | Save on Hotels, Flights & More"
        />

        <meta
          name="twitter:description"
          content="Join Crest Travel Club and unlock exclusive savings on hotels, resorts, cruises, car rentals, flights, and more with a flexible travel membership."
        />

        <meta
          name="twitter:image"
          content="https://www.cresttravelclub.com/og-image.jpg"
        />
      </Helmet>
      {/* <HeaderInner /> */}
      <MainForm />
      <section className="vacation-section">
        <div className="container">
          <h2 className="section-title">Vacation Rentals Worth the Trip</h2>

          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            spaceBetween={25}
            loop={true}
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              576: {
                slidesPerView: 2,
              },
              992: {
                slidesPerView: 3,
              },
              1200: {
                slidesPerView: 4,
              },
            }}
          >
            <SwiperSlide>
              <div className="rental-card">
                <img src={vac1} alt="" />
                <div className="card-content">
                  <h3>Sedona Sunrise Villa</h3>
                  <p>Arizona, United States</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={vac2} alt="" />
                <div className="card-content">
                  <h3>Quail Corner</h3>
                  <p>Luxury Mountain Retreat</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={vac3} alt="" />
                <div className="card-content">
                  <h3>Key West Escape</h3>
                  <p>Private Pool & BBQ</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={vac4} alt="" />
                <div className="card-content">
                  <h3>Avalon Chic Condo</h3>
                  <p>Modern Interior Design</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={vac5} alt="" />
                <div className="card-content">
                  <h3>Ocean Breeze Villa</h3>
                  <p>Beachfront Paradise</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={vac6} alt="" />
                <div className="card-content">
                  <h3>Luxury Hillside Home</h3>
                  <p>Panoramic Sunset Views</p>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      <section className="vacation-section">
        <div className="container">
          <h2 className="section-title">
            Stay Somewhere You'll Never Want to Leave
          </h2>

          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            spaceBetween={25}
            loop={true}
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              576: {
                slidesPerView: 2,
              },
              992: {
                slidesPerView: 3,
              },
              1200: {
                slidesPerView: 4,
              },
            }}
          >
            <SwiperSlide>
              <div className="rental-card">
                <img src={hotel1} alt="" />
                <div className="card-content">
                  <h3>Sedona Sunrise Villa</h3>
                  <p>Arizona, United States</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={hotel2} alt="" />
                <div className="card-content">
                  <h3>Quail Corner</h3>
                  <p>Luxury Mountain Retreat</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={hotel3} alt="" />
                <div className="card-content">
                  <h3>Key West Escape</h3>
                  <p>Private Pool & BBQ</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={hotel4} alt="" />
                <div className="card-content">
                  <h3>Avalon Chic Condo</h3>
                  <p>Modern Interior Design</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={hotel5} alt="" />
                <div className="card-content">
                  <h3>Ocean Breeze Villa</h3>
                  <p>Beachfront Paradise</p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="rental-card">
                <img src={hotel6} alt="" />
                <div className="card-content">
                  <h3>Luxury Hillside Home</h3>
                  <p>Panoramic Sunset Views</p>
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

export default Home;
