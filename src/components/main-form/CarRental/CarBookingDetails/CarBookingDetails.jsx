import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaCheck,
  FaCar,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaReceipt,
  FaInfoCircle,
  FaSuitcase,
  FaDoorOpen,
  FaSnowflake,
  FaCog,
} from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import HeaderInner from "../../../../reuseable-components/HeaderInner";
import Footer from "../../../../reuseable-components/Footer";
import SimpleLoader from "../../../../reuseable-components/SimpleLoader/SimpleLoader";
import {
  carOrdersCancel,
  carOrdersInfo,
} from "../../../../store/Services/AllApi";
import "./CarBookingDetails.css";

const CarBookingDetails = () => {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderid");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelErrorPopup, setCancelErrorPopup] = useState(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState("");
  const [openImportantInfo, setOpenImportantInfo] = useState(false);
  const [openBookingConditions, setOpenBookingConditions] = useState(false);
  const [openCarPolicy, setOpenCarPolicy] = useState(false);

  useEffect(() => {
    const fetchCarBookingInfo = async () => {
      if (!orderId) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log("Calling carOrdersInfo with orderId:", orderId);

        const response = await carOrdersInfo({
          body: {
            bookingId: orderId,
          },
        });

        console.log("Car Booking Details Response:", response);

        const result =
          response?.data?.lookup?.result ||
          response?.orders?.[0]?.booking_data?.revalidate ||
          response?.result;

        if (result) {
          setBooking(result);
        } else {
          setError(
            response?.data?.lookup?.message ||
              response?.message ||
              "Unable to fetch car booking details.",
          );
        }
      } catch (error) {
        console.error("Error fetching car booking details:", error);
        setError("Something went wrong while loading booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarBookingInfo();
  }, [orderId]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
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

    return `${booking?.price?.currencysymbol || "$"}${amount.toFixed(2)}`;
  };

  const getRentalHours = () => {
    if (!booking?.pickup?.time_text || !booking?.dropoff?.time_text) {
      return 0;
    }

    const pickup = new Date(booking.pickup.time_text);
    const dropoff = new Date(booking.dropoff.time_text);

    if (isNaN(pickup.getTime()) || isNaN(dropoff.getTime())) {
      return 0;
    }

    return Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60));
  };

  const handleCarCancel = async () => {
    try {
      setLoading(true);

      const response = await carOrdersCancel({
        body: {
          bookingid: orderId,
        },
      });

      console.log("Cancel Booking Response:", response);

      const cancelBooking = response?.data?.cancelbooking;

      if (cancelBooking?.success === false) {
        setCancelErrorMessage(
          cancelBooking?.message ||
            "This booking cannot be cancelled or refunded.",
        );
        setCancelErrorPopup(true);
        return;
      }

      if (cancelBooking?.success === true) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error cancelling car booking:", error);

      setCancelErrorMessage(
        "Something went wrong while cancelling your booking.",
      );
      setCancelErrorPopup(true);
    } finally {
      setLoading(false);
    }
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

  const car = booking?.car || {};
  const partner = booking?.partner || {};
  const pickup = booking?.pickup || {};
  const dropoff = booking?.dropoff || {};
  const driver = booking?.driver || {};
  const customer = booking?.customer || {};
  const price =
    booking?.booking_data?.data?.revalidate?.result?.price ||
    booking?.price ||
    {};

  const isCancelled =
    booking?.booking_Status === "CANCELLED" || booking?.status === "CANCELLED";

  const rentalHours = getRentalHours();

  return (
    <>
      <div className="hbd-page">
        <HeaderInner />

        <main className="hbd-main container">
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
                  Your booking ID is{" "}
                  <strong>{booking.confirmationNumber || id}</strong>
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
                : booking.booking_Status || "CONFIRMED"}
            </div>
          </div>

          <div className="hbd-layout">
            <div className="hbd-left-column">
              <section className="hbd-card hbd-hotel-card">
                <div className="hbd-section-accent"></div>

                <div className="hbd-hotel-info">
                  <div className="hbd-hotel-heading">
                    <div>
                      <h2>{car.name || "Car Rental"}</h2>

                      <p className="hbd-location">
                        <FaMapMarkerAlt />
                        {partner.name || "Car Rental Partner"}
                      </p>

                      {car.description && (
                        <p className="hbd-location">
                          <FaCar />
                          {car.description}
                        </p>
                      )}
                    </div>

                    <div className="hbd-hotel-icon">
                      <FaCar />
                    </div>
                  </div>

                  <div className="hbd-stay-summary">
                    <div className="hbd-date-block">
                      <span className="hbd-label">
                        <FaCalendarAlt />
                        Pick Up
                      </span>

                      <strong>{formatDate(pickup.date)}</strong>

                      <small>{pickup.time_text || pickup.time || "-"}</small>
                    </div>

                    <div className="hbd-night-wrapper">
                      <div className="hbd-night-line"></div>

                      <span className="hbd-night-badge">
                        {rentalHours > 0
                          ? `${rentalHours} HOURS`
                          : "CAR RENTAL"}
                      </span>

                      <div className="hbd-night-line"></div>
                    </div>

                    <div className="hbd-date-block left-align">
                      <span className="hbd-label">
                        <FaCalendarAlt />
                        Drop Off
                      </span>

                      <strong>{formatDate(dropoff.date)}</strong>

                      <small>{dropoff.time_text || dropoff.time || "-"}</small>
                    </div>
                  </div>
                </div>

                <div className="hbd-hotel-image-wrapper">
                  {car.heroImage ? (
                    <img
                      src={car.heroImage}
                      alt={car.name || "Rental car"}
                      className="hbd-hotel-image"
                    />
                  ) : (
                    <div className="hbd-no-image">
                      <FaCar />
                    </div>
                  )}
                </div>
              </section>

              <section className="hbd-card hbd-room-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Car Details</h2>
                    <p>Vehicle information for this reservation</p>
                  </div>
                </div>

                <div className="hbd-room-content">
                  <div className="hbd-room-main">
                    <div className="hbd-room-icon">
                      <FaCar />
                    </div>

                    <div className="hbd-room-information">
                      <h3>{car.name || "-"}</h3>

                      <p>{car.description || "-"}</p>

                      <div className="hbd-room-meta">
                        <span>
                          <FaUser />
                          {car.passengers || 0} Passengers
                        </span>

                        <span>
                          <FaSuitcase />
                          {car.bags || 0} Bags
                        </span>

                        <span>
                          <FaDoorOpen />
                          {car.doors || 0} Doors
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hbd-board-basis">
                    <span>Features</span>

                    <strong>{car.hasAMT ? "Automatic" : "Manual"}</strong>

                    <strong>{car.hasAC ? "AC" : "No AC"}</strong>

                    <strong>
                      {car.mileage ? `${car.mileage} mileage` : "-"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="hbd-card hbd-contact-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Pick Up & Drop Off Details</h2>
                    <p>Rental location information</p>
                  </div>
                </div>

                <div className="hbd-contact-grid">
                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaMapMarkerAlt />
                    </div>

                    <div>
                      <span>Pick Up Location</span>

                      <strong>{pickup.name || "-"}</strong>

                      <p>{pickup.address || "-"}</p>

                      <p>
                        {[pickup.city, pickup.state, pickup.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      <p>{pickup.time_text || pickup.time || "-"}</p>
                    </div>
                  </div>

                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaMapMarkerAlt />
                    </div>

                    <div>
                      <span>Drop Off Location</span>

                      <strong>{dropoff.name || "-"}</strong>

                      <p>{dropoff.address || "-"}</p>

                      <p>
                        {[dropoff.city, dropoff.state, dropoff.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      <p>{dropoff.time_text || dropoff.time || "-"}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="hbd-card hbd-traveler-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Driver Details</h2>
                    <p>Driver information for this reservation</p>
                  </div>
                </div>

                <div className="hbd-traveler-count">
                  <FaUser />

                  <strong>Primary Driver</strong>
                </div>

                <div className="hbd-traveler-details">
                  <div className="hbd-traveler-avatar">
                    <FaUser />
                  </div>

                  <div className="hbd-traveler-info">
                    <h3>
                      {driver.title || ""}{" "}
                      {driver.firstName || customer.firstname || ""}{" "}
                      {driver.lastName || customer.lastname || ""}
                    </h3>

                    <p>{driver.title || customer.title || "DRIVER"}</p>

                    <div className="hbd-traveler-contact">
                      {customer.email && <span>{customer.email}</span>}

                      {customer.phone && <span>{customer.phone}</span>}
                    </div>
                  </div>

                  <span className="hbd-primary-label">Primary</span>
                </div>
              </section>

              <section className="hbd-card hbd-contact-card">
                <div className="hbd-section-title">
                  <div className="hbd-title-accent"></div>

                  <div>
                    <h2>Rental Company Details</h2>
                    <p>Car rental partner contact information</p>
                  </div>
                </div>

                <div className="hbd-contact-grid">
                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaCar />
                    </div>

                    <div>
                      <span>Rental Company</span>

                      <strong>{partner.name || "-"}</strong>

                      <p>{partner.code || "-"}</p>
                    </div>
                  </div>

                  <div className="hbd-contact-item">
                    <div className="hbd-contact-icon">
                      <FaPhone />
                    </div>

                    <div>
                      <span>Phone</span>

                      <strong>{partner.phone || "-"}</strong>
                    </div>
                  </div>
                </div>
              </section>

              {booking?.booking_data?.data?.revalidate?.result
                ?.important_information?.length > 0 && (
                <section className="hbd-card hbd-accordion-card">
                  <button
                    type="button"
                    className="hbd-accordion-header"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenImportantInfo((prev) => !prev);
                    }}
                  >
                    <div className="hbd-section-title">
                      <div className="hbd-title-accent"></div>

                      <div>
                        <h2>Important Information</h2>
                        <p>Important information for your car rental</p>
                      </div>
                    </div>

                    <span
                      className={`hbd-accordion-arrow ${openImportantInfo ? "open" : ""}`}
                    >
                      ▼
                    </span>
                  </button>

                  {openImportantInfo && (
                    <div className="hbd-accordion-content">
                      {booking.booking_data.data.revalidate.result.important_information.map(
                        (item, index) => (
                          <div className="hbd-policy-block" key={index}>
                            <p className="hbd-policy-text">{item.text}</p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </section>
              )}

              {booking?.booking_data?.data?.revalidate?.result
                ?.booking_conditions?.length > 0 && (
                <section className="hbd-card hbd-accordion-card">
                  <button
                    type="button"
                    className="hbd-accordion-header"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenBookingConditions((prev) => !prev);
                    }}
                  >
                    <div className="hbd-section-title">
                      <div className="hbd-title-accent"></div>

                      <div>
                        <h2>Booking Conditions</h2>
                        <p>Conditions for this car reservation</p>
                      </div>
                    </div>

                    <span
                      className={`hbd-accordion-arrow ${
                        openBookingConditions ? "open" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {openBookingConditions && (
                    <div className="hbd-accordion-content">
                      {booking.booking_data.data.revalidate.result.booking_conditions.map(
                        (item, index) => (
                          <div className="hbd-policy-block" key={index}>
                            <p className="hbd-policy-text">{item.text}</p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </section>
              )}

              {booking?.booking_data?.data?.revalidate?.result?.car_policy_data
                ?.length > 0 && (
                <section className="hbd-card hbd-accordion-card">
                  <button
                    type="button"
                    className="hbd-accordion-header"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenCarPolicy((prev) => !prev);
                    }}
                  >
                    <div className="hbd-section-title">
                      <div className="hbd-title-accent"></div>

                      <div>
                        <h2>Car Rental Policy</h2>
                        <p>Pickup and rental policy information</p>
                      </div>
                    </div>

                    <span
                      className={`hbd-accordion-arrow ${openCarPolicy ? "open" : ""}`}
                    >
                      ▼
                    </span>
                  </button>

                  {openCarPolicy && (
                    <div className="hbd-accordion-content">
                      {booking.booking_data.data.revalidate.result.car_policy_data.map(
                        (item, index) => (
                          <div className="hbd-policy-block" key={index}>
                            <h3>{item.title}</h3>

                            <p
                              className="hbd-policy-text"
                              dangerouslySetInnerHTML={{
                                __html: item.description || "",
                              }}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </section>
              )}
              <button
                onClick={handleCarCancel}
                className="your-cancel-button-class"
              >
                Cancel Booking
              </button>
            </div>

            <aside className="hbd-right-column">
              <section className="hbd-card hbd-price-card">
                <div className="hbd-price-title">
                  <FaReceipt />

                  <h2>Price Details</h2>
                </div>

                <div className="hbd-price-description">
                  <span>Car Rental</span>

                  <strong>{formatPrice(price.total)}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Base Price</span>

                  <strong>{formatPrice(price.base)}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Taxes & Fees</span>

                  <strong>{formatPrice(price.taxes)}</strong>
                </div>

                {price?.taxes_and_fees?.length > 0 &&
                  price.taxes_and_fees.map((fee, index) => (
                    <div className="hbd-price-row" key={index}>
                      <span>{fee.title}</span>

                      <strong>{formatPrice(fee.price)}</strong>
                    </div>
                  ))}

                <div className="hbd-price-divider"></div>

                <div className="hbd-total-row">
                  <span>Total Amount</span>

                  <strong>{formatPrice(price.total)}</strong>
                </div>
              </section>

              <section className="hbd-card hbd-price-card">
                <div className="hbd-price-title">
                  <FaReceipt />

                  <h2>Booking Information</h2>
                </div>

                <div className="hbd-price-row">
                  <span>Confirmation Number</span>

                  <strong>{booking.confirmationNumber || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Booking Status</span>

                  <strong>{booking.booking_Status || "-"}</strong>
                </div>

                <div className="hbd-price-row">
                  <span>Provider</span>

                  <strong>
                    {booking?.booking_data?.data?.revalidate?.result
                      ?.providerId || "-"}
                  </strong>
                </div>

                <div className="hbd-price-row">
                  <span>Cancellation</span>

                  <strong>
                    {booking.is_cancellation_allowed
                      ? "Allowed"
                      : "Not Allowed"}
                  </strong>
                </div>
              </section>
            </aside>
          </div>
        </main>

        <Footer />
      </div>

      {loading && <SimpleLoader />}

      {cancelErrorPopup && (
        <div className="car-cancel-error-overlay">
          <div className="car-cancel-error-popup">
            <button
              className="car-cancel-error-close"
              onClick={() => setCancelErrorPopup(false)}
            >
              ×
            </button>

            <div className="car-cancel-error-icon">
              <FaCircleXmark />
            </div>

            <h2>Cancellation Not Available</h2>

            <p className="car-cancel-error-message">{cancelErrorMessage}</p>

            <p className="car-cancel-error-contact">
              Please contact us for further assistance.
            </p>

            <div className="car-cancel-error-contact-details">
              <a href="mailto:contact@cresttravelclub.com">
                contact@cresttravelclub.com
              </a>

              <a href="tel:+18883779065">+1 (888) 377-9065</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarBookingDetails;
