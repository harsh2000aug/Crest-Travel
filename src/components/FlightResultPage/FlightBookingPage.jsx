import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";

import "./FlightBookingPage.css";

import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import {
  flightOrder,
  flightPayment,
  flightPrices,
} from "../../store/Services/AllApi";
import Loader from "../../reuseable-components/Loader/Loader";

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (value, currency = "USD") => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `${currency} 0.00`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getPassengerTypeLabel = (type) => {
  if (type === "adult") return "Adult";
  if (type === "child") return "Child";
  if (type === "infant") return "Infant";

  return "Passenger";
};

const getPassengerAgeText = (type) => {
  if (type === "adult") return "12+ years";
  if (type === "child") return "2–11 years";
  if (type === "infant") return "Under 2 years";

  return "";
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getDateYearsAgo = (years) => {
  const date = getToday();

  date.setFullYear(date.getFullYear() - years);

  return date;
};

const validatePassengerDOB = (value, passengerType) => {
  if (!value) {
    return "Date of birth is required";
  }

  const dob = new Date(`${value}T00:00:00`);

  if (Number.isNaN(dob.getTime())) {
    return "Enter a valid date of birth";
  }

  const today = getToday();

  if (dob > today) {
    return "Date of birth cannot be in the future";
  }

  /* INFANT - UNDER 2 YEARS */

  if (passengerType === "infant") {
    const twoYearsAgo = getDateYearsAgo(2);

    if (dob <= twoYearsAgo) {
      return "Infant must be under 2 years old";
    }

    return true;
  }

  /* CHILD - 2 TO 11 YEARS */

  if (passengerType === "child") {
    const twoYearsAgo = getDateYearsAgo(2);

    const twelveYearsAgo = getDateYearsAgo(12);

    if (dob > twoYearsAgo) {
      return "Child must be at least 2 years old";
    }

    if (dob <= twelveYearsAgo) {
      return "Child must be under 12 years old";
    }

    return true;
  }

  /* ADULT - 12 YEARS OR OLDER */

  if (passengerType === "adult") {
    const twelveYearsAgo = getDateYearsAgo(12);

    if (dob > twelveYearsAgo) {
      return "Adult must be 12 years or older";
    }

    return true;
  }

  return true;
};

/* =========================================================
   PHONE VALIDATION
========================================================= */

const validatePhoneNumber = (value) => {
  if (!value) {
    return "Phone number is required";
  }

  if (!/^\d{10}$/.test(value)) {
    return "Phone number must contain exactly 10 digits";
  }

  return true;
};

/* =========================================================
   CARD NUMBER VALIDATION
========================================================= */

const validateCardNumber = (value) => {
  if (!value) {
    return "Card number is required";
  }

  const number = value.replace(/\s/g, "");

  if (!/^\d+$/.test(number)) {
    return "Card number must contain only digits";
  }

  if (number.length !== 16) {
    return "Card number must contain exactly 16 digits";
  }

  return true;
};

/* =========================================================
   CARD EXPIRY VALIDATION
========================================================= */

const validateCardExpiry = (value) => {
  if (!value) {
    return "Expiry date is required";
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
    return "Expiry must be in MM/YY format";
  }

  const [monthString, yearString] = value.split("/");

  const month = Number(monthString);

  const year = 2000 + Number(yearString);

  const now = new Date();

  const currentMonth = now.getMonth() + 1;

  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Card has expired";
  }

  return true;
};

/* =========================================================
   CVV VALIDATION
========================================================= */

const validateCVV = (value) => {
  if (!value) {
    return "CVV is required";
  }

  if (!/^\d{3,4}$/.test(value)) {
    return "CVV must contain 3 or 4 digits";
  }

  return true;
};

/* =========================================================
   CREATE PASSENGERS
========================================================= */

const createPassengerList = (searchData) => {
  const adults = Math.max(0, Number(searchData?.adults || 0));

  const children = Math.max(0, Number(searchData?.children || 0));

  const infants = Math.max(0, Number(searchData?.infants || 0));

  const passengers = [];

  for (let i = 0; i < adults; i++) {
    passengers.push({
      id: `adult-${i + 1}`,
      type: "adult",
      number: i + 1,
    });
  }

  for (let i = 0; i < children; i++) {
    passengers.push({
      id: `child-${i + 1}`,
      type: "child",
      number: i + 1,
    });
  }

  for (let i = 0; i < infants; i++) {
    passengers.push({
      id: `infant-${i + 1}`,
      type: "infant",
      number: i + 1,
    });
  }

  return passengers;
};

const createEmptyPassenger = (passenger) => ({
  id: passenger.id,

  type: passenger.type,

  title: "",

  firstName: "",

  middleName: "",

  lastName: "",

  gender: "",

  dateOfBirth: "",

  nationality: "",

  /* OPTIONAL */

  documentType: "",

  documentNumber: "",

  documentExpiry: "",
});

/* =========================================================
   PASSENGER FORM
========================================================= */

function PassengerForm({ passenger, index, register, errors }) {
  const typeLabel = getPassengerTypeLabel(passenger.type);

  const ageText = getPassengerAgeText(passenger.type);

  const passengerErrors = errors?.passengers?.[index] || {};

  return (
    <section className="fb-passenger-card">
      <div className="fb-passenger-header">
        <div className="fb-passenger-header-left">
          <div className="fb-passenger-number">{index + 1}</div>

          <div>
            <div className="fb-passenger-title">{typeLabel}</div>

            <div className="fb-passenger-subtitle">{ageText}</div>
          </div>
        </div>

        <div className="fb-passenger-badge">{typeLabel}</div>
      </div>

      <div className="fb-passenger-body">
        <div className="fb-form-section-title">
          <span className="fb-section-icon">👤</span>
          Passenger Information
        </div>

        <div className="fb-form-grid fb-form-grid-four">
          {/* TITLE */}

          <div className="fb-field">
            <label>
              Title <span>*</span>
            </label>

            <select
              {...register(`passengers.${index}.title`, {
                required: "Title is required",
              })}
            >
              <option value="">Select</option>

              <option value="Mr">Mr</option>

              <option value="Mrs">Mrs</option>

              <option value="Ms">Ms</option>

              <option value="Miss">Miss</option>

              <option value="Master">Master</option>
            </select>

            {passengerErrors.title && (
              <small className="fb-error">
                {passengerErrors.title.message}
              </small>
            )}
          </div>

          {/* FIRST NAME */}

          <div className="fb-field fb-field-wide">
            <label>
              First Name <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Enter first name"
              {...register(`passengers.${index}.firstName`, {
                required: "First name is required",

                validate: (value) =>
                  value.trim() !== "" || "First name is required",
              })}
            />

            {passengerErrors.firstName && (
              <small className="fb-error">
                {passengerErrors.firstName.message}
              </small>
            )}
          </div>

          {/* MIDDLE NAME - OPTIONAL */}

          <div className="fb-field">
            <label>Middle Name</label>

            <input
              type="text"
              placeholder="Enter middle name"
              {...register(`passengers.${index}.middleName`)}
            />
          </div>

          {/* LAST NAME */}

          <div className="fb-field">
            <label>
              Last Name <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Enter last name"
              {...register(`passengers.${index}.lastName`, {
                required: "Last name is required",

                validate: (value) =>
                  value.trim() !== "" || "Last name is required",
              })}
            />

            {passengerErrors.lastName && (
              <small className="fb-error">
                {passengerErrors.lastName.message}
              </small>
            )}
          </div>
        </div>

        {/* PERSONAL DETAILS */}

        <div className="fb-form-grid fb-form-grid-four fb-details-grid">
          {/* GENDER */}

          <div className="fb-field">
            <label>
              Gender <span>*</span>
            </label>

            <select
              {...register(`passengers.${index}.gender`, {
                required: "Gender is required",
              })}
            >
              <option value="">Select</option>

              <option value="Male">Male</option>

              <option value="Female">Female</option>

              <option value="Other">Other</option>
            </select>

            {passengerErrors.gender && (
              <small className="fb-error">
                {passengerErrors.gender.message}
              </small>
            )}
          </div>

          {/* DATE OF BIRTH */}

          <div className="fb-field">
            <label>
              Date of Birth <span>*</span>
            </label>

            <input
              type="date"
              {...register(`passengers.${index}.dateOfBirth`, {
                required: "Date of birth is required",

                validate: (value) =>
                  validatePassengerDOB(value, passenger.type),
              })}
            />

            {passengerErrors.dateOfBirth && (
              <small className="fb-error">
                {passengerErrors.dateOfBirth.message}
              </small>
            )}
          </div>

          {/* NATIONALITY */}

          <div className="fb-field">
            <label>
              Nationality <span>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Indian"
              {...register(`passengers.${index}.nationality`, {
                required: "Nationality is required",

                validate: (value) =>
                  value.trim() !== "" || "Nationality is required",
              })}
            />

            {passengerErrors.nationality && (
              <small className="fb-error">
                {passengerErrors.nationality.message}
              </small>
            )}
          </div>

          {/* DOCUMENT TYPE - OPTIONAL */}

          <div className="fb-field">
            <label>Document Type</label>

            <select {...register(`passengers.${index}.documentType`)}>
              <option value="">Select</option>

              <option value="Passport">Passport</option>

              <option value="National ID">National ID</option>
            </select>
          </div>
        </div>

        {/* TRAVEL DOCUMENT */}

        <div className="fb-form-section-title fb-document-title">
          <span className="fb-section-icon">🛂</span>
          Travel Document
        </div>

        <div className="fb-form-grid fb-form-grid-two">
          {/* PASSPORT NUMBER - OPTIONAL */}

          <div className="fb-field">
            <label>Passport Number</label>

            <input
              type="text"
              placeholder="Enter passport number"
              {...register(`passengers.${index}.documentNumber`)}
            />
          </div>

          {/* DOCUMENT EXPIRY - OPTIONAL */}

          <div className="fb-field">
            <label>Document Expiry</label>

            <input
              type="date"
              {...register(`passengers.${index}.documentExpiry`)}
            />
          </div>
        </div>

        <div className="fb-passenger-note">
          <span>🔒</span>
          Please make sure the passenger name matches the travel document
          exactly.
        </div>
      </div>
    </section>
  );
}
/* =========================================================
   FLIGHT SEGMENT
========================================================= */

function FlightSegment({ segment }) {
  if (!segment) {
    return null;
  }

  return (
    <div className="fb-segment">
      {/* DEPARTURE */}

      <div className="fb-segment-time">
        <strong>{formatTime(segment.departureTime)}</strong>

        <span>{segment.departure || ""}</span>

        <small>
          {segment.departureairport || segment.departurelocation || ""}
        </small>
      </div>

      {/* MIDDLE */}

      <div className="fb-segment-middle">
        <div className="fb-segment-duration">{segment.duration || ""}</div>

        <div className="fb-segment-line">
          <span className="fb-plane-dot">✈</span>
        </div>

        <div className="fb-segment-flight">
          {segment.flightCode || ""}

          {segment.flightNumber ? ` ${segment.flightNumber}` : ""}
        </div>
      </div>

      {/* ARRIVAL */}

      <div className="fb-segment-time fb-segment-arrival">
        <strong>{formatTime(segment.arrivalTime)}</strong>

        <span>{segment.arrival || ""}</span>

        <small>{segment.arrivalairport || segment.arrivallocation || ""}</small>
      </div>
    </div>
  );
}

/* =========================================================
   ITINERARY
========================================================= */

function ItineraryCard({ flight, searchData }) {
  const outboundSegments = Array.isArray(flight?.outboundSegments)
    ? flight.outboundSegments
    : [];

  const returnSegments = Array.isArray(flight?.returnSegments)
    ? flight.returnSegments
    : [];

  const isRoundTrip =
    searchData?.tripType === "round-trip" ||
    searchData?.tripType === "round" ||
    searchData?.tripType === "RoundTrip";
  console.log("lole", flight.airlineCode);
  return (
    <section className="fb-itinerary-card">
      {/* =================================================
          ITINERARY HEADER
      ================================================= */}

      <div className="fb-itinerary-header">
        <div className="fb-itinerary-airline">
          <div className="fb-airline-logo">
            {flight?.airlineCode?.slice(0, 2) || "✈"}
          </div>

          <div>
            <div className="fb-airline-name">
              {flight?.airlineName || flight?.airlineCode || "Airline"}
            </div>

            <div className="fb-flight-number">
              {flight?.flightNo || flight?.flightNumber || "Flight"}
            </div>
          </div>
        </div>

        <div className="fb-itinerary-badge">
          {flight?.cabinClass || searchData?.cabinClass || "Economy"}
        </div>
      </div>

      {/* =================================================
          OUTBOUND
      ================================================= */}

      <div className="fb-itinerary-leg">
        <div className="fb-leg-heading">
          <div>
            <span className="fb-leg-icon">↗</span>

            <div>
              <strong>
                {searchData?.originName || searchData?.origin || "Departure"}
              </strong>

              <span>
                {searchData?.departureDate
                  ? formatDate(searchData.departureDate)
                  : ""}
              </span>
            </div>
          </div>

          <div className="fb-leg-type">Outbound</div>
        </div>

        <div className="fb-segments-wrapper">
          {outboundSegments.length > 0 ? (
            outboundSegments.map((segment, index) => (
              <React.Fragment
                key={`outbound-${segment.flightCode || "flight"}-${
                  segment.flightNumber || index
                }-${index}`}
              >
                <FlightSegment segment={segment} />

                {/* LAYOVER */}

                {index < outboundSegments.length - 1 && (
                  <div className="fb-connection">
                    <span>Layover</span>

                    <div>
                      {segment.arrival || ""}

                      {" → "}

                      {outboundSegments[index + 1]?.departure || ""}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="fb-no-segment">Flight details unavailable</div>
          )}
        </div>

        <div className="fb-leg-footer">
          <span>
            Duration: <strong>{flight?.duration || "—"}</strong>
          </span>

          <span>
            Stops:{" "}
            <strong>
              {Number(flight?.stops || 0) === 0
                ? "Non-stop"
                : `${flight.stops} stop${Number(flight.stops) > 1 ? "s" : ""}`}
            </strong>
          </span>
        </div>
      </div>

      {/* =================================================
          RETURN
      ================================================= */}

      {isRoundTrip && returnSegments.length > 0 && (
        <div className="fb-itinerary-leg fb-return-leg">
          <div className="fb-leg-heading">
            <div>
              <span className="fb-leg-icon fb-return-icon">↙</span>

              <div>
                <strong>
                  {searchData?.destinationName ||
                    searchData?.destination ||
                    "Return"}
                </strong>

                <span>
                  {searchData?.returnDate
                    ? formatDate(searchData.returnDate)
                    : ""}
                </span>
              </div>
            </div>

            <div className="fb-leg-type">Return</div>
          </div>

          <div className="fb-segments-wrapper">
            {returnSegments.map((segment, index) => (
              <React.Fragment
                key={`return-${segment.flightCode || "flight"}-${
                  segment.flightNumber || index
                }-${index}`}
              >
                <FlightSegment segment={segment} />

                {/* LAYOVER */}

                {index < returnSegments.length - 1 && (
                  <div className="fb-connection">
                    <span>Layover</span>

                    <div>
                      {segment.arrival || ""}

                      {" → "}

                      {returnSegments[index + 1]?.departure || ""}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="fb-leg-footer">
            <span>
              Duration: <strong>{flight?.returnDuration || "—"}</strong>
            </span>

            <span>
              Stops:{" "}
              <strong>
                {returnSegments.length - 1 === 0
                  ? "Non-stop"
                  : `${returnSegments.length - 1} stop${
                      returnSegments.length - 1 > 1 ? "s" : ""
                    }`}
              </strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   PRICE SUMMARY
========================================================= */

function PriceSummary({ flight, searchData }) {
  const currency = flight?.currency || "USD";

  const adults = Number(searchData?.adults || 0);

  const children = Number(searchData?.children || 0);

  const infants = Number(searchData?.infants || 0);

  const totalPassengers = adults + children + infants;

  const pricePerPerson = Number(flight?.price || 0);

  const totalPrice = Number(flight?.totalPrice || 0);

  const taxes = Number(flight?.taxes || 0);

  const baseFare = Number(flight?.baseFare || 0);

  return (
    <aside className="fb-price-card">
      {/* HEADER */}

      <div className="fb-price-card-header">
        <div>
          <span>Booking Summary</span>

          <h3>Your Trip</h3>
        </div>

        <div className="fb-price-lock">🔒</div>
      </div>

      {/* ROUTE */}

      <div className="fb-price-route">
        <div>
          <strong>{searchData?.origin || "—"}</strong>

          <span>{searchData?.originName || "Departure"}</span>
        </div>

        <div className="fb-price-route-line"></div>

        <div className="fb-price-route-right">
          <strong>{searchData?.destination || "—"}</strong>

          <span>{searchData?.destinationName || "Arrival"}</span>
        </div>
      </div>

      <div className="fb-summary-divider" />

      {/* AIRLINE */}

      <div className="fb-summary-row">
        <span>Flight</span>

        <strong>{flight?.airlineName || flight?.airlineCode || "—"}</strong>
      </div>

      {/* CABIN */}

      <div className="fb-summary-row">
        <span>Cabin</span>

        <strong>
          {flight?.cabinClass || searchData?.cabinClass || "Economy"}
        </strong>
      </div>

      {/* PASSENGERS */}

      <div className="fb-summary-row">
        <span>Passengers</span>

        <strong>{totalPassengers}</strong>
      </div>

      <div className="fb-summary-divider" />

      {/* FARE */}

      <div className="fb-fare-heading">Fare Breakdown</div>

      <div className="fb-summary-row">
        <span>Base fare</span>

        <strong>{formatMoney(baseFare, currency)}</strong>
      </div>

      <div className="fb-summary-row">
        <span>Taxes & fees</span>

        <strong>{formatMoney(taxes, currency)}</strong>
      </div>

      <div className="fb-summary-divider" />

      {/* TOTAL */}

      <div className="fb-total-row">
        <div>
          <span>Total amount</span>

          <small>Inclusive of taxes & fees</small>
        </div>

        <strong>
          {formatMoney(
            totalPrice || pricePerPerson * totalPassengers,
            currency,
          )}
        </strong>
      </div>
    </aside>
  );
}
/* =========================================================
   CONTACT DETAILS
========================================================= */

function ContactDetails({ register, errors }) {
  return (
    <section className="fb-contact-card">
      <div className="fb-card-heading">
        <div className="fb-card-heading-icon">✉</div>

        <div>
          <h2>Contact Information</h2>

          <p>We'll send your booking confirmation and ticket here.</p>
        </div>
      </div>

      <div className="fb-form-grid fb-form-grid-two">
        {/* =================================================
            EMAIL
        ================================================= */}

        <div className="fb-field">
          <label>
            Email Address <span>*</span>
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            {...register("contact.email", {
              required: "Email address is required",

              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                message: "Enter a valid email address",
              },
            })}
          />

          {errors?.contact?.email && (
            <small className="fb-error">{errors.contact.email.message}</small>
          )}
        </div>

        {/* =================================================
            PHONE
        ================================================= */}

        <div className="fb-field">
          <label>
            Phone Number <span>*</span>
          </label>

          <div className="fb-phone-group">
            <select {...register("contact.countryCode")}>
              <option value="+91">+91</option>

              <option value="+1">+1</option>

              <option value="+44">+44</option>

              <option value="+61">+61</option>

              <option value="+971">+971</option>
            </select>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter phone number"
              {...register("contact.phone", {
                required: "Phone number is required",

                validate: validatePhoneNumber,

                onChange: (e) => {
                  e.target.value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                },
              })}
            />
          </div>

          {errors?.contact?.phone && (
            <small className="fb-error">{errors.contact.phone.message}</small>
          )}
        </div>
      </div>

      <div className="fb-contact-note">
        <span>ℹ</span>
        Please provide an active email address and phone number so we can
        contact you regarding your booking.
      </div>
    </section>
  );
}

/* =========================================================
   CARD DETAILS
========================================================= */

function CardDetails({ register, errors }) {
  return (
    <section className="fb-card-details-card">
      <div className="fb-card-heading">
        <div className="fb-card-heading-icon">💳</div>

        <div>
          <h2>Card Details</h2>

          <p>Enter your card details for payment.</p>
        </div>
      </div>

      {/* =================================================
          SECURITY MESSAGE
      ================================================= */}

      <div className="fb-card-security-note">
        <span>🔒</span>

        <div>
          <strong>Secure payment</strong>

          <p>Your payment information is securely processed.</p>
        </div>
      </div>

      <div className="fb-form-grid fb-form-grid-two">
        {/* =================================================
            CARD HOLDER
        ================================================= */}

        <div className="fb-field">
          <label>
            Card Holder Name <span>*</span>
          </label>

          <input
            type="text"
            placeholder="Name on card"
            {...register("card.cardHolderName", {
              required: "Card holder name is required",

              validate: (value) =>
                value.trim() !== "" || "Card holder name is required",
            })}
          />

          {errors?.card?.cardHolderName && (
            <small className="fb-error">
              {errors.card.cardHolderName.message}
            </small>
          )}
        </div>

        {/* =================================================
            CARD NUMBER
        ================================================= */}

        <div className="fb-field">
          <label>
            Card Number <span>*</span>
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={19}
            placeholder="XXXX XXXX XXXX XXXX"
            {...register("card.cardNumber", {
              required: "Card number is required",

              validate: validateCardNumber,

              onChange: (e) => {
                let value = e.target.value.replace(/\D/g, "");

                /*
                 * Keep maximum 16 digits.
                 */

                value = value.slice(0, 16);

                /*
                 * Format as:
                 * XXXX XXXX XXXX XXXX
                 */

                value = value.replace(/(.{4})/g, "$1 ").trim();

                e.target.value = value;
              },
            })}
          />

          {errors?.card?.cardNumber && (
            <small className="fb-error">{errors.card.cardNumber.message}</small>
          )}
        </div>

        {/* =================================================
            EXPIRY
        ================================================= */}

        <div className="fb-field">
          <label>
            Expiry Date <span>*</span>
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="MM/YY"
            {...register("card.expiry", {
              required: "Expiry date is required",

              validate: validateCardExpiry,

              onChange: (e) => {
                let value = e.target.value.replace(/\D/g, "");

                /*
                 * MMYY only.
                 */

                value = value.slice(0, 4);

                /*
                 * Add slash:
                 * MM/YY
                 */

                if (value.length >= 3) {
                  value = `${value.slice(0, 2)}/${value.slice(2)}`;
                }

                e.target.value = value;
              },
            })}
          />

          {errors?.card?.expiry && (
            <small className="fb-error">{errors.card.expiry.message}</small>
          )}
        </div>

        {/* =================================================
            CVV
        ================================================= */}

        <div className="fb-field">
          <label>
            CVV <span>*</span>
          </label>

          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="CVV"
            {...register("card.cvv", {
              required: "CVV is required",

              validate: validateCVV,

              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
              },
            })}
          />

          {errors?.card?.cvv && (
            <small className="fb-error">{errors.card.cvv.message}</small>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BILLING ADDRESS
========================================================= */

function BillingAddress({ register, errors }) {
  return (
    <section className="fb-card-details-card">
      <div className="fb-form-grid fb-form-grid-two">
        {/* =================================================
            ADDRESS LINE 1
        ================================================= */}

        <div className="fb-field">
          <label>
            Address Line 1 <span>*</span>
          </label>

          <input
            type="text"
            placeholder="Street address"
            {...register("billing.address1", {
              required: "Address is required",

              validate: (value) => value.trim() !== "" || "Address is required",
            })}
          />

          {errors?.billing?.address1 && (
            <small className="fb-error">
              {errors.billing.address1.message}
            </small>
          )}
        </div>

        {/* =================================================
            ADDRESS LINE 2 - OPTIONAL
        ================================================= */}

        <div className="fb-field">
          <label>Address Line 2</label>

          <input
            type="text"
            placeholder="Apartment, suite, unit, etc. (optional)"
            {...register("billing.address2")}
          />
        </div>

        {/* =================================================
            CITY
        ================================================= */}

        <div className="fb-field">
          <label>
            City <span>*</span>
          </label>

          <input
            type="text"
            placeholder="Enter city"
            {...register("billing.city", {
              required: "City is required",

              validate: (value) => value.trim() !== "" || "City is required",
            })}
          />

          {errors?.billing?.city && (
            <small className="fb-error">{errors.billing.city.message}</small>
          )}
        </div>

        {/* =================================================
            STATE
        ================================================= */}

        <div className="fb-field">
          <label>
            State / Province <span>*</span>
          </label>

          <input
            type="text"
            placeholder="Enter state or province"
            {...register("billing.state", {
              required: "State / Province is required",

              validate: (value) =>
                value.trim() !== "" || "State / Province is required",
            })}
          />

          {errors?.billing?.state && (
            <small className="fb-error">{errors.billing.state.message}</small>
          )}
        </div>

        {/* =================================================
            COUNTRY
        ================================================= */}

        <div className="fb-field">
          <label>
            Country <span>*</span>
          </label>

          <select
            {...register("billing.country", {
              required: "Country is required",
            })}
          >
            <option value="">Select country</option>

            <option value="AF">Afghanistan</option>
            <option value="AL">Albania</option>
            <option value="DZ">Algeria</option>
            <option value="AD">Andorra</option>
            <option value="AO">Angola</option>
            <option value="AG">Antigua and Barbuda</option>
            <option value="AR">Argentina</option>
            <option value="AM">Armenia</option>
            <option value="AU">Australia</option>
            <option value="AT">Austria</option>
            <option value="AZ">Azerbaijan</option>
            <option value="BS">Bahamas</option>
            <option value="BH">Bahrain</option>
            <option value="BD">Bangladesh</option>
            <option value="BB">Barbados</option>
            <option value="BY">Belarus</option>
            <option value="BE">Belgium</option>
            <option value="BZ">Belize</option>
            <option value="BJ">Benin</option>
            <option value="BT">Bhutan</option>
            <option value="BO">Bolivia</option>
            <option value="BA">Bosnia and Herzegovina</option>
            <option value="BW">Botswana</option>
            <option value="BR">Brazil</option>
            <option value="BN">Brunei</option>
            <option value="BG">Bulgaria</option>
            <option value="BF">Burkina Faso</option>
            <option value="BI">Burundi</option>
            <option value="KH">Cambodia</option>
            <option value="CM">Cameroon</option>
            <option value="CA">Canada</option>
            <option value="CV">Cape Verde</option>
            <option value="CF">Central African Republic</option>
            <option value="TD">Chad</option>
            <option value="CL">Chile</option>
            <option value="CN">China</option>
            <option value="CO">Colombia</option>
            <option value="KM">Comoros</option>
            <option value="CG">Congo</option>
            <option value="CD">Democratic Republic of the Congo</option>
            <option value="CR">Costa Rica</option>
            <option value="CI">Côte d'Ivoire</option>
            <option value="HR">Croatia</option>
            <option value="CU">Cuba</option>
            <option value="CY">Cyprus</option>
            <option value="CZ">Czech Republic</option>
            <option value="DK">Denmark</option>
            <option value="DJ">Djibouti</option>
            <option value="DM">Dominica</option>
            <option value="DO">Dominican Republic</option>
            <option value="EC">Ecuador</option>
            <option value="EG">Egypt</option>
            <option value="SV">El Salvador</option>
            <option value="GQ">Equatorial Guinea</option>
            <option value="ER">Eritrea</option>
            <option value="EE">Estonia</option>
            <option value="SZ">Eswatini</option>
            <option value="ET">Ethiopia</option>
            <option value="FJ">Fiji</option>
            <option value="FI">Finland</option>
            <option value="FR">France</option>
            <option value="GA">Gabon</option>
            <option value="GM">Gambia</option>
            <option value="GE">Georgia</option>
            <option value="DE">Germany</option>
            <option value="GH">Ghana</option>
            <option value="GR">Greece</option>
            <option value="GD">Grenada</option>
            <option value="GT">Guatemala</option>
            <option value="GN">Guinea</option>
            <option value="GW">Guinea-Bissau</option>
            <option value="GY">Guyana</option>
            <option value="HT">Haiti</option>
            <option value="HN">Honduras</option>
            <option value="HU">Hungary</option>
            <option value="IS">Iceland</option>
            <option value="IN">India</option>
            <option value="ID">Indonesia</option>
            <option value="IR">Iran</option>
            <option value="IQ">Iraq</option>
            <option value="IE">Ireland</option>
            <option value="IL">Israel</option>
            <option value="IT">Italy</option>
            <option value="JM">Jamaica</option>
            <option value="JP">Japan</option>
            <option value="JO">Jordan</option>
            <option value="KZ">Kazakhstan</option>
            <option value="KE">Kenya</option>
            <option value="KI">Kiribati</option>
            <option value="KP">North Korea</option>
            <option value="KR">South Korea</option>
            <option value="KW">Kuwait</option>
            <option value="KG">Kyrgyzstan</option>
            <option value="LA">Laos</option>
            <option value="LV">Latvia</option>
            <option value="LB">Lebanon</option>
            <option value="LS">Lesotho</option>
            <option value="LR">Liberia</option>
            <option value="LY">Libya</option>
            <option value="LI">Liechtenstein</option>
            <option value="LT">Lithuania</option>
            <option value="LU">Luxembourg</option>
            <option value="MG">Madagascar</option>
            <option value="MW">Malawi</option>
            <option value="MY">Malaysia</option>
            <option value="MV">Maldives</option>
            <option value="ML">Mali</option>
            <option value="MT">Malta</option>
            <option value="MH">Marshall Islands</option>
            <option value="MR">Mauritania</option>
            <option value="MU">Mauritius</option>
            <option value="MX">Mexico</option>
            <option value="FM">Micronesia</option>
            <option value="MD">Moldova</option>
            <option value="MC">Monaco</option>
            <option value="MN">Mongolia</option>
            <option value="ME">Montenegro</option>
            <option value="MA">Morocco</option>
            <option value="MZ">Mozambique</option>
            <option value="MM">Myanmar</option>
            <option value="NA">Namibia</option>
            <option value="NR">Nauru</option>
            <option value="NP">Nepal</option>
            <option value="NL">Netherlands</option>
            <option value="NZ">New Zealand</option>
            <option value="NI">Nicaragua</option>
            <option value="NE">Niger</option>
            <option value="NG">Nigeria</option>
            <option value="NO">Norway</option>
            <option value="OM">Oman</option>
            <option value="PK">Pakistan</option>
            <option value="PW">Palau</option>
            <option value="PA">Panama</option>
            <option value="PG">Papua New Guinea</option>
            <option value="PY">Paraguay</option>
            <option value="PE">Peru</option>
            <option value="PH">Philippines</option>
            <option value="PL">Poland</option>
            <option value="PT">Portugal</option>
            <option value="QA">Qatar</option>
            <option value="RO">Romania</option>
            <option value="RU">Russia</option>
            <option value="RW">Rwanda</option>
            <option value="KN">Saint Kitts and Nevis</option>
            <option value="LC">Saint Lucia</option>
            <option value="VC">Saint Vincent and the Grenadines</option>
            <option value="WS">Samoa</option>
            <option value="SM">San Marino</option>
            <option value="ST">São Tomé and Príncipe</option>
            <option value="SA">Saudi Arabia</option>
            <option value="SN">Senegal</option>
            <option value="RS">Serbia</option>
            <option value="SC">Seychelles</option>
            <option value="SL">Sierra Leone</option>
            <option value="SG">Singapore</option>
            <option value="SK">Slovakia</option>
            <option value="SI">Slovenia</option>
            <option value="SB">Solomon Islands</option>
            <option value="SO">Somalia</option>
            <option value="ZA">South Africa</option>
            <option value="SS">South Sudan</option>
            <option value="ES">Spain</option>
            <option value="LK">Sri Lanka</option>
            <option value="SD">Sudan</option>
            <option value="SR">Suriname</option>
            <option value="SE">Sweden</option>
            <option value="CH">Switzerland</option>
            <option value="SY">Syria</option>
            <option value="TW">Taiwan</option>
            <option value="TJ">Tajikistan</option>
            <option value="TZ">Tanzania</option>
            <option value="TH">Thailand</option>
            <option value="TL">Timor-Leste</option>
            <option value="TG">Togo</option>
            <option value="TO">Tonga</option>
            <option value="TT">Trinidad and Tobago</option>
            <option value="TN">Tunisia</option>
            <option value="TR">Turkey</option>
            <option value="TM">Turkmenistan</option>
            <option value="TV">Tuvalu</option>
            <option value="UG">Uganda</option>
            <option value="UA">Ukraine</option>
            <option value="AE">United Arab Emirates</option>
            <option value="GB">United Kingdom</option>
            <option value="US">United States</option>
            <option value="UY">Uruguay</option>
            <option value="UZ">Uzbekistan</option>
            <option value="VU">Vanuatu</option>
            <option value="VA">Vatican City</option>
            <option value="VE">Venezuela</option>
            <option value="VN">Vietnam</option>
            <option value="YE">Yemen</option>
            <option value="ZM">Zambia</option>
            <option value="ZW">Zimbabwe</option>
          </select>

          {errors?.billing?.country && (
            <small className="fb-error">{errors.billing.country.message}</small>
          )}
        </div>

        {/* =================================================
            POSTAL CODE
        ================================================= */}

        <div className="fb-field">
          <label>
            Postal / ZIP Code <span>*</span>
          </label>

          <input
            type="text"
            placeholder="Enter postal code"
            {...register("billing.postalcode", {
              required: "Postal / ZIP code is required",

              validate: (value) =>
                value.trim() !== "" || "Postal / ZIP code is required",
            })}
          />

          {errors?.billing?.postalcode && (
            <small className="fb-error">
              {errors.billing.postalcode.message}
            </small>
          )}
        </div>

        {/* =================================================
            BILLING PHONE
        ================================================= */}

        <div className="fb-field">
          <label>
            Billing Phone <span>*</span>
          </label>

          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter billing phone"
            {...register("billing.phone", {
              required: "Billing phone is required",

              validate: validatePhoneNumber,

              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
              },
            })}
          />

          {errors?.billing?.phone && (
            <small className="fb-error">{errors.billing.phone.message}</small>
          )}
        </div>

        {/* =================================================
            BILLING EMAIL
        ================================================= */}

        <div className="fb-field">
          <label>
            Billing Email <span>*</span>
          </label>

          <input
            type="email"
            placeholder="billing@example.com"
            {...register("billing.email", {
              required: "Billing email is required",

              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                message: "Enter a valid email address",
              },
            })}
          />

          {errors?.billing?.email && (
            <small className="fb-error">{errors.billing.email.message}</small>
          )}
        </div>
      </div>

      {/* =================================================
          BILLING NOTE
      ================================================= */}
    </section>
  );
}
/* =========================================================
   MAIN PAGE
========================================================= */

export default function FlightBookingPage() {
  const navigate = useNavigate();
  const [revalidateData, setRevalidateData] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      passengers: [],

      /* =================================================
         CONTACT
      ================================================= */

      contact: {
        email: "",

        countryCode: "+91",

        phone: "",
      },

      /* =================================================
         CARD
      ================================================= */

      card: {
        cardHolderName: "",

        cardNumber: "",

        expiry: "",

        cvv: "",
      },

      /* =================================================
         BILLING
      ================================================= */

      billing: {
        address1: "",

        address2: "",

        city: "",

        state: "",

        country: "",

        postalcode: "",

        phone: "",

        email: "",
      },
    },

    mode: "onSubmit",
  });

  /* =======================================================
     PASSENGER FIELD ARRAY
  ======================================================= */

  const { fields: passengers } = useFieldArray({
    control,

    name: "passengers",
  });

  /* =======================================================
     PRICE API
  ======================================================= */

  const getPriceTaxes = async (fareCode) => {
    setLoading(true);
    try {
      if (!fareCode) {
        return;
      }

      const res = await flightPrices({
        body: {
          sessionId: localStorage.getItem("sessionId"),

          fareSourceCode: fareCode,
        },
      });

      console.log("FLIGHT PRICE RESPONSE:", res);
      setRevalidateData(res.result);
    } catch (error) {
      console.log("error in getting tax", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem("flightBookingData");

      /* =================================================
         SESSION DATA NOT FOUND
      ================================================= */

      if (!savedData) {
        setBookingData(null);

        reset({
          passengers: [],

          contact: {
            email: "",

            countryCode: "+91",

            phone: "",
          },

          card: {
            cardHolderName: "",

            cardNumber: "",

            expiry: "",

            cvv: "",
          },

          billing: {
            address1: "",

            address2: "",

            city: "",

            state: "",

            country: "",

            postalcode: "",

            phone: "",

            email: "",
          },
        });

        return;
      }

      /* =================================================
         PARSE SESSION DATA
      ================================================= */

      const parsedData = JSON.parse(savedData);

      console.log("FLIGHT BOOKING DATA FROM SESSION:", parsedData);

      /* =================================================
         VALIDATE SESSION DATA
      ================================================= */

      if (!parsedData?.selectedFlight || !parsedData?.searchData) {
        setBookingData(null);

        return;
      }

      /* =================================================
         NORMALIZE SELECTED FLIGHT
      ================================================= */

      const normalizedData = {
        ...parsedData,

        selectedFlight: {
          ...parsedData.selectedFlight,

          outboundSegments: Array.isArray(
            parsedData.selectedFlight?.outboundSegments,
          )
            ? parsedData.selectedFlight.outboundSegments
            : [],

          returnSegments: Array.isArray(
            parsedData.selectedFlight?.returnSegments,
          )
            ? parsedData.selectedFlight.returnSegments
            : [],
        },

        /* =================================================
           NORMALIZE SEARCH DATA
        ================================================= */

        searchData: {
          ...parsedData.searchData,

          adults: Number(parsedData.searchData?.adults || 0),

          children: Number(parsedData.searchData?.children || 0),

          infants: Number(parsedData.searchData?.infants || 0),
        },
      };

      /* =================================================
         SET BOOKING DATA
      ================================================= */

      setBookingData(normalizedData);

      /* =================================================
         CREATE PASSENGER LIST
      ================================================= */

      const passengerList = createPassengerList(normalizedData.searchData);

      const passengerFormData = passengerList.map(createEmptyPassenger);

      /* =================================================
         RESET FORM
      ================================================= */

      reset({
        passengers: passengerFormData,

        contact: {
          email: "",

          countryCode: "+91",

          phone: "",
        },

        card: {
          cardHolderName: "",

          cardNumber: "",

          expiry: "",

          cvv: "",
        },

        billing: {
          address1: "",

          address2: "",

          city: "",

          state: "",

          country: "",

          postalcode: "",

          phone: "",

          email: "",
        },
      });

      /* =================================================
         GET CURRENT PRICE
      ================================================= */

      const fareCode = normalizedData?.selectedFlight?.fareSourceCode;

      getPriceTaxes(fareCode);
    } catch (error) {
      console.error("Unable to load flight booking data:", error);

      setBookingData(null);
    }
  }, [reset]);

  /* =======================================================
     PASSENGER COUNTS
  ======================================================= */

  const passengerCounts = useMemo(() => {
    const adults = passengers.filter((item) => item.type === "adult").length;

    const children = passengers.filter((item) => item.type === "child").length;

    const infants = passengers.filter((item) => item.type === "infant").length;

    return {
      adults,

      children,

      infants,

      total: adults + children + infants,
    };
  }, [passengers]);

  const encodeBase64 = (value) => {
    return btoa(String(value ?? ""));
  };

  const handlePayment = async (orderId, formData, paymentRemaining) => {
    setLoading(true);
    try {
      const cardData = formData?.card || {};
      const billingData = formData?.billing || {};
      const contactData = formData?.contact || {};

      const encodeBase64 = (value) => {
        return btoa(String(value ?? ""));
      };

      // ==============================
      // CARD DETAILS
      // ==============================

      // Remove spaces from card number
      const cardNumber = String(cardData?.cardNumber || "").replace(/\s/g, "");

      // Card holder name
      const cardName = cardData?.cardHolderName || "";

      // CVV
      const cardCode = cardData?.cvv || "";

      // Expiry MM/YY
      const expiry = cardData?.expiry || "";
      const [expiryMonth = "", expiryYear = ""] = expiry.split("/");

      const paymentPayload = {
        sessionId:
          localStorage.getItem("sessionId") ||
          "722243C3-FBF3-4359-806F-5AC5A07F6492-1910",

        input: {
          orderid: orderId,

          success:
            "https://it.alphatravelclub.link/flight/IT-75271198623/paymentSuccessful",

          fail: "https://it.alphatravelclub.link/flight/IT-75271198623/bookingFailed",

          mode: "CARD",

          paymentRemaining: Number(paymentRemaining || 0),

          identity: {
            number: encodeBase64(cardNumber),
            name: cardName,
            code: encodeBase64(cardCode),

            type: encodeBase64("VI"),

            em: encodeBase64(expiryMonth),
            ey: encodeBase64(expiryYear),

            line1: billingData?.address1 || "",
            line2: billingData?.address2 || "",

            country: billingData?.country || "IN",

            postalcode: billingData?.postalcode || "",
            email: billingData?.email || contactData?.email || "",
            phone: billingData?.phone || contactData?.phone || "",
            city: billingData?.city || "",
            state: billingData?.state || "",
          },

          retryNumber: 0,
          isRetryPayment: false,
          coin_type: "LTCT",
        },
      };
      const res = await flightPayment({
        body: paymentPayload,
      });

      const paymentUrl = res?.data?.paynow?.result?.url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        console.error("Payment URL not found in response:", res);
      }
    } catch (error) {
      console.error("Error in payment API:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (formData) => {
    console.log("VALID FORM DATA:", formData);

    const passengersData = formData?.passengers || [];
    const contactData = formData?.contact || {};
    const billingData = formData?.billing || {};

    const selectedFlight = bookingData?.selectedFlight || {};
    const searchData = bookingData?.searchData || {};

    const outboundSegments = Array.isArray(selectedFlight?.outboundSegments)
      ? selectedFlight.outboundSegments
      : [];

    const returnSegments = Array.isArray(selectedFlight?.returnSegments)
      ? selectedFlight.returnSegments
      : [];

    const firstSegment = outboundSegments?.[0] || {};
    const lastOutboundSegment =
      outboundSegments?.[outboundSegments.length - 1] || firstSegment;

    const firstReturnSegment = returnSegments?.[0] || {};
    const lastReturnSegment =
      returnSegments?.[returnSegments.length - 1] || firstReturnSegment;

    /*
     * =========================================================
     * TRIP TYPE
     * =========================================================
     */

    const trip =
      searchData?.tripType?.toLowerCase() === "oneway" ? "OneWay" : "RoundTrip";

    /*
     * =========================================================
     * DATES
     * =========================================================
     */

    const startDate =
      searchData?.departureDate ||
      firstSegment?.departureTime?.split("T")?.[0] ||
      "2026-08-20";

    const endDate =
      searchData?.returnDate ||
      (trip === "RoundTrip"
        ? lastReturnSegment?.arrivalTime?.split("T")?.[0]
        : startDate) ||
      startDate;

    /*
     * =========================================================
     * AIRLINE
     * =========================================================
     *
     * Use dynamic value if available.
     * Otherwise use the static value from your required payload.
     */

    const airline =
      selectedFlight?.airlineName ||
      selectedFlight?.airline ||
      selectedFlight?.airlineCode;

    /*
     * =========================================================
     * ROUTE
     * =========================================================
     */

    const route = [
      {
        code: firstSegment?.departure || searchData?.origin || "JFK",
        airport:
          firstSegment?.departureairport ||
          firstSegment?.departurelocation ||
          searchData?.originName,
        datetime: firstSegment?.departureTime || `${startDate}T00:00:00`,
      },
      {
        code: lastOutboundSegment?.arrival || searchData?.destination || "BOS",
        airport:
          lastOutboundSegment?.arrivalairport ||
          lastOutboundSegment?.arrivallocation ||
          searchData?.destinationName,
        datetime: lastOutboundSegment?.arrivalTime || `${endDate}T00:00:00`,
      },
    ];

    const basePrice = Number(
      selectedFlight?.baseFare ??
        selectedFlight?.base_price ??
        selectedFlight?.basePrice ??
        174.54,
    );

    const taxes = revalidateData.pricing.taxes;

    const payable = revalidateData.pricing.showOurprice;

    const ourPrice = revalidateData.pricing.ourprice;
    const netPrice = revalidateData.pricing.totalFare;

    const margin = revalidateData.pricing.margin;

    const merchantFees = revalidateData.pricing.merchantfee;

    /*
     * =========================================================
     * BAGGAGE
     * =========================================================
     */

    const baggagePolicy = revalidateData.rules.baggage[0].cabinBaggage;
    /*
     * =========================================================
     * GUESTS
     * =========================================================
     */

    const guests = passengersData.map((passenger, index) => ({
      title: passenger?.title,
      firstname: passenger?.firstName,
      lastname: passenger?.lastName,
      birthdate: passenger?.dateOfBirth,
      gender: passenger?.gender,
      phone: contactData?.phone || billingData?.phone,
      email: contactData?.email || billingData?.email,
      type:
        passenger?.type === "child"
          ? "Child"
          : passenger?.type === "infant"
            ? "Infants"
            : "Adult",
      primary: passenger.type == "adult" ? true : false,
      extraservice: [],
    }));

    const flightSegments = outboundSegments.length
      ? outboundSegments
      : [
          {
            airline: airline,
            departurelocation: searchData?.originName || "New York",
            arrivallocation: searchData?.destinationName || "Boston",

            departairport: "John F Kennedy Intl",
            arrivalairport: "Boston Logan Intl",

            departure: searchData?.origin || "JFK",
            arrival: searchData?.destination || "BOS",

            departureTime:
              firstSegment?.departureTime || `${startDate}T00:00:00`,

            arrivalTime: firstSegment?.arrivalTime || `${endDate}T00:00:00`,

            flightCode:
              firstSegment?.flightCode || selectedFlight?.airlineCode || "DL",

            flightNumber:
              firstSegment?.flightNumber || selectedFlight?.flightNo || "5765",

            cabin:
              selectedFlight?.cabinClass || searchData?.cabinClass || "Economy",

            fareFamily: firstSegment?.fareFamily || "",

            pnrNumber: firstSegment?.pnrNumber || "",

            fareBasisCodes: firstSegment?.fareBasisCodes || [],

            remainingSeats: Number(firstSegment?.remainingSeats || 1),

            stops: Number(firstSegment?.stops || 0),

            triptime: Number(firstSegment?.triptime || 0),

            legindicator: Number(firstSegment?.legindicator || 0),

            cabinBaggage:
              firstSegment?.cabinBaggage ||
              revalidateData?.rules?.baggage[0]?.cabinBaggage,

            checkInBaggage: firstSegment?.checkInBaggage || baggagePolicy,
          },
        ];

    /*
     * =========================================================
     * FINAL INPUT PAYLOAD
     * =========================================================
     */

    const inputPayload = {
      moduleid: 8189,
      supplierid: 1198,
      airline: airline,
      start_date: startDate,
      end_date: endDate,
      trip: trip,
      payment_mode: "CARD",
      route: route,
      base_price: basePrice,
      taxes: taxes,
      payable: payable,
      our_price: ourPrice,
      rate: 1,
      net_price: netPrice,
      saving_perc: 0,
      margin_perc: Number(((margin / netPrice) * 100).toFixed(1)),
      margin: margin,
      merchant_fees_perc: merchantFees,
      merchant_fees: merchantFees,
      roomcoins: 0,
      tripcoins: 0,
      tripcoins_amount: 0,
      saving: 0,
      refundability: revalidateData.isRefundable == "NO" ? false : true,
      baggage_policy: baggagePolicy,
      billing_title: passengersData?.[0]?.title || "Mr",
      billing_name: [
        passengersData?.[0]?.firstName || "Rohit",
        passengersData?.[0]?.middleName || "",
        passengersData?.[0]?.lastName || "Kumar",
      ]
        .filter(Boolean)
        .join(" "),
      billing_address1: billingData?.address1 || "",
      billing_address2: billingData?.address2 || "",
      billing_city: billingData?.city || "",
      billing_state: billingData?.state || "",
      billing_country: billingData?.country,
      billing_postalcode: billingData?.postalcode || "",
      billing_phone: billingData?.phone || contactData?.phone || "",
      billing_email: billingData?.email || contactData?.email || "",
      orderdate: new Date().toISOString(),
      guests: guests,
      fareSourceCode: selectedFlight?.fareSourceCode || "",
      booking_data: {
        airline: airline,
        start_date: startDate,
        end_date: endDate,
        stops: Number(
          selectedFlight?.stops ?? Math.max(0, flightSegments.length - 1),
        ),
        trip: trip,
        flighticket: [
          {
            flights: flightSegments.map((segment) => ({
              airline: segment?.airline || airline,
              departurelocation:
                segment?.departurelocation || searchData?.originName || "",
              arrivallocation:
                segment?.arrivallocation || searchData?.destinationName || "",
              departairport:
                segment?.departairport || segment?.departureairport,
              arrivalairport: segment?.arrivalairport,
              departure: segment?.departure || searchData?.origin || "",
              arrival: segment?.arrival || searchData?.destination || "",
              departureTime: segment?.departureTime || `${startDate}T00:00:00`,
              arrivalTime: segment?.arrivalTime || `${endDate}T00:00:00`,
              flightCode:
                segment?.flightCode || selectedFlight?.airlineCode || "",
              flightNumber:
                segment?.flightNumber || selectedFlight?.flightNo || "",
              cabin:
                segment?.cabin ||
                selectedFlight?.cabinClass ||
                searchData?.cabinClass ||
                "",
              fareFamily: segment?.fareFamily || "",
              pnrNumber: segment?.pnrNumber || "",
              fareBasisCodes: Array.isArray(segment?.fareBasisCodes)
                ? segment.fareBasisCodes
                : [],
              remainingSeats: Number(segment?.remainingSeats || 1),
              stops: Number(segment?.stops || 0),
              triptime: Number(segment?.triptime || 0),
              legindicator: Number(segment?.legindicator || 0),
              cabinBaggage:
                segment?.cabinBaggage ||
                revalidateData?.rules?.baggage[0]?.cabinBaggage,
              checkInBaggage: segment?.checkInBaggage || baggagePolicy,
            })),
          },
        ],
      },
      adults: Number(bookingData?.searchData?.adults || 0),
      children: Number(bookingData?.searchData?.children || 0),
      infants: Number(bookingData?.searchData?.infants || 0),
    };

    const flightOrderPayload = {
      sessionId:
        localStorage.getItem("sessionId") ||
        "722243C3-FBF3-4359-806F-5AC5A07F6492-1910",
      input: inputPayload,
    };

    console.log(
      "FINAL FLIGHT ORDER PAYLOAD:",
      JSON.stringify(flightOrderPayload, null, 2),
    );

    /*
     * =========================================================
     * API CALL
     * =========================================================
     */
    setLoading(true);
    try {
      const response = await flightOrder({
        body: flightOrderPayload,
      });

      console.log("FLIGHT ORDER RESPONSE:", response);

      if (response?.success === false) {
        console.error("Flight order failed:", response);
        return;
      }

      const orderId = response?.data?.addorder?.result?.itemid;

      if (!orderId) {
        console.error("Order ID not found in flight order response:", response);
        return;
      }

      console.log("FLIGHT ORDER ID:", orderId);

      // Hit payment API after successful flight order
      await handlePayment(
        orderId,
        formData,
        revalidateData?.pricing?.showOurprice,
      );

      // navigate("/flight-payment");
    } catch (error) {
      console.error("Error in flight order API:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
   NO BOOKING DATA
======================================================= */

  if (!bookingData) {
    return (
      <>
        {loading && <Loader />}
        <HeaderInner />

        <main className="fb-page">
          <div className="fb-empty-state">
            <div className="fb-empty-icon">✈</div>

            <h1>Booking session not found</h1>

            <p>
              Your selected flight information is no longer available. Please
              search for a flight again.
            </p>

            <button
              type="button"
              className="fb-primary-button"
              onClick={() => navigate("/")}
            >
              Search Flights
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  /* =======================================================
   DATA FOR JSX
======================================================= */

  const flight = bookingData.selectedFlight;

  const searchData = bookingData.searchData;
  /* =======================================================
   PAGE RETURN
======================================================= */

  return (
    <>
      {loading && <Loader />}
      <HeaderInner />

      <main className="fb-page">
        {/* =================================================
          HERO SECTION
      ================================================= */}

        <section className="fb-booking-hero">
          <div className="fb-container">
            {/* BREADCRUMB */}

            <div className="fb-breadcrumb">
              <span>Flights</span>

              <span>/</span>

              <span>Select Flight</span>

              <span>/</span>

              <strong>Passenger Details</strong>
            </div>

            {/* HERO CONTENT */}

            <div className="fb-hero-content">
              <div>
                <div className="fb-hero-kicker">Almost there</div>

                <h1>Complete your booking</h1>

                <p>
                  Enter the passenger details exactly as they appear on their
                  travel documents.
                </p>
              </div>

              {/* =================================================
                PROGRESS STEPS
            ================================================= */}

              <div className="fb-step-progress">
                {/* STEP 1 */}

                <div className="fb-step completed">
                  <span>✓</span>

                  <small>Search</small>
                </div>

                <div className="fb-progress-line active" />

                {/* STEP 2 */}

                <div className="fb-step completed">
                  <span>✓</span>

                  <small>Flight</small>
                </div>

                <div className="fb-progress-line active" />

                {/* STEP 3 */}

                <div className="fb-step current">
                  <span>3</span>

                  <small>Passenger</small>
                </div>

                <div className="fb-progress-line" />

                {/* STEP 4 */}

                <div className="fb-step">
                  <span>4</span>

                  <small>Payment</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
          MAIN CONTAINER
      ================================================= */}

        <div className="fb-container fb-main-layout">
          {/* =================================================
            LEFT COLUMN
        ================================================= */}

          <div className="fb-main-column">
            {/* =================================================
              VALIDATION ALERT
          ================================================= */}

            {Object.keys(errors).length > 0 && (
              <div className="fb-validation-alert">
                <div className="fb-alert-icon">!</div>

                <div>
                  <strong>Please complete all required fields</strong>

                  <p>
                    Fill in the passenger, contact, card and billing details
                    before continuing.
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
              01 - SELECTED FLIGHT
          ================================================= */}

            <div className="fb-section-heading">
              <div className="fb-heading-number">01</div>

              <div>
                <h2>Your selected flight</h2>

                <p>Review your itinerary before entering passenger details.</p>
              </div>
            </div>

            <ItineraryCard flight={flight} searchData={searchData} />

            {/* =================================================
              02 - CONTACT DETAILS
          ================================================= */}

            <div className="fb-section-heading fb-heading-space">
              <div className="fb-heading-number">02</div>

              <div>
                <h2>Contact details</h2>

                <p>Where should we send your booking confirmation?</p>
              </div>
            </div>

            <ContactDetails register={register} errors={errors} />

            {/* =================================================
              03 - PASSENGER DETAILS
          ================================================= */}

            <div className="fb-section-heading fb-heading-space">
              <div className="fb-heading-number">03</div>

              <div>
                <h2>Passenger details</h2>

                <p>
                  Enter details for all passengers travelling on this
                  reservation.
                </p>
              </div>
            </div>

            {/* =================================================
              PASSENGER COUNT
          ================================================= */}

            <div className="fb-passenger-count-banner">
              <div className="fb-count-icon">👥</div>

              <div>
                <strong>
                  {passengerCounts.total} passenger
                  {passengerCounts.total !== 1 ? "s" : ""}
                </strong>

                <span>
                  Adult
                  {passengerCounts.children > 0 && (
                    <>
                      {" · "}
                      Child
                    </>
                  )}
                  {passengerCounts.infants > 0 && (
                    <>
                      {" · "}
                      Infant
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* =================================================
              PASSENGER FORMS
          ================================================= */}

            <div className="fb-passengers-list">
              {passengers.map((passenger, index) => (
                <PassengerForm
                  key={passenger.id}
                  passenger={{
                    ...passenger,

                    number: Number(passenger.id?.split("-")[1]) || index + 1,
                  }}
                  index={index}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>

            {/* =================================================
              04 - BILLING ADDRESS
          ================================================= */}

            <div className="fb-section-heading fb-heading-space">
              <div className="fb-heading-number">04</div>

              <div>
                <h2>Billing address</h2>

                <p>Enter the address associated with your payment.</p>
              </div>
            </div>

            <BillingAddress register={register} errors={errors} />

            {/* =================================================
              05 - PAYMENT DETAILS
          ================================================= */}

            <div className="fb-section-heading fb-heading-space">
              <div className="fb-heading-number">05</div>

              <div>
                <h2>Payment details</h2>

                <p>Enter your card information for payment.</p>
              </div>
            </div>

            <CardDetails register={register} errors={errors} />

            {/* =================================================
              SECURITY CARD
          ================================================= */}

            <div className="fb-security-card">
              <div className="fb-security-icon">🔐</div>

              <div>
                <strong>Your information is secure</strong>

                <p>
                  Your passenger, contact and billing details are encrypted and
                  used only for processing your flight reservation.
                </p>
              </div>
            </div>

            {/* =================================================
              CONTINUE SECTION
          ================================================= */}

            <div className="fb-continue-section">
              <div className="fb-continue-note">
                <span>🔒</span>

                <div>
                  <strong>Secure checkout</strong>

                  <p>You'll review your booking before payment.</p>
                </div>
              </div>

              <button
                type="button"
                className="fb-continue-button"
                onClick={handleSubmit(handleContinue)}
              >
                Continue to Payment
                <span>→</span>
              </button>
            </div>
          </div>

          {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

          <div className="fb-sidebar">
            {/* =================================================
              PRICE SUMMARY
          ================================================= */}

            <PriceSummary flight={flight} searchData={searchData} />

            {/* =================================================
              HELP CARD
          ================================================= */}

            <div className="fb-help-card">
              <div className="fb-help-icon">?</div>

              <div>
                <strong>Need help?</strong>

                <p>
                  Make sure every passenger name matches their travel document.
                </p>
              </div>
            </div>

            {/* =================================================
              TRUST CARD
          ================================================= */}

            <div className="fb-trust-card">
              {/* SECURE BOOKING */}

              <div className="fb-trust-item">
                <span>✓</span>

                <div>
                  <strong>Secure booking</strong>

                  <small>Your information is protected</small>
                </div>
              </div>

              {/* INSTANT CONFIRMATION */}

              <div className="fb-trust-item">
                <span>✓</span>

                <div>
                  <strong>Instant confirmation</strong>

                  <small>Ticket sent to your email</small>
                </div>
              </div>

              {/* SUPPORT */}

              <div className="fb-trust-item">
                <span>✓</span>

                <div>
                  <strong>24/7 support</strong>

                  <small>We're here when you need us</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =================================================
        FOOTER
    ================================================= */}

      <Footer />
    </>
  );
}
