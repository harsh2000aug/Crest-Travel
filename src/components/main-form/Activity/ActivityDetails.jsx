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

const activityDetailCache = new Map();
const activityReviewsCache = new Map();
const activityCalendarCache = new Map();

const getCachedRequest = (cache, key, request) => {
  if (!cache.has(key)) {
    const promise = request().catch((error) => {
      cache.delete(key);
      throw error;
    });

    cache.set(key, promise);
  }

  return cache.get(key);
};

const formatDateToApi = (date) => {
  if (!date) return "";

  const parsedDate = date instanceof Date ? date : new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return typeof date === "string" ? date : "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date) => {
  if (!date) return "";

  const parsedDate = date instanceof Date ? date : new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return typeof date === "string" ? date : "";
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = String(time).split(":");
  const hour = Number(hours);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minutes || "00"} ${suffix}`;
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

const ActivityDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activityData, setActivityData] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [calendarAvailabilityData, setCalendarAvailabilityData] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedTimes, setSelectedTimes] = useState({});

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

  const participantsRef = useRef(null);
  const calendarRef = useRef(null);

  const activityCode = searchParams.get("activityCode") || "";
  const startDate = searchParams.get("travelDate") || "";

  const loadAvailability = async (date, participantState) => {
    if (!activityCode || !date) {
      return null;
    }

    setAvailabilityLoading(true);
    setAvailabilityError("");

    try {
      const ageBands = [
        {
          ageBand: "SENIOR",
          numberOfTravelers: 0,
        },
        {
          ageBand: "ADULT",
          numberOfTravelers: Number(participantState?.adult) || 0,
        },
        {
          ageBand: "CHILD",
          numberOfTravelers:
            (Number(participantState?.youth) || 0) +
            (Number(participantState?.child) || 0),
        },
      ];

      const requestBody = {
        activityCode,
        travelDate: date,
        ageBands,
      };

      console.log("activityCalendarAvail REQUEST:", requestBody);

      const response = await activityCalendarAvail({
        body: requestBody,
      });

      const result = response?.data?.availability?.result || null;

      if (!result) {
        setCalendarAvailabilityData(null);
        setAvailabilityError("No availability found for the selected date.");
        return null;
      }

      setCalendarAvailabilityData(result);

      const firstAvailableItem = result?.bookableItems?.find((item) =>
        item?.availabilityDetails?.some((detail) => detail?.available === true),
      );

      if (firstAvailableItem) {
        const firstAvailableDetail =
          firstAvailableItem.availabilityDetails?.find(
            (detail) => detail?.available === true,
          );

        if (firstAvailableDetail?.startTime) {
          setSelectedTimes((previous) => ({
            ...previous,
            [firstAvailableItem.gradeCode]: firstAvailableDetail.startTime,
          }));
        }
      }

      return result;
    } catch (requestError) {
      console.error("activityCalendarAvail ERROR:", requestError);

      setCalendarAvailabilityData(null);
      setAvailabilityError(
        "Unable to load availability for the selected date.",
      );

      return null;
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (!activityCode) {
      setError("Activity code is missing.");
      setLoading(false);
      setReviewsLoading(false);
      setCalendarLoading(false);
      return;
    }

    let active = true;

    const loadActivityPage = async () => {
      setLoading(true);
      setReviewsLoading(true);
      setCalendarLoading(true);
      setError("");

      const detailKey = activityCode;
      const reviewsKey = activityCode;
      const calendarKey = activityCode;

      try {
        const detailPromise = getCachedRequest(
          activityDetailCache,
          detailKey,
          () =>
            activityDetail({
              body: {
                activityCode,
                startDate,
              },
            }),
        );

        const reviewsPromise = getCachedRequest(
          activityReviewsCache,
          reviewsKey,
          () =>
            activityReviews({
              body: {
                activityCode,
                count: 10,
                page: 1,
                ratings: [1, 2, 3, 4, 5],
              },
            }),
        );

        const calendarPromise = getCachedRequest(
          activityCalendarCache,
          calendarKey,
          () =>
            activityCalendar({
              body: {
                activityCode,
              },
            }),
        );

        const [detailResult, reviewsResult, calendarResult] =
          await Promise.allSettled([
            detailPromise,
            reviewsPromise,
            calendarPromise,
          ]);

        if (!active) return;

        if (detailResult.status === "fulfilled") {
          const response = detailResult.value;

          console.log("ACTIVITY DETAIL API DATA:", response?.data);

          const result =
            response?.data?.details?.result ||
            response?.data?.details ||
            response?.data?.result ||
            response?.data?.data?.details?.result ||
            null;

          console.log("ACTIVITY DETAIL EXTRACTED RESULT:", result);

          if (result && typeof result === "object") {
            setActivityData(result);
          } else {
            setActivityData(null);
            setError("Activity details not found.");
          }
        } else {
          console.error("ACTIVITY DETAIL API FAILED:", detailResult.reason);

          setActivityData(null);
          setError("Unable to load activity details.");
        }

        if (reviewsResult.status === "fulfilled") {
          const response = reviewsResult.value;

          const result =
            response?.data?.reviews?.result ||
            response?.data?.reviews ||
            response?.data?.result ||
            null;

          setReviewsData(result);
        } else {
          console.error("ACTIVITY REVIEWS API FAILED:", reviewsResult.reason);

          setReviewsData(null);
        }

        if (calendarResult.status === "fulfilled") {
          const response = calendarResult.value;

          console.log("ACTIVITY CALENDAR API DATA:", response?.data);

          const availableDates =
            response?.data?.calender?.result?.availableDates ||
            response?.data?.calendar?.result?.availableDates ||
            response?.data?.calender?.availableDates ||
            response?.data?.calendar?.availableDates ||
            [];

          const normalizedDates = Array.isArray(availableDates)
            ? availableDates
                .map((item) => ({
                  ...item,
                  date: String(
                    item?.date || item?.travelDate || item?.startDate || "",
                  ).slice(0, 10),
                }))
                .filter((item) => item.date)
            : [];

          setCalendarData(normalizedDates);

          const firstDate = normalizedDates[0]?.date || "";

          setSelectedDate((currentDate) => {
            if (
              currentDate &&
              normalizedDates.some((item) => item.date === currentDate)
            ) {
              return currentDate;
            }

            return firstDate;
          });

          const initialDate =
            startDate && normalizedDates.some((item) => item.date === startDate)
              ? startDate
              : normalizedDates[0]?.date || "";

          setSelectedDate(initialDate);

          if (initialDate) {
            await loadAvailability(initialDate, appliedParticipants);
          }
        } else {
          console.error("ACTIVITY CALENDAR API FAILED:", calendarResult.reason);

          setCalendarData([]);
          setSelectedDate("");
          setCalendarAvailabilityData(null);
        }

        if (active) {
          setLoading(false);
          setReviewsLoading(false);
          setCalendarLoading(false);
        }
      } catch (error) {
        console.error("ACTIVITY PAGE LOAD ERROR:", error);

        if (active) {
          setError("Unable to load activity details.");
          setLoading(false);
          setReviewsLoading(false);
          setCalendarLoading(false);
        }
      }
    };

    loadActivityPage();

    return () => {
      active = false;
    };
  }, [activityCode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        participantsOpen &&
        participantsRef.current &&
        !participantsRef.current.contains(event.target)
      ) {
        setParticipantsOpen(false);
      }

      if (
        calendarOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [participantsOpen, calendarOpen]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, [activityCode]);

  const normalizedCalendarData = useMemo(() => {
    return calendarData
      .map((item) => {
        const rawDate = item?.date || item?.travelDate || item?.startDate || "";

        if (!rawDate) return null;

        const dateOnly = String(rawDate).slice(0, 10);
        const parsedDate = new Date(`${dateOnly}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
          return null;
        }

        const rawPrice =
          item?.datePrice ??
          item?.price?.ourPrice ??
          item?.price?.showOurPrice ??
          item?.ourPrice ??
          item?.showOurPrice ??
          item?.fromPrice ??
          item?.price ??
          null;

        const numericPrice =
          rawPrice === null || rawPrice === undefined || rawPrice === ""
            ? null
            : Number(rawPrice);

        return {
          ...item,
          date: dateOnly,
          datePrice: Number.isFinite(numericPrice) ? numericPrice : null,
        };
      })
      .filter(Boolean);
  }, [calendarData]);

  const calendarDateMap = useMemo(() => {
    return normalizedCalendarData.reduce((accumulator, item) => {
      accumulator[item.date] = item.datePrice;
      return accumulator;
    }, {});
  }, [normalizedCalendarData]);

  const availableCalendarDates = useMemo(
    () => new Set(normalizedCalendarData.map((item) => item.date)),
    [normalizedCalendarData],
  );

  const calendarAvailableDateObjects = useMemo(
    () =>
      normalizedCalendarData.map((item) => new Date(`${item.date}T00:00:00`)),
    [normalizedCalendarData],
  );

  const updateParticipant = (type, change) => {
    setParticipants((previous) => {
      const currentValue = Number(previous[type]) || 0;
      const minimum = type === "adult" ? 1 : 0;

      const nextValue = Math.max(minimum, Math.min(10, currentValue + change));

      const nextParticipants = {
        ...previous,
        [type]: nextValue,
      };

      const total =
        nextParticipants.adult +
        nextParticipants.youth +
        nextParticipants.child +
        nextParticipants.infant;

      if (total > 10) {
        return previous;
      }

      return nextParticipants;
    });
  };

  const applyParticipants = () => {
    setAppliedParticipants({
      adult: Number(participants.adult) || 1,
      youth: Number(participants.youth) || 0,
      child: Number(participants.child) || 0,
      infant: Number(participants.infant) || 0,
    });

    setParticipantsOpen(false);
  };

  const handleCalendarDateChange = (date) => {
    if (!date) return;

    const formattedDate = formatDateToApi(date);

    if (!availableCalendarDates.has(formattedDate)) {
      return;
    }

    setSelectedDate(formattedDate);
    setCalendarOpen(false);
    setAvailabilityError("");
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;

    return !availableCalendarDates.has(formatDateToApi(date));
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateKey = formatDateToApi(date);
    const price = calendarDateMap[dateKey];

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price))
    ) {
      return null;
    }

    return (
      <span className="activityDetailsUi__calendarPrice">
        {displayCurrency} {Number(price).toFixed(2)}
      </span>
    );
  };

  const handleUpdateSearch = async () => {
    if (!selectedDate || !activityCode) {
      return;
    }

    const nextDate = formatDateToApi(selectedDate);

    setSearchParams(
      {
        activityCode,
        travelDate: nextDate,
      },
      { replace: true },
    );

    const result = await loadAvailability(nextDate, appliedParticipants);

    if (!result) {
      return;
    }

    requestAnimationFrame(() => {
      const element = document.getElementById(
        "activityDetailsUi__availability",
      );

      if (!element) {
        return;
      }

      const headerOffset = 90;

      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      });
    });
  };

  const getAvailabilityItems = useMemo(() => {
    const items = calendarAvailabilityData?.bookableItems;

    if (!Array.isArray(items)) {
      return [];
    }

    return items;
  }, [calendarAvailabilityData]);

  const getAvailableDetails = (item) => {
    if (!Array.isArray(item?.availabilityDetails)) {
      return [];
    }

    return item.availabilityDetails.filter(
      (detail) => detail?.available === true,
    );
  };

  const getItemPrice = (item, detail) => {
    const price =
      detail?.totalPrice?.price ||
      item?.availabilityDetails?.[0]?.totalPrice?.price ||
      {};

    return (
      Number(price?.showOurPrice) ||
      Number(price?.ourPrice) ||
      Number(price?.convertedCoin) ||
      Number(price?.netPrice) ||
      0
    );
  };

  const getItemPublicPrice = (item, detail) => {
    const price =
      detail?.totalPrice?.price ||
      item?.availabilityDetails?.[0]?.totalPrice?.price ||
      {};

    return Number(price?.publicPrice) || 0;
  };

  const getItemPerPersonPrice = (item, detail) => {
    const totalPrice = getItemPrice(item, detail);

    if (!totalParticipants) {
      return 0;
    }

    return totalPrice / totalParticipants;
  };

  const getSelectedDetail = (item) => {
    const details = getAvailableDetails(item);

    if (!details.length) {
      return null;
    }

    const selectedTime = selectedTimes[item?.gradeCode];

    if (!selectedTime) {
      return details[0];
    }

    const matchingDetail = details.find(
      (detail) => detail?.startTime === selectedTime,
    );

    return matchingDetail || details[0];
  };

  const getRatingCount = (rating) => {
    const totals = reviewsData?.totalReviewsSummary?.reviewCountTotals;

    if (!Array.isArray(totals)) return 0;

    const item = totals.find(
      (entry) => Number(entry.rating) === Number(rating),
    );

    return Number(item?.count) || 0;
  };

  const totalReviewCount =
    Number(reviewsData?.totalReviewsSummary?.totalReviews) || 0;

  const calculatedReviewAverage = useMemo(() => {
    const totals = reviewsData?.totalReviewsSummary?.reviewCountTotals;

    if (!Array.isArray(totals) || totals.length === 0) {
      return Number(activityData?.reviews?.combinedAverageRating) || 0;
    }

    const total = totals.reduce(
      (sum, item) => sum + Number(item?.count || 0),
      0,
    );

    if (!total) {
      return Number(activityData?.reviews?.combinedAverageRating) || 0;
    }

    const score = totals.reduce(
      (sum, item) => sum + Number(item?.rating || 0) * Number(item?.count || 0),
      0,
    );

    return score / total;
  }, [reviewsData, activityData?.reviews?.combinedAverageRating]);

  const getRatingPercentage = (rating) => {
    if (!totalReviewCount) return 0;

    return Math.round((getRatingCount(rating) / totalReviewCount) * 100);
  };

  const totalParticipants =
    Number(appliedParticipants.adult) +
    Number(appliedParticipants.youth) +
    Number(appliedParticipants.child) +
    Number(appliedParticipants.infant);

  const participantLabel = `${totalParticipants} ${
    totalParticipants === 1 ? "Participant" : "Participants"
  }`;

  const {
    title,
    description,
    supplierName,
    currency,
    reviews,
    bookingQuestions,
    cancellationPolicy,
    inclusions,
    exclusions,
    additionalInfo,
    bookingRequirements,
    categories,
    subCategories,
    destination: apiDestination,
    ticketInfo,
    bookingConfirmationSettings,
  } = activityData || {};

  const displayTitle = title || "Activity";

  const displayDestination = apiDestination || "Activity";

  const displayCurrency =
    calendarAvailabilityData?.currency || currency || "USD";

  const displayRating = calculatedReviewAverage || 0;

  const availabilityPriceSummary = useMemo(() => {
    const items = Array.isArray(calendarAvailabilityData?.bookableItems)
      ? calendarAvailabilityData.bookableItems
      : [];

    const prices = items
      .flatMap((item) =>
        Array.isArray(item?.availabilityDetails)
          ? item.availabilityDetails
          : [],
      )
      .filter((detail) => detail?.available === true)
      .map((detail) => Number(detail?.totalPrice?.price?.showOurPrice))
      .filter((price) => Number.isFinite(price) && price > 0);

    if (!prices.length) {
      return {
        current: 0,
        original: 0,
        discount: 0,
      };
    }

    const current = Math.min(...prices);

    const publicPrices = items
      .flatMap((item) =>
        Array.isArray(item?.availabilityDetails)
          ? item.availabilityDetails
          : [],
      )
      .filter((detail) => detail?.available === true)
      .map((detail) => Number(detail?.totalPrice?.price?.publicPrice))
      .filter((price) => Number.isFinite(price) && price > 0);

    const original = publicPrices.length ? Math.min(...publicPrices) : 0;

    return {
      current,
      original,
      discount:
        original > current && current > 0
          ? Math.round(((original - current) / original) * 100)
          : 0,
    };
  }, [calendarAvailabilityData]);

  const displayPrice = availabilityPriceSummary.current;
  const originalPrice = availabilityPriceSummary.original;
  const discount = availabilityPriceSummary.discount;

  const activityDuration =
    activityData?.duration ||
    activityData?.durationText ||
    activityData?.durationDescription ||
    "";

  const freeCancellation = Boolean(
    cancellationPolicy?.description ||
    cancellationPolicy?.refundEligibility?.some(
      (refund) => Number(refund?.percentageRefundable) > 0,
    ),
  );

  const galleryImages = useMemo(() => {
    const productPhotos = Array.isArray(activityData?.productPhotos)
      ? activityData.productPhotos.filter((photo) => photo?.photoURL)
      : [];

    return productPhotos;
  }, [activityData?.productPhotos]);

  const activeGalleryImage = galleryImages[activeImageIndex]?.photoURL || "";

  const handlePreviousImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0
        ? Math.max(galleryImages.length - 1, 0)
        : currentIndex - 1,
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((currentIndex) =>
      galleryImages.length === 0 || currentIndex === galleryImages.length - 1
        ? 0
        : currentIndex + 1,
    );
  };

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

  const handleBookNow = (item, detail, gradeKey) => {
    const price = detail?.totalPrice?.price || {};

    const selectedActivityData = {
      startDate: selectedDate || "",
      endDate: selectedDate || "",
      activityCode: activityCode || "",
      name: displayTitle || "",
      image: galleryImages?.[0]?.photoURL || "",
      category:
        categories
          ?.map((category) => category?.name)
          .filter(Boolean)
          .join(", ") || "",
      description: description || "",
      adults: Number(appliedParticipants?.adult) || 0,
      children:
        (Number(appliedParticipants?.child) || 0) +
        (Number(appliedParticipants?.youth) || 0),
      ourPrice:
        price?.ourPrice || price?.showOurPrice || price?.convertedCoin || "",
      payable:
        price?.ourPrice || price?.showOurPrice || price?.convertedCoin || "",
      publicPrice: price?.publicPrice || "",
      cancellationPolicy: cancellationPolicy?.description || "",
      startTime: detail?.startTime || "",
      shortTittle: displayTitle || "",
      guests: [],
      orderDate: new Date().toISOString(),
      duration: activityDuration || "",
      star_rating: displayRating || "",
      gradeCode: gradeKey || item?.gradeCode || "",
    };

    const adultCount = Number(appliedParticipants?.adult) || 0;
    const childCount =
      (Number(appliedParticipants?.child) || 0) +
      (Number(appliedParticipants?.youth) || 0);
    const infantCount = Number(appliedParticipants?.infant) || 0;

    const guests = [];

    for (let index = 0; index < adultCount; index += 1) {
      guests.push({
        primary: index === 0,
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        covered: false,
        birthDate: "",
        gender: "",
        type: "ADULT",
      });
    }

    for (let index = 0; index < childCount; index += 1) {
      guests.push({
        primary: false,
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        covered: false,
        birthDate: "",
        gender: "",
        type: "CHILD",
      });
    }

    for (let index = 0; index < infantCount; index += 1) {
      guests.push({
        primary: false,
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        covered: false,
        birthDate: "",
        gender: "",
        type: "INFANT",
      });
    }

    selectedActivityData.guests = guests;

    sessionStorage.setItem(
      "activityBookingData",
      JSON.stringify(selectedActivityData),
    );

    const params = new URLSearchParams({
      activityCode,
      travelDate: selectedDate,
      gradeCode: gradeKey || item?.gradeCode || "",
      startTime: detail?.startTime || "",
    });

    window.location.href = `/activity-book?${params.toString()}`;
  };

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
                {activeGalleryImage ? (
                  <>
                    <img
                      src={activeGalleryImage}
                      alt={
                        galleryImages[activeImageIndex]?.caption || displayTitle
                      }
                    />

                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="activityDetailsUi__galleryArrow activityDetailsUi__galleryArrow--prev"
                          onClick={handlePreviousImage}
                          aria-label="Previous image"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          className="activityDetailsUi__galleryArrow activityDetailsUi__galleryArrow--next"
                          onClick={handleNextImage}
                          aria-label="Next image"
                        >
                          ›
                        </button>

                        <div className="activityDetailsUi__galleryCounter">
                          {activeImageIndex + 1} / {galleryImages.length}
                        </div>
                      </>
                    )}
                  </>
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

              {galleryImages.length > 1 && (
                <div className="activityDetailsUi__thumbnailCarousel">
                  {galleryImages.map((photo, index) => (
                    <button
                      type="button"
                      key={`${photo.photoURL}-${index}`}
                      className={`activityDetailsUi__thumbnail ${
                        activeImageIndex === index
                          ? "activityDetailsUi__thumbnail--active"
                          : ""
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={photo.photoURL}
                        alt={photo.caption || `${displayTitle} ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="activityDetailsUi__contentMain">
                <section
                  id="activityDetailsUi__availability"
                  className="activityDetailsUi__section"
                >
                  <div className="activityDetailsUi__sectionTitle">
                    <h2>
                      {calendarAvailabilityData
                        ? `${getAvailabilityItems.length} options available`
                        : `${activityData?.bookableItems?.length || 0} options available`}
                    </h2>
                  </div>

                  {availabilityLoading && (
                    <div className="activityDetailsUi__availabilityLoading">
                      <div className="activityDetailsUi__loader"></div>
                      <span>Updating availability...</span>
                    </div>
                  )}

                  {availabilityError && (
                    <div className="activityDetailsUi__empty">
                      {availabilityError}
                    </div>
                  )}

                  {!availabilityError && (
                    <>
                      {calendarAvailabilityData ? (
                        getAvailabilityItems.length > 0 ? (
                          <div className="activityDetailsUi__availabilityList">
                            {getAvailabilityItems.map((item, index) => {
                              const gradeKey =
                                item?.gradeCode ||
                                item?.productOptionCode ||
                                String(index);

                              const availableDetails =
                                getAvailableDetails(item);

                              const selectedDetail = getSelectedDetail(item);

                              const itemPrice = getItemPrice(
                                item,
                                selectedDetail,
                              );

                              const publicPrice = getItemPublicPrice(
                                item,
                                selectedDetail,
                              );

                              const itemPerPersonPrice = getItemPerPersonPrice(
                                item,
                                selectedDetail,
                              );

                              const itemDiscount =
                                publicPrice > itemPrice && itemPrice > 0
                                  ? Math.round(
                                      ((publicPrice - itemPrice) /
                                        publicPrice) *
                                        100,
                                    )
                                  : 0;

                              const guideLanguages = Array.isArray(
                                item?.languageGuides,
                              )
                                ? item.languageGuides
                                    .map((guide) => guide?.language)
                                    .filter(Boolean)
                                : [];

                              return (
                                <div
                                  className="activityDetailsUi__availabilityCard"
                                  key={`${gradeKey}-${index}`}
                                >
                                  <div className="activityDetailsUi__availabilityInfo">
                                    <h3>
                                      {item?.title || `Option ${index + 1}`}
                                    </h3>

                                    {item?.description && (
                                      <p>{item.description}</p>
                                    )}

                                    {guideLanguages.length > 0 && (
                                      <span className="activityDetailsUi__guide">
                                        Guide:{" "}
                                        {guideLanguages
                                          .map((language) =>
                                            language.toUpperCase(),
                                          )
                                          .join(", ")}
                                      </span>
                                    )}

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
                                            selectedTimes[gradeKey] ||
                                            availableDetails[0]?.startTime ||
                                            ""
                                          }
                                          onChange={(event) =>
                                            setSelectedTimes((previous) => ({
                                              ...previous,
                                              [gradeKey]: event.target.value,
                                            }))
                                          }
                                          className="activityDetailsUi__timeDropdown"
                                          disabled={
                                            availableDetails.length === 0
                                          }
                                        >
                                          {availableDetails.map(
                                            (detail, detailIndex) => (
                                              <option
                                                key={`${detail.startTime}-${detailIndex}`}
                                                value={detail.startTime}
                                              >
                                                {formatTime(detail.startTime)}
                                              </option>
                                            ),
                                          )}
                                        </select>
                                      </div>
                                    </div>

                                    {availableDetails.length === 0 && (
                                      <span className="activityDetailsUi__empty">
                                        No time slots available
                                      </span>
                                    )}
                                  </div>

                                  <div className="activityDetailsUi__availabilityPrice">
                                    {itemDiscount > 0 && (
                                      <span className="activityDetailsUi__optionDiscount">
                                        {itemDiscount}% OFF
                                      </span>
                                    )}

                                    <small>Total</small>

                                    <strong>
                                      {displayCurrency} {itemPrice.toFixed(2)}
                                    </strong>

                                    <span>
                                      {participantLabel} ×{" "}
                                      {itemPerPersonPrice.toFixed(2)}
                                    </span>

                                    {selectedDetail && (
                                      <span className="activityDetailsUi__availabilityStatus">
                                        {selectedDetail.available
                                          ? "Available"
                                          : "Unavailable"}
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      className="activityDetailsUi__bookButton"
                                      disabled={
                                        !selectedDetail ||
                                        !selectedDetail.available
                                      }
                                      onClick={() =>
                                        handleBookNow(
                                          item,
                                          selectedDetail,
                                          item?.gradeCode,
                                        )
                                      }
                                    >
                                      Book Now
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="activityDetailsUi__empty">
                            No availability found for{" "}
                            {formatDisplayDate(selectedDate)}.
                          </div>
                        )
                      ) : (
                        <div className="activityDetailsUi__empty">
                          Select a date and click Update search to load
                          availability.
                        </div>
                      )}
                    </>
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

                      {bookingQuestions.map((question, index) => (
                        <div
                          key={question?.id || `${question?.label}-${index}`}
                          className="activityDetailsUi__question"
                        >
                          <div>
                            <strong>{question?.label}</strong>

                            {question?.hint && <p>{question.hint}</p>}
                          </div>

                          <span>
                            {question?.required === "MANDATORY"
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
                          <strong>
                            {displayRating.toFixed(1)}
                            /5
                          </strong>

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
                          (source, index) => (
                            <div key={`${source?.provider}-${index}`}>
                              <span>{source?.provider}</span>

                              <strong>{source?.totalCount || 0}</strong>
                            </div>
                          ),
                        )}
                      </div>

                      <div className="activityDetailsUi__reviewList">
                        {reviewsData?.reviews?.length > 0 ? (
                          reviewsData.reviews.map((review, index) => (
                            <article
                              key={`${review?.reviewer_name}-${index}`}
                              className="activityDetailsUi__review"
                            >
                              <div className="activityDetailsUi__reviewTop">
                                <div className="activityDetailsUi__reviewRatingBox">
                                  <strong>
                                    {Number(review?.rating) || 0}
                                    /5
                                  </strong>

                                  {renderStars(Number(review?.rating), "small")}
                                </div>
                              </div>

                              <div className="activityDetailsUi__reviewer">
                                <strong>
                                  {review?.reviewer_name || "Anonymous"}
                                </strong>

                                <span>Verified Traveller</span>

                                <small>
                                  {formatReviewDate(review?.date_submitted)}
                                </small>
                              </div>

                              {review?.title && <h3>{review.title}</h3>}

                              {review?.text && <p>{review.text}</p>}

                              <div className="activityDetailsUi__reviewBottom">
                                <span>{review?.verification_source}</span>

                                <span>
                                  Helpful votes: {review?.helpfulVotes || 0}
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
                              {refund?.dayRangeMin}
                              {refund?.dayRangeMax !== null &&
                              refund?.dayRangeMax !== undefined
                                ? ` - ${refund.dayRangeMax}`
                                : "+"}{" "}
                              days before activity
                            </span>

                            <strong>
                              {refund?.percentageRefundable}% refundable
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
                          {categories.map((category, index) => (
                            <span
                              key={
                                category?.tagId || `${category?.name}-${index}`
                              }
                            >
                              {category?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {subCategories?.length > 0 && (
                      <div className="activityDetailsUi__tagsBlock">
                        <span>Activity type</span>

                        <div>
                          {subCategories.map((category, index) => (
                            <span
                              key={
                                category?.tagId || `${category?.name}-${index}`
                              }
                            >
                              {category?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>

            <aside className="activityDetailsUi__bookingPanel">
              {originalPrice > displayPrice && (
                <div className="activityDetailsUi__bookingSaving">
                  <span>
                    {displayCurrency} {originalPrice.toFixed(2)}
                  </span>

                  {discount > 0 && <strong>{discount}% OFF</strong>}
                </div>
              )}

              <div
                ref={calendarRef}
                className="activityDetailsUi__bookingField activityDetailsUi__dateField"
              >
                <label>Select Date</label>

                <div className="activityDetailsUi__dateInputWrapper">
                  <span className="activityDetailsUi__fieldIcon">📅</span>

                  <button
                    type="button"
                    className="activityDetailsUi__dateTrigger"
                    onClick={() => setCalendarOpen((previous) => !previous)}
                  >
                    <span>
                      {selectedDate
                        ? formatDisplayDate(selectedDate)
                        : "Select Date"}
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
                              ? new Date(`${selectedDate}T00:00:00`)
                              : null
                          }
                          onChange={handleCalendarDateChange}
                          tileDisabled={tileDisabled}
                          tileContent={tileContent}
                          minDate={
                            calendarAvailableDateObjects.length > 0
                              ? new Date(
                                  Math.min(
                                    ...calendarAvailableDateObjects.map(
                                      (date) => date.getTime(),
                                    ),
                                  ),
                                )
                              : new Date()
                          }
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
                className="activityDetailsUi__bookingField activityDetailsUi__participantsField"
              >
                <label>Participants</label>

                <button
                  type="button"
                  className="activityDetailsUi__participantsTrigger"
                  onClick={() => setParticipantsOpen((previous) => !previous)}
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

                    {[
                      {
                        type: "adult",
                        label: "Adult (16-99)",
                        min: 1,
                      },
                      {
                        type: "youth",
                        label: "Youth (5-15)",
                        min: 0,
                      },
                      {
                        type: "child",
                        label: "Child (3-4)",
                        min: 0,
                      },
                      {
                        type: "infant",
                        label: "Infant (0-2)",
                        min: 0,
                      },
                    ].map((item) => (
                      <div
                        key={item.type}
                        className="activityDetailsUi__participantRow"
                      >
                        <div className="activityDetailsUi__participantInfo">
                          <strong>{item.label}</strong>

                          <span>Min {item.min} - Max 10</span>
                        </div>

                        <div className="activityDetailsUi__participantControls">
                          <button
                            type="button"
                            className="activityDetailsUi__participantMinus"
                            disabled={participants[item.type] <= item.min}
                            onClick={() => updateParticipant(item.type, -1)}
                          >
                            −
                          </button>

                          <span className="activityDetailsUi__participantCount">
                            {participants[item.type]}
                          </span>

                          <button
                            type="button"
                            className="activityDetailsUi__participantPlus"
                            disabled={participants[item.type] >= 10}
                            onClick={() => updateParticipant(item.type, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}

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
                disabled={availabilityLoading || !selectedDate}
                onClick={handleUpdateSearch}
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
