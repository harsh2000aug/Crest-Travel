import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { activityBook } from "../../../../store/Services/AllApi";
import "./ActivityPayment.css";
const ActivityPaymentRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing your booking...");

  useEffect(() => {
    const completeActivityBooking = async () => {
      const status = searchParams.get("status");

      if (status !== "success") {
        setLoading(false);
        setMessage("Payment was not successful.");
        return;
      }

      try {
        const storedData = JSON.parse(
          sessionStorage.getItem("activityPaymentRedirectData") || "{}",
        );

        if (!storedData?.orderId) {
          setLoading(false);
          setMessage("Booking information not found.");
          return;
        }

        const requestBody = {
          bookingDate: storedData.bookingDate || "",
          activityCode: storedData.activityCode || "",
          gradeCode: storedData.gradeCode || "",
          orderId: storedData.orderId || "",
          startTime: storedData.startTime || "",

          primaryTraveller: {
            firstName: storedData.primaryTraveller?.firstName || "",
            type: storedData.primaryTraveller?.type || "Adult",
            title: storedData.primaryTraveller?.title || "",
            lastName: storedData.primaryTraveller?.lastName || "",
            email: storedData.primaryTraveller?.email || "",
            contactNo: storedData.primaryTraveller?.contactNo || "",
          },

          ageBandCount: storedData.ageBandCount || {},

          bookingQuestionAnswers: storedData.bookingQuestionAnswers || [],

          languageGuide: storedData.languageGuide || {
            type: "GUIDE",
            language: "en",
            legacyGuide: "en/SERVICE_GUIDE",
          },
        };

        console.log("Activity Final Booking REQUEST:", requestBody);

        const response = await activityBook({
          body: requestBody,
        });

        console.log("Activity Final Booking RESPONSE:", response);

        const success =
          response?.data?.success === true ||
          response?.data?.booking?.success === true ||
          response?.data?.result?.success === true;

        if (success) {
          setMessage("Booking confirmed successfully.");

          sessionStorage.removeItem("activityPaymentRedirectData");

          setTimeout(() => {
            navigate("/my-bookings");
          }, 2000);
        } else {
          setMessage(
            response?.data?.message ||
              "Payment was successful but booking confirmation failed.",
          );
        }
      } catch (error) {
        console.log("Activity Final Booking ERROR:", error);

        setMessage(
          "Payment was successful but we could not confirm your booking.",
        );
      } finally {
        setLoading(false);
      }
    };

    completeActivityBooking();
  }, [searchParams, navigate]);

  return (
    <div className="activity-payment-redirect-page">
      {loading ? (
        <>
          <div className="activity-payment-redirect-loader" />
          <h2>Processing your booking...</h2>
          <p>Please don't close or refresh this page.</p>
        </>
      ) : (
        <>
          <h2>{message}</h2>
        </>
      )}
    </div>
  );
};

export default ActivityPaymentRedirect;
