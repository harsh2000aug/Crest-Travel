import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { activityBook } from "../../../../store/Services/AllApi";
import "./ActivityPayment.css";

const ActivityPaymentRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing your booking...");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const completeActivityBooking = async () => {
      const paymentStatus = searchParams.get("status");
      const isPaymentSuccess = paymentStatus === "success";

      setPaymentSuccess(isPaymentSuccess);

      try {
        const storedData = JSON.parse(
          sessionStorage.getItem("activityPaymentRedirectData") || "{}",
        );

        if (!storedData?.orderId) {
          setBookingSuccess(false);
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
          bookingQuestionAnswers: Array.from(
            new Map(
              (storedData.bookingQuestionAnswers || []).map((item) => [
                `${item.question}_${item.travelerNum}_${item.unit}`,
                item,
              ]),
            ).values(),
          ),

          ...(storedData.languageGuide
            ? { languageGuide: storedData.languageGuide }
            : {}),
        };

        console.log("Payment Status:", paymentStatus);
        console.log("Activity Final Booking REQUEST:", requestBody);

        const response = await activityBook({
          body: requestBody,
        });

        console.log("Activity Final Booking RESPONSE:", response);

        const bookResponse = response?.data?.book;

        const apiSuccess = bookResponse?.success === true;
        const bookingResult = bookResponse?.result;
        const bookingStatus = bookingResult?.status;

        console.log("Booking API success:", apiSuccess);
        console.log("Booking status:", bookingStatus);

        const isBookingSuccess =
          apiSuccess &&
          bookingStatus !== "FAILED" &&
          bookingStatus !== "CANCELLED";

        if (isBookingSuccess) {
          setBookingSuccess(true);

          console.log("Activity Booking Confirmed:", bookingResult);

          sessionStorage.removeItem("activityPaymentRedirectData");

          setMessage(
            bookingResult?.bookingRef
              ? `Booking confirmed successfully. Booking Ref: ${bookingResult.bookingRef}`
              : "Booking confirmed successfully.",
          );

          setTimeout(() => {
            navigate("/my-bookings");
          }, 2000);
        } else {
          setBookingSuccess(false);

          if (!isPaymentSuccess) {
            setMessage(
              bookResponse?.message ||
                "Payment was not successful and the activity booking could not be confirmed.",
            );
          } else {
            setMessage(
              bookResponse?.message ||
                "Payment was successful but booking confirmation failed.",
            );
          }
        }
      } catch (error) {
        console.log("Activity Final Booking ERROR:", error);

        setBookingSuccess(false);

        if (!isPaymentSuccess) {
          setMessage(
            "Payment was not successful and we could not confirm your booking.",
          );
        } else {
          setMessage(
            "Payment was successful but we could not confirm your booking.",
          );
        }
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
        <div
          className={`activity-payment-status ${
            bookingSuccess
              ? "activity-payment-success"
              : "activity-payment-failure"
          }`}
        >
          <div className="activity-payment-status-icon">
            {bookingSuccess ? "✓" : "!"}
          </div>

          <h2>{message}</h2>

          {bookingSuccess ? (
            <p>Your booking has been confirmed successfully.</p>
          ) : (
            <p>
              {paymentSuccess
                ? "Your payment was not successful, so the activity booking could not be confirmed."
                : "Your payment was not successful, so the activity booking could not be confirmed."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityPaymentRedirect;
