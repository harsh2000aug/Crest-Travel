import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import "./FlightResultPage.css";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import { fligtsData, suggestionFlight } from "../../store/Services/AllApi";

const STOP_OPTIONS = [
  {
    id: "nonstop",
    label: "Non-stop",
  },
  {
    id: "1stop",
    label: "1 Stop",
  },
  {
    id: "2stops",
    label: "2+ Stops",
  },
];

/* =========================================================
   CURRENCY
========================================================= */

const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    CAD: "CA$",
    AUD: "A$",
  };

  return symbols[currency] || currency || "$";
};

const formatMoney = (value, currency = "USD") => {
  const amount = Number(value) || 0;

  return `${getCurrencySymbol(currency)}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const formatTime = (value) => {
  if (!value) return "";

  return value.substring(11, 16);
};

const getDurationMinutes = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((endDate - startDate) / 60000));
};

const formatDuration = (minutes) => {
  const totalMinutes = Number(minutes) || 0;

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

/* =========================================================
   AIRPORT CODE PARSER
   (same as FlightForm - fullname looks like "[JFK] New York")
========================================================= */

const getAirportCode = (fullname = "") => {
  const match = fullname.match(/^\[([^\]]+)\]/);
  return match ? match[1] : "";
};

/* =========================================================
   CONNECTION / LAYOVER
========================================================= */

const getConnectionInfo = (segments) => {
  if (!segments || segments.length < 2) {
    return null;
  }

  const first = segments[0];
  const second = segments[1];

  const layoverMinutes = getDurationMinutes(
    first.arrivalTime,
    second.departureTime,
  );

  return {
    airport: first.arrival,
    airportName: first.arrivalairport,
    layover: formatDuration(layoverMinutes),
  };
};

/* =========================================================
   API RESPONSE -> UI DATA MAPPER
========================================================= */

const mapFlightResult = (item, index, currency, multiCitySegments = []) => {
  const segments = Array.isArray(item?.flights) ? item.flights : [];

  const isMultiCity =
    Array.isArray(multiCitySegments) && multiCitySegments.length > 1;

  const outbound = segments.filter(
    (segment) => Number(segment?.legindicator) === 0,
  );

  const returnSegments = segments.filter(
    (segment) => Number(segment?.legindicator) === 1,
  );

  const outboundSegments = isMultiCity
    ? segments
    : outbound.length > 0
      ? outbound
      : segments;

  const firstOutbound = outboundSegments[0];

  const lastOutbound = outboundSegments[outboundSegments.length - 1];

  const firstReturn = returnSegments[0];

  const lastReturn = returnSegments[returnSegments.length - 1];

  const outboundStops = Math.max(0, outboundSegments.length - 1);

  const returnStops = Math.max(0, returnSegments.length - 1);

  const apiStops = Number(item?.stops);

  const totalStops = Number.isFinite(apiStops)
    ? apiStops
    : outboundStops + returnStops;

  const outboundDuration = formatDuration(
    getDurationMinutes(firstOutbound?.departureTime, lastOutbound?.arrivalTime),
  );

  const returnDuration =
    firstReturn && lastReturn
      ? formatDuration(
          getDurationMinutes(firstReturn.departureTime, lastReturn.arrivalTime),
        )
      : null;

  const allAirlines = [...outboundSegments, ...returnSegments].reduce(
    (acc, segment) => {
      if (segment?.airline && !acc.includes(segment.airline)) {
        acc.push(segment.airline);
      }

      return acc;
    },
    [],
  );

  const primaryAirlineCode =
    firstOutbound?.flightCode || firstReturn?.flightCode || "";

  const primaryAirlineName =
    firstOutbound?.airline || firstReturn?.airline || primaryAirlineCode;

  const penalty = item?.penaltydetails?.[0];

  const fareFeatures = [
    {
      label: `Base Fare ${formatMoney(item?.baseFare, currency)}`,
      ok: true,
    },
    {
      label: `Taxes ${formatMoney(item?.taxes, currency)}`,
      ok: true,
    },
    {
      label: penalty?.refundAllowed ? "Refundable" : "Non-refundable",
      ok: Boolean(penalty?.refundAllowed),
    },
    {
      label: penalty?.changeAllowed
        ? "Date Change Allowed"
        : "Date Change Not Allowed",
      ok: Boolean(penalty?.changeAllowed),
    },
    {
      label: firstOutbound?.fareFamily || "Fare",
      ok: true,
    },
  ];

  const seats = segments
    .map((segment) => Number(segment?.remainingSeats))
    .filter((seat) => Number.isFinite(seat));

  const seatsLeft = seats.length > 0 ? Math.min(...seats) : null;

  return {
    id: item?.fareSourceCode || `flight-${index}`,

    fareSourceCode: item?.fareSourceCode || "",

    airlineCode: primaryAirlineCode,

    airlineName: primaryAirlineName,

    airlineNames: allAirlines,

    flightNo: firstOutbound
      ? `${firstOutbound.flightCode}-${firstOutbound.flightNumber}`
      : "",

    cabinClass: firstOutbound?.cabin || firstReturn?.cabin || "Economy",

    dep: {
      time: formatTime(firstOutbound?.departureTime),
      airport: firstOutbound?.departure || "",
      city: firstOutbound?.departurelocation || "",
      airportName: firstOutbound?.departairport || "",
      date: formatDate(firstOutbound?.departureTime),
      dateTime: firstOutbound?.departureTime || "",
    },

    arr: {
      time: formatTime(lastOutbound?.arrivalTime),
      airport: lastOutbound?.arrival || "",
      city: lastOutbound?.arrivallocation || "",
      airportName: lastOutbound?.arrivalairport || "",
      date: formatDate(lastOutbound?.arrivalTime),
      dateTime: lastOutbound?.arrivalTime || "",
    },

    duration: outboundDuration,

    stops: isMultiCity
      ? segments.reduce(
          (total, segment) =>
            total +
            Math.max(
              0,
              Array.isArray(segment?.segments)
                ? segment.segments.length - 1
                : 0,
            ),
          0,
        )
      : outboundStops,

    totalStops,

    stopDetail: getConnectionInfo(outboundSegments),

    returnDuration,

    price: Number(item?.ourprice) || Number(item?.convertedCoin) || 0,

    totalPrice: Number(item?.ourprice) || Number(item?.convertedCoin) || 0,

    baseFare: Number(item?.baseFare) || 0,

    taxes: Number(item?.taxes) || 0,

    totalFare: Number(item?.totalFare) || 0,

    convertedCoin: Number(item?.convertedCoin) || 0,

    currency,

    seatsLeft,

    badges: [
      penalty?.refundAllowed ? "refundable" : "non-refundable",

      index === 0 ? "best" : "",
    ].filter(Boolean),

    amenities: {
      wifi: false,
      meal: false,
      entertainment: false,
      powerOutlet: false,
      extraLegroom: false,
    },

    fares: [
      {
        id: item?.fareSourceCode || `fare-${index}`,

        name: firstOutbound?.fareFamily || "Available Fare",

        price: Number(item?.ourprice) || 0,

        recommended: index === 0,

        features: fareFeatures,
      },
    ],

    baggage: [],

    outboundSegments: isMultiCity ? segments : outboundSegments,

    returnSegments: isMultiCity ? [] : returnSegments,

    multiCitySegments: isMultiCity ? multiCitySegments : [],

    penaltydetails: item?.penaltydetails || [],
  };
};

/* =========================================================
   AIRLINE LOGO
========================================================= */

function AirlineLogo({ code, name, size = "md" }) {
  const airlineName = name || code || "";

  const initials = airlineName.trim().slice(0, 2).toUpperCase();

  const className = size === "lg" ? "airline-logo-lg" : "airline-logo";

  return (
    <div className={className} title={airlineName}>
      {initials || "—"}
    </div>
  );
}

/* =========================================================
   DURATION
========================================================= */

function DurationStrip({ duration, stops, stopDetail }) {
  const isNonStop = stops === 0;

  return (
    <div className="duration-strip">
      <div className="duration-label">{duration}</div>

      <div className="duration-line">
        <div className="duration-dot" />

        <div className="duration-track">
          <span className="duration-plane">✈</span>
        </div>

        <div className="duration-dot" />
      </div>

      <div className={`stop-count-label ${isNonStop ? "nonstop" : "one-stop"}`}>
        {isNonStop
          ? "Non-stop"
          : `${stops} Stop${stops > 1 ? "s" : ""}${
              stopDetail?.airport ? ` · ${stopDetail.airport}` : ""
            }`}
      </div>
    </div>
  );
}

/* =========================================================
   SEGMENT LIST
========================================================= */

function SegmentList({ segments = [] }) {
  if (!segments.length) {
    return (
      <div className="no-flights-sub">
        Segment information is not available.
      </div>
    );
  }

  return (
    <div className="segment-timeline">
      {segments.map((segment, index) => (
        <div
          className="timeline-point"
          key={`${segment.flightCode}-${segment.flightNumber}-${index}`}
        >
          <div
            className="timeline-dot"
            style={{
              background: index === 0 ? "var(--sky)" : "var(--green)",
            }}
          />

          <div className="timeline-time">
            {formatTime(segment.departureTime)} ·{" "}
            {formatDate(segment.departureTime)}
          </div>

          <div className="timeline-airport">
            {segment.departurelocation} ({segment.departure})
          </div>

          <div className="timeline-airline-info">
            {segment.airline} {segment.flightCode}-{segment.flightNumber} ·{" "}
            {segment.cabin}
          </div>

          <div
            className="timeline-airport"
            style={{
              marginTop: 8,
            }}
          >
            ↓ Arrives {formatTime(segment.arrivalTime)} ·{" "}
            {segment.arrivallocation} ({segment.arrival})
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   DETAILS PANEL
========================================================= */

function DetailsPanel({ flight }) {
  return (
    <div className="flight-details-grid">
      {/* =========================
          OUTBOUND
      ========================= */}

      <div className="detail-segment">
        <div className="segment-header">
          <div className="segment-route">
            {flight.dep.airport} → {flight.arr.airport}
          </div>

          <div className="segment-duration-badge">{flight.duration}</div>
        </div>

        <div
          className="timeline-airline-info"
          style={{
            marginBottom: 12,
          }}
        >
          {flight.airlineName}

          {flight.airlineNames?.length > 1 &&
            ` · ${flight.airlineNames.join(", ")}`}
        </div>

        <SegmentList segments={flight.outboundSegments} />

        {/* =========================
            RETURN
        ========================= */}

        {flight.returnSegments?.length > 0 && (
          <>
            <div
              className="segment-header"
              style={{
                marginTop: 24,
              }}
            >
              <div className="segment-route">
                Return · {flight.returnSegments[0].departure} →{" "}
                {
                  flight.returnSegments[flight.returnSegments.length - 1]
                    .arrival
                }
              </div>

              <div className="segment-duration-badge">
                {flight.returnDuration}
              </div>
            </div>

            <SegmentList segments={flight.returnSegments} />
          </>
        )}

        {/* Amenities */}

        <div className="amenities-row">
          <div className="amenity-chip unavailable">
            📶 Wi-Fi — Not provided
          </div>

          <div className="amenity-chip unavailable">🍽️ Meal — Not provided</div>

          <div className="amenity-chip unavailable">🎬 IFE — Not provided</div>

          <div className="amenity-chip unavailable">
            🔌 Power — Not provided
          </div>
        </div>
      </div>

      {/* =========================
          PRICING
      ========================= */}

      <div className="detail-segment">
        <div className="segment-header">
          <div className="segment-route">Fare & Pricing</div>
        </div>

        <table className="baggage-table">
          <tbody>
            <tr>
              <td>Base Fare</td>

              <td>{formatMoney(flight.baseFare, flight.currency)}</td>
            </tr>

            <tr>
              <td>Taxes</td>

              <td>{formatMoney(flight.taxes, flight.currency)}</td>
            </tr>

            <tr>
              <td>Provider Total Fare</td>

              <td>{formatMoney(flight.totalFare, flight.currency)}</td>
            </tr>

            <tr>
              <td>Our Price</td>

              <td>{formatMoney(flight.price, flight.currency)}</td>
            </tr>

            <tr>
              <td>Total Stops</td>

              <td>{flight.totalStops}</td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            marginTop: 16,
            padding: "12px",
            background: "var(--sky-pale)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--sky)",
          }}
        >
          ℹ️ Baggage and seat amenities are not included in the supplied
          flight-search response.
        </div>

        {/* Penalties */}

        {flight.penaltydetails?.map((penalty, index) => (
          <div
            key={index}
            style={{
              marginTop: 12,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          >
            <strong>{penalty.paxType || "Passenger"}</strong>

            <div
              style={{
                marginTop: 6,
              }}
            >
              Refund: {penalty.refundAllowed ? "Allowed" : "Not allowed"}
            </div>

            <div>
              Date Change: {penalty.changeAllowed ? "Allowed" : "Not allowed"}
            </div>

            {penalty.changePenaltyAmount && (
              <div>Change penalty: {penalty.changePenaltyAmount}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   FARE PANEL
========================================================= */

function FarePanel({ fares = [], flight }) {
  const [selected, setSelected] = useState(fares[0]?.id || null);

  return (
    <div className="fare-grid">
      {fares.map((fare) => (
        <div
          className={`fare-card ${fare.recommended ? "recommended" : ""} ${
            selected === fare.id ? "selected" : ""
          }`}
          onClick={() => setSelected(fare.id)}
          key={fare.id}
        >
          <div className="fare-name">{fare.name}</div>

          <div className="fare-price">
            {formatMoney(fare.price, flight.currency)}
          </div>

          {fare.features?.map((feature, index) => (
            <div className="fare-feature" key={index}>
              <span className={feature.ok ? "check" : "cross"}>
                {feature.ok ? "✓" : "✕"}
              </span>

              {feature.label}
            </div>
          ))}

          <button className="fare-select-btn">
            {selected === fare.id ? "✓ Selected" : "Select"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   FLIGHT CARD
   (unchanged - reads current search context from the URL,
   not from the search form, so no RHF dependency needed here)
========================================================= */

function FlightCard({ flight }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);

  const handleBookFlight = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);

      // Get only the search information required on booking page
      const searchData = {
        tripType: searchParams.get("tripType") || "round-trip",

        origin: searchParams.get("origin") || "",
        originName: searchParams.get("originName") || "",

        destination: searchParams.get("destination") || "",
        destinationName: searchParams.get("destinationName") || "",

        departureDate: searchParams.get("departureDate") || "",
        returnDate: searchParams.get("returnDate") || "",

        adults: Number(searchParams.get("adults") || 1),
        children: Number(searchParams.get("children") || 0),
        infants: Number(searchParams.get("infants") || 0),

        cabinClass: searchParams.get("cabinClass"),
        segments: (() => {
          try {
            const raw = searchParams.get("segments");

            if (raw) {
              const parsed = JSON.parse(raw);

              if (Array.isArray(parsed)) {
                return parsed;
              }
            }

            const stored = sessionStorage.getItem("multiCityFlights");

            if (stored) {
              const parsed = JSON.parse(stored);

              if (Array.isArray(parsed?.segments)) {
                return parsed.segments;
              }
            }
          } catch (error) {
            console.error("Unable to get Multi City segments:", error);
          }

          return [];
        })(),
      };

      // Store only the flight data required by booking page
      const selectedFlight = {
        airlineCode: flight.airlineCode || "",
        airlineName: flight.airlineName || "",
        flightNo: flight.flightNo || "",
        cabinClass: flight.cabinClass,
        fareSourceCode: flight.fareSourceCode,
        dep: flight.dep || {
          time: "",
          airport: "",
          date: "",
          city: "",
        },

        arr: flight.arr || {
          time: "",
          airport: "",
          date: "",
          city: "",
        },

        duration: flight.duration || "",
        stops: Number(flight.stops || 0),
        stopDetail: flight.stopDetail || "",

        price: Number(flight.price || 0),
        totalPrice: Number(flight.totalPrice || 0),
        currency: flight.currency || "USD",

        outboundSegments: Array.isArray(flight.outboundSegments)
          ? flight.outboundSegments
          : [],

        returnSegments: Array.isArray(flight.returnSegments)
          ? flight.returnSegments
          : [],
      };

      const bookingData = {
        selectedFlight,
        searchData,

        // Keep session ID available for future booking/payment API
        sessionId: localStorage.getItem("sessionId") || "",

        createdAt: new Date().toISOString(),
      };

      // SAVE DATA
      sessionStorage.setItem("flightBookingData", JSON.stringify(bookingData));

      console.log("FLIGHT BOOKING DATA SAVED:", bookingData);

      // Navigate without sending data in URL
      navigate("/flight-booking");
    } catch (error) {
      console.error("Unable to continue to flight booking:", error);
    }
  };

  function toggleTab(tab) {
    setActiveTab((prev) => (prev === tab ? null : tab));
  }

  const isBest = flight.badges?.includes("best");

  const hasReturn = flight.returnSegments?.length > 0;

  const returnFirst = flight.returnSegments?.[0];

  const returnLast = flight.returnSegments?.[flight.returnSegments.length - 1];

  return (
    <div className={`flight-card-inner ${isBest ? "best-value" : ""}`}>
      {/* =========================
          MAIN FLIGHT
      ========================= */}

      <div className="flight-card-main">
        {/* Airline */}

        <div className="airline-identity">
          <AirlineLogo
            code={flight.airlineCode}
            name={flight.airlineName}
            size="lg"
          />

          <div>
            <div className="airline-card-name">{flight.airlineName}</div>

            <div className="airline-card-flight-no">
              {flight.flightNo}

              {flight.outboundSegments?.length > 1 && " + Connecting"}
            </div>

            <div className="airline-card-class">{flight.cabinClass}</div>
          </div>
        </div>

        {/* =========================
            DEPARTURE
        ========================= */}

        <div className="time-block dep">
          <div className="flight-time">{flight.dep.time}</div>

          <div className="flight-airport">{flight.dep.airport}</div>

          <div className="flight-date">{flight.dep.date}</div>

          <div className="airline-card-class">{flight.dep.city}</div>
        </div>

        {/* =========================
            DURATION
        ========================= */}

        <DurationStrip
          duration={flight.duration}
          stops={flight.stops}
          stopDetail={flight.stopDetail}
        />

        {/* =========================
            ARRIVAL
        ========================= */}

        <div className="time-block arr">
          <div className="flight-time">{flight.arr.time}</div>

          <div className="flight-airport">{flight.arr.airport}</div>

          <div className="flight-date">{flight.arr.date}</div>

          <div className="airline-card-class">{flight.arr.city}</div>
        </div>

        {/* =========================
            PRICE
        ========================= */}

        <div className="price-section">
          <div className="price-per-person">Per Person</div>

          <div className="price-amount">
            <span className="price-currency">
              {getCurrencySymbol(flight.currency)}
            </span>

            {Number(flight.price).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div className="price-total">
            Total {formatMoney(flight.totalPrice, flight.currency)}
          </div>

          <button type="button" className="book-btn" onClick={handleBookFlight}>
            Book Now →
          </button>

          {Number.isFinite(flight.seatsLeft) && flight.seatsLeft <= 5 && (
            <div className="seats-left">
              🔥 Only {flight.seatsLeft} seats left!
            </div>
          )}
        </div>
      </div>

      {/* =========================
          RETURN FLIGHT
      ========================= */}

      {hasReturn && (
        <div
          style={{
            margin: "0 20px 14px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "var(--sky-pale)",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong>↩ Return</strong>

            <div
              style={{
                marginTop: 4,
              }}
            >
              {formatTime(returnFirst.departureTime)} · {returnFirst.departure}{" "}
              → {returnLast.arrival}
            </div>

            <div
              style={{
                fontSize: 12,
                marginTop: 3,
                opacity: 0.75,
              }}
            >
              {formatDate(returnFirst.departureTime)} ·{" "}
              {returnFirst.departurelocation} → {returnLast.arrivallocation}
            </div>
          </div>

          <div>
            <strong>{flight.returnDuration}</strong>

            <div
              style={{
                fontSize: 12,
                marginTop: 4,
                opacity: 0.75,
              }}
            >
              {flight.returnSegments.length - 1} stop
              {flight.returnSegments.length - 1 !== 1 ? "s" : ""}
            </div>
          </div>

          <div>
            <strong>Flights</strong>

            <div
              style={{
                fontSize: 12,
                marginTop: 4,
                opacity: 0.75,
              }}
            >
              {flight.returnSegments
                .map(
                  (segment) => `${segment.flightCode}-${segment.flightNumber}`,
                )
                .join(" · ")}
            </div>
          </div>
        </div>
      )}

      {/* =========================
          FOOTER
      ========================= */}

      <div className="flight-card-footer">
        <button
          className={`footer-tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => toggleTab("details")}
        >
          ✈ Flight Details
        </button>

        <div className="footer-tab-divider" />

        <button
          className={`footer-tab ${activeTab === "fares" ? "active" : ""}`}
          onClick={() => toggleTab("fares")}
        >
          🎫 Fare Options
        </button>
      </div>

      {/* =========================
          EXPANDED
      ========================= */}

      <div className={`expanded-panel ${activeTab ? "open" : ""}`}>
        {activeTab === "details" && <DetailsPanel flight={flight} />}

        {activeTab === "fares" && (
          <FarePanel fares={flight.fares} flight={flight} />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const EMPTY_SEGMENT = {
  origin: "",
  originName: "",
  destination: "",
  destinationName: "",
  departureDate: "",
};

export default function FlightResultPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* =========================
     URL PARAMS (used only as INITIAL / default form values)
  ========================= */

  const tripTypeParam = searchParams.get("tripType") || "round-trip";

  const originParam = searchParams.get("origin") || "";

  const originNameParam = searchParams.get("originName") || "";

  const destinationParam = searchParams.get("destination") || "";

  const destinationNameParam = searchParams.get("destinationName") || "";

  const departureDateParam = searchParams.get("departureDate") || "";

  const returnDateParam = searchParams.get("returnDate") || "";

  const adultsParam = searchParams.get("adults") || "1";

  const childrenParam = searchParams.get("children") || "0";

  const infantsParam = searchParams.get("infants") || "0";

  const cabinClassParam = searchParams.get("cabinClass") || "Economy";

  const segmentsParam = searchParams.get("segments");

  let initialMultiCitySegments = [];

  try {
    if (segmentsParam) {
      const parsedSegments = JSON.parse(segmentsParam);

      if (Array.isArray(parsedSegments)) {
        initialMultiCitySegments = parsedSegments;
      }
    }
  } catch (error) {
    console.error("Unable to parse Multi City URL segments:", error);
  }

  if (initialMultiCitySegments.length === 0) {
    try {
      const storedData = sessionStorage.getItem("multiCityFlights");

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        if (Array.isArray(parsedData?.segments)) {
          initialMultiCitySegments = parsedData.segments;
        }
      }
    } catch (error) {
      console.error("Unable to parse Multi City session data:", error);
    }
  }

  if (initialMultiCitySegments.length < 2) {
    initialMultiCitySegments = [{ ...EMPTY_SEGMENT }, { ...EMPTY_SEGMENT }];
  }

  /* =========================================================
     REACT HOOK FORM
     Holds every search-form field: tripType, origin/destination,
     dates, traveler counts, cabin class, and the multi-city
     segment list (as a field array).
  ========================================================= */

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      tripType: tripTypeParam,
      origin: originParam,
      originName: originNameParam || originParam,
      destination: destinationParam,
      destinationName: destinationNameParam || destinationParam,
      depDate: departureDateParam,
      retDate: returnDateParam,
      adults: adultsParam,
      children: childrenParam,
      infants: infantsParam,
      cabinClass: cabinClassParam,
      multiCitySegments: initialMultiCitySegments,
    },
  });

  const {
    fields: multiCityFields,
    append: appendMultiCitySegment,
    remove: removeMultiCitySegmentAt,
  } = useFieldArray({
    control,
    name: "multiCitySegments",
  });

  // Reactive snapshot of the whole form, used for rendering.
  const formValues = watch();

  const {
    tripType,
    originName: originText,
    destinationName: destinationText,
    origin,
    destination,
    depDate,
    retDate,
    adults,
    children,
    infants,
    cabinClass,
    multiCitySegments,
  } = formValues;

  /* =========================
     NON-FORM UI STATE
     (autocomplete suggestion lists, results, filters, paging)
  ========================= */

  const [originAirport, setOriginAirport] = useState(null);

  const [destinationAirport, setDestinationAirport] = useState(null);

  const [originDropdown, setOriginDropdown] = useState([]);

  const [destinationDropdown, setDestinationDropdown] = useState([]);

  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);

  const [multiCityDropdown, setMultiCityDropdown] = useState({
    index: null,
    field: null,
    items: [],
  });

  const [apiFlights, setApiFlights] = useState([]);

  const [currency, setCurrency] = useState("USD");

  const [totalResults, setTotalResults] = useState(0);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const flightsPerPage = 20;
  const totalPages = Math.ceil(totalResults / flightsPerPage);

  const [maxPrice, setMaxPrice] = useState(Number.POSITIVE_INFINITY);

  /*
    Empty = all airlines
  */

  const [selectedAirlines, setSelectedAirlines] = useState([]);

  /*
    Empty = all stops
  */

  const [selectedStops, setSelectedStops] = useState([]);

  const [sortBy, setSortBy] = useState("price");

  /* =========================
     TRAVELER COUNTERS
     (same increment/decrement pattern, now via RHF setValue)
  ========================= */

  const incrementTraveler = (type) => {
    setValue(type, String(Number(getValues(type)) + 1));
  };

  const decrementTraveler = (type) => {
    const min = type === "adults" ? 1 : 0;

    setValue(type, String(Math.max(min, Number(getValues(type)) - 1)));
  };

  const totalTravelers = Number(adults) + Number(children) + Number(infants);

  /* =========================================================
     AIRPORT SUGGESTION DROPDOWN
     (same logic as FlightForm's handleSearchDropdown)
  ========================================================= */

  const handleAirportSearch = async (type, value) => {
    if (!value.trim()) {
      if (type === "from") {
        setOriginDropdown([]);
      } else {
        setDestinationDropdown([]);
      }
      return;
    }

    try {
      const res = await suggestionFlight({
        body: {
          term: value,
          sessionId: localStorage.getItem("sessionId"),
        },
      });

      if (type === "from") {
        setOriginDropdown(res?.data?.locations?.result || []);
      } else {
        setDestinationDropdown(res?.data?.locations?.result || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateMultiCitySegment = (index, field, value) => {
    setValue(`multiCitySegments.${index}.${field}`, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (field === "originName") {
      setValue(`multiCitySegments.${index}.origin`, "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (field === "destinationName") {
      setValue(`multiCitySegments.${index}.destination`, "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleMultiCityAirportSearch = async (index, field, value) => {
    if (!value.trim()) {
      setMultiCityDropdown({
        index: null,
        field: null,
        items: [],
      });

      return;
    }

    try {
      const res = await suggestionFlight({
        body: {
          term: value,

          sessionId: localStorage.getItem("sessionId"),
        },
      });

      setMultiCityDropdown({
        index,
        field,
        items: res?.data?.locations?.result || [],
      });
    } catch (error) {
      console.error("Multi City suggestion error:", error);

      setMultiCityDropdown({
        index: null,
        field: null,
        items: [],
      });
    }
  };

  const selectMultiCityAirport = (index, field, item) => {
    const code = getAirportCode(item?.fullname || "");

    if (field === "origin") {
      setValue(`multiCitySegments.${index}.origin`, code, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      setValue(`multiCitySegments.${index}.originName`, item?.fullname || "", {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      setValue(`multiCitySegments.${index}.destination`, code, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      setValue(
        `multiCitySegments.${index}.destinationName`,
        item?.fullname || "",
        {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        },
      );
    }

    setMultiCityDropdown({
      index: null,
      field: null,
      items: [],
    });
  };

  const addMultiCitySegment = () => {
    const segments = getValues("multiCitySegments");

    if (segments.length >= 6) {
      return;
    }

    const last = segments[segments.length - 1];

    appendMultiCitySegment({
      origin: last?.destination || "",
      originName: last?.destinationName || "",
      destination: "",
      destinationName: "",
      departureDate: "",
    });
  };

  const removeMultiCitySegment = (index) => {
    if (multiCityFields.length <= 2) {
      return;
    }

    removeMultiCitySegmentAt(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAirportSearch("from", originText || "");
    }, 500);

    return () => clearTimeout(timer);
  }, [originText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAirportSearch("to", destinationText || "");
    }, 500);

    return () => clearTimeout(timer);
  }, [destinationText]);

  /* =========================
     ROUND TRIP CHECK
  ========================= */

  const isMultiCity =
    tripType === "multicity" ||
    tripType === "multi-city" ||
    tripType === "MultiCity";

  const isRoundTrip =
    !isMultiCity &&
    (tripType === "round-trip" ||
      tripType === "round" ||
      tripType === "RoundTrip");

  /* =========================
     STOP TOGGLE
  ========================= */

  function toggleStop(id) {
    setSelectedStops((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  /* =========================
     AIRLINE TOGGLE
  ========================= */

  function toggleAirline(code) {
    setSelectedAirlines((prev) =>
      prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code],
    );
  }

  /* =========================
     RESET FILTERS
  ========================= */

  function resetFilters() {
    setMaxPrice(Number.POSITIVE_INFINITY);

    setSelectedStops([]);

    setSelectedAirlines([]);
  }

  /* =========================
     DYNAMIC AIRLINE FILTER
  ========================= */

  const airlineFilterList = apiFlights.reduce((acc, flight) => {
    const code = flight.airlineCode;

    if (!code) {
      return acc;
    }

    const existing = acc.find((item) => item.code === code);

    if (!existing || flight.price < existing.fromPrice) {
      if (existing) {
        existing.fromPrice = flight.price;

        existing.name = flight.airlineName || code;
      } else {
        acc.push({
          code,
          name: flight.airlineName || code,
          fromPrice: flight.price,
        });
      }
    }

    return acc;
  }, []);

  /* =========================
     FILTER FLIGHTS
  ========================= */

  const filteredFlights = [...apiFlights]
    .filter((flight) => {
      /* Price */

      if (flight.price > maxPrice) {
        return false;
      }

      /* Airline */

      if (
        selectedAirlines.length > 0 &&
        !selectedAirlines.includes(flight.airlineCode)
      ) {
        return false;
      }

      /* Stops */

      if (selectedStops.length > 0) {
        const stopKey =
          flight.totalStops === 0
            ? "nonstop"
            : flight.totalStops === 1
              ? "1stop"
              : "2stops";

        if (!selectedStops.includes(stopKey)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      /* PRICE */

      if (sortBy === "price") {
        return a.price - b.price;
      }

      /* DURATION */

      if (sortBy === "duration") {
        const parseDuration = (value) => {
          if (!value) return 0;

          const hourMatch = value.match(/(\d+)h/);

          const minuteMatch = value.match(/(\d+)m/);

          return (
            Number(hourMatch?.[1] || 0) * 60 + Number(minuteMatch?.[1] || 0)
          );
        };

        return parseDuration(a.duration) - parseDuration(b.duration);
      }

      /* DEPARTURE */

      if (sortBy === "dep") {
        return a.dep.time.localeCompare(b.dep.time);
      }

      /* ARRIVAL */

      if (sortBy === "arr") {
        return a.arr.time.localeCompare(b.arr.time);
      }

      return 0;
    });

  /* =========================================================
     CORE SEARCH FUNCTION
     Reads the latest form values synchronously via getValues()
     so it never runs against a stale closure, regardless of
     when/how it's triggered (page change, or right after a
     setValue call inside onSubmit).
  ========================================================= */

  const runFlightSearch = async (page = 1) => {
    try {
      setLoading(true);

      const sessionId = localStorage.getItem("sessionId");

      const values = getValues();

      const isMultiCitySearch =
        values.tripType === "multicity" ||
        values.tripType === "multi-city" ||
        values.tripType === "MultiCity";

      const isRoundTripSearch =
        !isMultiCitySearch &&
        (values.tripType === "round-trip" ||
          values.tripType === "round" ||
          values.tripType === "RoundTrip");

      let destinations = [];

      if (isMultiCitySearch) {
        const validSegments = values.multiCitySegments.filter(
          (segment) =>
            segment?.origin && segment?.destination && segment?.departureDate,
        );

        if (validSegments.length < 2) {
          console.error(
            "Invalid Multi City segments:",
            values.multiCitySegments,
          );

          setApiFlights([]);
          setTotalResults(0);

          return;
        }

        destinations = validSegments.map((segment) => ({
          departureDate: segment.departureDate,

          destination: segment.origin,

          arrival: segment.destination,
        }));
      } else if (isRoundTripSearch) {
        destinations = [
          {
            departureDate: values.depDate,
            destination: values.origin,
            arrival: values.destination,
          },
          {
            departureDate: values.retDate,
            destination: values.destination,
            arrival: values.origin,
          },
        ];
      } else {
        destinations = [
          {
            departureDate: values.depDate,
            destination: values.origin,
            arrival: values.destination,
          },
        ];
      }

      const requestBody = {
        sessionId,

        filter: {
          type: isMultiCitySearch
            ? "MultiCity"
            : isRoundTripSearch
              ? "RoundTrip"
              : "OneWay",

          destinations,

          adult: Number(values.adults),

          ...(Number(values.children) > 0 && {
            child: Number(values.children),
          }),

          ...(Number(values.infants) > 0 && {
            infants: Number(values.infants),
          }),

          preference: values.cabinClass,

          preferenceLevel: "Preferred",
        },

        limit: flightsPerPage,

        page,

        findData: {},

        sortBy: {
          price: "LOW",
        },
      };

      console.log("MULTI CITY SEARCH BODY", requestBody);

      const res = await fligtsData({
        body: requestBody,
      });

      const responseData = res?.data ?? res;

      const searchData = responseData?.newsearch ?? responseData;

      const results = Array.isArray(searchData?.result)
        ? searchData.result
        : [];

      const responseCurrency = searchData?.currency || "USD";

      const mappedFlights = results.map((item, index) =>
        mapFlightResult(
          item,
          index,
          responseCurrency,
          isMultiCitySearch ? values.multiCitySegments : [],
        ),
      );

      setApiFlights(mappedFlights);

      setCurrency(responseCurrency);

      setTotalResults(Number(searchData?.count) || mappedFlights.length);

      if (mappedFlights.length) {
        const highestPrice = Math.max(
          ...mappedFlights.map((flight) => Number(flight.price) || 0),
        );

        setMaxPrice(highestPrice);
      } else {
        setMaxPrice(Number.POSITIVE_INFINITY);
      }
    } catch (error) {
      console.error("Flight API Error:", error);

      setApiFlights([]);

      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD + PAGE CHANGE
  ========================================================= */

  useEffect(() => {
    runFlightSearch(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /* =========================================================
     SEARCH SUBMIT HANDLER
     (react-hook-form's handleSubmit hands us the current,
     validated form values as `data`)
  ========================================================= */

  const onSubmit = (data) => {
    setShowOriginDropdown(false);
    setShowDestinationDropdown(false);
    setShowTravelerDropdown(false);

    setMultiCityDropdown({
      index: null,
      field: null,
      items: [],
    });

    setSelectedAirlines([]);
    setSelectedStops([]);

    const isMultiCitySubmit =
      data.tripType === "multicity" ||
      data.tripType === "multi-city" ||
      data.tripType === "MultiCity";

    const isRoundTripSubmit =
      !isMultiCitySubmit &&
      (data.tripType === "round-trip" ||
        data.tripType === "round" ||
        data.tripType === "RoundTrip");

    const params = new URLSearchParams();

    params.set("tripType", data.tripType);

    if (isMultiCitySubmit) {
      const validSegments = data.multiCitySegments.map((segment) => ({
        ...segment,
        origin: segment.origin || "",
        originName: segment.originName || segment.origin || "",
        destination: segment.destination || "",
        destinationName: segment.destinationName || segment.destination || "",
        departureDate: segment.departureDate || "",
      }));

      setValue("multiCitySegments", validSegments, {
        shouldValidate: true,
      });

      setValue("origin", validSegments[0].origin);

      setValue("originName", validSegments[0].originName);

      setValue("destination", validSegments[0].destination);

      setValue("destinationName", validSegments[0].destinationName);

      setValue("depDate", validSegments[0].departureDate);

      params.set("origin", validSegments[0].origin);

      params.set("originName", validSegments[0].originName);

      params.set("destination", validSegments[0].destination);

      params.set("destinationName", validSegments[0].destinationName);

      params.set("departureDate", validSegments[0].departureDate);

      params.set("segments", JSON.stringify(validSegments));

      sessionStorage.setItem(
        "multiCityFlights",
        JSON.stringify({
          tripType: "multicity",
          segments: validSegments,
          adults: Number(data.adults),
          children: Number(data.children),
          infants: Number(data.infants),
          cabinClass: data.cabinClass,
        }),
      );
    } else {
      sessionStorage.removeItem("multiCityFlights");

      params.set("origin", data.origin);
      params.set("originName", data.originName);

      params.set("destination", data.destination);

      params.set("destinationName", data.destinationName);

      params.set("departureDate", data.depDate);

      if (isRoundTripSubmit && data.retDate) {
        params.set("returnDate", data.retDate);
      }
    }

    params.set("adults", String(data.adults));

    params.set("children", String(data.children));

    params.set("infants", String(data.infants));

    params.set("cabinClass", data.cabinClass);

    setSearchParams(params, {
      replace: true,
    });

    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      runFlightSearch(1);
    }
  };

  /* =========================================================
   PAGINATION
========================================================= */

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);

    // Scroll back to top of results
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <>
      <HeaderInner />

      <header className="search-header">
        <div className="container">
          <div className="search-header-inner">
            <div className="trip-type-row">
              <button
                type="button"
                className={`trip-type-btn ${isRoundTrip ? "active" : ""}`}
                onClick={() => setValue("tripType", "round-trip")}
              >
                Round Trip
              </button>

              <button
                type="button"
                className={`trip-type-btn ${
                  !isRoundTrip && !isMultiCity ? "active" : ""
                }`}
                onClick={() => setValue("tripType", "one-way")}
              >
                One Way
              </button>

              <button
                type="button"
                className={`trip-type-btn ${isMultiCity ? "active" : ""}`}
                onClick={() => setValue("tripType", "multicity")}
              >
                Multi City
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {isMultiCity ? (
                <div className="multi-city-form">
                  {multiCityFields.map((segmentField, index) => (
                    <div className="multi-city-segment" key={segmentField.id}>
                      <div className="multi-city-segment-header">
                        <div className="multi-city-segment-title">
                          Flight {index + 1}
                        </div>

                        {multiCityFields.length > 2 && (
                          <button
                            type="button"
                            className="multi-city-remove"
                            onClick={() => removeMultiCitySegment(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="multi-city-fields">
                        <div
                          className="form-field"
                          style={{
                            position: "relative",
                          }}
                        >
                          <label className="form-label">From</label>

                          <div className="form-input-wrap">
                            <span className="form-input-icon">🛫</span>

                            <Controller
                              control={control}
                              name={`multiCitySegments.${index}.originName`}
                              rules={{
                                required: "Origin is required",
                                validate: () => {
                                  const origin = getValues(
                                    `multiCitySegments.${index}.origin`,
                                  );

                                  return origin
                                    ? true
                                    : "Please select an origin airport";
                                },
                              }}
                              render={({ field }) => (
                                <input
                                  className={`form-input ${
                                    errors.multiCitySegments?.[index]
                                      ?.originName
                                      ? "multi-city-input-error"
                                      : ""
                                  }`}
                                  value={field.value || ""}
                                  placeholder="City or Airport"
                                  onChange={(e) => {
                                    field.onChange(e.target.value);

                                    updateMultiCitySegment(
                                      index,
                                      "originName",
                                      e.target.value,
                                    );

                                    handleMultiCityAirportSearch(
                                      index,
                                      "origin",
                                      e.target.value,
                                    );
                                  }}
                                  onFocus={() =>
                                    handleMultiCityAirportSearch(
                                      index,
                                      "origin",
                                      field.value || "",
                                    )
                                  }
                                />
                              )}
                            />
                          </div>
                          {errors.multiCitySegments?.[index]?.originName && (
                            <span className="multi-city-validation-error">
                              {
                                errors.multiCitySegments[index].originName
                                  .message
                              }
                            </span>
                          )}

                          {multiCityDropdown.index === index &&
                            multiCityDropdown.field === "origin" &&
                            multiCityDropdown.items.length > 0 && (
                              <div className="dropdownFlight multi-city-dropdown">
                                {multiCityDropdown.items.map(
                                  (item, itemIndex) => (
                                    <div
                                      key={itemIndex}
                                      className="dropdown-item"
                                      onClick={() =>
                                        selectMultiCityAirport(
                                          index,
                                          "origin",
                                          item,
                                        )
                                      }
                                    >
                                      <div className="airport-row">
                                        <div>
                                          <div className="city-name">
                                            {item.fullname}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>

                        <div
                          className="form-field"
                          style={{
                            position: "relative",
                          }}
                        >
                          <label className="form-label">To</label>

                          <div className="form-input-wrap">
                            <span className="form-input-icon">🛬</span>

                            <Controller
                              control={control}
                              name={`multiCitySegments.${index}.destinationName`}
                              rules={{
                                required: "Destination is required",
                                validate: () => {
                                  const destination = getValues(
                                    `multiCitySegments.${index}.destination`,
                                  );

                                  return destination
                                    ? true
                                    : "Please select a destination airport";
                                },
                              }}
                              render={({ field }) => (
                                <input
                                  className={`form-input ${
                                    errors.multiCitySegments?.[index]
                                      ?.destinationName
                                      ? "multi-city-input-error"
                                      : ""
                                  }`}
                                  value={field.value || ""}
                                  placeholder="City or Airport"
                                  onChange={(e) => {
                                    field.onChange(e.target.value);

                                    updateMultiCitySegment(
                                      index,
                                      "destinationName",
                                      e.target.value,
                                    );

                                    handleMultiCityAirportSearch(
                                      index,
                                      "destination",
                                      e.target.value,
                                    );
                                  }}
                                  onFocus={() =>
                                    handleMultiCityAirportSearch(
                                      index,
                                      "destination",
                                      field.value || "",
                                    )
                                  }
                                />
                              )}
                            />
                          </div>
                          {errors.multiCitySegments?.[index]
                            ?.destinationName && (
                            <span className="multi-city-validation-error">
                              {
                                errors.multiCitySegments[index].destinationName
                                  .message
                              }
                            </span>
                          )}
                          {multiCityDropdown.index === index &&
                            multiCityDropdown.field === "destination" &&
                            multiCityDropdown.items.length > 0 && (
                              <div className="dropdownFlight multi-city-dropdown">
                                {multiCityDropdown.items.map(
                                  (item, itemIndex) => (
                                    <div
                                      key={itemIndex}
                                      className="dropdown-item"
                                      onClick={() =>
                                        selectMultiCityAirport(
                                          index,
                                          "destination",
                                          item,
                                        )
                                      }
                                    >
                                      <div className="airport-row">
                                        <div>
                                          <div className="city-name">
                                            {item.fullname}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>

                        <div className="form-field">
                          <label className="form-label">Departure</label>

                          <div className="form-input-wrap">
                            <span className="form-input-icon">📅</span>

                            <input
                              type="date"
                              className={`form-input ${
                                errors.multiCitySegments?.[index]?.departureDate
                                  ? "multi-city-input-error"
                                  : ""
                              }`}
                              min={
                                index === 0
                                  ? getToday()
                                  : multiCitySegments?.[index - 1]
                                      ?.departureDate || getToday()
                              }
                              {...register(
                                `multiCitySegments.${index}.departureDate`,
                                {
                                  required: "Departure date is required",

                                  validate: (value) => {
                                    if (!value) {
                                      return "Departure date is required";
                                    }

                                    if (index === 0) {
                                      return true;
                                    }

                                    const previousDate = getValues(
                                      `multiCitySegments.${index - 1}.departureDate`,
                                    );

                                    if (previousDate && value < previousDate) {
                                      return "Date must be on or after previous flight date";
                                    }

                                    return true;
                                  },
                                },
                              )}
                            />
                          </div>
                          {errors.multiCitySegments?.[index]?.departureDate && (
                            <span className="multi-city-validation-error">
                              {
                                errors.multiCitySegments[index].departureDate
                                  .message
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="multi-city-bottom">
                    {multiCityFields.length < 6 && (
                      <button
                        type="button"
                        className="multi-city-add"
                        onClick={addMultiCitySegment}
                      >
                        + Add Another Flight
                      </button>
                    )}

                    <div className="multi-city-route-preview">
                      {(multiCitySegments || []).map((segment, index) => (
                        <span key={`route-${index}`}>
                          {segment.origin || "From"} →{" "}
                          {segment.destination || "To"}
                          {index < multiCitySegments.length - 1 && <b> · </b>}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="multi-city-common-row">
                    <div
                      className="form-field traveler-group"
                      style={{
                        position: "relative",
                      }}
                    >
                      <label className="form-label">Travelers</label>

                      <div
                        className="form-input-wrap"
                        onClick={() => setShowTravelerDropdown((prev) => !prev)}
                      >
                        <span className="form-input-icon">👤</span>

                        <div
                          className="form-input"
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {totalTravelers} Traveler
                          {totalTravelers > 1 ? "s" : ""}
                        </div>
                      </div>

                      {showTravelerDropdown && (
                        <div className="traveler-dropdown">
                          <div className="traveler-row">
                            <div>
                              <h4>Adults</h4>
                              <span>12+ Years</span>
                            </div>

                            <div className="counter">
                              <button
                                type="button"
                                onClick={() => decrementTraveler("adults")}
                              >
                                -
                              </button>

                              <span>{adults}</span>

                              <button
                                type="button"
                                onClick={() => incrementTraveler("adults")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="traveler-row">
                            <div>
                              <h4>Children</h4>
                              <span>2 - 11 Years</span>
                            </div>

                            <div className="counter">
                              <button
                                type="button"
                                onClick={() => decrementTraveler("children")}
                              >
                                -
                              </button>

                              <span>{children}</span>

                              <button
                                type="button"
                                onClick={() => incrementTraveler("children")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="traveler-row">
                            <div>
                              <h4>Infants</h4>
                              <span>Under 2 Years</span>
                            </div>

                            <div className="counter">
                              <button
                                type="button"
                                onClick={() => decrementTraveler("infants")}
                              >
                                -
                              </button>

                              <span>{infants}</span>

                              <button
                                type="button"
                                onClick={() => incrementTraveler("infants")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="done-btn"
                            onClick={() => setShowTravelerDropdown(false)}
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="form-label">Cabin Class</label>

                      <div className="form-input-wrap">
                        <span className="form-input-icon">💼</span>

                        <select
                          className="form-input"
                          {...register("cabinClass")}
                        >
                          <option>Economy</option>

                          <option>Premium</option>

                          <option>Business</option>

                          <option>First Class</option>
                        </select>
                      </div>
                    </div>

                    <button
                      className="search-submit-btn"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Search Flights"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="search-form">
                    <div
                      className="form-field origin-wrap"
                      style={{
                        position: "relative",
                      }}
                    >
                      <label className="form-label">From</label>

                      <div className="form-input-wrap">
                        <span className="form-input-icon">🛫</span>

                        <Controller
                          control={control}
                          name="originName"
                          rules={{
                            required: "Origin is required",
                            validate: () =>
                              getValues("origin")
                                ? true
                                : "Please select an origin airport",
                          }}
                          render={({ field }) => (
                            <input
                              className={`form-input ${
                                errors.originName
                                  ? "flight-validation-input"
                                  : ""
                              }`}
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e.target.value);

                                setValue("origin", "", {
                                  shouldValidate: true,
                                });

                                setOriginAirport(null);
                                setShowOriginDropdown(true);
                              }}
                              onFocus={() => setShowOriginDropdown(true)}
                              placeholder="City or Airport"
                            />
                          )}
                        />
                      </div>
                      {errors.originName && (
                        <span className="flight-validation-error">
                          {errors.originName.message}
                        </span>
                      )}

                      {showOriginDropdown && originDropdown.length > 0 && (
                        <div className="dropdownFlight">
                          {originDropdown.map((item, index) => (
                            <div
                              key={index}
                              className="dropdown-item"
                              onClick={() => {
                                setValue("originName", item.fullname);

                                setOriginAirport(item);

                                setValue(
                                  "origin",
                                  getAirportCode(item.fullname),
                                );

                                setShowOriginDropdown(false);

                                setOriginDropdown([]);
                              }}
                            >
                              <div className="airport-row">
                                <div>
                                  <div className="city-name">
                                    {item.fullname}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className="form-field"
                      style={{
                        position: "relative",
                      }}
                    >
                      <label className="form-label">To</label>

                      <div className="form-input-wrap">
                        <span className="form-input-icon">🛬</span>

                        <Controller
                          control={control}
                          name="destinationName"
                          rules={{
                            required: "Destination is required",
                            validate: () =>
                              getValues("destination")
                                ? true
                                : "Please select a destination airport",
                          }}
                          render={({ field }) => (
                            <input
                              className={`form-input ${
                                errors.destinationName
                                  ? "flight-validation-input"
                                  : ""
                              }`}
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e.target.value);

                                setValue("destination", "", {
                                  shouldValidate: true,
                                });

                                setDestinationAirport(null);
                                setShowDestinationDropdown(true);
                              }}
                              onFocus={() => setShowDestinationDropdown(true)}
                              placeholder="City or Airport"
                            />
                          )}
                        />
                      </div>
                      {errors.destinationName && (
                        <span className="flight-validation-error">
                          {errors.destinationName.message}
                        </span>
                      )}

                      {showDestinationDropdown &&
                        destinationDropdown.length > 0 && (
                          <div className="dropdownFlight">
                            {destinationDropdown.map((item, index) => (
                              <div
                                key={index}
                                className="dropdown-item"
                                onClick={() => {
                                  setValue("destinationName", item.fullname);

                                  setDestinationAirport(item);

                                  setValue(
                                    "destination",
                                    getAirportCode(item.fullname),
                                  );

                                  setShowDestinationDropdown(false);

                                  setDestinationDropdown([]);
                                }}
                              >
                                <div className="airport-row">
                                  <div>
                                    <div className="city-name">
                                      {item.fullname}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="form-field">
                      <label className="form-label">Departure</label>

                      <div className="form-input-wrap">
                        <span className="form-input-icon">📅</span>

                        <input
                          type="date"
                          className={`form-input ${
                            errors.depDate ? "flight-validation-input" : ""
                          }`}
                          min={getToday()}
                          {...register("depDate", {
                            required: "Departure date is required",
                          })}
                        />
                      </div>
                      {errors.depDate && (
                        <span className="flight-validation-error">
                          {errors.depDate.message}
                        </span>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="form-label">Return</label>

                      <div className="form-input-wrap">
                        <span className="form-input-icon">📅</span>

                        <input
                          type="date"
                          className={`form-input ${
                            errors.retDate ? "flight-validation-input" : ""
                          }`}
                          min={depDate || getToday()}
                          disabled={!isRoundTrip}
                          style={{
                            opacity: !isRoundTrip ? 0.4 : 1,
                          }}
                          {...register("retDate", {
                            validate: (value) => {
                              if (!isRoundTrip) {
                                return true;
                              }

                              if (!value) {
                                return "Return date is required";
                              }

                              if (depDate && value < depDate) {
                                return "Return date must be after departure date";
                              }

                              return true;
                            },
                          })}
                        />
                      </div>
                      {errors.retDate && (
                        <span className="flight-validation-error">
                          {errors.retDate.message}
                        </span>
                      )}
                    </div>

                    <div
                      className="form-field traveler-group"
                      style={{
                        position: "relative",
                      }}
                    >
                      <label className="form-label">Travelers</label>

                      <div
                        className="form-input-wrap"
                        onClick={() => setShowTravelerDropdown((prev) => !prev)}
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <span className="form-input-icon">👤</span>

                        <div
                          className="form-input"
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {totalTravelers} Traveler
                          {totalTravelers > 1 ? "s" : ""}
                        </div>
                      </div>

                      {showTravelerDropdown && (
                        <div className="traveler-dropdown">
                          <div className="traveler-row">
                            <div>
                              <h4>Adults</h4>
                              <span>12+ Years</span>
                            </div>

                            <div className="counter">
                              <button
                                type="button"
                                onClick={() => decrementTraveler("adults")}
                              >
                                -
                              </button>

                              <span>{adults}</span>

                              <button
                                type="button"
                                onClick={() => incrementTraveler("adults")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="traveler-row">
                            <div>
                              <h4>Children</h4>
                              <span>2 - 11 Years</span>
                            </div>

                            <div className="counter">
                              <button
                                type="button"
                                onClick={() => decrementTraveler("children")}
                              >
                                -
                              </button>

                              <span>{children}</span>

                              <button
                                type="button"
                                onClick={() => incrementTraveler("children")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="traveler-row">
                            <div>
                              <h4>Infants</h4>
                              <span>Under 2 Years</span>
                            </div>

                            <div className="counter">
                              <button
                                type="button"
                                onClick={() => decrementTraveler("infants")}
                              >
                                -
                              </button>

                              <span>{infants}</span>

                              <button
                                type="button"
                                onClick={() => incrementTraveler("infants")}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="done-btn"
                            onClick={() => setShowTravelerDropdown(false)}
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      className="search-submit-btn"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Search Flights"}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="search-meta-row">
              <div className="meta-pill">
                👤 {adults} Adult
                {Number(adults) > 1 ? "s" : ""}
                {Number(children) > 0 && `, ${children} Child`}
                {Number(infants) > 0 && `, ${infants} Infant`}
              </div>

              {!isMultiCity && (
                <div className="meta-pill">
                  💼
                  <select {...register("cabinClass")}>
                    <option value="Economy">Economy</option>
                    <option value="Premium">Premium</option>
                    <option value="Business">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="page-body">
          <div className="results-summary">
            <div className="results-count">
              Showing <span>{filteredFlights.length}</span> of{" "}
              {totalResults || apiFlights.length} flights &nbsp;·&nbsp;
              {isMultiCity ? (
                (multiCitySegments || [])
                  .map(
                    (segment) =>
                      `${segment.origin || "?"} → ${
                        segment.destination || "?"
                      }`,
                  )
                  .join(" · ")
              ) : (
                <>
                  {origin} → {destination} &nbsp;·&nbsp; {depDate}
                  {isRoundTrip && retDate && ` → ${retDate}`}
                </>
              )}
            </div>

            <div className="sort-row">
              <span className="sort-label">Sort by:</span>

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">Cheapest First</option>

                <option value="duration">Shortest Duration</option>

                <option value="dep">Earliest Departure</option>

                <option value="arr">Earliest Arrival</option>
              </select>
            </div>
          </div>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="filter-sidebar">
            <div className="filter-header">
              <div className="filter-title">
                <span className="filter-title-icon">⚙</span> Filters
              </div>

              <button className="filter-reset" onClick={resetFilters}>
                Reset All
              </button>
            </div>

            {/* Stops */}

            <div className="filter-section">
              <div className="filter-section-title">Stops</div>

              <div className="stop-options">
                {STOP_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={`stop-option ${
                      selectedStops.includes(option.id) ? "selected" : ""
                    }`}
                    onClick={() => toggleStop(option.id)}
                  >
                    <div className="stop-option-left">
                      <div className="stop-checkbox">
                        {selectedStops.includes(option.id) ? "✓" : ""}
                      </div>

                      <span className="stop-label">{option.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Airlines</div>

              <div className="airline-options">
                {airlineFilterList.map((airline) => (
                  <label className="airline-option" key={airline.code}>
                    <input
                      type="checkbox"
                      checked={selectedAirlines.includes(airline.code)}
                      onChange={() => toggleAirline(airline.code)}
                    />

                    <AirlineLogo code={airline.code} />

                    <div className="airline-info">
                      <div className="airline-name">{airline.name}</div>

                      <div className="airline-from">
                        from {formatMoney(airline.fromPrice, currency)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="flight-list">
            {/* Loading */}

            {loading && (
              <div className="no-flights">
                <div className="no-flights-icon">✈️</div>

                <div className="no-flights-title">Loading flights...</div>

                <div className="no-flights-sub">
                  Please wait while we fetch the latest flight results.
                </div>
              </div>
            )}

            {/* No Results */}

            {!loading && filteredFlights.length === 0 && (
              <div className="no-flights">
                <div className="no-flights-icon">✈️</div>

                <div className="no-flights-title">
                  No flights match your filters
                </div>

                <div className="no-flights-sub">
                  Try adjusting your stop or airline filters.
                </div>
              </div>
            )}

            {/* ALL API FLIGHTS */}

            {!loading &&
              filteredFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            {!loading && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}
                >
                  ← Previous
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        className={`pagination-page ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
