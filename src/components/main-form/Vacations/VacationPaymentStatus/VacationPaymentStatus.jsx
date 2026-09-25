import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VacationPaymentStatus.css";
import { vacationBook } from "../../../../store/Services/AllApi";

const REDIRECT_SECONDS = 5;

const VacationPaymentStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [itemId, setItemId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        const savedHoldData = sessionStorage.getItem("vacationHoldData");
        const holdData = savedHoldData ? JSON.parse(savedHoldData) : null;

        if (!holdData) {
          setStatus("failed");
          setErrorMessage("We couldn't find your booking details.");
          return;
        }

        const res = await vacationBook({
          body: holdData,
        });

        const bookResult = res?.data?.book;
        const bookingResult = bookResult?.result;

        if (
          bookResult?.success &&
          bookingResult?.bookingStatus === "CONFIRMED"
        ) {
          setConfirmationNumber(bookingResult?.confirmationNumber || "");
          setItemId(bookingResult?.itemid || "");
          setStatus("success");
          sessionStorage.removeItem("vacationHoldData");
          sessionStorage.removeItem("vacationBookingData");
        } else {
          setErrorMessage(
            bookResult?.message ||
              "Something went wrong while confirming your booking.",
          );
          setStatus("failed");
        }
      } catch (error) {
        console.log("error in booking vacationRental", error);
        setErrorMessage(
          error?.response?.data?.message ||
            "Something went wrong while confirming your booking.",
        );
        setStatus("failed");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (status !== "success") {
      return undefined;
    }

    if (countdown === 0) {
      navigate("/");
      return undefined;
    }

    const timerId = setTimeout(() => {
      setCountdown((currentCount) => currentCount - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [status, countdown, navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="vacationPaymentStatus">
      <div
        className={`vacationPaymentStatus__card vacationPaymentStatus__card--${status}`}
      >
        {status === "pending" && (
          <>
            <div className="vacationPaymentStatus__spinnerWrap">
              <span className="vacationPaymentStatus__spinnerRing" />
              <span className="vacationPaymentStatus__spinnerRing" />
              <span className="vacationPaymentStatus__spinnerRing" />
            </div>

            <h1 className="vacationPaymentStatus__title">
              Confirming your booking
            </h1>

            <p className="vacationPaymentStatus__message">
              Please hold on while we finalize your reservation. This will only
              take a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="vacationPaymentStatus__iconWrap vacationPaymentStatus__iconWrap--success">
              <svg
                className="vacationPaymentStatus__checkIcon"
                viewBox="0 0 52 52"
              >
                <circle
                  className="vacationPaymentStatus__checkCircle"
                  cx="26"
                  cy="26"
                  r="24"
                  fill="none"
                />
                <path
                  className="vacationPaymentStatus__checkMark"
                  fill="none"
                  d="M14 27l7 7 16-16"
                />
              </svg>
            </div>

            <h1 className="vacationPaymentStatus__title">Booking Confirmed!</h1>

            <p className="vacationPaymentStatus__message">
              Your vacation is officially booked. Get ready for an amazing trip!
            </p>

            <div className="vacationPaymentStatus__details">
              {confirmationNumber && (
                <div className="vacationPaymentStatus__detailRow">
                  <span>Confirmation Number</span>
                  <strong>{confirmationNumber}</strong>
                </div>
              )}

              {itemId && (
                <div className="vacationPaymentStatus__detailRow">
                  <span>Booking ID</span>
                  <strong>{itemId}</strong>
                </div>
              )}
            </div>

            <p className="vacationPaymentStatus__redirectNote">
              Redirecting to home in {countdown}s...
            </p>

            <button
              type="button"
              className="vacationPaymentStatus__button vacationPaymentStatus__button--success"
              onClick={handleGoHome}
            >
              Go to Home Now
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="vacationPaymentStatus__iconWrap vacationPaymentStatus__iconWrap--failed">
              <svg
                className="vacationPaymentStatus__crossIcon"
                viewBox="0 0 52 52"
              >
                <circle
                  className="vacationPaymentStatus__crossCircle"
                  cx="26"
                  cy="26"
                  r="24"
                  fill="none"
                />
                <path
                  className="vacationPaymentStatus__crossMark"
                  fill="none"
                  d="M17 17l18 18M35 17L17 35"
                />
              </svg>
            </div>

            <h1 className="vacationPaymentStatus__title">Booking Failed</h1>

            <p className="vacationPaymentStatus__message">{errorMessage}</p>

            <button
              type="button"
              className="vacationPaymentStatus__button vacationPaymentStatus__button--failed"
              onClick={handleGoHome}
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VacationPaymentStatus;
