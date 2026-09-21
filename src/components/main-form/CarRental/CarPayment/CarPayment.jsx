import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { carBook } from "../../../../store/Services/AllApi";
import "./CarPayment.css";

const CarPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    const handleCarPayment = async () => {
      try {
        const status = searchParams.get("payment");

        const storedPaymentData = sessionStorage.getItem("carPaymentData");

        if (!storedPaymentData) {
          setApiError("Car payment data is missing.");
          setLoading(false);
          return;
        }

        const paymentData = JSON.parse(storedPaymentData);

        const orderId = paymentData?.orderId;
        const fareCode = paymentData?.fareCode;

        if (!orderId || !fareCode) {
          setApiError("Order ID or Fare Code is missing.");
          setLoading(false);
          return;
        }

        if (status !== "success") {
          setPaymentStatus("failed");
          setLoading(false);
          return;
        }

        const res = await carBook({
          body: {
            input: {
              orderid: orderId,
              fareCode: fareCode,
              firstName: paymentData?.firstName || "",
              lastName: paymentData?.lastName || "",
              email: paymentData?.email || "",
              phone: paymentData?.phone || "",
              country: paymentData?.country || "",
              city: paymentData?.city || "",
              state: paymentData?.state || "",
              postalCode: paymentData?.postalCode || "",
              driverFirstName: paymentData?.driverFirstName || "",
              driverLastName: paymentData?.driverLastName || "",
              cardrequired: paymentData?.cardrequired ?? true,
              specialRequest: paymentData?.specialRequest || [],
              identity: paymentData?.identity || {},
            },
          },
        });

        console.log("CAR BOOK RESPONSE:", res);

        const bookResult = res?.data?.book;

        if (bookResult?.success === true) {
          setPaymentStatus("success");
          return;
        } else {
          setPaymentStatus("failed");
          setApiError(
            bookResult?.message || "Your car booking could not be completed.",
          );
        }
      } catch (error) {
        console.error("CAR PAYMENT ERROR:", error);
        setPaymentStatus("failed");
        setApiError("Something went wrong while processing your car booking.");
      } finally {
        setLoading(false);
      }
    };

    handleCarPayment();
  }, [searchParams]);

  useEffect(() => {
    if (paymentStatus !== "failed") return;

    setRedirectCountdown(5);

    const countdownTimer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/home");
    }, 5000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(redirectTimer);
    };
  }, [paymentStatus, navigate]);

  useEffect(() => {
    if (paymentStatus !== "success") return;

    setRedirectCountdown(5);

    const countdownTimer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/my-bookings");
    }, 5000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(redirectTimer);
    };
  }, [paymentStatus, navigate]);

  if (loading) {
    return (
      <div className="car-payment-loader-overlay">
        <div className="car-payment-loader-box">
          <div className="car-payment-loader-spinner"></div>

          <h3>Processing Payment</h3>

          <p>Please wait while we confirm your car booking.</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="car-payment-result-overlay">
        <div className="car-payment-result-popup car-payment-failed-popup">
          <div className="car-payment-result-icon car-payment-failed-icon">
            !
          </div>
          <h2>Payment Failed</h2>
          <p>{apiError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="car-payment-result-overlay">
      {paymentStatus === "success" ? (
        <div className="car-payment-result-popup car-payment-success-popup">
          <div className="car-payment-result-icon car-payment-success-icon">
            ✓
          </div>
          <h2>Payment Successful!</h2>
          <p>
            Your car booking has been successfully processed. Your booking
            details will be available shortly.
          </p>
        </div>
      ) : (
        <div className="car-payment-result-popup car-payment-failed-popup">
          <h2>Payment Failed</h2>
          <p>
            Unfortunately, your car booking payment could not be completed.
            Please try again.
          </p>

          <div className="car-payment-redirect-message">
            You are being redirected to the home page in{" "}
            <strong>{redirectCountdown}</strong> seconds.
          </div>
        </div>
      )}
    </div>
  );
};

export default CarPayment;
