import React, { useEffect, useState } from "react";
import { flightBookPage } from "../../../store/Services/AllApi";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { IoAirplane } from "react-icons/io5";
import "./FlightPaymentStatus.css";

const FlightPaymentStatus = () => {
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const savedData = sessionStorage.getItem("flightPaymentData");

        if (!savedData) {
          throw new Error("Flight booking data not found");
        }

        const paymentData = JSON.parse(savedData);

        const res = await flightBookPage({
          body: {
            sessionId: paymentData.sessionId,
            input: {
              fareSourceCode: paymentData.input.fareSourceCode,
              passengers: {
                ...paymentData.input.passengers,
                details: paymentData.input.passengers.details.map(
                  (passenger) => ({
                    ...passenger,
                    extraservice: (passenger.extraservice || []).map(
                      (service) => ({
                        serviceid: service.serviceid,
                        quantity: 1,
                      }),
                    ),
                  }),
                ),
              },
              orderid: paymentData.input.orderid,
            },
          },
        });

        if (res?.data?.book?.success === true) {
          setBookingStatus(true);
        } else {
          setBookingError(
            res?.data?.book?.message ||
              "We couldn’t confirm your flight booking. Please contact support for assistance.",
          );
        }
      } catch (error) {
        console.error("Flight booking failed:", error);
        setBookingStatus(false);
        setBookingError(
          error?.message ||
            "Something went wrong while confirming your flight booking.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!bookingStatus) return;

    const timer = setTimeout(() => {
      navigate("/home");
    }, 5000);

    return () => clearTimeout(timer);
  }, [bookingStatus, navigate]);

  const status = loading ? "loading" : bookingStatus ? "success" : "error";

  return (
    <main className={`flight-status flight-status--${status}`}>
      <div className="flight-status__container">
        <div className="flight-status__brand">
          <span className="flight-status__brand-icon">
            <IoAirplane aria-hidden="true" />
          </span>
          YOUR JOURNEY
        </div>

        <section
          className="flight-status__card"
          aria-labelledby="flight-status-title"
          aria-busy={loading}
        >
          <div className="flight-status__topline" />

          <div
            className="flight-status__content"
            role="status"
            aria-live="polite"
          >
            <span className="flight-status__eyebrow">FLIGHT RESERVATION</span>

            <div className="flight-status__symbol" aria-hidden="true">
              {loading ? (
                <>
                  <span className="flight-status__spinner" />
                  <IoAirplane className="flight-status__main-icon flight-status__plane" />
                </>
              ) : bookingStatus ? (
                <FiCheck className="flight-status__main-icon" />
              ) : (
                <FiAlertCircle className="flight-status__main-icon" />
              )}
            </div>

            <span className="flight-status__badge">
              {loading
                ? "Confirmation in progress"
                : bookingStatus
                  ? "Booking confirmed"
                  : "Confirmation unsuccessful"}
            </span>

            <h1 id="flight-status-title" className="flight-status__title">
              {loading
                ? "Almost ready for takeoff."
                : bookingStatus
                  ? "Your next journey awaits."
                  : "We couldn’t confirm your flight."}
            </h1>

            <p className="flight-status__description">
              {loading
                ? "We’re confirming your flight reservation. This may take a moment."
                : bookingStatus
                  ? "Your flight booking is confirmed. Thank you for letting us be part of your journey."
                  : "Please review the details below. If you need help, contact our support team. Email: contact@cresttravelclub.com and support: +1 (888) 377-9065"}
            </p>

            <div className="flight-status__notice">
              <span className="flight-status__notice-dot" aria-hidden="true" />
              <p>
                {loading
                  ? "Please keep this page open and avoid refreshing."
                  : bookingStatus
                    ? "You’ll be redirected to home in 5 seconds."
                    : bookingError}
              </p>
            </div>

            {!loading && (
              <button
                type="button"
                className="flight-status__button"
                onClick={() => navigate("/home")}
              >
                Back to home
                <FiArrowRight
                  className="flight-status__button-icon"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          <footer className="flight-status__footer">
            <span>YOUR NEXT CHAPTER</span>
            <span>Starts with a journey.</span>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default FlightPaymentStatus;
