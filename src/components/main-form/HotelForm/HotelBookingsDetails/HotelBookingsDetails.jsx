import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheck,
  FaHotel,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaBed,
  FaReceipt,
  FaInfoCircle,
} from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import HeaderInner from "../../../../reuseable-components/HeaderInner";
import Footer from "../../../../reuseable-components/Footer";
import {
  hotelBookingCancel,
  hotelBookingInfo,
  hotelPriceRefund,
} from "../../../../store/Services/AllApi";
import "./HotelBookingsDetails.css";
import SimpleLoader from "../../../../reuseable-components/SimpleLoader/SimpleLoader";
import { toast } from "react-toastify";

const HotelBookingDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refundDetails, setRefundDetails] = useState(null);
  const [showCancelFailedPopup, setShowCancelFailedPopup] = useState(false);
  const [cancelFailedMessage, setCancelFailedMessage] = useState("");
  // const [showNotCancellablePopup, setShowNotCancellablePopup] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await hotelBookingInfo({
          body: {
            bookingid: id,
          },
        });

        console.log("Hotel Booking Details Response:", res);

        if (res?.success && res?.data) {
          setBooking(res.data);
        } else {
          setError(res?.message || "Unable to fetch booking details.");
        }
      } catch (error) {
        console.error("Error fetching hotel booking details:", error);

        setError("Something went wrong while loading booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

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

  const formatPrice = (value) => {
    const amount = Number(value || 0);

    return `${booking?.currencysymbol || "$"}${amount.toFixed(2)}`;
  };

  const calculateNights = () => {
    if (!booking?.tripStartDate || !booking?.tripEndDate) {
      return 0;
    }

    const start = new Date(booking.tripStartDate);
    const end = new Date(booking.tripEndDate);

    const difference = end.getTime() - start.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const getGuestCount = () => {
    if (booking?.adults) {
      return booking.adults;
    }

    if (booking?.billingContact) {
      return 1;
    }

    return 0;
  };

  const handleRefund = async () => {
    if (!booking?.bookingId) return;
    setLoader(true);
    try {
      setCancelling(true);
      const res = await hotelPriceRefund({
        body: {
          orderid: booking.bookingId,
        },
      });
      console.log("Hotel Refund Response:", res);
      const refundEligibility = res?.data?.checkRefundEligibility;
      const cancellationDetails = refundEligibility?.cancellationDetails;
      if (refundEligibility?.success && cancellationDetails) {
        setRefundDetails(cancellationDetails);
        setShowRefundPopup(true);
      } else {
        console.error(
          "Refund eligibility check failed:",
          refundEligibility?.message || "Unable to check refund eligibility",
        );
      }
    } catch (error) {
      console.error("Error checking refund eligibility:", error);
    } finally {
      setCancelling(false);
      setLoader(false);
    }
  };

  const handleBookingCancel = async () => {
    if (!booking?.bookingId) return;

    setLoader(true);

    try {
      setCancelling(true);

      const res = await hotelBookingCancel({
        body: {
          bookingid: booking.bookingId,
        },
      });

      console.log("Booking Cancel Response:", res);

      if (res?.success === true) {
        setShowCancelPopup(false);
        setShowRefundPopup(false);
        setRefundDetails(null);
        toast.success("Booking cancelled successfully");
        sessionStorage.setItem("hotelBookingStatus", "Cancelled");
        navigate(`/hotel-booking-details?id=${booking.bookingId}`);
      } else {
        setShowCancelPopup(false);
        setShowRefundPopup(false);
        setRefundDetails(null);

        setCancelFailedMessage(
          res?.message || "Unable to cancel booking. Please try again.",
        );

        setShowCancelFailedPopup(true);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);

      setShowCancelPopup(false);
      setShowRefundPopup(false);
      setRefundDetails(null);

      setCancelFailedMessage(
        error?.message || "Unable to cancel booking. Please try again.",
      );

      setShowCancelFailedPopup(true);
    } finally {
      setCancelling(false);
      setLoader(false);
    }
  };

  const handleCancelClick = () => {
    if (cancellable) {
      handleRefund();
    } else {
      setShowCancelPopup(true);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  });

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

  const nights = calculateNights();

  const city = booking?.contact?.address?.city?.name || "";

  const state = booking?.contact?.address?.state?.name || "";

  const country = booking?.contact?.address?.country?.name || "";

  const fullLocation = [city, state, country].filter(Boolean).join(", ");

  const cancellable =
    JSON.parse(sessionStorage.getItem("hotelBookingCancellable")) === true;

  const bookingStatus =
    sessionStorage.getItem("hotelBookingStatus") || "Upcoming";

  const isCancelled = bookingStatus === "Cancelled";

  return (
    <>
      {loader && <SimpleLoader />}
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
                  Your order ID is <strong>{booking.bookingId}</strong>
                  {booking.creationDate && (
                    <>
                      {" "}
                      · Booked On{" "}
                      <strong>{formatDate(booking.creationDate)}</strong>
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
              {isCancelled ? "Cancelled" : booking.bookingStatus}
            </div>
          </div>

          {/* =========================
            MAIN CONTENT
        ========================== */}
          <div className="hbd-layout">
            {/* LEFT COLUMN */}
            <div className="hbd-left-column">
              {/* =========================
                HOTEL SUMMARY
            ========================== */}
              <section className="hbd-card hbd-hotel-card">
                <div className="hbd-section-accent"></div>

                <div className="hbd-hotel-info">
                  <div className="hbd-hotel-heading">
                    <div>
                      <h2>{booking.name}</h2>

                      {fullLocation && (
                        <p className="hbd-location">
                          <FaMapMarkerAlt />
                          {fullLocation}
                        </p>
                      )}
                    </div>

                    <div className="hbd-hotel-icon">
                      <FaHotel />
                    </div>
                  </div>

                  <div className="hbd-stay-summary">
                    {/* CHECK IN */}
                    <div className="hbd-date-block">
                      <span className="hbd-label">
                        <FaCalendarAlt />
                        Check In
                      </span>

                      <strong>{formatDate(booking.tripStartDate)}</strong>

                      <small>Check-in time as per hotel policy</small>
                    </div>

                    {/* NIGHTS */}
                    <div className="hbd-night-wrapper">
                      <div className="hbd-night-line"></div>

                      <span className="hbd-night-badge">
                        {nights} {nights === 1 ? "NIGHT" : "NIGHTS"} STAY
                      </span>

                      <div className="hbd-night-line"></div>
                    </div>

                    {/* CHECK OUT */}
                    <div className="hbd-date-block left-align">
                      <span className="hbd-label">
                        <FaCalendarAlt />
                        Check Out
                      </span>

                      <strong>{formatDate(booking.tripEndDate)}</strong>

                      <small>Check-out time as per hotel policy</small>
                    </div>
                  </div>
                </div>

                {/* HOTEL IMAGE */}
                <div className="hbd-hotel-image-wrapper">
                  {booking.heroImage ? (
                    <img
                      src={booking.heroImage}
                      alt={booking.name}
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
                    <h2>
                      {booking.rooms?.length ||
                        booking.occupancies?.length ||
                        1}{" "}
                      {(booking.rooms?.length ||
                        booking.occupancies?.length ||
                        1) === 1
                        ? "ROOM"
                        : "ROOMS"}
                    </h2>

                    <p>Room & stay information</p>
                  </div>
                </div>

                <div className="hbd-room-content">
                  <div className="hbd-room-main">
                    <div className="hbd-room-icon">
                      <FaBed />
                    </div>

                    <div className="hbd-room-information">
                      <h3>{booking.roomname || "Hotel Room"}</h3>

                      <p>
                        {booking.boardBasis?.displayText ||
                          booking.boardBasis?.description ||
                          booking.boardBasis?.type ||
                          "Room Only"}
                      </p>

                      <div className="hbd-room-meta">
                        <span>
                          <FaUser />
                          {getGuestCount()}{" "}
                          {getGuestCount() === 1 ? "Adult" : "Adults"}
                        </span>

                        <span>
                          <FaCalendarAlt />
                          {nights} {nights === 1 ? "Night" : "Nights"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hbd-board-basis">
                    <span>Board Basis</span>

                    <strong>
                      {booking.boardBasis?.displayText ||
                        booking.boardBasis?.description ||
                        booking.boardBasis?.type ||
                        "-"}
                    </strong>
                  </div>
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

                    <p>Guest information for this reservation</p>
                  </div>
                </div>

                <div className="hbd-traveler-count">
                  <FaUser />

                  <strong>
                    {getGuestCount()}{" "}
                    {getGuestCount() === 1 ? "Adult" : "Adults"}
                  </strong>
                </div>

                <div className="hbd-traveler-details">
                  <div className="hbd-traveler-avatar">
                    <FaUser />
                  </div>

                  <div className="hbd-traveler-info">
                    <h3>
                      {booking.billingContact?.firstName || ""}{" "}
                      {booking.billingContact?.lastName || ""}
                    </h3>

                    <p>{booking.billingContact?.type || "ADULT"}</p>

                    <div className="hbd-traveler-contact">
                      {booking.billingContact?.contact?.email && (
                        <span>{booking.billingContact.contact.email}</span>
                      )}

                      {booking.billingContact?.contact?.phone && (
                        <span>{booking.billingContact.contact.phone}</span>
                      )}
                    </div>
                  </div>

                  <span className="hbd-primary-label">Primary</span>
                </div>

                {booking.guestNames && (
                  <div className="hbd-guest-names">
                    <span>Guest Name(s)</span>

                    <strong>{booking.guestNames}</strong>
                  </div>
                )}
              </section>

              {/* =========================
                HOTEL CONTACT
            ========================== */}
              <section className="hbd-card hbd-contact-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Hotel Contact Details</h2>
                    <p>Hotel address and contact information</p>
                  </div>
                </div>

                <div className="hbd-contact-grid">
                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaMapMarkerAlt />
                    </div>

                    <div>
                      <span>Address</span>

                      <strong>{booking.contact?.address?.line1 || "-"}</strong>

                      <p>{fullLocation}</p>

                      {booking.contact?.address?.postalCode && (
                        <p>{booking.contact.address.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaPhone />
                    </div>

                    <div>
                      <span>Hotel Phone</span>

                      <strong>{booking.contact?.phone || "-"}</strong>
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================
                CANCELLATION POLICY
            ========================== */}
              {/* {cancellable && booking.cancellationPolicies?.length > 0 && (
                <section className="hbd-card hbd-cancellation-card">
                  <div className="hbd-section-title">
                    <div className="hbd-title-accent"></div>
                    <div>
                      <h2>Cancellation Policy</h2>
                      <p>Cancellation terms for this booking</p>
                    </div>
                  </div>

                  {booking.cancellationPolicies.map((policy, policyIndex) => (
                    <div className="hbd-policy-block" key={policyIndex}>
                      {policy.text && (
                        <p className="hbd-policy-text">{policy.text}</p>
                      )}

                      {policy.rules?.map((rule, ruleIndex) => (
                        <div className="hbd-policy-rule" key={ruleIndex}>
                          <div>
                            <span>Start</span>
                            <strong>{formatDateWithTime(rule.start)}</strong>
                          </div>

                          <div>
                            <span>End</span>
                            <strong>{formatDateWithTime(rule.end)}</strong>
                          </div>

                          <div>
                            <span>Cancellation Charge</span>
                            <strong>{formatPrice(rule.value)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              )} */}

              {cancellable && !isCancelled && (
                <button
                  type="button"
                  className="your-cancel-button-class"
                  onClick={handleCancelClick}
                >
                  Cancel Booking
                </button>
              )}
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
                    {booking.rooms?.length || booking.occupancies?.length || 1}{" "}
                    Room × {nights} {nights === 1 ? "Night" : "Nights"}
                  </span>

                  <strong>{formatPrice(booking.roomCost)}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Room Cost</span>

                  <strong>{formatPrice(booking.roomCost)}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Taxes</span>

                  <strong>{formatPrice(booking.taxes)}</strong>
                </div>

                {booking.additional_charges && (
                  <div className="hbd-price-row">
                    <span>Additional Charges</span>

                    <strong>{formatPrice(booking.additional_charges)}</strong>
                  </div>
                )}

                <div className="hbd-price-divider"></div>

                <div className="hbd-total-row">
                  <span>Total Amount</span>

                  <strong>{formatPrice(booking.payable)}</strong>
                </div>
              </section>
            </aside>
          </div>
        </main>

        {showCancelPopup && (
          <div className="hbd-cancel-overlay">
            <div className="hbd-cancel-popup">
              <div className="hbd-cancel-popup-icon">
                <FaInfoCircle />
              </div>

              <h2>Cancel Booking?</h2>

              <p>Are you sure you want to cancel this booking?</p>

              <div className="hbd-cancel-popup-actions">
                <button
                  type="button"
                  className="hbd-cancel-popup-no"
                  onClick={() => setShowCancelPopup(false)}
                  disabled={cancelling}
                >
                  No
                </button>

                <button
                  type="button"
                  className="hbd-cancel-popup-yes"
                  onClick={handleBookingCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showRefundPopup && refundDetails && (
          <div className="hbd-cancel-overlay">
            <div className="hbd-cancel-popup">
              <div className="hbd-cancel-popup-icon">
                <FaInfoCircle />
              </div>

              <h2>Cancellation Charges</h2>

              <p>
                If you cancel this booking, a cancellation charge of{" "}
                <strong>
                  {formatPrice(refundDetails.cancellationCharges)}
                </strong>{" "}
                will be applicable.
              </p>

              <div className="hbd-refund-details">
                <div className="hbd-refund-row">
                  <span>Total Paid Amount</span>
                  <strong>{formatPrice(refundDetails.totalPaidAmount)}</strong>
                </div>

                <div className="hbd-refund-row">
                  <span>Cancellation Charges</span>
                  <strong>
                    {formatPrice(refundDetails.cancellationCharges)}
                  </strong>
                </div>

                <div className="hbd-refund-row hbd-refund-total">
                  <span>Total Refund</span>
                  <strong>{formatPrice(refundDetails.totalRefund)}</strong>
                </div>
              </div>

              <p className="hbd-refund-warning">
                Are you sure you want to proceed with cancellation?
              </p>

              <div className="hbd-cancel-popup-actions">
                <button
                  type="button"
                  className="hbd-cancel-popup-no"
                  onClick={() => {
                    setShowRefundPopup(false);
                    setRefundDetails(null);
                  }}
                  disabled={cancelling}
                >
                  Go Back
                </button>

                <button
                  type="button"
                  className="hbd-cancel-popup-yes"
                  onClick={handleBookingCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "OK, Continue"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* {showNotCancellablePopup && (
          <div className="hbd-cancel-overlay">
            <div className="hbd-cancel-popup">
              <div className="hbd-cancel-popup-icon">
                <FaInfoCircle />
              </div>

              <h2>Booking Not Cancellable</h2>

              <p>
                This hotel booking is not cancellable and cannot be cancelled.
              </p>

              <div className="hbd-cancel-popup-actions">
                <button
                  type="button"
                  className="hbd-cancel-popup-yes"
                  onClick={() => setShowNotCancellablePopup(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )} */}

        {showCancelFailedPopup && (
          <div className="hbd-cancel-overlay">
            <div className="hbd-cancel-popup">
              <div className="hbd-cancel-popup-icon">
                <FaInfoCircle />
              </div>

              <h2>Cancellation Failed</h2>

              <p>
                You can try again or connect with us on
                contact@cresttravelclub.com If you are facing any issue.
              </p>

              <div className="hbd-cancel-popup-actions">
                <button
                  type="button"
                  className="hbd-cancel-popup-yes"
                  onClick={() => {
                    setShowCancelFailedPopup(false);
                    setCancelFailedMessage("");
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default HotelBookingDetails;
