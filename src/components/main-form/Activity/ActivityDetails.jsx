import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import {
  activityCalendar,
  activityCalendarAvail,
  activityDetail,
  activityReviews,
} from "../../../store/Services/AllApi";
import "./Activity.css";
import Calendar from "react-calendar";

const ActivityDetails = () => {
  const [searchParams] = useSearchParams();

  const [activityData, setActivityData] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("availability");
  const [selectedTimes, setSelectedTimes] = useState({});
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [calendarAvailabilityData, setCalendarAvailabilityData] =
    useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [participants, setParticipants] = useState({
    adult: 2,
    youth: 0,
    child: 0,
    infant: 0,
  });

  const [appliedParticipants, setAppliedParticipants] = useState({
    adult: 2,
    youth: 0,
    child: 0,
    infant: 0,
  });

  const timeOptions = [
    "8:15 AM",
    "9:00 AM",
    "10:00 AM",
    "11:30 AM",
    "12:30 PM",
    "2:00 PM",
    "3:30 PM",
    "5:00 PM",
  ];
  const participantsRef = useRef(null);
  const activityCode = searchParams.get("activityCode") || "";
  const activityTitle = searchParams.get("activityTitle") || "";
  const destination = searchParams.get("destination") || "";
  const destinationId = searchParams.get("destinationId") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";
  const activityImage = searchParams.get("activityImage") || "";
  const fromPrice = Number(searchParams.get("fromPrice") || 0);
  const originalPrice = Number(searchParams.get("originalPrice") || 0);
  const ourPrice = Number(searchParams.get("ourPrice") || 0);
  const activityCurrency = searchParams.get("activityCurrency") || "USD";
  const activityRating = Number(searchParams.get("activityRating") || 0);
  const activityReviewCount = Number(
    searchParams.get("activityReviewCount") || 0,
  );
  const activityDuration = searchParams.get("activityDuration") || "";
  const freeCancellation = searchParams.get("freeCancellation") === "true";
  const [selectedDate, setSelectedDate] = useState(fromDate || "");
  const [calendarData, setCalendarData] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  //   useEffect(() => {
  //     const showDetailedActivity = async () => {
  //       if (!activityCode) {
  //         setError("Activity code is missing.");
  //         setLoading(false);
  //         return;
  //       }

  //       try {
  //         setLoading(true);
  //         setError("");

  //         const response = await activityDetail({
  //           body: {
  //             activityCode,
  //             startDate: fromDate,
  //           },
  //         });

  //         const result = response?.data?.details?.result;

  //         if (result) {
  //           setActivityData(result);
  //         } else {
  //           setError("Activity details not found.");
  //         }
  //       } catch (err) {
  //         console.error(err);
  //         setError("Unable to load activity details.");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     showDetailedActivity();
  //   }, [activityCode, fromDate]);

  //   useEffect(() => {
  //     const getReviews = async () => {
  //       if (!activityCode) {
  //         setReviewsLoading(false);
  //         return;
  //       }

  //       try {
  //         setReviewsLoading(true);

  //         const response = await activityReviews({
  //           body: {
  //             activityCode,
  //             count: 10,
  //             page: 1,
  //             ratings: [1, 2, 3, 4, 5],
  //           },
  //         });

  //         const result = response?.data?.reviews?.result;

  //         if (result) {
  //           setReviewsData(result);
  //         }
  //       } catch (err) {
  //         console.error(err);
  //       } finally {
  //         setReviewsLoading(false);
  //       }
  //     };

  //     getReviews();
  //   }, [activityCode]);

  //   useEffect(() => {
  //     const handleOutsideClick = (event) => {
  //       if (
  //         participantsRef.current &&
  //         !participantsRef.current.contains(event.target)
  //       ) {
  //         setParticipantsOpen(false);
  //       }
  //     };

  //     document.addEventListener("click", handleOutsideClick);

  //     return () => {
  //       document.removeEventListener("click", handleOutsideClick);
  //     };
  //   }, []);

  //   useEffect(() => {
  //     const calendarDetails = async () => {
  //       if (!activityCode) return;

  //       try {
  //         setCalendarLoading(true);

  //         const res = await activityCalendar({
  //           body: {
  //             activityCode,
  //           },
  //         });

  //         const availableDates =
  //           res?.data?.calender?.result?.availableDates || [];

  //         setCalendarData(availableDates);

  //         if (availableDates.length > 0) {
  //           const firstAvailableDate = availableDates[0].date;

  //           setSelectedDate((currentDate) => {
  //             const currentExists = availableDates.some(
  //               (item) => item.date === currentDate,
  //             );

  //             return currentExists ? currentDate : firstAvailableDate;
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Activity calendar error:", error);
  //         setCalendarData([]);
  //       } finally {
  //         setCalendarLoading(false);
  //       }
  //     };

  //     calendarDetails();
  //   }, [activityCode]);

  //   useEffect(() => {
  //     const handleCutomers = async () => {
  //       try {
  //         const res = await activityCalendarAvail({
  //           body: {
  //             activityCode,
  //             travelDate: fromDate,
  //           },
  //         });
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     };
  //     handleCutomers();
  //   }, []);

  useEffect(() => {
    if (!activityCode) {
      setError("Activity code is missing.");
      setLoading(false);
      setReviewsLoading(false);
      return;
    }

    const loadActivityData = async () => {
      setLoading(true);
      setReviewsLoading(true);
      setCalendarLoading(true);
      setError("");

      try {
        const [activityResponse, reviewsResponse, calendarResponse] =
          await Promise.all([
            activityDetail({
              body: {
                activityCode,
                startDate: fromDate,
              },
            }),

            activityReviews({
              body: {
                activityCode,
                count: 10,
                page: 1,
                ratings: [1, 2, 3, 4, 5],
              },
            }),

            activityCalendar({
              body: {
                activityCode,
              },
            }),
          ]);

        const activityResult = activityResponse?.data?.details?.result;

        const reviewsResult = reviewsResponse?.data?.reviews?.result;

        const availableDates =
          calendarResponse?.data?.calender?.result?.availableDates || [];

        if (activityResult) {
          setActivityData(activityResult);
        } else {
          setError("Activity details not found.");
        }

        if (reviewsResult) {
          setReviewsData(reviewsResult);
        }

        setCalendarData(availableDates);

        if (availableDates.length > 0) {
          const firstAvailableDate = availableDates[0].date;

          setSelectedDate((currentDate) => {
            const currentExists = availableDates.some(
              (item) => item.date === currentDate,
            );

            return currentExists ? currentDate : firstAvailableDate;
          });
        }
      } catch (error) {
        console.error("Activity API error:", error);
        setError("Unable to load activity data.");
        setCalendarData([]);
      } finally {
        setLoading(false);
        setReviewsLoading(false);
        setCalendarLoading(false);
      }
    };

    loadActivityData();
  }, [activityCode, fromDate]);

  const handleUpdateSearch = async () => {
    console.log("Update search clicked");
    console.log("activityCode:", activityCode);
    console.log("selectedDate:", selectedDate);
    console.log("appliedParticipants:", appliedParticipants);

    if (!activityCode) {
      console.error("Activity code is missing");
      return;
    }

    if (!selectedDate) {
      console.error("Selected date is missing");
      return;
    }

    try {
      setAvailabilityLoading(true);

      const ageBands = [
        {
          ageBand: "SENIOR",
          numberOfTravelers: 0,
        },
        {
          ageBand: "ADULT",
          numberOfTravelers: Number(appliedParticipants.adult) || 0,
        },
        {
          ageBand: "CHILD",
          numberOfTravelers:
            (Number(appliedParticipants.youth) || 0) +
            (Number(appliedParticipants.child) || 0),
        },
      ];

      const requestBody = {
        activityCode,
        travelDate: selectedDate,
        ageBands,
      };

      console.log("activityCalendarAvail request:", requestBody);

      const response = await activityCalendarAvail({
        body: requestBody,
      });

      console.log("activityCalendarAvail response:", response);

      const result =
        response?.data?.calender?.result ||
        response?.data?.calendar?.result ||
        response?.data?.result;

      setCalendarAvailabilityData(result || null);

      setActiveTab("availability");

      setTimeout(() => {
        const element = document.getElementById(
          "activityDetailsUi__availability",
        );

        if (element) {
          const headerOffset = 90;
          const elementPosition =
            element.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: "smooth",
          });
        }
      }, 100);
    } catch (error) {
      console.error("activityCalendarAvail error:", error);

      setCalendarAvailabilityData(null);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const calendarDateMap = useMemo(() => {
    return calendarData.reduce((acc, item) => {
      acc[item.date] = item.datePrice;
      return acc;
    }, {});
  }, [calendarData]);

  const availableCalendarDates = useMemo(() => {
    return new Set(calendarData.map((item) => item.date));
  }, [calendarData]);

  const formatCalendarDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleCalendarDateChange = (date) => {
    if (!date) return;

    const formattedDate = formatCalendarDate(date);

    if (!availableCalendarDates.has(formattedDate)) {
      return;
    }

    setSelectedDate(formattedDate);
    setCalendarOpen(false);
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;

    const formattedDate = formatCalendarDate(date);

    return !availableCalendarDates.has(formattedDate);
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const formattedDate = formatCalendarDate(date);
    const price = calendarDateMap[formattedDate];

    if (!price) return null;

    return (
      <span className="activityDetailsUi__calendarPrice">
        ${Number(price).toFixed(2)}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating, size = "normal") => {
    const numericRating = Number(rating) || 0;
    const roundedRating = Math.round(numericRating);

    return (
      <div
        className={`activityDetailsUi__stars activityDetailsUi__stars--${size}`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= roundedRating
                ? "activityDetailsUi__star activityDetailsUi__star--active"
                : "activityDetailsUi__star"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getRatingCount = (rating) => {
    const item = reviewsData?.totalReviewsSummary?.reviewCountTotals?.find(
      (entry) => Number(entry.rating) === Number(rating),
    );

    return item?.count || 0;
  };

  const totalReviewCount =
    reviewsData?.totalReviewsSummary?.totalReviews || activityReviewCount || 0;

  const calculatedReviewAverage = useMemo(() => {
    const totals = reviewsData?.totalReviewsSummary?.reviewCountTotals;

    if (!Array.isArray(totals) || totals.length === 0) {
      return activityRating || 0;
    }

    const total = totals.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0,
    );

    if (!total) {
      return activityRating || 0;
    }

    const score = totals.reduce(
      (sum, item) => sum + Number(item.rating || 0) * Number(item.count || 0),
      0,
    );

    return score / total;
  }, [reviewsData, activityRating]);

  const getRatingPercentage = (rating) => {
    if (!totalReviewCount) return 0;

    return Math.round((getRatingCount(rating) / totalReviewCount) * 100);
  };

  const formatReviewDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const updateParticipant = (type, change) => {
    setParticipants((prev) => {
      const current = prev[type];

      let minimum = 0;

      if (type === "adult") {
        minimum = 1;
      }

      const nextValue = Math.max(minimum, Math.min(10, current + change));

      return {
        ...prev,
        [type]: nextValue,
      };
    });
  };

  const applyParticipants = () => {
    setAppliedParticipants(participants);
    setParticipantsOpen(false);
  };

  const totalParticipants =
    appliedParticipants.adult +
    appliedParticipants.youth +
    appliedParticipants.child +
    appliedParticipants.infant;

  const participantLabel = `${totalParticipants} ${
    totalParticipants === 1 ? "Participant" : "Participants"
  }`;

  const getDateInputValue = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const minimumDate = new Date().toISOString().split("T")[0];

  const scrollToSection = (sectionId, tab) => {
    setActiveTab(tab);

    const element = document.getElementById(sectionId);

    if (element) {
      const headerOffset = 90;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      });
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
      <div className="activityDetailsUi__page">
        <HeaderInner />

        <div className="activityDetailsUi__loading">
          <div className="activityDetailsUi__loader"></div>
          <p>Loading activity details...</p>
        </div>

        <Footer />
      </div>
    );
  }

  if (error || !activityData) {
    return (
      <div className="activityDetailsUi__page">
        <HeaderInner />

        <div className="activityDetailsUi__error">
          <div className="activityDetailsUi__errorIcon">!</div>
          <h2>Unable to load activity</h2>
          <p>{error || "Activity details are unavailable."}</p>
        </div>

        <Footer />
      </div>
    );
  }

  const {
    title,
    description,
    supplierName,
    currency,
    reviews,
    bookableItems,
    bookingQuestions,
    cancellationPolicy,
    inclusions,
    exclusions,
    additionalInfo,
    bookingRequirements,
    pricingInfo,
    categories,
    subCategories,
    destination: apiDestination,
    ticketInfo,
    bookingConfirmationSettings,
    status,
  } = activityData;

  const displayTitle = title || activityTitle;
  const displayDestination = destination || apiDestination || "Activity";

  const displayCurrency = activityCurrency || currency || "USD";

  const displayRating =
    calculatedReviewAverage ||
    Number(reviews?.combinedAverageRating || 0) ||
    activityRating ||
    0;

  const displayPrice = ourPrice > 0 ? ourPrice : fromPrice;

  const discount =
    originalPrice > displayPrice && displayPrice > 0
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  return (
    <div className="activityDetailsUi__page">
      <HeaderInner />

      <main className="activityDetailsUi__main">
        <div className="activityDetailsUi__container">
          <section className="activityDetailsUi__topTitle">
            <h1>{displayTitle}</h1>

            <div className="activityDetailsUi__topMeta">
              <div className="activityDetailsUi__ratingCompact">
                <strong>{displayRating.toFixed(1)}</strong>
                {renderStars(displayRating, "small")}
                <span>{totalReviewCount.toLocaleString()} Reviews</span>
              </div>

              <span className="activityDetailsUi__metaDivider">|</span>

              {supplierName && (
                <span className="activityDetailsUi__supplierCompact">
                  {supplierName}
                </span>
              )}

              {activityDuration && (
                <>
                  <span className="activityDetailsUi__metaDivider">|</span>

                  <span className="activityDetailsUi__durationCompact">
                    {activityDuration}
                  </span>
                </>
              )}
            </div>
          </section>
          <section className="activityDetailsUi__heroGrid">
            <div className="activityDetailsUi__gallery">
              <div className="activityDetailsUi__mainImage">
                {activityImage ? (
                  <img src={activityImage} alt={displayTitle} />
                ) : (
                  <div className="activityDetailsUi__imageFallback">
                    <span>Activity</span>
                  </div>
                )}

                {freeCancellation && (
                  <span className="activityDetailsUi__imageBadge">
                    Free cancellation
                  </span>
                )}
              </div>
              <div className="activityDetailsUi__contentMain">
                <section
                  id="activityDetailsUi__availability"
                  className="activityDetailsUi__section"
                >
                  <div className="activityDetailsUi__sectionTitle">
                    <h2>{bookableItems?.length || 1} options available</h2>
                  </div>

                  {bookableItems?.length > 0 ? (
                    <div className="activityDetailsUi__availabilityList">
                      {bookableItems.map((item, index) => (
                        <div
                          className="activityDetailsUi__availabilityCard"
                          key={`${item.gradeCode}-${index}`}
                        >
                          <div className="activityDetailsUi__availabilityInfo">
                            <h3>{item.title || `Option ${index + 1}`}</h3>

                            {item.description && <p>{item.description}</p>}

                            <div className="activityDetailsUi__timeSelect">
                              <span className="activityDetailsUi__timeLabel">
                                Select Time
                              </span>

                              <div className="activityDetailsUi__timeSelectInner">
                                <span className="activityDetailsUi__timeIcon">
                                  ◷
                                </span>

                                <span className="activityDetailsUi__timeDivider"></span>

                                <select
                                  value={
                                    selectedTimes[item.gradeCode] || "8:15 AM"
                                  }
                                  onChange={(e) =>
                                    setSelectedTimes((prev) => ({
                                      ...prev,
                                      [item.gradeCode]: e.target.value,
                                    }))
                                  }
                                  className="activityDetailsUi__timeDropdown"
                                >
                                  {timeOptions.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="activityDetailsUi__availabilityPrice">
                            {discount > 0 && (
                              <span className="activityDetailsUi__optionDiscount">
                                {discount}% OFF
                              </span>
                            )}

                            <small>Total</small>

                            <strong>
                              {displayCurrency} {displayPrice.toFixed(2)}
                            </strong>

                            <span>
                              2 Adults × {(displayPrice / 2).toFixed(2)}
                            </span>

                            <button
                              type="button"
                              className="activityDetailsUi__bookButton"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="activityDetailsUi__empty">
                      Availability information is not available yet.
                    </div>
                  )}
                </section>

                <section
                  id="activityDetailsUi__overview"
                  className="activityDetailsUi__section"
                >
                  <div className="activityDetailsUi__sectionTitle">
                    <h2>Overview</h2>
                  </div>

                  <div className="activityDetailsUi__overviewBody">
                    <h3>{displayTitle}</h3>
                    <p>{description || "No description available."}</p>
                  </div>
                </section>

                <section
                  id="activityDetailsUi__additional"
                  className="activityDetailsUi__section"
                >
                  <div className="activityDetailsUi__sectionTitle">
                    <h2>Additional Info</h2>
                  </div>

                  <div className="activityDetailsUi__additionalGrid">
                    <div>
                      <span>Location</span>
                      <strong>{displayDestination}</strong>
                    </div>

                    {activityDuration && (
                      <div>
                        <span>Duration</span>
                        <strong>{activityDuration}</strong>
                      </div>
                    )}

                    {inclusions?.length > 0 && (
                      <div className="activityDetailsUi__additionalWide">
                        <span>Inclusions</span>

                        <ol>
                          {inclusions.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {exclusions?.length > 0 && (
                      <div className="activityDetailsUi__additionalWide">
                        <span>Exclusions</span>

                        <ol>
                          {exclusions.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {additionalInfo?.length > 0 && (
                      <div className="activityDetailsUi__additionalWide">
                        <span>Important information</span>

                        <ul>
                          {additionalInfo.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ticketInfo && (
                      <div>
                        <span>Ticket</span>
                        <strong>
                          {ticketInfo?.ticketTypeDescription ||
                            "Mobile ticket accepted"}
                        </strong>
                      </div>
                    )}

                    {bookingConfirmationSettings && (
                      <div>
                        <span>Confirmation</span>
                        <strong>
                          {bookingConfirmationSettings?.confirmationType ||
                            "Instant"}
                        </strong>
                      </div>
                    )}
                  </div>

                  {bookingRequirements && (
                    <div className="activityDetailsUi__requirements">
                      <h3>Booking requirements</h3>

                      <div>
                        <span>Minimum travelers</span>
                        <strong>
                          {bookingRequirements.minTravelersPerBooking}
                        </strong>
                      </div>

                      <div>
                        <span>Maximum travelers</span>
                        <strong>
                          {bookingRequirements.maxTravelersPerBooking}
                        </strong>
                      </div>

                      <div>
                        <span>Adult required</span>
                        <strong>
                          {bookingRequirements.requiresAdultForBooking
                            ? "Yes"
                            : "No"}
                        </strong>
                      </div>
                    </div>
                  )}

                  {bookingQuestions?.length > 0 && (
                    <div className="activityDetailsUi__questions">
                      <h3>Information required for booking</h3>

                      {bookingQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="activityDetailsUi__question"
                        >
                          <div>
                            <strong>{question.label}</strong>

                            {question.hint && <p>{question.hint}</p>}
                          </div>

                          <span>
                            {question.required === "MANDATORY"
                              ? "Required"
                              : "Optional"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section
                  id="activityDetailsUi__reviews"
                  className="activityDetailsUi__section activityDetailsUi__reviewsSection"
                >
                  <div className="activityDetailsUi__sectionTitle">
                    <h2>Reviews</h2>
                  </div>

                  {reviewsLoading ? (
                    <div className="activityDetailsUi__reviewLoading">
                      <div className="activityDetailsUi__loader"></div>
                      <span>Loading reviews...</span>
                    </div>
                  ) : (
                    <>
                      <div className="activityDetailsUi__reviewSummary">
                        <div className="activityDetailsUi__reviewScore">
                          <strong>{displayRating.toFixed(1)}/5</strong>

                          {renderStars(displayRating, "summary")}

                          <span>
                            Based on {totalReviewCount.toLocaleString()} Reviews
                          </span>

                          <small>Reviews by viator tripadvisor</small>
                        </div>

                        <div className="activityDetailsUi__reviewBreakdown">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div
                              key={rating}
                              className="activityDetailsUi__reviewBar"
                            >
                              <span>{renderStars(rating, "small")}</span>

                              <div>
                                <span
                                  style={{
                                    width: `${getRatingPercentage(rating)}%`,
                                  }}
                                />
                              </div>

                              <strong>{getRatingCount(rating)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="activityDetailsUi__reviewSources">
                        {reviewsData?.totalReviewsSummary?.sources?.map(
                          (source) => (
                            <div key={source.provider}>
                              <span>{source.provider}</span>
                              <strong>{source.totalCount}</strong>
                            </div>
                          ),
                        )}
                      </div>

                      <div className="activityDetailsUi__reviewList">
                        {reviewsData?.reviews?.length > 0 ? (
                          reviewsData.reviews.map((review, index) => (
                            <article
                              key={`${review.reviewer_name}-${index}`}
                              className="activityDetailsUi__review"
                            >
                              <div className="activityDetailsUi__reviewTop">
                                <div className="activityDetailsUi__reviewRatingBox">
                                  <strong>
                                    {Number(review.rating) || 0}
                                    /5
                                  </strong>

                                  {renderStars(Number(review.rating), "small")}
                                </div>
                              </div>

                              <div className="activityDetailsUi__reviewer">
                                <strong>
                                  {review.reviewer_name || "Anonymous"}
                                </strong>

                                <span>Verified Traveller</span>

                                <small>
                                  {formatReviewDate(review.date_submitted)}
                                </small>
                              </div>

                              {review.title && <h3>{review.title}</h3>}

                              {review.text && <p>{review.text}</p>}

                              <div className="activityDetailsUi__reviewBottom">
                                <span>{review.verification_source}</span>

                                <span>
                                  Helpful votes: {review.helpfulVotes || 0}
                                </span>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="activityDetailsUi__empty">
                            No reviews available.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </section>

                {cancellationPolicy && (
                  <section className="activityDetailsUi__section">
                    <div className="activityDetailsUi__sectionTitle">
                      <h2>Cancellation Policy</h2>
                    </div>

                    <div className="activityDetailsUi__cancellation">
                      <div>
                        <span>✓</span>
                        <strong>Free cancellation</strong>
                      </div>

                      <p>{cancellationPolicy.description}</p>

                      {cancellationPolicy.refundEligibility?.map(
                        (refund, index) => (
                          <div
                            key={index}
                            className="activityDetailsUi__refund"
                          >
                            <span>
                              {refund.dayRangeMin}
                              {refund.dayRangeMax !== null
                                ? ` - ${refund.dayRangeMax}`
                                : "+"}{" "}
                              days before activity
                            </span>

                            <strong>
                              {refund.percentageRefundable}% refundable
                            </strong>
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                )}

                {(categories?.length > 0 || subCategories?.length > 0) && (
                  <section className="activityDetailsUi__section">
                    <div className="activityDetailsUi__sectionTitle">
                      <h2>Activity Categories</h2>
                    </div>

                    {categories?.length > 0 && (
                      <div className="activityDetailsUi__tagsBlock">
                        <span>Categories</span>

                        <div>
                          {categories.map((category) => (
                            <span key={category.tagId}>{category.name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {subCategories?.length > 0 && (
                      <div className="activityDetailsUi__tagsBlock">
                        <span>Activity type</span>

                        <div>
                          {subCategories.map((category) => (
                            <span key={category.tagId}>{category.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>

            <aside className="activityDetailsUi__bookingPanel">
              <div className="activityDetailsUi__bookingPrice">
                <span>Total</span>

                <strong>
                  {displayCurrency} {displayPrice.toFixed(2)}
                </strong>
              </div>

              {originalPrice > displayPrice && (
                <div className="activityDetailsUi__bookingSaving">
                  <span>
                    {displayCurrency} {originalPrice.toFixed(2)}
                  </span>

                  {discount > 0 && <strong>{discount}% OFF</strong>}
                </div>
              )}

              <div
                ref={participantsRef}
                className="activityDetailsUi__bookingField activityDetailsUi__dateField"
              >
                <label>Select Date</label>

                <div className="activityDetailsUi__dateInputWrapper">
                  <span className="activityDetailsUi__fieldIcon">▣</span>

                  <button
                    type="button"
                    className="activityDetailsUi__dateTrigger"
                    onClick={() => setCalendarOpen((prev) => !prev)}
                  >
                    <span>
                      {selectedDate ? formatDate(selectedDate) : "Select Date"}
                    </span>
                  </button>

                  {calendarOpen && (
                    <div className="activityDetailsUi__calendarPopup">
                      {calendarLoading ? (
                        <div className="activityDetailsUi__calendarLoading">
                          Loading dates...
                        </div>
                      ) : calendarData.length > 0 ? (
                        <Calendar
                          value={
                            selectedDate
                              ? new Date(
                                  `${getDateInputValue(selectedDate)}T00:00:00`,
                                )
                              : null
                          }
                          onChange={handleCalendarDateChange}
                          tileDisabled={tileDisabled}
                          tileContent={tileContent}
                          minDate={new Date()}
                          prev2Label={null}
                          next2Label={null}
                        />
                      ) : (
                        <div className="activityDetailsUi__calendarEmpty">
                          No availability available.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div
                ref={participantsRef}
                onClick={(event) => event.stopPropagation()}
                className="activityDetailsUi__bookingField activityDetailsUi__participantsField"
              >
                <label>Participants</label>

                <button
                  type="button"
                  className="activityDetailsUi__participantsTrigger"
                  onClick={() => setParticipantsOpen((prev) => !prev)}
                >
                  <span className="activityDetailsUi__fieldIcon">♙</span>

                  <strong>
                    {appliedParticipants.adult} Adult
                    {appliedParticipants.adult !== 1 ? "s" : ""}
                    {appliedParticipants.youth > 0
                      ? `, ${appliedParticipants.youth} Youth`
                      : ""}
                    {appliedParticipants.child > 0
                      ? `, ${appliedParticipants.child} Child`
                      : ""}
                    {appliedParticipants.infant > 0
                      ? `, ${appliedParticipants.infant} Infant`
                      : ""}
                  </strong>
                </button>

                {participantsOpen && (
                  <div className="activityDetailsUi__participantsPopup">
                    <div className="activityDetailsUi__participantsHeader">
                      <h3>Select Participants</h3>
                      <p>You Can select upto 10 Participants</p>
                    </div>

                    <div className="activityDetailsUi__participantRow">
                      <div className="activityDetailsUi__participantInfo">
                        <strong>Adult (16-99)</strong>
                        <span>Min 1 - Max 10</span>
                      </div>

                      <div className="activityDetailsUi__participantControls">
                        <button
                          type="button"
                          className="activityDetailsUi__participantMinus"
                          disabled={participants.adult <= 1}
                          onClick={() => updateParticipant("adult", -1)}
                        >
                          −
                        </button>

                        <span className="activityDetailsUi__participantCount">
                          {participants.adult}
                        </span>

                        <button
                          type="button"
                          className="activityDetailsUi__participantPlus"
                          disabled={participants.adult >= 10}
                          onClick={() => updateParticipant("adult", 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="activityDetailsUi__participantRow">
                      <div className="activityDetailsUi__participantInfo">
                        <strong>Youth (5-15)</strong>
                        <span>Min 0 - Max 10</span>
                      </div>

                      <div className="activityDetailsUi__participantControls">
                        <button
                          type="button"
                          className="activityDetailsUi__participantMinus"
                          disabled={participants.youth <= 0}
                          onClick={() => updateParticipant("youth", -1)}
                        >
                          −
                        </button>

                        <span className="activityDetailsUi__participantCount">
                          {participants.youth}
                        </span>

                        <button
                          type="button"
                          className="activityDetailsUi__participantPlus"
                          disabled={participants.youth >= 10}
                          onClick={() => updateParticipant("youth", 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="activityDetailsUi__participantRow">
                      <div className="activityDetailsUi__participantInfo">
                        <strong>Child (3-4)</strong>
                        <span>Min 0 - Max 10</span>
                      </div>

                      <div className="activityDetailsUi__participantControls">
                        <button
                          type="button"
                          className="activityDetailsUi__participantMinus"
                          disabled={participants.child <= 0}
                          onClick={() => updateParticipant("child", -1)}
                        >
                          −
                        </button>

                        <span className="activityDetailsUi__participantCount">
                          {participants.child}
                        </span>

                        <button
                          type="button"
                          className="activityDetailsUi__participantPlus"
                          disabled={participants.child >= 10}
                          onClick={() => updateParticipant("child", 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="activityDetailsUi__participantRow">
                      <div className="activityDetailsUi__participantInfo">
                        <strong>Infant (0-2)</strong>
                        <span>Min 0 - Max 10</span>
                      </div>

                      <div className="activityDetailsUi__participantControls">
                        <button
                          type="button"
                          className="activityDetailsUi__participantMinus"
                          disabled={participants.infant <= 0}
                          onClick={() => updateParticipant("infant", -1)}
                        >
                          −
                        </button>

                        <span className="activityDetailsUi__participantCount">
                          {participants.infant}
                        </span>

                        <button
                          type="button"
                          className="activityDetailsUi__participantPlus"
                          disabled={participants.infant >= 10}
                          onClick={() => updateParticipant("infant", 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="activityDetailsUi__participantsApply"
                      onClick={applyParticipants}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="activityDetailsUi__updateButton"
                onClick={handleUpdateSearch}
                disabled={availabilityLoading}
              >
                {availabilityLoading ? "Updating..." : "Update search"}
              </button>

              {freeCancellation && (
                <div className="activityDetailsUi__freeCancellation">
                  <span>✓</span>
                  <div>
                    <strong>Free Cancellation</strong>
                    {cancellationPolicy?.description && (
                      <small>{cancellationPolicy.description}</small>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ActivityDetails;
