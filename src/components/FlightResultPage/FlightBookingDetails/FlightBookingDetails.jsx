import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  FaCheck,
  FaPlane,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaMapMarkerAlt,
  FaPhone,
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

import { upcomingFlightDetails } from "../../../store/Services/AllApi";

import "./FlightBookingDetails.css";

const FlightBookingDetails = () => {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

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

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateWithTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("en-GB", {
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

  const getFlights = () => {
    return booking?.booking_data?.flighticket || [];
  };

  // Flattened list of every flight leg, in order, from booking_data.flighticket
  const getAllTicketFlights = () => {
    return getFlights().flatMap((ticket) => ticket?.flights || []);
  };

  // Outbound/return used to be decided purely by array index
  // (flighticket[0] = outbound, flighticket[1] = return). That breaks if a
  // response ever comes back with a different grouping. Each leg already
  // carries a `legIndicator` (0 = outbound, 1 = return), so use that when
  // it's present and only fall back to index-based grouping if it's missing.
  const getOutboundFlights = () => {
    const allFlights = getAllTicketFlights();
    const hasLegIndicator = allFlights.some(
      (flight) => typeof flight?.legIndicator === "number",
    );

    if (hasLegIndicator) {
      return allFlights.filter((flight) => flight?.legIndicator === 0);
    }

    return getFlights()?.[0]?.flights || [];
  };

  const getReturnFlights = () => {
    const allFlights = getAllTicketFlights();
    const hasLegIndicator = allFlights.some(
      (flight) => typeof flight?.legIndicator === "number",
    );

    if (hasLegIndicator) {
      return allFlights.filter((flight) => flight?.legIndicator === 1);
    }

    return getFlights()?.[1]?.flights || [];
  };

  const getAllFlights = () => {
    return getAllTicketFlights();
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

  // The raw per-segment reservation data from the itinerary — this is the
  // schema-guaranteed source for baggage allowance per flight leg.
  const getReservationItems = () => {
    return (
      getItinerary()?.Itineraries?.[0]?.ItineraryInfo?.ReservationItems || []
    );
  };

  // booking_data.flighticket[].flights[].checkInBaggage / cabinBaggage is a
  // custom field that isn't always populated by the backend, which is why
  // baggage sometimes showed blank. Build a reliable flightNumber -> baggage
  // lookup from ReservationItems (per-leg "Baggage" field) and the fare
  // breakdown's BaggageInfo / CabinBaggageInfo arrays (same order as the
  // reservation items), and only fall back to the flighticket fields last.
  const getBaggageByFlightNumber = () => {
    const reservationItems = getReservationItems();
    const fareBreakdown = getFareBreakdown();
    const baggageInfoList = fareBreakdown?.BaggageInfo || [];
    const cabinBaggageInfoList = fareBreakdown?.CabinBaggageInfo || [];

    const map = {};

    reservationItems.forEach((item, index) => {
      map[item?.FlightNumber] = {
        checkedBaggage: item?.Baggage || baggageInfoList?.[index] || null,
        cabinBaggage: cabinBaggageInfoList?.[index] || null,
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
    return booking?.guests?.length || booking?.travellers?.length || 0;
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

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

  const allFlights = getAllFlights();

  const firstFlight = allFlights?.[0];
  const lastFlight = allFlights?.[allFlights.length - 1];

  const totalStopsOutbound =
    outboundFlights.length > 0 ? outboundFlights.length - 1 : 0;

  const totalStopsReturn =
    returnFlights.length > 0 ? returnFlights.length - 1 : 0;

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
      : passenger?.PassengerType || "Adult";

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
              {isCancelled ? "Cancelled" : ticketStatus}
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
                        {itinerary?.Origin || firstFlight?.departure || "-"} →{" "}
                        {itinerary?.Destination || lastFlight?.arrival || "-"}
                      </h2>

                      <p className="hbd-location">
                        <FaMapMarkerAlt />

                        {itinerary?.TripType || booking?.booking_data?.trip}
                        {" · "}
                        {booking?.booking_data?.trip === "RoundTrip"
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
                        {booking?.booking_data?.trip ||
                          itinerary?.TripType ||
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
                    <FaPlane />
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
                          {outboundFlights?.[0]?.departure} →{" "}
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

                            {formatDuration(
                              outboundFlights.reduce(
                                (total, flight) =>
                                  total + Number(flight?.triptime || 0),
                                0,
                              ),
                            )}
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
                      key={`outbound-${index}`}
                    >
                      <div className="hbd-traveler-avatar">
                        <FaPlane />
                      </div>

                      <div className="hbd-traveler-info">
                        <h3>
                          {flight?.departure} → {flight?.arrival}
                        </h3>

                        <p>
                          {flight?.airline} · {flight?.flightCode}
                          {flight?.flightNumber}
                        </p>

                        <div className="hbd-traveler-contact">
                          <span>
                            {formatTime(flight?.departureTime)} -{" "}
                            {formatTime(flight?.arrivalTime)}
                          </span>

                          <span>
                            {getAirportName(flight, "departure")} →{" "}
                            {getAirportName(flight, "arrival")}
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
                          {returnFlights?.[0]?.departure} →{" "}
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

                            {formatDuration(
                              returnFlights.reduce(
                                (total, flight) =>
                                  total + Number(flight?.triptime || 0),
                                0,
                              ),
                            )}
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
                      key={`return-${index}`}
                    >
                      <div className="hbd-traveler-avatar">
                        <FaPlane />
                      </div>

                      <div className="hbd-traveler-info">
                        <h3>
                          {flight?.departure} → {flight?.arrival}
                        </h3>

                        <p>
                          {flight?.airline} · {flight?.flightCode}
                          {flight?.flightNumber}
                        </p>

                        <div className="hbd-traveler-contact">
                          <span>
                            {formatTime(flight?.departureTime)} -{" "}
                            {formatTime(flight?.arrivalTime)}
                          </span>

                          <span>
                            {getAirportName(flight, "departure")} →{" "}
                            {getAirportName(flight, "arrival")}
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
                        key={`baggage-${index}`}
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
                          itinerary?.PassengerInfos?.[0]?.ETickets?.[0]
                            ?.ETicketNumber ||
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

                      <strong>{booking?.payment_mode || "-"}</strong>

                      <p>Gateway: {booking?.payment_gateway || "-"}</p>
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

                      <strong>{itinerary?.FareType || "-"}</strong>

                      <p>Provider: {itinerary?.Provider || "-"}</p>
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

                  <strong>{formatPrice(booking?.payable)}</strong>
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

                  <strong>{itinerary?.Provider || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Payment Mode</span>

                  <strong>{booking?.payment_mode || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Currency</span>

                  <strong>{booking?.currency || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>PNR</span>

                  <strong>{firstFlight?.pnrNumber || "-"}</strong>
                </div>

                <div className="hbd-price-divider"></div>

                <div className="hbd-price-row">
                  <span>Booking Created</span>

                  <strong>
                    {formatDateWithTime(booking?.BookingCreatedOn)}
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
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FlightBookingDetails;
