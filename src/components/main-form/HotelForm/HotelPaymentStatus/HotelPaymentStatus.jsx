import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Country } from "country-state-city";

import { hotelBooking } from "../../../../store/Services/AllApi";

const HotelPaymentStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // =========================================================
  // URL PARAMETERS
  // =========================================================

  const paymentStatus = searchParams.get("payment") || "";

  // =========================================================
  // HELPERS
  // =========================================================

  const encodeBase64 = (value) => {
    return btoa(String(value || ""));
  };

  const getCardType = (cardNumber) => {
    const number = String(cardNumber || "").replace(/\s/g, "");

    if (/^4/.test(number)) {
      return "VI";
    }

    if (/^(5[1-5]|2[2-7])/.test(number)) {
      return "MC";
    }

    if (/^3[47]/.test(number)) {
      return "AX";
    }

    if (/^6(?:011|5)/.test(number)) {
      return "DI";
    }

    return "";
  };

  // =========================================================
  // HOTEL BOOKING AFTER PAYMENT
  // =========================================================

  useEffect(() => {
    const processHotelBooking = async () => {
      try {
        // Only process successful payment
        if (paymentStatus !== "success") {
          setLoading(false);

          if (paymentStatus === "failed") {
            setBookingError("Payment failed.");
          } else {
            setBookingError("Invalid payment status.");
          }

          return;
        }

        // -----------------------------------------------------
        // GET SAVED DATA
        // -----------------------------------------------------

        const itemId = localStorage.getItem("hotelPaymentItemId");

        const savedFormData = localStorage.getItem("hotelPaymentFormData");

        const savedLeadGuest = localStorage.getItem("hotelPaymentLeadGuest");

        const savedBookingInfo = localStorage.getItem(
          "hotelPaymentBookingInfo",
        );

        if (!savedBookingInfo) {
          throw new Error("Hotel booking information is missing.");
        }

        const bookingInfo = JSON.parse(savedBookingInfo);

        const { hotelId, roomId, rateid, ourprice } = bookingInfo;

        console.log("PAYMENT STATUS DATA:", {
          itemId,
          savedFormData,
          savedLeadGuest,
        });

        // -----------------------------------------------------
        // VALIDATE SAVED DATA
        // -----------------------------------------------------

        if (!itemId) {
          throw new Error("Payment item ID is missing.");
        }

        if (!savedFormData) {
          throw new Error("Hotel booking form data is missing.");
        }

        // -----------------------------------------------------
        // PARSE SAVED DATA
        // -----------------------------------------------------

        const bookingData = JSON.parse(savedFormData);

        let leadGuest = {
          title: "Mr",
          countryCode: "+91",
        };

        if (savedLeadGuest) {
          try {
            leadGuest = JSON.parse(savedLeadGuest);
          } catch (error) {
            console.error("Unable to parse lead guest:", error);
          }
        }

        console.log("RESTORED BOOKING DATA:", bookingData);

        // -----------------------------------------------------
        // GUESTS
        // -----------------------------------------------------

        const guests = [
          {
            age: Number(bookingData.age) || 0,

            email: bookingData.email || "",

            title: leadGuest?.title?.toUpperCase() || "MR",

            type: Number(bookingData.age) >= 18 ? "ADULT" : "CHILD",

            lastName: bookingData.lastName || "",

            firstName: bookingData.firstName || "",
          },

          ...(bookingData.travellers || []).map((traveller) => ({
            age: Number(traveller.age) || 0,

            email: bookingData.email || "",

            title: traveller.title?.toUpperCase() || "MR",

            type: Number(traveller.age) >= 18 ? "ADULT" : "CHILD",

            lastName: traveller.lastName || "",

            firstName: traveller.firstName || "",
          })),
        ];

        // -----------------------------------------------------
        // BOOKING PAYLOAD
        // -----------------------------------------------------

        const bookingPayload = {
          orderNumber: itemId,

          hotelId: hotelId,

          ourprice: ourprice,

          rooms: [
            {
              roomId: localStorage.getItem("roomId") || roomId,

              rateId: localStorage.getItem("rateid") || rateid,

              guests,
            },
          ],

          billing: {
            type: Number(bookingData.age) >= 18 ? "ADULT" : "CHILD",

            title: leadGuest?.title?.toUpperCase() || "MR",

            firstName: bookingData.firstName || "",

            lastName: bookingData.lastName || "",

            age: Number(bookingData.age) || 0,

            line1: bookingData.address1 || "",

            line2: bookingData.address2 || "",

            postalCode: bookingData.zipCode || "",

            phone: bookingData.phone || "",

            email: bookingData.email || "",

            city: {
              code: bookingData.city || "",

              name: bookingData.city || "",
            },

            state: {
              code: bookingData.state || "",

              name: bookingData.state || "",
            },

            country: {
              name:
                Country.getCountryByCode(bookingData.country)?.name ||
                bookingData.country ||
                "",

              code: bookingData.country || "",
            },
          },

          identity: {
            number: encodeBase64(
              String(bookingData.cardNumber || "").replace(/\s/g, ""),
            ),

            name: encodeBase64(bookingData.cardHolder || ""),

            code: encodeBase64(bookingData.cvv || ""),

            type: getCardType(
              String(bookingData.cardNumber || "").replace(/\s/g, ""),
            ),

            em: encodeBase64(
              String(bookingData.expiryDate || "").split("/")[0] || "",
            ),

            ey: encodeBase64(
              String(bookingData.expiryDate || "").split("/")[1] || "",
            ),

            line1: bookingData.address1 || "",

            line2: bookingData.address2 || "",

            city: {
              name: bookingData.city || "",

              code: bookingData.city || "",
            },

            state: {
              name: bookingData.state || "",

              code: bookingData.state || "",
            },

            country: {
              name:
                Country.getCountryByCode(bookingData.country)?.name ||
                bookingData.country ||
                "",

              code: bookingData.country || "",
            },

            postalCode: bookingData.zipCode || "",

            phone: bookingData.phone || "",

            email: bookingData.email || "",
          },
        };

        console.log(
          "FINAL HOTEL BOOKING PAYLOAD:",
          JSON.stringify(bookingPayload, null, 2),
        );

        // -----------------------------------------------------
        // CALL HOTEL BOOKING API
        // -----------------------------------------------------

        const bookingResponse = await hotelBooking({
          body: bookingPayload,
        });

        console.log("HOTEL BOOKING RESPONSE:", bookingResponse);

        // -----------------------------------------------------
        // CHECK RESPONSE
        // -----------------------------------------------------

        if (bookingResponse?.success === false) {
          throw new Error(bookingResponse?.message || "Hotel booking failed.");
        }

        // -----------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------

        setBookingSuccess(true);

        // Clear temporary payment data
        localStorage.removeItem("hotelPaymentItemId");

        localStorage.removeItem("hotelPaymentFormData");

        localStorage.removeItem("hotelPaymentLeadGuest");

        localStorage.removeItem("hotelPaymentBookingInfo");

        setLoading(false);

        // Redirect to home after 5 seconds
        setTimeout(() => {
          navigate("/home");
        }, 5000);
      } catch (error) {
        console.error("HOTEL BOOKING AFTER PAYMENT ERROR:", error);

        setLoading(false);

        setBookingSuccess(false);

        setBookingError(
          error?.message ||
            "Something went wrong while confirming your hotel booking.",
        );
      }
    };

    processHotelBooking();
  }, []);

  // =========================================================
  // UI
  // =========================================================

  if (loading) {
    return (
      <>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h2>Confirming your hotel booking...</h2>

          <p>Please do not close or refresh this page.</p>
        </div>
      </>
    );
  }

  if (bookingSuccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: "60px",
            color: "green",
          }}
        >
          ✓
        </div>

        <h2>Hotel Booking Confirmed</h2>

        <p>
          Your payment was successful and your hotel booking has been confirmed.
        </p>

        <p>Redirecting to home in 5 seconds...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "60px",
          color: "red",
        }}
      >
        ✕
      </div>

      <h2>Hotel Booking Failed</h2>

      <p>{bookingError}</p>

      <button onClick={() => navigate("/home")}>Go Home</button>
    </div>
  );
};

export default HotelPaymentStatus;
