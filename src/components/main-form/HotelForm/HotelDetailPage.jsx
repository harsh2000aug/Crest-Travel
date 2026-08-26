import React, { useEffect, useRef, useState } from "react";

import {
  FaStar,
  FaSignInAlt,
  FaSignOutAlt,
  FaBed,
  FaUsers,
  FaExpandArrowsAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { MdRestaurant } from "react-icons/md";
import { BsCashStack } from "react-icons/bs";

import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import HotelLoader from "../../../reuseable-components/HotelLoader/HotelLoader";

import { detailHotels, getFilters } from "../../../store/Services/AllApi";

import { useNavigate, useSearchParams } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";

import { Keyboard } from "swiper/modules";

import "swiper/css";

const HotelDetailPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [hotelImages, setHotelImages] = useState({});
  const [roomDetails, setRoomDetails] = useState([]);

  const [hotelLoader, setHotelLoader] = useState(false);

  const [showGallery, setShowGallery] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  // =========================================================
  // URL PARAMETERS
  // =========================================================

  const hotelId = searchParams.get("hotelid");
  const token = searchParams.get("token");

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  const countryOfResidence = searchParams.get("countryOfResidence");

  const currencyrate = Number(searchParams.get("currencyrate")) || 1;

  const hotelName = searchParams.get("hotelName");

  const correlationId = searchParams.get("correlationId");

  const adults = Number(searchParams.get("adults") || 0);

  const children = Number(searchParams.get("children") || 0);

  let childAges = [];

  try {
    childAges = JSON.parse(searchParams.get("childAges") || "[]");
  } catch (error) {
    childAges = [];
  }

  // =========================================================
  // GET HOTEL RESULT
  // NEW JSON:
  // res.content.result
  // =========================================================

  const getHotelResult = (res) => {
    return (
      res?.content?.result ||
      res?.result ||
      res?.data?.content?.result ||
      res?.data?.result ||
      res?.data?.data?.content?.result ||
      {}
    );
  };

  // =========================================================
  // GET PRICING / ROOM RESULT
  //
  // NEW JSON:
  // pricing.result.groups
  // =========================================================

  const getFilterResult = (res) => {
    return (
      res?.pricing?.result ||
      res?.data?.pricing?.result ||
      res?.content?.pricing?.result ||
      res?.result ||
      res?.content?.result ||
      res?.data?.result ||
      res?.data?.content?.result ||
      res?.data?.data?.content?.result ||
      {}
    );
  };

  // =========================================================
  // REMOVE HTML
  // =========================================================

  const removeHtmlTags = (text = "") => {
    return String(text)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?p>/gi, " ")
      .replace(/<\/?li>/gi, " ")
      .replace(/<\/?ul>/gi, " ")
      .replace(/<\/?strong>/gi, "")
      .replace(/<\/?b>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, " ")
      .trim();
  };

  // =========================================================
  // GET IMAGE URL
  //
  // NEW JSON:
  //
  // links: [
  //   {
  //     url: "...",
  //     size: "Standard"
  //   },
  //   {
  //     url: "...",
  //     size: "XXL"
  //   }
  // ]
  //
  // OLD EAN STRUCTURE ALSO SUPPORTED
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    // NEW STRUCTURE
    if (Array.isArray(image?.links)) {
      return (
        image.links.find((item) => item?.size === "XXL")?.url ||
        image.links.find((item) => item?.size === "Standard")?.url ||
        image.links?.[0]?.url ||
        ""
      );
    }

    // OLD EAN STRUCTURE
    if (image?.links && typeof image.links === "object") {
      return (
        image.links?.["1000px"]?.href ||
        image.links?.["350px"]?.href ||
        image.links?.["70px"]?.href ||
        ""
      );
    }

    return "";
  };

  // =========================================================
  // DETAIL HOTEL API
  // =========================================================

  const handleImages = async () => {
    setHotelLoader(true);

    try {
      const occupancies = [
        {
          numOfAdults: adults || 2,
          childAges: Array.isArray(childAges)
            ? childAges
                .filter(
                  (age) => age !== "" && age !== null && age !== undefined,
                )
                .map((age) => Number(age))
            : [],
        },
      ];

      const payload = {
        hotelid: hotelId,
        checkIn: checkIn,
        checkOut: checkOut,
        countryOfResidence: countryOfResidence || "US",
        currencyrate: currencyrate,
        hotelname: hotelName,
        correlationId: correlationId,
        occupancies: occupancies,
      };

      const res = await detailHotels({ body: payload });

      const hotelResult = getHotelResult(res);
      setHotelImages(hotelResult);

      // In case this endpoint DOES also return pricing (like your sample JSON),
      // grab it too — but never overwrite a populated room list with an empty one.
      const pricingResult = getFilterResult(res);
      const groups = Array.isArray(pricingResult?.groups)
        ? pricingResult.groups
        : [];

      if (groups.length > 0) {
        setRoomDetails((prev) => (prev.length > 0 ? prev : groups));
      }
    } catch (error) {
      console.error("DETAIL HOTEL ERROR:", error);
      setHotelImages({});
    } finally {
      setHotelLoader(false);
    }
  };

  // =========================================================
  // GET ROOMS / RATES
  //
  // NEW JSON:
  //
  // pricing.result.groups
  //
  // Each group contains:
  // - name
  // - facilities
  // - area
  // - beds
  // - images
  // - rooms
  //
  // Each rooms[] item contains:
  // - name
  // - recommendationId
  // - rateid
  // - occupancies
  // - publishedRate
  // - ourprice
  // - taxes
  // - fees
  // - ratetype
  // - refundability
  // - refundable
  // - boardBasis
  // - cancellationPolicies
  // etc.
  // =========================================================

  // const handleRoomDetails = async () => {
  //   try {
  //     const payload = {
  //       hotelId: hotelId, // double-check this matches what getFilters expects
  //       correlationId: correlationId,
  //       checkIn: checkIn,
  //       checkOut: checkOut,
  //     };

  //     const res = await getFilters({ body: payload });

  //     const filterResult = getFilterResult(res);
  //     const groups = Array.isArray(filterResult?.groups)
  //       ? filterResult.groups
  //       : [];

  //     if (groups.length > 0) {
  //       setRoomDetails(groups); // this is the authoritative source, safe to overwrite
  //     }
  //   } catch (error) {
  //     console.error("getFilters error:", error);
  //   }
  // };

  // =========================================================
  // API CALL
  // =========================================================

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    handleImages();
  }, [hotelId, checkIn, checkOut, correlationId]);
  // =========================================================
  // DEBUG
  // =========================================================

  // =========================================================
  // RATINGS
  // =========================================================

  const guestRatings = hotelImages?.eanRating?.ratings?.guest || {};

  const reviews = Array.isArray(hotelImages?.eanReviews)
    ? hotelImages.eanReviews
    : [];

  const [currentPage, setCurrentPage] = useState(1);

  const reviewsPerPage = 10;

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const currentReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage,
  );

  // =========================================================
  // ADDRESS
  //
  // NEW JSON:
  // contact.address
  // =========================================================

  const address = hotelImages?.contact?.address || {};

  const fullAddress = [
    address?.line1,
    address?.city?.name,
    address?.state?.name,
    address?.country?.name,
    address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  // =========================================================
  // DESCRIPTION
  //
  // NEW JSON:
  // descriptions: [
  //   {
  //      type: "...",
  //      text: "..."
  //   }
  // ]
  // =========================================================

  const getDescription = (type) => {
    return (
      hotelImages?.descriptions?.find((item) => item?.type === type)?.text || ""
    );
  };

  // =========================================================
  // HOTEL IMAGES
  // =========================================================

  const images = Array.isArray(hotelImages?.images) ? hotelImages.images : [];

  // =========================================================
  // ROOM GROUPS
  //
  // NEW JSON:
  // pricing.result.groups
  //
  // Flatten groups[].rooms[] so each rate
  // becomes one existing room card.
  // =========================================================

  const roomList = Array.isArray(roomDetails)
    ? roomDetails.flatMap((group) => {
        const groupRooms = Array.isArray(group?.rooms) ? group.rooms : [];

        return groupRooms.map((rate) => ({
          ...rate,

          // GROUP DATA
          groupId: group?.id,
          groupName: group?.name,
          groupType: group?.type,

          groupFacilities: Array.isArray(group?.facilities)
            ? group.facilities
            : [],

          groupImages: Array.isArray(group?.images) ? group.images : [],

          groupBeds: Array.isArray(group?.beds) ? group.beds : [],

          groupArea: group?.area,

          groupViews: Array.isArray(group?.views) ? group.views : [],

          groupMaxGuests: Number(group?.maxGuestAllowed) || 0,

          groupMaxAdults: Number(group?.maxAdultAllowed) || 0,

          groupMaxChildren: Number(group?.maxChildrenAllowed) || 0,
        }));
      })
    : [];

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0.00";
    }

    return number.toFixed(2);
  };

  // =========================================================
  // FORMAT BED NAME
  // =========================================================

  const formatBedType = (type = "") => {
    const bedTypeMap = {
      QueenBed: "Queen Bed",
      SofaBed: "Sofa Bed",
      KingBed: "King Bed",
      DoubleBed: "Double Bed",
      TwinBed: "Twin Bed",
      FullBed: "Full Bed",
      BunkBed: "Bunk Bed",
      QUEEN: "Queen Bed",
      KING: "King Bed",
      TWIN: "Twin Bed",
      DOUBLE: "Double Bed",
      FULL: "Full Bed",
    };

    return (
      bedTypeMap[type] ||
      String(type)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
    );
  };

  // =========================================================
  // GET BED DESCRIPTION
  //
  // Uses the new group.beds / room.beds data.
  // =========================================================

  const getBedDescription = (room, groupBeds) => {
    const beds =
      Array.isArray(room?.beds) && room.beds.length > 0 ? room.beds : groupBeds;

    if (!Array.isArray(beds) || beds.length === 0) {
      return "";
    }

    return beds
      .map((bed) => {
        const count = Number(bed?.count) || 1;

        return `${count} ${formatBedType(bed?.type)}`;
      })
      .join(", ");
  };

  // =========================================================
  // GET ROOM AREA
  //
  // group.area is available in the new pricing JSON.
  // Some room descriptions also contain square feet.
  // =========================================================

  const getRoomArea = (room, groupArea) => {
    let squareMeters = null;
    let squareFeet = null;

    if (groupArea !== null && groupArea !== undefined && groupArea !== "") {
      const areaNumber = Number(groupArea);

      if (!Number.isNaN(areaNumber)) {
        squareMeters = areaNumber;
      }
    }

    const description = room?.description || "";

    const feetMatch = description.match(
      /([\d,.]+)\s*(?:sq\.?\s*feet|sq\.?\s*ft|square feet)/i,
    );

    if (feetMatch?.[1]) {
      squareFeet = Number(feetMatch[1].replace(/,/g, ""));
    }

    return {
      squareFeet,
      squareMeters,
    };
  };

  // =========================================================
  // BOOK ROOM
  // =========================================================

  const handleBookRoom = (room) => {
    const rateId = room?.rateid || "";

    if (rateId) {
      localStorage.setItem("rateid", rateId);
    }
    const params = new URLSearchParams();

    const occupancy = room?.occupancies?.[0] || {};

    const roomId = occupancy?.roomId || room?.id || "";

    const roomName = room?.name || room?.groupName || "";

    const boardBasis =
      room?.boardBasis?.displayText || room?.boardBasis?.description || "";

    // ---------------------------------------------------------
    // COMPLETE SELECTED ROOM DATA
    // ---------------------------------------------------------

    const selectedRoom = {
      roomId: roomId,
      roomName: roomName,

      recommendationId: room?.recommendationId || "",
      rateid: room?.rateid || "",
      publishedRate:
        room?.publishedRate != null ? Number(room.publishedRate) : 0,

      ourprice: room?.ourprice != null ? Number(room.ourprice) : 0,

      taxes: room?.taxes != null ? Number(room.taxes) : 0,

      fees: room?.fees != null ? Number(room.fees) : 0,

      ratetype: room?.ratetype || "",

      refundability: room?.refundability || "",

      refundable: room?.refundable != null ? Boolean(room.refundable) : null,

      payAtHotel: room?.payAtHotel != null ? Boolean(room.payAtHotel) : false,

      // MEAL / BOARD
      boardBasis: boardBasis,

      // ---------------------------------------------------------
      // PERSON / OCCUPANCY INFORMATION
      // ---------------------------------------------------------

      adults: Number(occupancy?.numOfAdults) || 0,

      children: Number(occupancy?.numOfChildren) || 0,

      childAges: Array.isArray(childAges)
        ? childAges
            .filter((age) => age !== "" && age !== null && age !== undefined)
            .map(Number)
        : [],

      // Keep original occupancy also
      occupancies: room?.occupancies || [],

      // ---------------------------------------------------------
      // ROOM INFORMATION
      // ---------------------------------------------------------

      facilities: Array.isArray(room?.facilities)
        ? room.facilities
        : room?.groupFacilities || [],

      beds: Array.isArray(room?.beds) ? room.beds : room?.groupBeds || [],

      area: room?.groupArea || null,

      views: room?.groupViews || [],

      maxGuests: Number(room?.groupMaxGuests) || 0,

      maxAdults: Number(room?.groupMaxAdults) || 0,

      maxChildren: Number(room?.groupMaxChildren) || 0,

      groupId: room?.groupId || "",

      groupName: room?.groupName || "",

      groupType: room?.groupType || "",

      groupImages: room?.groupImages || [],

      // ---------------------------------------------------------
      // CANCELLATION
      // ---------------------------------------------------------

      cancellationPolicies: room?.cancellationPolicies || [],

      // Keep the complete original rate object also.
      // This makes sure no useful API data is lost.
      originalRate: room,
    };

    // ---------------------------------------------------------
    // ROOMS ARRAY
    // ---------------------------------------------------------

    const rooms = [selectedRoom];

    // ---------------------------------------------------------
    // HOTEL / SEARCH INFORMATION
    // ---------------------------------------------------------

    params.set("hotelId", hotelId || "");
    params.set("hotelName", hotelName || "");
    params.set("token", token || "");

    params.set("correlationId", correlationId || "");

    params.set("checkIn", checkIn || "");

    params.set("checkOut", checkOut || "");

    params.set("recommendationIdFinal", room?.recommendationId);

    const roomImageUrl = hotelImages?.heroImage || getImageUrl(images?.[0]);

    params.set("heroUrl", roomImageUrl || "");

    // ---------------------------------------------------------
    // SELECTED ROOM BASIC DATA
    // ---------------------------------------------------------

    params.set("roomId", roomId);

    params.set("roomName", roomName);

    // ---------------------------------------------------------
    // PRICE DATA
    // Keep these separately because your existing Hotel page
    // already uses them.
    // ---------------------------------------------------------

    params.set(
      "ourprice",
      room?.ourprice != null ? String(room.ourprice) : "0",
    );

    params.set("taxes", room?.taxes != null ? String(room.taxes) : "0");

    params.set("fees", room?.fees != null ? String(room.fees) : "0");

    params.set(
      "payAtHotel",
      room?.payAtHotel != null ? String(room.payAtHotel) : "",
    );

    // ---------------------------------------------------------
    // COMPLETE ROOMS DATA
    // ---------------------------------------------------------

    // ---------------------------------------------------------
    // OPTIONAL: TOTAL PERSON COUNTS
    // These are convenient directly on Hotel page.
    // ---------------------------------------------------------

    params.set("adults", String(Number(occupancy?.numOfAdults) || 0));

    params.set("children", String(Number(occupancy?.numOfChildren) || 0));

    params.set(
      "childAges",
      JSON.stringify(Array.isArray(childAges) ? childAges : []),
    );

    navigate(`/hotel?${params.toString()}`);
  };

  // =========================================================
  // RETURN
  // =========================================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return (
    <>
      <HeaderInner />

      {hotelLoader && (
        <div className="simple-hotel-loader">
          <div className="simple-hotel-loader__box">
            <div className="simple-hotel-loader__icon-wrap">
              <div className="simple-hotel-loader__icon">
                <div className="simple-hotel-loader__roof"></div>

                <div className="simple-hotel-loader__building">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="simple-hotel-loader__door"></div>
              </div>

              <div className="simple-hotel-loader__circle"></div>
            </div>

            <h2 className="simple-hotel-loader__title">
              Finding your perfect stay
            </h2>

            <p className="simple-hotel-loader__text">
              Please wait while we get hotel details for you.
            </p>

            <div className="simple-hotel-loader__loading">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="simple-hotel-loader__line">
              <div className="simple-hotel-loader__line-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HOTEL GALLERY
      ===================================================== */}

      <section className="hotel-gallery-wrapper">
        <div className="container">
          <div className="hotel-gallery-card">
            <div className="hotel-gallery-header">
              <div>
                <h2>{hotelImages?.name || hotelName || "Hotel"}</h2>

                <p>{fullAddress || "Address not available"}</p>
              </div>
            </div>

            <div className="hotel-gallery-grid">
              {/* MAIN IMAGE */}

              <div className="hotel-main-image">
                <img
                  src={hotelImages?.heroImage || getImageUrl(images?.[0])}
                  alt={hotelImages?.name || "Hotel"}
                />
              </div>

              {/* SIDE IMAGES */}

              <div className="hotel-side-gallery">
                {images.slice(0, 6).map((image, index) => (
                  <div
                    className="gallery-thumb"
                    key={index}
                    onClick={() => {
                      setActiveIndex(index);

                      setShowGallery(true);
                    }}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={image?.caption || `Hotel ${index + 1}`}
                    />

                    {index === 5 && (
                      <button
                        className="gallery-see-all"
                        onClick={(e) => {
                          e.stopPropagation();

                          setActiveIndex(0);

                          setShowGallery(true);
                        }}
                      >
                        See All Photos ({images.length})
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* FULL GALLERY */}

              {showGallery && (
                <div
                  className="gallery-overlay"
                  onClick={() => setShowGallery(false)}
                >
                  <div
                    className="gallery-wrapper"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="gallery-close"
                      onClick={() => setShowGallery(false)}
                    >
                      ✕
                    </button>

                    <Swiper
                      modules={[Keyboard]}
                      keyboard
                      spaceBetween={20}
                      slidesPerView={1}
                      initialSlide={activeIndex}
                      onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                      }}
                    >
                      {images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            className="gallery-image"
                            src={getImageUrl(image)}
                            alt={image?.caption || `Hotel ${index + 1}`}
                          />

                          <div className="gallery-count">
                            {index + 1} / {images.length}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button
                      className="gallery-arrow gallery-arrow-left"
                      onClick={() => swiperRef.current?.slidePrev()}
                    >
                      <FaChevronLeft />
                    </button>

                    <button
                      className="gallery-arrow gallery-arrow-right"
                      onClick={() => swiperRef.current?.slideNext()}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* HOTEL DESCRIPTION */}

            <div className="hotel-gallery-footer">
              <div className="hotel-description">
                {removeHtmlTags(getDescription("amenities"))}
              </div>

              <div className="hotel-timing">
                <p>
                  <FaSignInAlt />
                  Check-in Time :{" "}
                  <strong>{hotelImages?.checkinInfo?.beginTime}</strong>
                </p>

                <p>
                  <FaSignOutAlt />
                  Check-out Time :{" "}
                  <strong>{hotelImages?.checkoutInfo?.time}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROOMS
      ===================================================== */}

      <section>
        <div className="container">
          <div className="hotel-room-section">
            <h2 className="room-main-title">Choose Your Room</h2>

            {roomList.length > 0 ? (
              roomList.map((room, roomIndex) => {
                // -------------------------------------------------
                // ROOM IMAGE
                // -------------------------------------------------

                const roomImage =
                  room?.groupImages?.find(
                    (image) => image?.hero_image === true,
                  ) || room?.groupImages?.[0];

                const roomImageUrl =
                  getImageUrl(roomImage) ||
                  hotelImages?.heroImage ||
                  getImageUrl(images?.[0]);

                // -------------------------------------------------
                // BED DETAILS
                // -------------------------------------------------

                const bedDescription = getBedDescription(room, room?.groupBeds);

                // -------------------------------------------------
                // ROOM AMENITIES
                //
                // Prefer rate-level facilities.
                // Fall back to group facilities.
                // -------------------------------------------------

                const roomAmenities =
                  Array.isArray(room?.facilities) && room.facilities.length > 0
                    ? room.facilities.map((facility) =>
                        typeof facility === "string"
                          ? {
                              name: facility,
                            }
                          : facility,
                      )
                    : room?.groupFacilities?.map((facility) =>
                        typeof facility === "string"
                          ? {
                              name: facility,
                            }
                          : facility,
                      ) || [];

                // -------------------------------------------------
                // OCCUPANCY
                //
                // Only show maximum values when JSON
                // actually provides a value greater than 0.
                // -------------------------------------------------

                const maxAdults = Number(room?.groupMaxAdults) || 0;

                const maxChildren = Number(room?.groupMaxChildren) || 0;

                const maxGuests = Number(room?.groupMaxGuests) || 0;

                // -------------------------------------------------
                // AREA
                // -------------------------------------------------

                const { squareFeet, squareMeters } = getRoomArea(
                  room,
                  room?.groupArea,
                );

                // -------------------------------------------------
                // DESCRIPTION
                //
                // NEW RATE STRUCTURE:
                // room.description
                // -------------------------------------------------

                const roomDescription = room?.description || "";

                // -------------------------------------------------
                // PRICE
                // -------------------------------------------------

                const publishedRate = Number(room?.publishedRate) || 0;

                const ourPrice = Number(room?.ourprice) || 0;

                const taxes = Number(room?.taxes) || 0;

                // -------------------------------------------------
                // BOARD BASIS
                // -------------------------------------------------

                const boardBasis =
                  room?.boardBasis?.displayText ||
                  room?.boardBasis?.description ||
                  "";

                // -------------------------------------------------
                // REFUNDABILITY
                // -------------------------------------------------

                const refundable = room?.refundable;

                return (
                  <div
                    className="room-type-card"
                    key={room?.rateid || room?.id || roomIndex}
                  >
                    {/* =================================================
                          LEFT SIDE
                      ================================================= */}

                    <div className="room-left">
                      <img
                        src={roomImageUrl}
                        alt={room?.name || room?.groupName || "Room"}
                        className="room-main-image"
                      />

                      <div className="room-basic-details">
                        <h3>{room?.name || room?.groupName}</h3>

                        <div className="room-feature-list">
                          {/* ROOM / BED */}

                          {bedDescription && (
                            <div className="room-feature">
                              <FaBed className="room-icon" />

                              <span>{bedDescription}</span>
                            </div>
                          )}

                          {/* ADULTS */}

                          {maxAdults > 0 && (
                            <div className="room-feature">
                              <FaUsers className="room-icon" />

                              <span>Max {maxAdults} Adults</span>
                            </div>
                          )}

                          {/* TOTAL GUESTS */}

                          {maxGuests > 0 && (
                            <div className="room-feature">
                              <FaUsers className="room-icon" />

                              <span>Up to {maxGuests} Guests</span>
                            </div>
                          )}

                          {/* AREA */}

                          {(squareFeet || squareMeters) && (
                            <div className="room-feature">
                              <FaExpandArrowsAlt className="room-icon" />

                              <span>
                                {squareFeet
                                  ? `${squareFeet} sq ft`
                                  : `${squareMeters} sq m`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                          RIGHT SIDE
                      ================================================= */}

                    <div className="room-right">
                      <div className="rate-card">
                        <div className="rate-left">
                          <h4>{room?.name || room?.groupName}</h4>

                          {/* ROOM FEATURES */}

                          <div className="room-tags">
                            {bedDescription && (
                              <span className="meal-tag">
                                <FaBed className="tag-icon" />

                                {bedDescription}
                              </span>
                            )}

                            {maxAdults > 0 && (
                              <span className="refund-tag refundable">
                                <FaUsers className="tag-icon" />
                                {maxAdults} Adults
                              </span>
                            )}

                            {maxChildren > 0 && (
                              <span className="payment-tag">
                                <FaUsers className="tag-icon" />
                                {maxChildren} Children
                              </span>
                            )}

                            {boardBasis && (
                              <span className="meal-tag">
                                <MdRestaurant className="tag-icon" />

                                {boardBasis}
                              </span>
                            )}

                            {refundable !== undefined && (
                              <span
                                className={
                                  refundable
                                    ? "refund-tag refundable"
                                    : "payment-tag"
                                }
                              >
                                {refundable ? (
                                  <FaCheckCircle className="tag-icon" />
                                ) : (
                                  <BsCashStack className="tag-icon" />
                                )}

                                {refundable ? "Refundable" : "Non Refundable"}
                              </span>
                            )}
                          </div>

                          {/* ROOM DESCRIPTION */}

                          <p className="room-desc">
                            {removeHtmlTags(roomDescription)}
                          </p>

                          {/* ROOM AMENITIES */}

                          {roomAmenities.length > 0 && (
                            <div className="room-amenities">
                              <h5>Room Amenities</h5>

                              <div className="room-amenities-list">
                                {roomAmenities
                                  .slice(0, 8)
                                  .map((amenity, amenityIndex) => (
                                    <span
                                      key={amenity?.id || amenityIndex}
                                      className="room-amenity-tag"
                                    >
                                      ✓ {amenity?.name}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* =================================================
                              RIGHT PRICE / BOOKING
                          ================================================= */}

                        <div className="rate-right">
                          {ourPrice > 0 && (
                            <p className="tax-text">
                              <b>${formatPrice(ourPrice)}</b>
                            </p>
                          )}

                          <p style={{ fontSize: "12px", marginBottom: "15px" }}>
                            including taxes and fees
                          </p>

                          <button
                            className="book-room-btn"
                            onClick={() => {
                              handleBookRoom(room);
                            }}
                          >
                            Book Room
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-rooms">
                <h2>No Rooms Available</h2>

                <p>
                  Sorry, there are no room details available for this hotel.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          AMENITIES
      ===================================================== */}

      <section className="tb-gap">
        <div className="container">
          <div className="hotel-amenities-card">
            <h2 className="hotel-amenities-title">Amenities</h2>

            <div className="hotel-amenities-grid">
              <div className="hotel-amenities-column">
                {Array.isArray(hotelImages?.eanRating?.amenities) &&
                  hotelImages.eanRating.amenities.map((item, idx) => (
                    <div key={idx} className="hotel-amenity-item">
                      {item?.name}
                    </div>
                  ))}

                {/* FALLBACK TO FACILITIES */}

                {(!Array.isArray(hotelImages?.eanRating?.amenities) ||
                  hotelImages.eanRating.amenities.length === 0) &&
                  hotelImages?.facilities?.map((item, idx) => (
                    <div key={idx} className="hotel-amenity-item">
                      {item?.name}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION
      ===================================================== */}

      <section className="tb-gap">
        <div className="container">
          <div className="hotel-location-section">
            <h2>Location</h2>

            <div className="hotel-location-wrapper">
              <div className="hotel-map">
                <iframe
                  title="Hotel Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${hotelImages?.geoCode?.lat},${hotelImages?.geoCode?.long}&z=14&output=embed`}
                />
              </div>

              <div className="hotel-location-details">
                <div className="hotel-location-address">
                  <h3>
                    <i className="fa-solid fa-location-dot"></i>
                    Location
                  </h3>

                  <p>{fullAddress}</p>
                </div>

                {/* NEIGHBORHOODS */}

                {hotelImages?.neighbourhoods?.length > 0 && (
                  <div className="hotel-nearby">
                    <h3>Neighborhoods</h3>

                    <div className="hotel-nearby-list">
                      {hotelImages.neighbourhoods.map((item, index) => (
                        <div className="hotel-nearby-item" key={index}>
                          <span>{item?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEARBY PLACES */}

                <div className="hotel-nearby">
                  <h3>
                    <i className="fa-solid fa-route"></i>
                    Nearby Places
                  </h3>

                  <div className="hotel-nearby-list">
                    {hotelImages?.nearByAttractions?.map((item, index) => (
                      <div className="hotel-nearby-item" key={index}>
                        <span>{item?.name}</span>

                        <span>
                          {item?.distance} {item?.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          REVIEWS
      ===================================================== */}

      <section className="tb-gap">
        <div className="container">
          <div className="hotel-review-section">
            <div className="hotel-review-header">
              <h2>Reviews</h2>

              <div className="hotel-review-summary">
                <div className="hotel-rating-card">
                  <h1>{guestRatings?.overall}</h1>

                  <div className="hotel-stars">
                    {"★★★★★".split("").map((star, index) => (
                      <span
                        key={index}
                        className={
                          index < Math.round(Number(guestRatings?.overall) || 0)
                            ? "hotel-star-filled"
                            : "hotel-star-empty"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p>
                    {Number(guestRatings?.overall) >= 4
                      ? "Excellent"
                      : Number(guestRatings?.overall) >= 3
                        ? "Good"
                        : "Poor"}
                  </p>
                </div>

                <div className="hotel-rating-progress">
                  {[
                    "cleanliness",
                    "service",
                    "comfort",
                    "condition",
                    "amenities",
                  ].map((type) => {
                    const value = Number(guestRatings?.[type]) || 0;

                    return (
                      <div className="hotel-progress-item" key={type}>
                        <span>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>

                        <span>{value}</span>

                        <div className="hotel-progress-bar">
                          <div
                            className="hotel-progress-fill"
                            style={{
                              width: `${(value / 5) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <h3 className="hotel-review-title">
              Most Recent {guestRatings?.count || reviews.length} Reviews
            </h3>

            <div className="hotel-review-list">
              {currentReviews.map((review, index) => (
                <div className="hotel-review-card" key={index}>
                  <div className="hotel-review-rating">
                    <span>
                      {review?.rating}/5 •{" "}
                      {Number(review?.rating) >= 4
                        ? "Excellent"
                        : Number(review?.rating) === 3
                          ? "Good"
                          : "Poor"}
                    </span>

                    <div className="hotel-review-stars">
                      {"★★★★★".split("").map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Number(review?.rating)
                              ? "hotel-star-filled"
                              : "hotel-star-empty"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="hotel-review-info">
                    <strong>{review?.reviewer_name}</strong>

                    {review?.verification_source && (
                      <span className="hotel-review-verified">
                        Verified Traveler
                      </span>
                    )}

                    <span className="hotel-review-date">
                      {review?.date_submitted
                        ? new Date(review.date_submitted).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            },
                          )
                        : ""}
                    </span>
                  </div>

                  <p className="hotel-review-text">{review?.text}</p>
                </div>
              ))}

              {reviews.length === 0 && <p>No reviews available.</p>}

              {totalPages > 1 && (
                <div className="hotel-pagination">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="hotel-page-btn"
                  >
                    Previous
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`hotel-page-number ${
                          currentPage === index + 1 ? "hotel-page-active" : ""
                        }`}
                      >
                        {index + 1}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="hotel-page-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT HOTEL
      ===================================================== */}

      <section className="tb-gap">
        <div className="container">
          <div className="hotel-amenities-card">
            <h2 className="hotel-amenities-title">About</h2>

            <div className="hotel-amenities-grid">
              <ul>
                {hotelImages?.descriptions?.map((item, index) => (
                  <li key={index} className="hotel-amenity-item">
                    <strong>{item?.type}:</strong> {removeHtmlTags(item?.text)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CHECK-IN / CHECK-OUT / POLICIES
      ===================================================== */}

      <section className="tb-gap">
        <div className="container">
          <div className="hotel-amenities-card">
            <h2 className="hotel-amenities-title">
              Policies & Important Information
            </h2>

            <div className="hotel-amenities-grid">
              <div className="hotel-amenity-item">
                <strong>Check-in:</strong> {hotelImages?.checkinInfo?.beginTime}
              </div>

              <div className="hotel-amenity-item">
                <strong>Check-in End:</strong>{" "}
                {hotelImages?.checkinInfo?.endTime}
              </div>

              <div className="hotel-amenity-item">
                <strong>Check-out:</strong> {hotelImages?.checkoutInfo?.time}
              </div>

              {hotelImages?.eanRating?.checkin?.min_age && (
                <div className="hotel-amenity-item">
                  <strong>Minimum Check-in Age:</strong>{" "}
                  {hotelImages.eanRating.checkin.min_age}
                </div>
              )}
            </div>

            {/* CHECK-IN INSTRUCTIONS */}

            {hotelImages?.eanRating?.checkin?.instructions && (
              <div className="hotel-description">
                <h3>Check-in Instructions</h3>

                <p>
                  {removeHtmlTags(hotelImages.eanRating.checkin.instructions)}
                </p>
              </div>
            )}

            {/* SPECIAL CHECK-IN INSTRUCTIONS */}

            {hotelImages?.eanRating?.checkin?.special_instructions && (
              <div className="hotel-description">
                <h3>Special Check-in Instructions</h3>

                <p>{hotelImages.eanRating.checkin.special_instructions}</p>
              </div>
            )}

            {/* MANDATORY FEES */}

            {hotelImages?.eanRating?.fees?.mandatory && (
              <div className="hotel-description">
                <h3>Mandatory Fees</h3>

                <p>{removeHtmlTags(hotelImages.eanRating.fees.mandatory)}</p>
              </div>
            )}

            {/* OPTIONAL FEES */}

            {hotelImages?.eanRating?.fees?.optional && (
              <div className="hotel-description">
                <h3>Optional Fees</h3>

                <p>{removeHtmlTags(hotelImages.eanRating.fees.optional)}</p>
              </div>
            )}

            {/* KNOW BEFORE YOU GO */}

            {hotelImages?.eanRating?.policies?.know_before_you_go && (
              <div className="hotel-description">
                <h3>Know Before You Go</h3>

                <p>
                  {removeHtmlTags(
                    hotelImages.eanRating.policies.know_before_you_go,
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HotelDetailPage;
