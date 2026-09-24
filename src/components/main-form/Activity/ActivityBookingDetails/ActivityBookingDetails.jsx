import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaCheck,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaReceipt,
  FaInfoCircle,
  FaClock,
  FaTicketAlt,
  FaRoute,
} from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import HeaderInner from "../../../../reuseable-components/HeaderInner";
import Footer from "../../../../reuseable-components/Footer";
import {
  activityCancel,
  activityInfo,
  activityRefund,
} from "../../../../store/Services/AllApi";
import "./ActivityBookingDetails.css";

const ActivityBookingDetails = () => {
  const [searchParams] = useSearchParams();
  const orderid = searchParams.get("orderid");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundDetails, setRefundDetails] = useState(null);
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [selectedCancellationReason, setSelectedCancellationReason] =
    useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!orderid) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await activityInfo({
          body: {
            orderId: orderid,
          },
        });

        console.log("Activity Booking Details Response:", response);

        const bookingData = response?.data?.bookingInfo?.result;

        if (response?.data?.bookingInfo?.success && bookingData) {
          setBooking(bookingData);
        } else {
          setError(
            response?.data?.bookingInfo?.message ||
              "Unable to fetch booking details.",
          );
        }
      } catch (error) {
        console.error("Error fetching activity booking details:", error);
        setError("Something went wrong while loading booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [orderid]);

  const handleRefundCheck = async () => {
    try {
      setRefundLoading(true);
      setRefundError("");

      const response = await activityRefund({
        body: {
          bookingRef: booking.bookingRef,
        },
      });

      console.log("Refund Check Response:", response);

      const cancelData = response?.data?.canceldetails;

      if (!cancelData?.success) {
        setRefundError(
          cancelData?.message || "Unable to check cancellation eligibility.",
        );
        return;
      }

      const result = cancelData?.result;

      if (result?.status === "CANCELLABLE") {
        setRefundDetails(result);
        setShowRefundPopup(true);
      } else {
        setRefundError("This booking is not cancellable at this time.");
      }
    } catch (error) {
      console.error("Refund check error:", error);
      setRefundError(
        "Something went wrong while checking cancellation eligibility.",
      );
    } finally {
      setRefundLoading(false);
    }
  };

  const handleCancellationConfirm = async () => {
    if (!selectedCancellationReason) {
      setRefundError("Please select a cancellation reason.");
      return;
    }

    try {
      setCancellationLoading(true);
      setRefundError("");

      const response = await activityCancel({
        body: {
          bookingRef: booking.bookingRef,
          reasonCode: selectedCancellationReason,
        },
      });

      console.log("Activity Cancellation Response:", response);

      const cancelResponse =
        response?.data?.activityCancel || response?.data?.cancel || response;

      if (cancelResponse?.success === true) {
        setShowRefundPopup(false);
        setRefundDetails(null);
        setSelectedCancellationReason("");

        setIsCancelled(true);

        setBooking((previousBooking) => ({
          ...previousBooking,
          orderStatus: "CANCELLED",
        }));
      } else {
        setRefundError(
          cancelResponse?.message ||
            "Unable to cancel booking. Please try again.",
        );
      }
    } catch (error) {
      console.error("Activity cancellation error:", error);

      setRefundError(
        error?.message || "Unable to cancel booking. Please try again.",
      );
    } finally {
      setCancellationLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (value) => {
    const amount = Number(value || 0);

    return `${booking?.currencySymbol || "$"}${amount.toFixed(2)}`;
  };

  const getTravelerCount = () => {
    if (!booking?.travelers?.length) {
      return 0;
    }

    return booking.travelers.reduce(
      (total, traveler) => total + Number(traveler?.numberOfTravelers || 0),
      0,
    );
  };

  const getTravelerText = () => {
    const count = getTravelerCount();

    return `${count} ${count === 1 ? "Traveler" : "Travelers"}`;
  };

  const getTravelerBreakdown = () => {
    if (!booking?.travelers?.length) {
      return "-";
    }

    return booking.travelers
      .map((traveler) => {
        const count = Number(traveler?.numberOfTravelers || 0);

        const ageBand = traveler?.ageBand
          ? traveler.ageBand.charAt(0) + traveler.ageBand.slice(1).toLowerCase()
          : "Traveler";

        return `${count} ${ageBand}${count === 1 ? "" : "s"}`;
      })
      .join(", ");
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

  const isConfirmed = booking.orderStatus === "CONFIRMED";

  const fullLocation = [booking.city, booking.state, booking.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="hbd-page">
      <HeaderInner />

      <main className="hbd-main container">
        {/* BOOKING CONFIRMATION */}

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
                  ? "Your Activity Booking Has Been Cancelled"
                  : isConfirmed
                    ? "Your Activity Booking Is Confirmed"
                    : "Your Activity Booking"}
              </h1>

              <p>
                Your order ID is <strong>{booking.orderId}</strong>
                {booking.orderDate && (
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
            {isCancelled ? "Cancelled" : booking.orderStatus || "-"}
          </div>
        </div>

        {/* MAIN CONTENT */}

        <div className="hbd-layout">
          {/* LEFT COLUMN */}

          <div className="hbd-left-column">
            {/* ACTIVITY SUMMARY */}

            <section className="hbd-card hbd-hotel-card">
              <div className="hbd-section-accent"></div>

              <div className="hbd-hotel-info">
                <div className="hbd-hotel-heading">
                  <div>
                    <h2>{booking.title || "Activity Booking"}</h2>

                    {fullLocation && (
                      <p className="hbd-location">
                        <FaMapMarkerAlt />
                        {fullLocation}
                      </p>
                    )}
                  </div>

                  <div className="hbd-hotel-icon">
                    <FaRoute />
                  </div>
                </div>

                <div className="hbd-stay-summary">
                  {/* ACTIVITY DATE */}

                  <div className="hbd-date-block">
                    <span className="hbd-label">
                      <FaCalendarAlt />
                      Activity Date
                    </span>

                    <strong>{formatDate(booking.startDate)}</strong>

                    {booking.startTime && (
                      <small>Start Time: {booking.startTime}</small>
                    )}
                  </div>

                  {/* TRAVELERS */}

                  <div className="hbd-night-wrapper">
                    <div className="hbd-night-line"></div>

                    <span className="hbd-night-badge">
                      {getTravelerCount()}{" "}
                      {getTravelerCount() === 1 ? "TRAVELER" : "TRAVELERS"}
                    </span>

                    <div className="hbd-night-line"></div>
                  </div>

                  {/* END DATE */}

                  <div className="hbd-date-block left-align">
                    <span className="hbd-label">
                      <FaCalendarAlt />
                      End Date
                    </span>

                    <strong>{formatDate(booking.endDate)}</strong>

                    <small>
                      {booking.duration
                        ? `Duration: ${booking.duration}`
                        : "Activity schedule"}
                    </small>
                  </div>
                </div>
              </div>

              {/* ACTIVITY IMAGE */}

              <div className="hbd-hotel-image-wrapper">
                {booking.image ? (
                  <img
                    src={booking.image}
                    alt={booking.title || "Activity"}
                    className="hbd-hotel-image"
                  />
                ) : (
                  <div className="hbd-no-image">
                    <FaRoute />
                  </div>
                )}
              </div>
            </section>

            {/* ACTIVITY DETAILS */}

            <section className="hbd-card hbd-room-card">
              <div className="hbd-section-title">
                <div className="hbd-title-accent"></div>

                <div>
                  <h2>Activity Details</h2>
                  <p>Information about your booked activity</p>
                </div>
              </div>

              <div className="hbd-room-content">
                <div className="hbd-room-main">
                  <div className="hbd-room-icon">
                    <FaRoute />
                  </div>

                  <div className="hbd-room-information">
                    <h3>{booking.title || "-"}</h3>

                    <p>
                      {booking.description ||
                        "Activity details are not available."}
                    </p>

                    <div className="hbd-room-meta">
                      <span>
                        <FaUser />
                        {getTravelerText()}
                      </span>

                      <span>
                        <FaCalendarAlt />
                        {formatDate(booking.startDate)}
                      </span>

                      {booking.startTime && (
                        <span>
                          <FaClock />
                          {booking.startTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hbd-board-basis">
                  <span>Activity Code</span>

                  <strong>{booking.activityCode || "-"}</strong>
                </div>
              </div>
            </section>

            {/* TRAVELER DETAILS */}

            <section className="hbd-card hbd-traveler-card">
              <div className="hbd-section-title">
                <div className="hbd-title-accent"></div>

                <div>
                  <h2>Traveler Details</h2>
                  <p>Guest information for this reservation</p>
                </div>
              </div>

              <div className="hbd-traveler-count">
                <FaUser />

                <strong>{getTravelerText()}</strong>
              </div>

              <div className="hbd-traveler-details">
                <div className="hbd-traveler-avatar">
                  <FaUser />
                </div>

                <div className="hbd-traveler-info">
                  <h3>{booking.billingName || "-"}</h3>

                  <p>{getTravelerBreakdown()}</p>

                  <div className="hbd-traveler-contact">
                    {booking.billingEmail && (
                      <span>{booking.billingEmail}</span>
                    )}

                    {booking.billingPhone && (
                      <span>{booking.billingPhone}</span>
                    )}
                  </div>
                </div>

                <span className="hbd-primary-label">Primary</span>
              </div>
            </section>

            {/* BILLING / CONTACT DETAILS */}

            <section className="hbd-card hbd-contact-card">
              <div className="hbd-section-title">
                <div className="hbd-title-accent"></div>

                <div>
                  <h2>Billing Details</h2>
                  <p>Contact information for this reservation</p>
                </div>
              </div>

              <div className="hbd-contact-grid">
                <div className="hbd-contact-item">
                  <div className="hbd-contact-icon">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <span>Address</span>

                    <strong>{booking.billingAddress1 || "-"}</strong>

                    <p>
                      {[
                        booking.billingCity,
                        booking.billingState,
                        booking.billingCountry,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    {booking.billingPostalCode && (
                      <p>{booking.billingPostalCode}</p>
                    )}
                  </div>
                </div>

                <div className="hbd-contact-item">
                  <div className="hbd-contact-icon">
                    <FaPhone />
                  </div>

                  <div>
                    <span>Phone</span>

                    <strong>{booking.billingPhone || "-"}</strong>

                    {booking.billingEmail && <p>{booking.billingEmail}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* CANCELLATION POLICY */}

            <section className="hbd-card hbd-cancellation-card">
              <div className="hbd-section-title">
                <div className="hbd-title-accent"></div>

                <div>
                  <h2>Cancellation Policy</h2>
                  <p>Cancellation terms for this booking</p>
                </div>
              </div>

              <div className="hbd-policy-block">
                <p className="hbd-policy-text">
                  {booking.cancellationPolicy ||
                    "Cancellation policy is not available."}
                </p>
              </div>
            </section>

            {/* VOUCHER */}

            {booking.voucherUrl && (
              <section className="hbd-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Booking Voucher</h2>
                    <p>Your activity voucher is available here</p>
                  </div>
                </div>

                <a
                  href={booking.voucherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cancef-flight-btn"
                >
                  <FaTicketAlt /> View Ticket
                </a>
              </section>
            )}

            <button
              type="button"
              className={`your-cancel-button-class ${
                isCancelled ? "activity-booking-cancelled-button" : ""
              }`}
              onClick={isCancelled ? undefined : handleRefundCheck}
              disabled={isCancelled || refundLoading || cancellationLoading}
            >
              {isCancelled
                ? "Booking Cancelled"
                : refundLoading
                  ? "Checking..."
                  : cancellationLoading
                    ? "Cancelling..."
                    : "Cancel Booking"}
            </button>

            {refundLoading && (
              <div className="activity-refund-checking">
                <div className="activity-refund-checking-spinner"></div>
                <span>Checking cancellation eligibility...</span>
              </div>
            )}

            {refundError && (
              <div className="activity-refund-error">{refundError}</div>
            )}
          </div>

          {/* RIGHT COLUMN */}

          <aside className="hbd-right-column">
            {/* PRICE DETAILS */}

            <section className="hbd-card hbd-price-card">
              <div className="hbd-price-title">
                <FaReceipt />

                <h2>Price Details</h2>
              </div>

              <div className="hbd-price-description">
                <span>{getTravelerText()}</span>

                <strong>{formatPrice(booking.ourPrice)}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Public Price</span>

                <strong>{formatPrice(booking.publicPrice)}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Our Price</span>

                <strong>{formatPrice(booking.ourPrice)}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Payment Status</span>

                <strong>{booking.paymentStatus || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Payment Mode</span>

                <strong>{booking.paymentMode || "-"}</strong>
              </div>

              <div className="hbd-price-divider"></div>

              <div className="hbd-total-row">
                <span>Total Amount</span>

                <strong>{formatPrice(booking.payable)}</strong>
              </div>
            </section>

            {/* BOOKING INFORMATION */}

            <section className="hbd-card hbd-price-card">
              <div className="hbd-price-title">
                <FaReceipt />

                <h2>Booking Information</h2>
              </div>

              <div className="hbd-price-row">
                <span>Booking Ref</span>

                <strong>{booking.bookingRef || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Order Status</span>

                <strong>{booking.orderStatus || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Payment Status</span>

                <strong>{booking.paymentStatus || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Payment Gateway</span>

                <strong>{booking.paymentGateway || "-"}</strong>
              </div>

              <div className="hbd-price-row">
                <span>Invoice Type</span>

                <strong>{booking.invoiceType || "-"}</strong>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {showRefundPopup && refundDetails && (
        <div
          className="activity-refund-popup-overlay"
          onClick={() => setShowRefundPopup(false)}
        >
          <div
            className="activity-refund-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="activity-refund-popup-header">
              <div>
                <h2>Cancel Booking</h2>
                <p>Review your cancellation and refund details</p>
              </div>

              <button
                type="button"
                className="activity-refund-popup-close"
                onClick={() => setShowRefundPopup(false)}
              >
                ×
              </button>
            </div>

            <div className="activity-refund-status">
              <span className="activity-refund-status-dot"></span>
              <span>
                Booking is <strong>{refundDetails.status}</strong>
              </span>
            </div>

            <div className="activity-refund-booking">
              <span>Booking Reference</span>
              <strong>{refundDetails.bookingId || "-"}</strong>
            </div>

            <div className="activity-refund-amount-card">
              <div className="activity-refund-amount-row">
                <span>Original Amount</span>
                <strong>
                  {refundDetails.refundDetails?.currencyCode || "$"}{" "}
                  {Number(refundDetails.refundDetails?.itemPrice || 0).toFixed(
                    2,
                  )}
                </strong>
              </div>

              <div className="activity-refund-amount-row">
                <span>Refund Percentage</span>
                <strong>
                  {refundDetails.refundDetails?.refundPercentage || 0}%
                </strong>
              </div>

              <div className="activity-refund-divider"></div>

              <div className="activity-refund-total-row">
                <span>Refund Amount</span>
                <strong>
                  {refundDetails.refundDetails?.currencyCode || "$"}{" "}
                  {Number(
                    refundDetails.refundDetails?.refundAmount || 0,
                  ).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="activity-refund-reasons">
              <h3>Cancellation Reason</h3>

              <p className="activity-refund-reasons-description">
                Please select a reason for cancelling this booking.
              </p>

              <select
                className="activity-refund-reason-select"
                value={selectedCancellationReason}
                onChange={(e) => setSelectedCancellationReason(e.target.value)}
              >
                <option value="" disabled>
                  Select cancellation reason
                </option>

                {refundDetails.reasons?.map((reason) => (
                  <option
                    key={reason.cancellationReasonCode}
                    value={reason.cancellationReasonCode}
                  >
                    {reason.cancellationReasonText}
                  </option>
                ))}
              </select>
            </div>

            <div className="activity-refund-popup-actions">
              <button
                type="button"
                className="activity-refund-cancel-btn"
                onClick={() => setShowRefundPopup(false)}
              >
                Keep Booking
              </button>

              <button
                type="button"
                className="activity-refund-confirm-btn"
                onClick={handleCancellationConfirm}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ActivityBookingDetails;
