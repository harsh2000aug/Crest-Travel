import React, { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";

import {
  FaCheck,
  FaPlane,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaReceipt,
  FaInfoCircle,
  FaSuitcase,
  FaUtensils,
  FaTicketAlt,
  FaClock,
  FaCreditCard,
} from "react-icons/fa";

import { FaCircleXmark } from "react-icons/fa6";

import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import Loader from "../../../reuseable-components/Loader/Loader";

import {
  checkFlightCancel,
  checkFlightRefund,
  upcomingFlightDetails,
} from "../../../store/Services/AllApi";

import "./FlightBookingDetails.css";

const FlightBookingDetails = () => {
  const [searchParams] = useSearchParams();

  const itemId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refundDetails, setRefundDetails] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await upcomingFlightDetails({
          body: {
            sessionId: localStorage.getItem("sessionId"),
            itemid: itemId,
          },
        });

        console.log("Flight Booking Details Response:", res);

        const tripData = res?.data?.tripdetails?.Data;

        const itinerary = tripData?.TripDetailsResult?.TravelItinerary;

        if (
          res?.data?.tripdetails?.Success &&
          tripData?.TripDetailsResult?.Success &&
          itinerary
        ) {
          setBooking(tripData);
        } else {
          setError(
            res?.data?.tripdetails?.message ||
              "Unable to fetch flight booking details.",
          );
        }
      } catch (error) {
        console.error("Flight Booking Details Error:", error);

        setError("Something went wrong while loading booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);
  const checkRefundEligibility = async () => {
    setRefundLoading(true);
    setRefundError("");
    setLoading(true);
    try {
      const res = await checkFlightRefund({
        body: {
          sessionId: localStorage.getItem("sessionId"),
          input: {
            orderid: itemId,
          },
        },
      });

      const details = res?.data?.checkRefundEligibility;

      if (details?.success) {
        setRefundDetails(details);
        setShowCancelModal(true);
      } else {
        setRefundError(details?.message || "Unable to fetch refund details.");
      }
    } catch (error) {
      console.log(error);
      setRefundError("Something went wrong while checking refund eligibility.");
    } finally {
      setRefundLoading(false);
      setLoading(false);
    }
  };

  const confirmCancelBooking = async () => {
    try {
      const res = await checkFlightCancel({
        body: {
          sessionId: localStorage.getItem("sessionId"),
          bookingid: itemId,
        },
      });
      setShowCancelModal(false);
    } catch (error) {
      console.log("error in cancelling booking", error);
    }
  };
  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateWithTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (value) => {
    const amount = Number(value || 0);

    return `${booking?.currencysymbol || "$"}${amount.toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    const totalMinutes = Number(minutes || 0);

    if (!totalMinutes) {
      return "0m";
    }

    const hours = Math.floor(totalMinutes / 60);

    const mins = totalMinutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  };

  const getItinerary = () => {
    return booking?.TripDetailsResult?.TravelItinerary || {};
  };

  /*
   * IMPORTANT:
   * Flight details are now taken from:
   *
   * TravelItinerary
   *   -> Itineraries
   *      -> ItineraryInfo
   *         -> ReservationItems
   *
   * This is the actual itinerary returned by Mystifly.
   */
  const getReservationItems = () => {
    return (
      getItinerary()?.Itineraries?.flatMap(
        (itinerary) => itinerary?.ItineraryInfo?.ReservationItems || [],
      ) || []
    );
  };

  /*
   * Convert ReservationItems into the same structure
   * used by the existing UI.
   */
  const getAllFlights = () => {
    return getReservationItems().map((flight) => ({
      airline: flight?.airlineName || flight?.MarketingAirlineCode || "-",

      departure: flight?.DepartureAirportLocationCode || "-",

      arrival: flight?.ArrivalAirportLocationCode || "-",

      departurelocation: flight?.DepartureAirportLocationCode || "-",

      arrivallocation: flight?.ArrivalAirportLocationCode || "-",

      departureTime: flight?.DepartureDateTime,

      arrivalTime: flight?.ArrivalDateTime,

      flightCode:
        flight?.MarketingAirlineCode || flight?.OperatingAirlineCode || "-",

      flightNumber: flight?.FlightNumber || "-",

      flightId: flight?.ItemRPH,

      stops: Number(flight?.StopQuantity || 0),

      triptime: Number(flight?.JourneyDuration || 0),

      cabin: flight?.CabinClass || "-",

      checkInBaggage: flight?.Baggage || "-",

      cabinBaggage: "-",

      pnrNumber: flight?.AirlinePNR || "-",

      departureTerminal: flight?.DepartureTerminal || "-",

      arrivalTerminal: flight?.ArrivalTerminal || "-",

      bookingClass: flight?.ResBookDesigCode || "-",

      flightStatus: flight?.FlightStatus || "-",

      isReturn: flight?.IsReturn === true,

      fareFamily: flight?.FareFamily || "-",

      paymentMode: flight?.paymentMode || "-",

      airlineCode:
        flight?.OperatingAirlineCode || flight?.MarketingAirlineCode || "-",

      raw: flight,
    }));
  };

  /*
   * Use IsReturn from ReservationItems.
   *
   * IsReturn:
   * false = outbound
   * true  = return
   *
   * This is more reliable than relying on array indexes.
   */
  const getOutboundFlights = () => {
    return getAllFlights().filter((flight) => flight?.isReturn === false);
  };

  const getReturnFlights = () => {
    return getAllFlights().filter((flight) => flight?.isReturn === true);
  };

  const getPassenger = () => {
    return getItinerary()?.PassengerInfos?.[0]?.Passenger || {};
  };

  const getETicket = () => {
    return getItinerary()?.PassengerInfos?.[0]?.ETickets?.[0] || {};
  };

  const getFareBreakdown = () => {
    return getItinerary()?.TripDetailsPTC_FareBreakdowns?.[0] || {};
  };

  const getFareDetails = () => {
    return getFareBreakdown()?.TripDetailsPassengerFare || {};
  };

  const getExtraServices = () => {
    return (
      booking?.guests?.[0]?.extraservice ||
      booking?.travellers?.[0]?.extraservice ||
      []
    );
  };

  const getCancellationPolicy = () => {
    if (!booking?.cancellation_policy) {
      return null;
    }

    try {
      return JSON.parse(booking.cancellation_policy);
    } catch (error) {
      console.error("Unable to parse cancellation policy:", error);

      return null;
    }
  };

  /*
   * Build baggage map directly from ReservationItems.
   *
   * ReservationItems:
   * FlightNumber -> Baggage
   */
  const getBaggageByFlightNumber = () => {
    const reservationItems = getReservationItems();

    const fareBreakdown = getFareBreakdown();

    const baggageInfoList = fareBreakdown?.BaggageInfo || [];

    const cabinBaggageInfoList = fareBreakdown?.CabinBaggageInfo || [];

    const map = {};

    reservationItems.forEach((item, index) => {
      const flightNumber = item?.FlightNumber;

      if (!flightNumber) {
        return;
      }

      map[flightNumber] = {
        checkedBaggage: item?.Baggage || baggageInfoList?.[index] || "-",

        cabinBaggage: cabinBaggageInfoList?.[index] || "-",
      };
    });

    return map;
  };

  const getAirportName = (flight, type) => {
    if (type === "departure") {
      return flight?.departurelocation || flight?.departure || "-";
    }

    return flight?.arrivallocation || flight?.arrival || "-";
  };

  const getGuestCount = () => {
    return (
      booking?.guests?.length ||
      booking?.travellers?.length ||
      getItinerary()?.PassengerInfos?.length ||
      0
    );
  };

  if (loading) {
    return (
      <div className="hbd-page">
        <HeaderInner />

        <div className="hbd-loading-wrapper">
          <div className="hbd-loader"></div>

          <p>Loading booking details...</p>
        </div>

        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="hbd-page">
        <HeaderInner />

        <div className="hbd-error-wrapper">
          <div className="hbd-error-icon">
            <FaInfoCircle />
          </div>

          <h2>Booking Details Not Found</h2>

          <p>{error || "Unable to find this booking."}</p>
        </div>

        <Footer />
      </div>
    );
  }

  const itinerary = getItinerary();

  /*
   * All flight segments now come from
   * TravelItinerary.Itineraries[].ItineraryInfo.ReservationItems
   */
  const allFlights = getAllFlights();

  const outboundFlights = getOutboundFlights();

  const returnFlights = getReturnFlights();

  const passenger = getPassenger();

  const eTicket = getETicket();

  const fareBreakdown = getFareBreakdown();

  const fareDetails = getFareDetails();

  const extraServices = getExtraServices();

  const cancellationPolicy = getCancellationPolicy();

  const baggageByFlightNumber = getBaggageByFlightNumber();

  const transactions = itinerary?.TransactionDetails?.Transactions || [];

  const transaction = transactions?.[0] || {};

  const bookingStatus = itinerary?.BookingStatus || "Booked";

  const ticketStatus = itinerary?.TicketStatus || "Ticketed";

  const isCancelled =
    bookingStatus?.toLowerCase() === "cancelled" ||
    ticketStatus?.toLowerCase() === "cancelled";

  const firstFlight = allFlights?.[0];

  const lastFlight = allFlights?.[allFlights.length - 1];
  const tripOrigin =
    outboundFlights?.[0]?.departure ||
    firstFlight?.departure ||
    itinerary?.Origin ||
    "-";

  const tripDestination =
    outboundFlights?.[outboundFlights.length - 1]?.arrival ||
    firstFlight?.arrival ||
    itinerary?.Destination ||
    "-";

  const totalStopsOutbound =
    outboundFlights.length > 0
      ? outboundFlights.reduce(
          (total, flight) => total + Number(flight?.stops || 0),
          0,
        )
      : 0;

  const totalStopsReturn =
    returnFlights.length > 0
      ? returnFlights.reduce(
          (total, flight) => total + Number(flight?.stops || 0),
          0,
        )
      : 0;

  const passengerName = [
    passenger?.PaxName?.PassengerTitle,
    passenger?.PaxName?.PassengerFirstName,
    passenger?.PaxName?.PassengerLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const passengerType =
    passenger?.PassengerType === "ADT"
      ? "Adult"
      : passenger?.PassengerType === "CHD"
        ? "Child"
        : passenger?.PassengerType === "INF"
          ? "Infant"
          : passenger?.PassengerType || "Adult";

  const outboundDuration = outboundFlights.reduce(
    (total, flight) => total + Number(flight?.triptime || 0),
    0,
  );

  const returnDuration = returnFlights.reduce(
    (total, flight) => total + Number(flight?.triptime || 0),
    0,
  );

  return (
    <>
      <div className="hbd-page">
        <HeaderInner />

        <main className="hbd-main container">
          {/* =========================
              BOOKING CONFIRMATION
          ========================== */}

          <div
            className={`hbd-confirmation ${
              isCancelled ? "hbd-confirmation-cancelled" : ""
            }`}
          >
            <div className="hbd-confirmation-left">
              <div className="hbd-confirmation-icon">
                {isCancelled ? <FaCircleXmark /> : <FaCheck />}
              </div>

              <div
                className={`hbd-confirmation-content ${
                  isCancelled ? "hbd-confirmation-content-cancel" : ""
                }`}
              >
                <h1>
                  {isCancelled
                    ? "Your Booking Has Been Cancelled"
                    : "Your Booking Is Confirmed"}
                </h1>

                <p>
                  Your booking reference is{" "}
                  <strong>{itinerary?.MFRef || "-"}</strong>
                  {booking?.BookingCreatedOn && (
                    <>
                      {" "}
                      · Booked On{" "}
                      <strong>{formatDate(booking.BookingCreatedOn)}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div
              className={`hbd-confirmation-status ${
                isCancelled ? "hbd-confirmation-status-cancelled" : ""
              }`}
            >
              {isCancelled
                ? "Cancelled"
                : booking?.TripDetailsResult?.TravelItinerary?.BookingStatus}
            </div>
          </div>

          {/* =========================
              MAIN CONTENT
          ========================== */}

          <div className="hbd-layout">
            {/* =========================
                LEFT COLUMN
            ========================== */}

            <div className="hbd-left-column">
              {/* =========================
                  FLIGHT SUMMARY
              ========================== */}

              <section className="hbd-card hbd-hotel-card">
                <div className="hbd-section-accent"></div>

                <div className="hbd-hotel-info">
                  <div className="hbd-hotel-heading">
                    <div>
                      <h2>
                        {tripOrigin} → {tripDestination}
                      </h2>

                      <p className="hbd-location">
                        <FaMapMarkerAlt />

                        {itinerary?.TripType ||
                          booking?.booking_data?.trip ||
                          "Flight"}

                        {" · "}

                        {itinerary?.TripType === "Return" ||
                        booking?.booking_data?.trip === "RoundTrip"
                          ? "Round Trip"
                          : "Flight Journey"}
                      </p>
                    </div>

                    <div className="hbd-hotel-icon">
                      <FaPlane />
                    </div>
                  </div>

                  <div className="hbd-stay-summary">
                    <div className="hbd-date-block">
                      <span className="hbd-label">
                        <FaCalendarAlt />
                        Departure
                      </span>

                      <strong>{formatDate(firstFlight?.departureTime)}</strong>

                      <small>{formatTime(firstFlight?.departureTime)}</small>
                    </div>

                    <div className="hbd-night-wrapper">
                      <div className="hbd-night-line"></div>

                      <span className="hbd-night-badge">
                        {itinerary?.TripType ||
                          booking?.booking_data?.trip ||
                          "FLIGHT"}
                      </span>

                      <div className="hbd-night-line"></div>
                    </div>

                    <div className="hbd-date-block left-align">
                      <span className="hbd-label">
                        <FaCalendarAlt />
                        Arrival
                      </span>

                      <strong>{formatDate(lastFlight?.arrivalTime)}</strong>

                      <small>{formatTime(lastFlight?.arrivalTime)}</small>
                    </div>
                  </div>
                </div>

                <div className="hbd-hotel-image-wrapper">
                  <div className="hbd-no-image">
                    <img
                      src={`https://d15u1xbazig0vl.cloudfront.net/images/flight/${
                        booking?.TripDetailsResult?.booking_data?.flighticket[0]
                          ?.flights[0]?.flightCode
                      }.png`}
                      alt={booking.flightCode || "Flight"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display =
                          "block";
                      }}
                    />
                    <FaPlane style={{ display: "none" }} />
                  </div>
                </div>
              </section>

              {/* =========================
                  OUTBOUND FLIGHT
              ========================== */}

              {outboundFlights.length > 0 && (
                <section className="hbd-card hbd-room-card">
                  <div className="hbd-section-title">
                    <div className="hbd-title-accent"></div>

                    <div>
                      <h2>Outbound Journey</h2>

                      <p>
                        {outboundFlights.length === 1
                          ? "Direct flight"
                          : totalStopsOutbound === 0
                            ? "Direct flight"
                            : `${totalStopsOutbound} stop${
                                totalStopsOutbound > 1 ? "s" : ""
                              }`}
                      </p>
                    </div>
                  </div>

                  <div className="hbd-room-content">
                    <div className="hbd-room-main">
                      <div className="hbd-room-icon">
                        <FaPlaneDeparture />
                      </div>

                      <div className="hbd-room-information">
                        <h3>
                          {outboundFlights?.[0]?.departure || "-"} →{" "}
                          {
                            outboundFlights?.[outboundFlights.length - 1]
                              ?.arrival
                          }
                        </h3>

                        <p>
                          {outboundFlights?.[0]?.airline ||
                            itinerary?.Provider ||
                            "-"}
                        </p>

                        <div className="hbd-room-meta">
                          <span>
                            <FaCalendarAlt />

                            {formatDate(outboundFlights?.[0]?.departureTime)}
                          </span>

                          <span>
                            <FaClock />

                            {formatDuration(outboundDuration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hbd-board-basis">
                      <span>Cabin</span>

                      <strong>
                        {outboundFlights?.[0]?.cabin || "Economy"}
                      </strong>
                    </div>
                  </div>

                  {outboundFlights.map((flight, index) => (
                    <div
                      className="hbd-traveler-details"
                      key={`outbound-${flight?.flightNumber}-${index}`}
                    >
                      <div className="hbd-traveler-avatar">
                        <FaPlane />
                      </div>

                      <div className="hbd-traveler-info">
                        <h3>
                          {flight?.departure || "-"} → {flight?.arrival || "-"}
                        </h3>

                        <p>
                          {flight?.airline || "-"} · {flight?.flightCode || "-"}
                          {flight?.flightNumber || "-"}
                        </p>

                        <div className="hbd-traveler-contact">
                          <span>
                            {formatTime(flight?.departureTime)} -{" "}
                            {formatTime(flight?.arrivalTime)}
                          </span>

                          <span>
                            {flight?.departureTerminal
                              ? `Terminal ${flight.departureTerminal}`
                              : ""}

                            {flight?.departureTerminal &&
                            flight?.arrivalTerminal
                              ? " → "
                              : ""}

                            {flight?.arrivalTerminal
                              ? `Terminal ${flight.arrivalTerminal}`
                              : ""}
                          </span>
                        </div>

                        <div className="hbd-traveler-contact">
                          <span>
                            {getAirportName(flight, "departure")} →{" "}
                            {getAirportName(flight, "arrival")}
                          </span>

                          <span>
                            Duration: {formatDuration(flight?.triptime)}
                          </span>
                        </div>
                      </div>

                      <span className="hbd-primary-label">
                        {flight?.pnrNumber || "-"}
                      </span>
                    </div>
                  ))}
                </section>
              )}

              {/* =========================
                  RETURN FLIGHT
              ========================== */}

              {returnFlights.length > 0 && (
                <section className="hbd-card hbd-room-card">
                  <div className="hbd-section-title">
                    <div className="hbd-title-accent"></div>

                    <div>
                      <h2>Return Journey</h2>

                      <p>
                        {returnFlights.length === 1
                          ? "Direct flight"
                          : totalStopsReturn === 0
                            ? "Direct flight"
                            : `${totalStopsReturn} stop${
                                totalStopsReturn > 1 ? "s" : ""
                              }`}
                      </p>
                    </div>
                  </div>

                  <div className="hbd-room-content">
                    <div className="hbd-room-main">
                      <div className="hbd-room-icon">
                        <FaPlaneArrival />
                      </div>

                      <div className="hbd-room-information">
                        <h3>
                          {returnFlights?.[0]?.departure || "-"} →{" "}
                          {returnFlights?.[returnFlights.length - 1]?.arrival}
                        </h3>

                        <p>
                          {returnFlights?.[0]?.airline ||
                            itinerary?.Provider ||
                            "-"}
                        </p>

                        <div className="hbd-room-meta">
                          <span>
                            <FaCalendarAlt />

                            {formatDate(returnFlights?.[0]?.departureTime)}
                          </span>

                          <span>
                            <FaClock />

                            {formatDuration(returnDuration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hbd-board-basis">
                      <span>Cabin</span>

                      <strong>{returnFlights?.[0]?.cabin || "Economy"}</strong>
                    </div>
                  </div>

                  {returnFlights.map((flight, index) => (
                    <div
                      className="hbd-traveler-details"
                      key={`return-${flight?.flightNumber}-${index}`}
                    >
                      <div className="hbd-traveler-avatar">
                        <FaPlane />
                      </div>

                      <div className="hbd-traveler-info">
                        <h3>
                          {flight?.departure || "-"} → {flight?.arrival || "-"}
                        </h3>

                        <p>
                          {flight?.airline || "-"} · {flight?.flightCode || "-"}
                          {flight?.flightNumber || "-"}
                        </p>

                        <div className="hbd-traveler-contact">
                          <span>
                            {formatTime(flight?.departureTime)} -{" "}
                            {formatTime(flight?.arrivalTime)}
                          </span>

                          <span>
                            {flight?.departureTerminal
                              ? `Terminal ${flight.departureTerminal}`
                              : ""}

                            {flight?.departureTerminal &&
                            flight?.arrivalTerminal
                              ? " → "
                              : ""}

                            {flight?.arrivalTerminal
                              ? `Terminal ${flight.arrivalTerminal}`
                              : ""}
                          </span>
                        </div>

                        <div className="hbd-traveler-contact">
                          <span>
                            {getAirportName(flight, "departure")} →{" "}
                            {getAirportName(flight, "arrival")}
                          </span>

                          <span>
                            Duration: {formatDuration(flight?.triptime)}
                          </span>
                        </div>
                      </div>

                      <span className="hbd-primary-label">
                        {flight?.pnrNumber || "-"}
                      </span>
                    </div>
                  ))}
                </section>
              )}

              {/* =========================
                  BAGGAGE DETAILS
              ========================== */}

              <section className="hbd-card hbd-contact-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Baggage Details</h2>

                    <p>Baggage allowance for your journey</p>
                  </div>
                </div>

                <div className="hbd-contact-grid">
                  {allFlights.map((flight, index) => {
                    const baggage =
                      baggageByFlightNumber?.[flight?.flightNumber] || {};

                    const checkedBaggage =
                      baggage.checkedBaggage || flight?.checkInBaggage || "-";

                    const cabinBaggage =
                      baggage.cabinBaggage || flight?.cabinBaggage || "-";

                    return (
                      <div
                        className="hbd-contact-item"
                        key={`baggage-${flight?.flightNumber}-${index}`}
                      >
                        <div className="hbd-contact-icon">
                          <FaSuitcase />
                        </div>

                        <div>
                          <span>
                            {flight?.departure} → {flight?.arrival}
                          </span>

                          <strong>Checked Baggage: {checkedBaggage}</strong>

                          <p>Cabin Baggage: {cabinBaggage}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* =========================
                  TRAVELER DETAILS
              ========================== */}

              <section className="hbd-card hbd-traveler-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Traveler Details</h2>

                    <p>Passenger information for this reservation</p>
                  </div>
                </div>

                <div className="hbd-traveler-count">
                  <FaUser />

                  <strong>
                    {getGuestCount()}{" "}
                    {getGuestCount() === 1 ? "Passenger" : "Passengers"}
                  </strong>
                </div>

                <div className="hbd-traveler-details">
                  <div className="hbd-traveler-avatar">
                    <FaUser />
                  </div>

                  <div className="hbd-traveler-info">
                    <h3>{passengerName || "-"}</h3>

                    <p>{passengerType}</p>

                    <div className="hbd-traveler-contact">
                      <span>{passenger?.EmailAddress || "-"}</span>

                      <span>
                        +{passenger?.CountryCode || ""}{" "}
                        {passenger?.PhoneNumber || "-"}
                      </span>
                    </div>
                  </div>

                  <span className="hbd-primary-label">
                    {passenger?.TicketStatus || ticketStatus}
                  </span>
                </div>

                <div className="hbd-guest-names">
                  <span>Date of Birth</span>

                  <strong>{formatDate(passenger?.DateOfBirth)}</strong>
                </div>

                <div className="hbd-guest-names">
                  <span>Gender</span>

                  <strong>{passenger?.Gender || "-"}</strong>
                </div>

                <div className="hbd-guest-names">
                  <span>Passport Number</span>

                  <strong>{passenger?.PassportNumber || "-"}</strong>
                </div>

                <div className="hbd-guest-names">
                  <span>Passport Expiry</span>

                  <strong>{formatDate(passenger?.PassportExpiresOn)}</strong>
                </div>

                <div className="hbd-guest-names">
                  <span>Passport Issuance Country</span>

                  <strong>{passenger?.PassportIssuanceCountry || "-"}</strong>
                </div>

                <div className="hbd-guest-names">
                  <span>Passenger Nationality</span>

                  <strong>{passenger?.PassengerNationality || "-"}</strong>
                </div>

                <div className="hbd-guest-names">
                  <span>Passport Nationality</span>

                  <strong>{passenger?.PassportNationality || "-"}</strong>
                </div>

                <div className="hbd-guest-names">
                  <span>E-Ticket Number</span>

                  <strong>{eTicket?.ETicketNumber || "-"}</strong>
                </div>
              </section>

              {/* =========================
                  EXTRA SERVICES
              ========================== */}

              {extraServices.length > 0 && (
                <section className="hbd-card hbd-room-card">
                  <div className="hbd-section-title">
                    <div className="hbd-title-accent"></div>

                    <div>
                      <h2>Extra Services</h2>

                      <p>Baggage and meal services added to your booking</p>
                    </div>
                  </div>

                  {extraServices.map((service, index) => (
                    <div
                      className="hbd-traveler-details"
                      key={`${service?.serviceid}-${index}`}
                    >
                      <div className="hbd-traveler-avatar">
                        {service?.type === "MEAL" ? (
                          <FaUtensils />
                        ) : (
                          <FaSuitcase />
                        )}
                      </div>

                      <div className="hbd-traveler-info">
                        <h3>{service?.type === "MEAL" ? "Meal" : "Baggage"}</h3>

                        <p>{service?.description?.trim() || "-"}</p>

                        <div className="hbd-traveler-contact">
                          <span>Service ID: {service?.serviceid || "-"}</span>
                        </div>
                      </div>

                      <span className="hbd-primary-label">
                        {formatPrice(service?.price)}
                      </span>
                    </div>
                  ))}
                </section>
              )}

              {/* =========================
                  FARE / TICKET DETAILS
              ========================== */}

              <section className="hbd-card hbd-contact-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Booking Details</h2>

                    <p>Flight reservation information</p>
                  </div>
                </div>

                <div className="hbd-contact-grid">
                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaTicketAlt />
                    </div>

                    <div>
                      <span>Booking Reference</span>

                      <strong>{itinerary?.MFRef || "-"}</strong>

                      <p>
                        PNR:{" "}
                        {firstFlight?.pnrNumber ||
                          eTicket?.ETicketNumber ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaCreditCard />
                    </div>

                    <div>
                      <span>Payment</span>

                      <strong>
                        {booking?.TripDetailsResult?.payment_mode || "-"}
                      </strong>

                      <p>
                        Gateway:{" "}
                        {booking?.TripDetailsResult?.payment_gateway || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaReceipt />
                    </div>

                    <div>
                      <span>Invoice</span>

                      <strong>{transaction?.Number || "-"}</strong>

                      <p>{formatPrice(transaction?.Amount)}</p>
                    </div>
                  </div>

                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaInfoCircle />
                    </div>

                    <div>
                      <span>Fare Type</span>

                      <strong>
                        {booking?.TripDetailsResult?.TravelItinerary?.FareType}
                      </strong>

                      <p>Provider: {booking?.TripDetailsResult?.Provider}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================
                  FARE RULES
              ========================== */}

              {cancellationPolicy?.fareRules?.length > 0 && (
                <section className="hbd-card hbd-cancellation-card">
                  <div className="hbd-section-title">
                    <div className="hbd-title-accent"></div>

                    <div>
                      <h2>Fare Rules</h2>

                      <p>Rules associated with your flight fare</p>
                    </div>
                  </div>

                  {cancellationPolicy.fareRules.map((rule, index) => (
                    <div className="hbd-policy-block" key={index}>
                      <p className="hbd-policy-text">
                        {rule?.airline || "-"} · {rule?.cityPair || "-"}
                      </p>

                      {rule?.ruleDetails?.map((detail, detailIndex) => (
                        <div className="hbd-policy-rule" key={detailIndex}>
                          <div>
                            <span>Category</span>

                            <strong>{detail?.category || "-"}</strong>
                          </div>

                          <div>
                            <span>Rules</span>

                            <strong>
                              {detail?.rules || "No rules provided"}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              )}

              {/* =========================
                  REFUND / EXCHANGE POLICY
              ========================== */}

              <section className="hbd-card hbd-cancellation-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Flight Policy</h2>

                    <p>Refund and exchange information</p>
                  </div>
                </div>

                <div className="hbd-policy-block">
                  <div className="hbd-policy-rule">
                    <div>
                      <span>Refund Before Departure</span>

                      <strong>
                        {fareBreakdown?.AirRefundCharges
                          ?.IsRefundableBeforeDeparture || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Refund After Departure</span>

                      <strong>
                        {fareBreakdown?.AirRefundCharges
                          ?.IsRefundableAfterDeparture || "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="hbd-policy-rule">
                    <div>
                      <span>Exchange Before Departure</span>

                      <strong>
                        {fareBreakdown?.AirExchangeCharges
                          ?.IsExchangeableBeforeDeparture || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Exchange After Departure</span>

                      <strong>
                        {fareBreakdown?.AirExchangeCharges
                          ?.IsExchangeableAfterDeparture || "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="hbd-policy-rule">
                    <div>
                      <span>Voidable</span>

                      <strong>
                        {fareBreakdown?.AirVoidCharges?.IsVoidable || "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* =========================
                RIGHT COLUMN
            ========================== */}

            <aside className="hbd-right-column">
              {/* =========================
                  PRICE DETAILS
              ========================== */}

              <section className="hbd-card hbd-price-card">
                <div className="hbd-price-title">
                  <FaReceipt />

                  <h2>Price Details</h2>
                </div>

                <div className="hbd-price-description">
                  <span>
                    {getGuestCount()} Passenger
                    {getGuestCount() === 1 ? "" : "s"}
                  </span>

                  <strong>{formatPrice(fareDetails?.TotalFare?.Amount)}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Base Fare</span>

                  <strong>{formatPrice(fareDetails?.EquiFare?.Amount)}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Taxes</span>

                  <strong>
                    {formatPrice(fareDetails?.Tax?.Amount ?? booking?.taxes)}
                  </strong>
                </div>

                {Number(booking?.totalExtraService || 0) > 0 && (
                  <div className="hbd-price-row">
                    <span>Extra Services</span>

                    <strong>{formatPrice(booking?.totalExtraService)}</strong>
                  </div>
                )}

                {Number(booking?.feess || 0) > 0 && (
                  <div className="hbd-price-row">
                    <span>Fees</span>

                    <strong>{formatPrice(booking?.feess)}</strong>
                  </div>
                )}

                <div className="hbd-price-divider"></div>

                <div className="hbd-total-row">
                  <span>Total Amount</span>

                  <strong>${booking?.TripDetailsResult?.our_price}</strong>
                </div>
              </section>

              {/* =========================
                  BOOKING INFORMATION
              ========================== */}

              <section className="hbd-card hbd-price-card">
                <div className="hbd-price-title">
                  <FaInfoCircle />

                  <h2>Booking Information</h2>
                </div>

                <div className="hbd-price-row">
                  <span>Booking Status</span>

                  <strong>{bookingStatus}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Ticket Status</span>

                  <strong>{ticketStatus}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Provider</span>

                  <strong>{booking?.TripDetailsResult?.Provider || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Payment Mode</span>

                  <strong>
                    {booking?.TripDetailsResult?.payment_mode || "-"}
                  </strong>
                </div>

                <div className="hbd-price-row">
                  <span>Currency</span>

                  <strong>{booking?.TripDetailsResult?.currency || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>PNR</span>

                  <strong>{firstFlight?.pnrNumber || "-"}</strong>
                </div>

                <div className="hbd-price-divider"></div>

                <div className="hbd-price-row">
                  <span>Booking Created</span>

                  <strong>
                    {formatDateWithTime(
                      booking?.TripDetailsResult?.BookingCreatedOn,
                    )}
                  </strong>
                </div>
              </section>

              {/* =========================
                  TICKET DETAILS
              ========================== */}

              <section className="hbd-card hbd-price-card">
                <div className="hbd-price-title">
                  <FaTicketAlt />

                  <h2>Ticket Details</h2>
                </div>

                <div className="hbd-price-row">
                  <span>E-Ticket</span>

                  <strong>{eTicket?.ETicketNumber || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Ticket Type</span>

                  <strong>{eTicket?.ETicketType || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Airline PNR</span>

                  <strong>{firstFlight?.pnrNumber || "-"}</strong>
                </div>
              </section>

              {/* =========================
                  CANCELLATION / REFUND
              ========================== */}

              <section className="hbd-card hbd-price-card">
                <div className="hbd-price-title">
                  <FaInfoCircle />

                  <h2>Cancellation Policy</h2>
                </div>

                <div className="hbd-price-row">
                  <span>Before Departure</span>

                  <strong>
                    {fareBreakdown?.AirRefundCharges
                      ?.IsRefundableBeforeDeparture || "-"}
                  </strong>
                </div>

                <div className="hbd-price-row">
                  <span>After Departure</span>

                  <strong>
                    {fareBreakdown?.AirRefundCharges
                      ?.IsRefundableAfterDeparture || "-"}
                  </strong>
                </div>

                <div className="hbd-price-divider"></div>

                <div className="hbd-price-description">
                  <span>Rerouting Allowed</span>

                  <strong>{itinerary?.ReroutingAllowed || "-"}</strong>
                </div>
              </section>
            </aside>
          </div>
          <button
            className="your-cancel-button-class"
            onClick={checkRefundEligibility}
          >
            Cancel Booking
          </button>
          {refundError && (
            <p style={{ color: "#b91c1c", marginTop: 8 }}>{refundError}</p>
          )}
        </main>
        {showCancelModal && refundDetails && (
          <div
            className="hbd-modal-overlay"
            onClick={() => setShowCancelModal(false)}
          >
            <div className="hbd-modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Cancel Booking</h3>

              {refundDetails?.eligible ? (
                <>
                  <p className="hbd-modal-refund-text">
                    The total refund amount will be:{" "}
                    <strong>
                      {formatPrice(
                        refundDetails?.cancellationDetails?.totalRefund,
                      )}
                    </strong>
                  </p>

                  <p className="hbd-modal-confirm-text">
                    Are you sure you want to cancel?
                  </p>

                  <div className="hbd-modal-actions">
                    <button
                      className="hbd-modal-btn hbd-modal-btn-secondary"
                      onClick={() => setShowCancelModal(false)}
                    >
                      No, Go Back
                    </button>

                    <button
                      className="hbd-modal-btn hbd-modal-btn-danger"
                      onClick={confirmCancelBooking}
                    >
                      Yes, Cancel Booking
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="hbd-modal-confirm-text">
                    This booking is not eligible for cancellation.
                  </p>

                  <div className="hbd-modal-actions">
                    <button
                      className="hbd-modal-btn hbd-modal-btn-secondary"
                      onClick={() => setShowCancelModal(false)}
                    >
                      OK
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default FlightBookingDetails;
