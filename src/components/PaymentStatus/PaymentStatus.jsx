import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentStatus.css";
const PaymentStatus = () => {
  const navigate = useNavigate();

  const [paymentStatus, setPaymentStatus] = useState("checking");
  const [message, setMessage] = useState(
    "Please wait while we confirm your payment...",
  );

  useEffect(() => {
    const orderId = localStorage.getItem("membershipOrderId");
    const orderKey = localStorage.getItem("membershipOrderKey");
    const savedStatusUrl = localStorage.getItem("membershipStatusUrl");

    console.log("Payment Status - Order ID:", orderId);
    console.log("Payment Status - Order Key:", orderKey);
    console.log("Payment Status - Saved Status URL:", savedStatusUrl);

    // If order information is missing
    if (!orderId || !orderKey) {
      setPaymentStatus("failed");
      setMessage(
        "We could not find your order information. Please contact support.",
      );
      return;
    }

    let intervalId = null;
    let attempts = 0;
    let isChecking = false;

    const checkPaymentStatus = async () => {
      // Prevent multiple API calls running at the same time
      if (isChecking) {
        return;
      }

      isChecking = true;
      attempts++;

      try {
        const statusUrl =
          savedStatusUrl ||
          `https://backendcms.cresttravelclub.com/index.php?rest_route=%2Fcrest%2Fv1%2Fmembership-status&order_id=${encodeURIComponent(
            orderId,
          )}&order_key=${encodeURIComponent(orderKey)}`;

        console.log("=================================");
        console.log("Checking Payment Status");
        console.log("Attempt:", attempts);
        console.log("Order ID:", orderId);
        console.log("Status URL:", statusUrl);

        const response = await fetch(statusUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        console.log("Payment Status API Response:", data);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to check payment status");
        }

        const status = String(
          data?.paymentStatus || data?.status || data?.orderStatus || "",
        ).toLowerCase();

        console.log("Payment Status:", status);

        // --------------------------------
        // SUCCESS
        // --------------------------------
        if (
          status === "completed" ||
          status === "complete" ||
          status === "success" ||
          status === "successful" ||
          status === "paid"
        ) {
          console.log("PAYMENT SUCCESS");

          setPaymentStatus("success");

          setMessage(
            data?.message ||
              "Your payment was successful and your membership has been activated.",
          );

          // Stop polling
          if (intervalId) {
            clearInterval(intervalId);
          }

          isChecking = false;

          return;
        }

        // --------------------------------
        // FAILED
        // --------------------------------
        if (
          status === "failed" ||
          status === "failure" ||
          status === "cancelled" ||
          status === "canceled"
        ) {
          console.log("PAYMENT FAILED");

          setPaymentStatus("failed");

          setMessage(
            data?.message ||
              "Unfortunately, your payment could not be completed.",
          );

          // Stop polling
          if (intervalId) {
            clearInterval(intervalId);
          }

          isChecking = false;

          return;
        }

        // --------------------------------
        // REFUNDED
        // --------------------------------
        if (status === "refunded") {
          console.log("PAYMENT REFUNDED");

          setPaymentStatus("failed");

          setMessage(
            data?.message ||
              "Your payment was refunded. Please contact support for assistance.",
          );

          // Stop polling
          if (intervalId) {
            clearInterval(intervalId);
          }

          isChecking = false;

          return;
        }

        // --------------------------------
        // PENDING / PROCESSING
        // --------------------------------
        console.log("PAYMENT STILL PROCESSING");

        setPaymentStatus("pending");

        setMessage(
          "Your payment is being processed. Please wait while we confirm it.",
        );

        if (attempts >= 30) {
          console.log("Payment status checking timed out.");

          if (intervalId) {
            clearInterval(intervalId);
          }

          setPaymentStatus("failed");

          setMessage(
            "We could not confirm your payment right now. If your amount was deducted, please contact support.",
          );
        }

        isChecking = false;
      } catch (error) {
        console.error("Payment Status Error:", error);

        setPaymentStatus("pending");

        setMessage(
          "We are still trying to confirm your payment. Please wait...",
        );

        if (attempts >= 30) {
          console.log("Payment status checking timed out after API errors.");

          if (intervalId) {
            clearInterval(intervalId);
          }

          setPaymentStatus("failed");

          setMessage(
            "We could not confirm your payment. If your amount was deducted, please contact support.",
          );
        }

        isChecking = false;
      }
    };

    // --------------------------------
    // FIRST CHECK
    // --------------------------------

    checkPaymentStatus();

    // --------------------------------
    // CHECK EVERY 2 SECONDS
    // --------------------------------

    intervalId = setInterval(() => {
      checkPaymentStatus();
    }, 2000);

    // --------------------------------
    // CLEANUP
    // --------------------------------

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // --------------------------------
  // CONTINUE BUTTON
  // --------------------------------

  const handleContinue = () => {
    // Remove temporary payment information
    localStorage.removeItem("membershipOrderId");
    localStorage.removeItem("membershipOrderKey");
    localStorage.removeItem("membershipStatusUrl");

    navigate("/");
  };

  return (
    <div className="payment-status-page">
      <div className="payment-status-card">
        {paymentStatus === "checking" && (
          <>
            <div className="payment-status-spinner"></div>

            <h1>Checking Payment</h1>

            <p>{message}</p>

            <span className="payment-status-note">
              Please wait while we verify your payment.
            </span>
          </>
        )}

        {paymentStatus === "pending" && (
          <>
            <div className="payment-status-spinner"></div>

            <h1>Payment Processing</h1>

            <p>{message}</p>

            <span className="payment-status-note">
              Please do not close this page.
            </span>
          </>
        )}

        {paymentStatus === "success" && (
          <>
            <div className="payment-status-icon payment-status-success">✓</div>

            <h1>Payment Successful</h1>

            <p>{message}</p>

            <span className="payment-status-note">
              Your membership payment has been successfully completed.
            </span>

            <button
              type="button"
              className="payment-status-button"
              onClick={handleContinue}
            >
              Continue
            </button>
          </>
        )}

        {paymentStatus === "failed" && (
          <>
            <div className="payment-status-icon payment-status-failed">×</div>

            <h1>Payment Failed</h1>

            <p>{message}</p>

            <span className="payment-status-note">
              If your amount was deducted, please contact support before making
              another payment.
            </span>

            <button
              type="button"
              className="payment-status-button"
              onClick={handleContinue}
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
