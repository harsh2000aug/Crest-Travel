import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import DatePicker from "react-datepicker";
import L from "leaflet";
import {
  FaBath,
  FaBed,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaImages,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegCalendarCheck,
  FaRegStar,
  FaStar,
  FaTimes,
  FaUtensils,
  FaUsers,
} from "react-icons/fa";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import VacationLoader from "../../../reuseable-components/VacationLoader/VacationLoader";
import {
  resortAvailability,
  resortDetails,
} from "../../../store/Services/AllApi";
import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";
import "./VacationDetail.css";
import VacationFinalLoader from "../../../reuseable-components/VacationFinalLoader/VacationFinalLoader";

const resortMarkerIcon = L.divIcon({
  className: "vacationDetail__mapIcon",
  html: "<span><i></i></span>",
  iconSize: [32, 42],
  iconAnchor: [16, 40],
});

const calculateWeeks = (checkInDate, checkOutDate) => {
  const createUtcDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return Date.UTC(year, month - 1, day);
  };

  const start = createUtcDate(checkInDate);
  const end = createUtcDate(checkOutDate);

  if (start === null || end === null || end <= start) {
    return 1;
  }

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  return Math.max(1, Math.ceil(days / 7));
};

const formatTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

const normalizeImageUrl = (url) => {
  return url?.replace(/^http:\/\//i, "https://") || "";
};

const MAX_SELECTION_DAYS = 7;

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

const calendarStyles = {
  trigger: {
    width: "100%",
    minHeight: "46px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #d6d6d6",
    borderRadius: "6px",
    background: "#fff",
    color: "#222",
    fontSize: "14px",
    textAlign: "left",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 3000,
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.42)",
  },
  dialog: {
    width: "min(680px, calc(100vw - 24px))",
    maxHeight: "calc(100vh - 24px)",
    overflowY: "auto",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.28)",
  },
  summary: {
    padding: "14px 18px 10px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "end",
    gap: "18px",
  },
  summaryItem: {
    minWidth: 0,
    paddingBottom: "7px",
    borderBottom: "2px solid #c79c4b",
  },
  summaryLabel: {
    display: "block",
    marginBottom: "4px",
    color: "#777",
    fontSize: "11px",
  },
  summaryValue: {
    display: "block",
    overflow: "hidden",
    color: "#222",
    fontSize: "14px",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  arrow: {
    paddingBottom: "10px",
    color: "#59636b",
    fontSize: "25px",
  },
  calendarBody: {
    padding: "0 12px",
    display: "flex",
    justifyContent: "center",
    overflowX: "auto",
  },
  information: {
    margin: "8px 12px 0",
    padding: "9px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #73b9f4",
    borderRadius: "7px",
    background: "#e9f5ff",
    color: "#2e6caa",
    fontSize: "12px",
  },
  footer: {
    padding: "18px 14px",
    display: "flex",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "8px 10px",
    border: 0,
    background: "transparent",
    color: "#31aecd",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

const startOfDay = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseAvailabilityDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  const dayMonthYearMatch = String(value).match(
    /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/,
  );

  if (dayMonthYearMatch) {
    const [, day, monthName, year] = dayMonthYearMatch;
    const normalizedMonthName =
      monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
    const month = monthIndexes[normalizedMonthName];

    if (month !== undefined) {
      return new Date(Number(year), month, Number(day));
    }
  }

  const yearMonthDayMatch = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (yearMonthDayMatch) {
    const [, year, month, day] = yearMonthDayMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : startOfDay(parsedDate);
};

const addDays = (date, numberOfDays) => {
  const nextDate = startOfDay(date);
  nextDate.setDate(nextDate.getDate() + numberOfDays);
  return nextDate;
};

const getCalendarDayNumber = (date) => {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

const getNumberOfNights = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 0;
  }

  return Math.round(
    (getCalendarDayNumber(endDate) - getCalendarDayNumber(startDate)) /
      (1000 * 60 * 60 * 24),
  );
};

const formatShortDate = (date) => {
  if (!date) {
    return "Select date";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const formatFullDate = (date) => {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAvailableStartDates = (units) => {
  const datesByDay = new Map();

  units.forEach((unit) => {
    const startDate = parseAvailabilityDate(unit.checkInDate);
    const endDate = parseAvailabilityDate(unit.checkOutDate);

    if (!startDate || !endDate || endDate < startDate) {
      return;
    }

    for (
      let currentDate = startDate;
      currentDate <= endDate;
      currentDate = addDays(currentDate, 1)
    ) {
      datesByDay.set(getCalendarDayNumber(currentDate), currentDate);
    }
  });

  return [...datesByDay.values()].sort((firstDate, secondDate) => {
    return firstDate - secondDate;
  });
};

const formatNearestAirport = (airport) => {
  if (!airport) {
    return "";
  }

  if (typeof airport === "string") {
    return airport;
  }

  const airportName = airport.airportName || airport.code || "Airport";
  const airportCode =
    airport.airportName && airport.code ? ` (${airport.code})` : "";

  if (airport.distanceKMS !== null && airport.distanceKMS !== undefined) {
    return `${airportName}${airportCode} - ${airport.distanceKMS} km away`;
  }

  if (airport.distanceMiles !== null && airport.distanceMiles !== undefined) {
    return `${airportName}${airportCode} - ${airport.distanceMiles} miles away`;
  }

  return `${airportName}${airportCode}`;
};

const getUnits = (availabilityGroup) => {
  return (availabilityGroup?.unitRow || []).flatMap((row) => row?.unit || []);
};

const ResortRating = ({ rating }) => {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <span
      className="vacationDetail__rating"
      aria-label={`${normalizedRating} stars`}
    >
      {Array.from({ length: 5 }, (_, index) =>
        index < normalizedRating ? (
          <FaStar key={index} />
        ) : (
          <FaRegStar key={index} />
        ),
      )}
    </span>
  );
};

const VacationDetail = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDateRanges, setSelectedDateRanges] = useState({});
  const [openCalendarIndex, setOpenCalendarIndex] = useState(null);
  const [activeSection, setActiveSection] = useState("availability");
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [detailsError, setDetailsError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const navigate = useNavigate();

  const resortId = searchParams.get("resortId") || "";
  const checkInDate = searchParams.get("checkInDate") || "";
  const checkOutDate = searchParams.get("checkOutDate") || "";

  const weeks = useMemo(
    () => calculateWeeks(checkInDate, checkOutDate),
    [checkInDate, checkOutDate],
  );

  const fetchVacationData = useCallback(async () => {
    const response = await resortAvailability({
      body: {
        resortId,
        checkInDate,
        checkOutDate,
      },
    });

    return (
      response?.data?.availability?.result ||
      response?.data?.data?.availability?.result ||
      []
    );
  }, [resortId, checkInDate, checkOutDate, weeks]);

  useEffect(() => {
    let ignoreResponse = false;

    const loadVacationDetails = async () => {
      setLoading(true);
      setDetails(null);
      setAvailability([]);
      setSelectedDateRanges({});
      setOpenCalendarIndex(null);
      setDetailsError("");
      setAvailabilityError("");

      if (!resortId || !checkInDate || !checkOutDate) {
        setDetailsError(
          "The resort ID, check-in date, and check-out date are required.",
        );
        setLoading(false);
        return;
      }

      try {
        const detailsResponse = await resortDetails({
          body: {
            resortId,
          },
        });

        if (ignoreResponse) {
          return;
        }

        const detailsResult =
          detailsResponse?.data?.details?.result ||
          detailsResponse?.data?.data?.details?.result;

        if (!detailsResult) {
          throw new Error("Resort details were not returned.");
        }

        setDetails(detailsResult);

        try {
          const availabilityResult = await fetchVacationData();

          if (!ignoreResponse) {
            setAvailability(availabilityResult);
          }
        } catch (error) {
          if (!ignoreResponse) {
            setAvailabilityError(
              error?.response?.data?.message ||
                "Unable to load available vacation dates.",
            );
          }
        }
      } catch (error) {
        if (!ignoreResponse) {
          setDetailsError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load resort details.",
          );
        }
      } finally {
        if (!ignoreResponse) {
          setLoading(false);
        }
      }
    };

    loadVacationDetails();

    return () => {
      ignoreResponse = true;
    };
  }, [resortId, checkInDate, checkOutDate, fetchVacationData]);
  const images = useMemo(() => {
    const largeImages = details?.images?.largeImages || [];
    const smallImages = details?.images?.smallImages || [];
    const sourceImages = largeImages.length > 0 ? largeImages : smallImages;

    return [...new Set(sourceImages.filter(Boolean).map(normalizeImageUrl))];
  }, [details]);

  const closePhotoCarousel = useCallback(() => {
    setShowAllPhotos(false);
  }, []);

  const openPhotoCarousel = useCallback((index = 0) => {
    setActivePhotoIndex(index);
    setShowAllPhotos(true);
  }, []);

  const showPreviousPhoto = useCallback(() => {
    setActivePhotoIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  }, [images.length]);

  const showNextPhoto = useCallback(() => {
    setActivePhotoIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  }, [images.length]);

  useEffect(() => {
    if (!showAllPhotos) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePhotoCarousel();
      }

      if (event.key === "ArrowLeft") {
        showPreviousPhoto();
      }

      if (event.key === "ArrowRight") {
        showNextPhoto();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAllPhotos, closePhotoCarousel, showPreviousPhoto, showNextPhoto]);

  useEffect(() => {
    if (openCalendarIndex === null) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenCalendarIndex(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openCalendarIndex]);

  const address = useMemo(() => {
    if (!details) {
      return "";
    }

    return [
      details.addressLine1,
      details.addressLine2,
      details.city,
      details.state,
      details.country,
      details.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  }, [details]);

  const nearestAirportLabel = useMemo(
    () => formatNearestAirport(details?.nearestAirport),
    [details?.nearestAirport],
  );

  const latitude = Number(details?.latitude);
  const longitude = Number(details?.longitude);
  const hasMapLocation =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDateRangeChange = (groupIndex, dates) => {
    const [startDate, endDate] = dates;
    const normalizedStartDate = startDate ? startOfDay(startDate) : null;
    let normalizedEndDate = endDate ? startOfDay(endDate) : null;

    if (
      normalizedStartDate &&
      normalizedEndDate &&
      getNumberOfNights(normalizedStartDate, normalizedEndDate) >
        MAX_SELECTION_DAYS
    ) {
      normalizedEndDate = addDays(normalizedStartDate, MAX_SELECTION_DAYS);
    }

    setSelectedDateRanges((current) => ({
      ...current,
      [groupIndex]: [normalizedStartDate, normalizedEndDate],
    }));

    if (normalizedStartDate && normalizedEndDate) {
      setOpenCalendarIndex(null);
    }
  };

  const handleCalendarCancel = (groupIndex) => {
    setSelectedDateRanges((current) => {
      const selectedRange = current[groupIndex];

      if (!selectedRange?.[0] || selectedRange?.[1]) {
        return current;
      }

      const nextRanges = { ...current };
      delete nextRanges[groupIndex];
      return nextRanges;
    });

    setOpenCalendarIndex(null);
  };
  const formatBookingDate = (date) => {
    if (!date) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleBookNow = ({
    group,
    displayedUnit,
    selectedStartDate,
    selectedEndDate,
  }) => {
    if (!selectedStartDate || !selectedEndDate) {
      return;
    }

    if (!displayedUnit) {
      return;
    }

    const orderPrice = displayedUnit?.orderPrice || {};

    const bookingData = {
      startDate: formatBookingDate(selectedStartDate),
      endDate: formatBookingDate(selectedEndDate),
      startTime: formatTime(details?.checkinTime),
      endTime: formatTime(details?.checkoutTime),

      roomType: `${group?.title}, Max Occupancy: ${displayedUnit.maxOccupancy}`,

      property: {
        id: details?.resortId || details?.id || resortId,
        image: images[0] || "",
        name: details?.resortName || "",
        addressLine1: details?.addressLine1 || "",
        addressLine2: details?.addressLine2 || "",
        city: details?.city || "",
        state: details?.state || "",
        country: details?.country || "",
        postalCode: details?.postalCode || "",
        latitude: Number(details?.latitude) || 0,
        longitude: Number(details?.longitude) || 0,
        phone: details?.phone || "",
        email: details?.email || "",
      },

      price: {
        currency: orderPrice?.currency || "USD",
        rate: Number(orderPrice?.rate ?? 1),
        ourPrice: Number(orderPrice?.ourPrice ?? 0),
        payable: Number(orderPrice?.payable ?? orderPrice?.ourPrice ?? 0),
      },

      starRating: String(details?.rating || ""),
    };

    sessionStorage.setItem("vacationBookingData", JSON.stringify(bookingData));

    navigate("/vacation-billing");
  };
  if (!loading && detailsError && !details) {
    return (
      <div className="vacationDetailPage">
        <HeaderInner />
        <main className="vacationDetail vacationDetail--message">
          <div className="vacationDetail__error">{detailsError}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="vacationDetailPage">
      <HeaderInner />
      {loading && <VacationFinalLoader />}

      {details && (
        <main className="vacationDetail">
          <section className="vacationDetail__hero">
            <div className="vacationDetail__titleBar">
              <div>
                <div className="vacationDetail__titleRow">
                  <h1>{details.resortName}</h1>
                  <ResortRating rating={details.rating} />
                </div>

                <p>
                  {[details.city, details.state, details.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              {details.phone && (
                <a
                  href={`tel:${details.phone}`}
                  className="vacationDetail__phone"
                >
                  <FaPhoneAlt />
                  {details.phone}
                </a>
              )}
            </div>

            <div className="vacationDetail__gallery">
              <div className="vacationDetail__galleryMain">
                {images[0] ? (
                  <img src={images[0]} alt={details.resortName} />
                ) : (
                  <div className="vacationDetail__imageFallback">
                    <FaImages />
                    <span>No resort image</span>
                  </div>
                )}
              </div>

              <div className="vacationDetail__galleryGrid">
                {Array.from({ length: 6 }, (_, index) => {
                  const image = images[index + 1];

                  return image ? (
                    <img
                      key={image}
                      src={image}
                      alt={`${details.resortName} ${index + 2}`}
                    />
                  ) : (
                    <div
                      key={`image-placeholder-${index}`}
                      className="vacationDetail__imageFallback vacationDetail__imageFallback--small"
                    >
                      <FaImages />
                    </div>
                  );
                })}
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  className="vacationDetail__allPhotos"
                  onClick={() => openPhotoCarousel(0)}
                >
                  <FaImages />
                  See all {images.length} photos
                </button>
              )}
            </div>

            <div className="vacationDetail__summary">
              <p>
                {details.description || "No resort description is available."}
              </p>

              <div className="vacationDetail__policies">
                <span>
                  <FaClock />
                  Check-in <strong>{formatTime(details.checkinTime)}</strong>
                </span>

                <span>
                  <FaClock />
                  Check-out <strong>{formatTime(details.checkoutTime)}</strong>
                </span>

                <span
                  className={`vacationDetail__refundStatus ${
                    details.refundable
                      ? "vacationDetail__refundStatus--refundable"
                      : ""
                  }`}
                >
                  {details.refundable ? "Refundable" : "Non-refundable"}
                </span>
              </div>
            </div>
          </section>

          <nav className="vacationDetail__tabs" aria-label="Resort information">
            <button
              type="button"
              className={activeSection === "availability" ? "active" : ""}
              onClick={() => handleSectionClick("availability")}
            >
              <FaRegCalendarCheck />
              Availability
            </button>

            <button
              type="button"
              className={activeSection === "additional-charges" ? "active" : ""}
              onClick={() => handleSectionClick("additional-charges")}
            >
              <FaCalendarAlt />
              Additional Charges
            </button>

            <button
              type="button"
              className={activeSection === "amenities" ? "active" : ""}
              onClick={() => handleSectionClick("amenities")}
            >
              <FaCheckCircle />
              Amenities
            </button>

            <button
              type="button"
              className={activeSection === "location" ? "active" : ""}
              onClick={() => handleSectionClick("location")}
            >
              <FaMapMarkerAlt />
              Location
            </button>
          </nav>

          <section id="availability" className="vacationDetail__section">
            <div className="vacationDetail__sectionHeading">
              <h2>Availability</h2>
              <span>Maximum 7 nights</span>
            </div>

            {availabilityError && (
              <div className="vacationDetail__error">{availabilityError}</div>
            )}

            {!availabilityError && availability.length === 0 && !loading && (
              <div className="vacationDetail__empty">
                No available dates were returned for this resort.
              </div>
            )}

            <div className="vacationDetail__availabilityList">
              {availability.map((group, groupIndex) => {
                const units = getUnits(group);
                const availableStartDates = getAvailableStartDates(units);
                const firstAvailableDate = availableStartDates[0] || null;
                const lastAvailableDate =
                  availableStartDates[availableStartDates.length - 1] || null;
                const selectedRange = selectedDateRanges[groupIndex] || [
                  null,
                  null,
                ];
                const [selectedStartDate, selectedEndDate] = selectedRange;
                const selectingCheckout =
                  Boolean(selectedStartDate) && !selectedEndDate;
                const maximumCheckoutDate = selectedStartDate
                  ? addDays(selectedStartDate, MAX_SELECTION_DAYS)
                  : null;
                const calendarMinimumDate = selectingCheckout
                  ? selectedStartDate
                  : firstAvailableDate;
                const calendarMaximumDate = selectingCheckout
                  ? maximumCheckoutDate
                  : lastAvailableDate;
                const selectedUnit = units.find((unit) => {
                  if (!selectedStartDate) {
                    return false;
                  }

                  const unitStartDate = parseAvailabilityDate(unit.checkInDate);
                  const unitEndDate = parseAvailabilityDate(unit.checkOutDate);

                  return (
                    unitStartDate &&
                    unitEndDate &&
                    selectedStartDate >= unitStartDate &&
                    selectedStartDate <= unitEndDate
                  );
                });
                const displayedUnit = selectedUnit || units[0];
                const selectedNights = getNumberOfNights(
                  selectedStartDate,
                  selectedEndDate,
                );
                const price = Number(displayedUnit?.orderPrice?.ourPrice || 0);
                const currency = displayedUnit?.orderPrice?.currency || "USD";
                const formattedPrice = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                  maximumFractionDigits: 2,
                }).format(price);

                return (
                  <article
                    className="vacationDetail__availabilityCard"
                    key={`${group.title}-${groupIndex}`}
                  >
                    <div className="vacationDetail__unitDetails">
                      <h3>{group.title}</h3>

                      {displayedUnit && (
                        <div className="vacationDetail__unitPrice">
                          <span>
                            Total <strong>{formattedPrice}</strong>
                          </span>

                          <small>
                            for {selectedNights || displayedUnit.numberOfNights}{" "}
                            nights, including taxes and fees
                          </small>

                          {selectedStartDate && selectedEndDate && (
                            <button
                              type="button"
                              className="vacationDetail__confirmedBookingButton"
                              onClick={() =>
                                handleBookNow({
                                  group,
                                  displayedUnit,
                                  selectedStartDate,
                                  selectedEndDate,
                                })
                              }
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="vacationDetail__datePriceBox">
                      <div className="vacationDetail__dateSelect">
                        <label>Available dates ({units.length})</label>

                        <button
                          type="button"
                          style={calendarStyles.trigger}
                          onClick={() => setOpenCalendarIndex(groupIndex)}
                          disabled={availableStartDates.length === 0}
                        >
                          <FaCalendarAlt />
                          {selectedStartDate ? (
                            <span>
                              {formatFullDate(selectedStartDate)}
                              {selectedEndDate
                                ? ` - ${formatFullDate(selectedEndDate)}`
                                : " - Select checkout"}
                            </span>
                          ) : (
                            <span>Select date</span>
                          )}
                        </button>

                        {openCalendarIndex === groupIndex && (
                          <div
                            style={calendarStyles.overlay}
                            role="presentation"
                            onClick={() => handleCalendarCancel(groupIndex)}
                          >
                            <div
                              style={calendarStyles.dialog}
                              role="dialog"
                              aria-modal="true"
                              aria-label="Select vacation dates"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div style={calendarStyles.summary}>
                                <div style={calendarStyles.summaryItem}>
                                  <span style={calendarStyles.summaryLabel}>
                                    Check-in
                                  </span>
                                  <strong style={calendarStyles.summaryValue}>
                                    {formatShortDate(selectedStartDate)}
                                  </strong>
                                </div>

                                <span style={calendarStyles.arrow}>→</span>

                                <div style={calendarStyles.summaryItem}>
                                  <span style={calendarStyles.summaryLabel}>
                                    Check-out
                                  </span>
                                  <strong style={calendarStyles.summaryValue}>
                                    {formatShortDate(selectedEndDate)}
                                  </strong>
                                </div>
                              </div>

                              <div style={calendarStyles.calendarBody}>
                                <DatePicker
                                  selected={selectedStartDate}
                                  startDate={selectedStartDate}
                                  endDate={selectedEndDate}
                                  onChange={(dates) =>
                                    handleDateRangeChange(groupIndex, dates)
                                  }
                                  selectsRange
                                  inline
                                  monthsShown={2}
                                  minDate={calendarMinimumDate}
                                  maxDate={calendarMaximumDate}
                                  includeDates={
                                    selectingCheckout
                                      ? undefined
                                      : availableStartDates
                                  }
                                  openToDate={
                                    selectedStartDate || firstAvailableDate
                                  }
                                  calendarStartDay={1}
                                />
                              </div>

                              <div style={calendarStyles.information}>
                                <FaInfoCircle />
                                {selectingCheckout ? (
                                  <span>
                                    Please select checkout from{" "}
                                    {formatFullDate(selectedStartDate)} to{" "}
                                    {formatFullDate(maximumCheckoutDate)}.
                                  </span>
                                ) : (
                                  <span>
                                    Select a check-in date. Checkout can be any
                                    date within the next 7 days.
                                  </span>
                                )}
                              </div>

                              <div style={calendarStyles.footer}>
                                <button
                                  type="button"
                                  style={calendarStyles.cancelButton}
                                  onClick={() =>
                                    handleCalendarCancel(groupIndex)
                                  }
                                >
                                  CANCEL
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {displayedUnit && (
                        <div className="vacationDetail__unitPrice">
                          <span>
                            Total <strong>{formattedPrice}</strong>
                          </span>

                          <small>
                            for {selectedNights || displayedUnit.numberOfNights}{" "}
                            nights, including taxes and fees
                          </small>
                        </div>
                      )}
                    </div>

                    {selectedStartDate && selectedEndDate && (
                      <div className="vacationDetail__selectedDate">
                        <FaCalendarAlt />
                        Selected: {formatFullDate(selectedStartDate)} to{" "}
                        {formatFullDate(selectedEndDate)} ({selectedNights}{" "}
                        {selectedNights === 1 ? "night" : "nights"})
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section id="additional-charges" className="vacationDetail__section">
            <h2>Additional Charges</h2>

            {details.additionalCharges?.length > 0 ? (
              <ul className="vacationDetail__charges">
                {details.additionalCharges.map((charge, index) => (
                  <li key={`${index}-${charge.slice(0, 30)}`}>{charge}</li>
                ))}
              </ul>
            ) : (
              <div className="vacationDetail__empty">
                No additional charges were provided.
              </div>
            )}
          </section>

          <section id="amenities" className="vacationDetail__section">
            <h2>Amenities</h2>

            {details.amenities?.length > 0 ? (
              <div className="vacationDetail__amenities">
                {details.amenities.map((amenity) => (
                  <span key={amenity}>
                    <FaCheckCircle />
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <div className="vacationDetail__empty">
                No amenities were provided.
              </div>
            )}
          </section>

          <section id="location" className="vacationDetail__section">
            <h2>Location</h2>

            <div className="vacationDetail__location">
              <div className="vacationDetail__map">
                {hasMapLocation ? (
                  <MapContainer
                    key={`${latitude}-${longitude}`}
                    center={[latitude, longitude]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="vacationDetail__mapContainer"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker
                      position={[latitude, longitude]}
                      icon={resortMarkerIcon}
                    />
                  </MapContainer>
                ) : (
                  <div className="vacationDetail__imageFallback">
                    <FaMapMarkerAlt />
                    <span>Map location unavailable</span>
                  </div>
                )}
              </div>

              <div className="vacationDetail__address">
                <FaMapMarkerAlt />

                <div>
                  <h3>Address</h3>
                  <p>{address || "Address unavailable"}</p>

                  {nearestAirportLabel && (
                    <p>
                      <strong>Nearest airport:</strong> {nearestAirportLabel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {showAllPhotos && images.length > 0 && (
        <div
          className="vacationDetail__photoModal"
          role="dialog"
          aria-modal="true"
          aria-label={`${details?.resortName} photo carousel`}
          onClick={closePhotoCarousel}
        >
          <div
            className="vacationDetail__photoModalContent"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vacationDetail__photoModalHeader">
              <h2>{details?.resortName}</h2>

              <span className="vacationDetail__photoCounter">
                {activePhotoIndex + 1} / {images.length}
              </span>

              <button
                type="button"
                className="vacationDetail__photoClose"
                aria-label="Close photos"
                onClick={closePhotoCarousel}
              >
                <FaTimes />
              </button>
            </div>

            <div className="vacationDetail__carousel">
              <button
                type="button"
                className="vacationDetail__carouselButton vacationDetail__carouselButton--previous"
                aria-label="View previous photo"
                onClick={showPreviousPhoto}
              >
                <FaChevronLeft />
              </button>

              <div className="vacationDetail__carouselImageWrapper">
                <img
                  src={images[activePhotoIndex]}
                  alt={`${details?.resortName} ${activePhotoIndex + 1}`}
                />
              </div>

              <button
                type="button"
                className="vacationDetail__carouselButton vacationDetail__carouselButton--next"
                aria-label="View next photo"
                onClick={showNextPhoto}
              >
                <FaChevronRight />
              </button>
            </div>

            <div
              className="vacationDetail__carouselThumbnails"
              aria-label="Choose a resort photo"
            >
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  className={
                    activePhotoIndex === index
                      ? "vacationDetail__carouselThumbnail vacationDetail__carouselThumbnail--active"
                      : "vacationDetail__carouselThumbnail"
                  }
                  aria-label={`View photo ${index + 1}`}
                  aria-current={activePhotoIndex === index ? "true" : undefined}
                  onClick={() => setActivePhotoIndex(index)}
                >
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VacationDetail;
