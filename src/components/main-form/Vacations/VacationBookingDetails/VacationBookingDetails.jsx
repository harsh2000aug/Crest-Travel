import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaCheck,
  FaHotel,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaReceipt,
  FaInfoCircle,
  FaUser,
  FaBed,
  FaBath,
  FaUtensils,
  FaCreditCard,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import HeaderInner from "../../../../reuseable-components/HeaderInner";
import Footer from "../../../../reuseable-components/Footer";
import { vacationUpcomingDetails } from "../../../../store/Services/AllApi";
import "./VacationBookingDetails.css";

const monthIndexes = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const parseTicketDate = (value) => {
  if (!value) {
    return null;
  }

  const match = String(value).match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);

  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, day, monthName, year] = match;
  const month = monthIndexes[monthName];

  return month === undefined
    ? null
    : new Date(Number(year), month, Number(day));
};

const formatDate = (value) => {
  const date = parseTicketDate(value);

  if (!date) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateWithTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const VacationBookingDetails = () => {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let ignoreResponse = false;

    const fetchData = async () => {
      if (!itemId) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await vacationUpcomingDetails({
          body: {
            orderId: itemId,
          },
        });

        const result = res?.data?.getbookinginfo?.result;

        if (ignoreResponse) {
          return;
        }

        if (!result) {
          throw new Error("Booking details were not returned.");
        }

        setBooking(result);
      } catch (err) {
        if (!ignoreResponse) {
          console.error("Vacation Booking Details Error:", err);
          setError("Something went wrong while loading booking details.");
        }
      } finally {
        if (!ignoreResponse) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignoreResponse = true;
    };
  }, [itemId]);

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

  const bookingData = booking.bookingData || {};
  const property = bookingData.property || {};
  const billing = bookingData.billing || {};
  const unit = bookingData.unit || {};
  const price = bookingData.price || {};

  const propertyAddress = [
    property.address1,
    property.address2,
    property.city,
    property.state,
    property.country,
    property.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const billingAddress = [
    billing.address1,
    billing.address2,
    billing.city,
    billing.state,
    billing.country,
    billing.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const formatPrice = (value) => {
    const amount = Number(value || 0);
    return `${price?.currencySymbol || "$"}${amount.toFixed(2)}`;
  };

  const bookingStatus = booking?.orderStatus || "Confirmed";

  const isCancelled = bookingStatus?.toLowerCase() === "cancelled";

  return (
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
                  ? "Your Reservation Has Been Cancelled"
                  : "Your Reservation Is Confirmed"}
              </h1>

              <p>
                Your confirmation number is{" "}
                <strong>{booking?.confirmationNumber || "-"}</strong>
                {booking?.orderDate && (
                  <>
                    {" "}
                    · Booked On <strong>{formatDate(booking.orderDate)}</strong>
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
            {bookingStatus}
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
                RESORT SUMMARY
            ========================== */}

            <section className="hbd-card hbd-hotel-card">
              <div className="hbd-section-accent"></div>

              <div className="hbd-hotel-info">
                <div className="hbd-hotel-heading">
                  <div>
                    <h2>{property?.name || "-"}</h2>

                    <p className="hbd-location">
                      <FaMapMarkerAlt />
                      {propertyAddress || "-"}
                    </p>
                  </div>

                  <div className="hbd-hotel-icon">
                    <FaHotel />
                  </div>
                </div>

                <div className="hbd-stay-summary">
                  <div className="hbd-date-block">
                    <span className="hbd-label">
                      <FaCalendarAlt />
                      Check-in
                    </span>

                    <strong>{formatDate(unit?.checkInDate)}</strong>

                    <small>{bookingData?.checkInTime || "-"}</small>
                  </div>

                  <div className="hbd-night-wrapper">
                    <div className="hbd-night-line"></div>

                    <span className="hbd-night-badge">
                      {unit?.numberOfNights || 0}{" "}
                      {unit?.numberOfNights === 1 ? "NIGHT" : "NIGHTS"}
                    </span>

                    <div className="hbd-night-line"></div>
                  </div>

                  <div className="hbd-date-block left-align">
                    <span className="hbd-label">
                      <FaCalendarAlt />
                      Check-out
                    </span>

                    <strong>{formatDate(unit?.checkOutDate)}</strong>

                    <small>{bookingData?.checkOutTime || "-"}</small>
                  </div>
                </div>
              </div>

              <div className="hbd-hotel-image-wrapper">
                {property?.image ? (
                  <img
                    src={property.image}
                    alt={property?.name || "Resort"}
                    className="hbd-hotel-image"
                  />
                ) : (
                  <div className="hbd-no-image">
                    <FaHotel />
                  </div>
                )}
              </div>
            </section>

            {/* =========================
                ROOM DETAILS
            ========================== */}

            <section className="hbd-card hbd-room-card">
              <div className="hbd-section-title">
                <div className="hbd-title-accent"></div>

                <div>
                  <h2>Room Details</h2>

                  <p>Accommodation for your stay</p>
                </div>
              </div>

              <div className="hbd-room-content">
                <div className="hbd-room-main">
                  <div className="hbd-room-icon">
                    <FaBed />
                  </div>

                  <div className="hbd-room-information">
                    <h3>{unit?.description || "-"}</h3>

                    <p>Max Occupancy: {unit?.maxCapacity || "-"}</p>

                    <div className="hbd-room-meta">
                      <span>
                        <FaBed />
                        {unit?.numberOfBedrooms ?? 0} Bedroom
                        {unit?.numberOfBedrooms === 1 ? "" : "s"}
                      </span>

                      <span>
                        <FaBath />
                        {unit?.numberOfBathrooms ?? 0} Bathroom
                        {unit?.numberOfBathrooms === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hbd-board-basis">
                  <span>Kitchen</span>

                  <strong>{unit?.kitchenType || "Not available"}</strong>
                </div>
              </div>
            </section>

            {/* =========================
                RESORT CONTACT
            ========================== */}

            <section className="hbd-card hbd-contact-card">
              <div className="hbd-section-title">
                <div className="hbd-title-accent"></div>

                <div>
                  <h2>Resort Information</h2>

                  <p>How to reach the property</p>
                </div>
              </div>

              <div className="hbd-contact-grid">
                <div className="hbd-contact-item">
                  <div className="hbd-contact-icon">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <span>Address</span>

                    <strong>{property?.city || "-"}</strong>

                    <p>{propertyAddress || "-"}</p>
                  </div>
                </div>

                <div className="hbd-contact-item">
                  <div className="hbd-contact-icon">
                    <FaPhoneAlt />
                  </div>

                  <div>
                    <span>Phone</span>

                    <strong>{property?.phone || "Not provided"}</strong>
                  </div>
                </div>

                <div className="hbd-contact-item">
                  <div className="hbd-contact-icon">
                    <FaEnvelope />
                  </div>

                  <div>
                    <span>Email</span>

                    <strong>{property?.email || "Not provided"}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================
                GUEST DETAILS
            ========================== */}

            <section className="hbd-card hbd-traveler-card">
              <div className="hbd-section-title">
                <div className="hbd-title-accent"></div>

                <div>
                  <h2>Guest Details</h2>

                  <p>Billing information for this reservation</p>
                </div>
              </div>

              <div className="hbd-traveler-count">
                <FaUser />

                <strong>{unit?.maxCapacity || 1} Guests</strong>
              </div>

              <div className="hbd-traveler-details">
                <div className="hbd-traveler-avatar">
                  <FaUser />
                </div>

                <div className="hbd-traveler-info">
                  <h3>
                    {billing?.title ? `${billing.title} ` : ""}
                    {billing?.name || "-"}
                  </h3>

                  <p>{billingAddress || "-"}</p>

                  <div className="hbd-traveler-contact">
                    <span>{billing?.email || "-"}</span>

                    <span>{billing?.phone || "-"}</span>
                  </div>
                </div>

                <span className="hbd-primary-label">{bookingStatus}</span>
              </div>

              <div className="hbd-guest-names">
                <span>Payment Mode</span>

                <strong>
                  {bookingData?.paymentMode === "CARD"
                    ? "Card"
                    : bookingData?.paymentMode || "-"}
                </strong>
              </div>

              <div className="hbd-guest-names">
                <span>Booking Mode</span>

                <strong>{bookingData?.mode || "-"}</strong>
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
                  {unit?.numberOfNights || 0}{" "}
                  {unit?.numberOfNights === 1 ? "Night" : "Nights"}
                </span>

                <strong>{formatPrice(price?.ourPrice)}</strong>
              </div>

              {Number(price?.saving) > 0 && (
                <div className="hbd-price-row">
                  <span>Savings</span>

                  <strong>{formatPrice(price?.saving)}</strong>
                </div>
              )}

              {Number(price?.bookingFee) > 0 && (
                <div className="hbd-price-row">
                  <span>Booking Fee</span>

                  <strong>{formatPrice(price?.bookingFee)}</strong>
                </div>
              )}

              <div className="hbd-price-divider"></div>

              <div className="hbd-total-row">
                <span>Total Paid</span>

                <strong>
                  {formatPrice(price?.payable ?? price?.ourPrice)}
                </strong>
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
                <span>Confirmation Number</span>

                <strong>{booking?.confirmationNumber || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Payment Mode</span>

                <strong>
                  {bookingData?.paymentMode === "CARD"
                    ? "Card"
                    : bookingData?.paymentMode || "-"}
                </strong>
              </div>

              <div className="hbd-price-row">
                <span>Currency</span>

                <strong>{price?.currency || "-"}</strong>
              </div>

              <div className="hbd-price-divider"></div>

              <div className="hbd-price-row">
                <span>Booking Created</span>

                <strong>{formatDateWithTime(booking?.orderDate)}</strong>
              </div>
            </section>

            {/* =========================
                STAY DETAILS
            ========================== */}

            <section className="hbd-card hbd-price-card">
              <div className="hbd-price-title">
                <FaCreditCard />

                <h2>Stay Details</h2>
              </div>

              <div className="hbd-price-row">
                <span>Check-in</span>

                <strong>{bookingData?.checkInTime || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Check-out</span>

                <strong>{bookingData?.checkOutTime || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Room Type</span>

                <strong>{unit?.description || "-"}</strong>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VacationBookingDetails;
