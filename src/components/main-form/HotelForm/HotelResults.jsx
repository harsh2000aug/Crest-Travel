import React, { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt, FaStar, FaWifi } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import {
  hotelNextPull,
  hotelShow,
  newHotelFetch,
} from "../../../store/Services/AllApi";

import Footer from "../../../reuseable-components/Footer";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import HotelLoader from "../../../reuseable-components/HotelLoader/HotelLoader";
import DatePicker from "react-datepicker";

import { useAtom } from "jotai";
import {
  AdultCountToStore,
  ChildCountToStore,
  TotalRooms,
} from "../../../atoms/userAtom";

function HotelCard({
  image,
  name,
  location,
  newPrice,
  publishedRate,
  discountPercentage,
  credit,
  starRating,
  facilities,
  options,
  payAtHotel,
  onClick,
}) {
  const hasFreeWifi = (facilities || []).some((facility) =>
    String(facility?.name || "")
      .toLowerCase()
      .includes("free wifi"),
  );

  const published = Number(publishedRate || 0);
  const ourPrice = Number(newPrice || 0);

  const calculatedDiscount =
    published > 0 && ourPrice > 0 && published > ourPrice
      ? Math.round(((published - ourPrice) / published) * 100)
      : 0;

  return (
    <div className="lux-hotel-card" onClick={onClick}>
      <div className="lux-hotel-img-wrap">
        <img
          src={image || "/images/hotel-placeholder.jpg"}
          alt={name || "Hotel"}
        />
        {calculatedDiscount > 0 && (
          <div className="hotel-discount-badge">{calculatedDiscount}% OFF</div>
        )}
      </div>

      <div className="lux-hotel-content">
        <div className="lux-top-row">
          <div>
            <h3>{name}</h3>

            <p className="lux-location">
              <FaMapMarkerAlt />
              {location}
            </p>
          </div>
        </div>

        <div className="lux-hotel-options">
          {Object.entries(options || {})
            .filter(([_, value]) => value === true)
            .map(([key]) => (
              <span className="hotel-option green" key={key}>
                ✓{" "}
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </span>
            ))}

          {payAtHotel && (
            <span className="hotel-option green">✓ Pay At Hotel</span>
          )}

          {hasFreeWifi && (
            <span className="hotel-option green">
              <FaWifi /> Free WiFi
            </span>
          )}
        </div>

        <div className="lux-bottom-row">
          <div className="lux-rating-box">
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              Ratings:
              <span className="lux-stars">
                {Number(starRating) > 0 &&
                  [...Array(Math.floor(Number(starRating)))].map((_, index) => (
                    <FaStar key={index} />
                  ))}
              </span>
            </span>
          </div>

          <div className="lux-price-box">
            {Number(credit || 0) > 0 && (
              <div className="lux-credit">
                Using <b>{Number(credit).toFixed(2)}</b> room coins
              </div>
            )}

            <h2>${Number(newPrice || 0).toFixed(2)}</h2>

            <small>Includes taxes</small>

            <button
              type="button"
              className="lux-view-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              View Deal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const getHotelListingsResult = (response) => {
  return response?.data?.hotelListings?.result || null;
};

const getHotelsFromResult = (result) => {
  if (!result) return [];

  if (Array.isArray(result?.result)) {
    return result.result;
  }

  if (Array.isArray(result?.hotels)) {
    return result.hotels;
  }

  return [];
};

const getStatus = (result) => {
  return String(result?.status || "").toLowerCase();
};

const getFiltersFromResult = (result) => {
  return result?.filters || {};
};

const mergeHotels = (oldHotels = [], newHotels = []) => {
  const map = new Map();

  [...oldHotels, ...newHotels].forEach((hotel) => {
    if (!hotel) return;

    const id = hotel?.id;

    if (id === undefined || id === null) return;

    const key = String(id);
    const existingHotel = map.get(key);

    if (!existingHotel) {
      map.set(key, hotel);
      return;
    }

    const existingPrice = Number(existingHotel?.ourprice || Infinity);
    const newPrice = Number(hotel?.ourprice || Infinity);

    if (newPrice < existingPrice) {
      map.set(key, hotel);
    }
  });

  return Array.from(map.values());
};

export default function HotelResults() {
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [hotelsGet, setHotelGet] = useState([]);

  const [hotelLoader, setHotelLoader] = useState(false);

  const [isFetchingMoreHotels, setIsFetchingMoreHotels] = useState(false);

  const [showModifyForm, setShowModifyForm] = useState(false);

  const [hotelResults, setHotelResults] = useState([]);

  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedDestination, setSelectedDestination] = useState(null);

  const [paramsData, setParamsData] = useState(null);

  const [apiFilters, setApiFilters] = useState({});

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,

    starRatings: [],

    propertyTypes: [],

    chains: [],

    freeCancellation: false,

    freeBreakfast: false,

    refundable: false,

    freeWifi: false,

    payAtHotel: false,

    sortBy: "",
  });

  const hotelData = useMemo(() => {
    let roomDetails = [];

    try {
      roomDetails = JSON.parse(
        decodeURIComponent(params.get("roomDetails") || "[]"),
      );
    } catch {
      roomDetails = [];
    }

    return {
      destination: params.get("destination"),

      checkIn: params.get("checkIn"),

      checkOut: params.get("checkOut"),

      adults: Number(params.get("adults") || 0),

      children: Number(params.get("children") || 0),

      rooms: Number(params.get("rooms") || 1),

      locationid: params.get("locationid"),

      lat: Number(params.get("lat") || 25.27063),

      long: Number(params.get("long") || 55.30037),

      countryOfResidence: params.get("countryOfResidence") || "US",

      roomDetails,
    };
  }, [params]);

  const [searchData, setSearchData] = useState(hotelData);

  const [destination, setDestination] = useState(hotelData.destination || "");

  const [dateRange, setDateRange] = useState([
    hotelData.checkIn ? new Date(hotelData.checkIn) : null,

    hotelData.checkOut ? new Date(hotelData.checkOut) : null,
  ]);

  const [roomDetails, setRoomDetails] = useState(hotelData.roomDetails || []);

  const [showPopup, setShowPopup] = useState(false);

  const [adults, setAdults] = useState(hotelData.roomDetails?.[0]?.adults || 1);

  const [children, setChildren] = useState(
    hotelData.roomDetails?.[0]?.children || 0,
  );

  const [childrenAges, setChildrenAges] = useState(
    hotelData.roomDetails?.[0]?.childrenAges || [],
  );

  const [rooms, setRooms] = useState(hotelData.roomDetails?.slice(1) || []);

  const [roomCountToStore, setRoomCountToStore] = useAtom(TotalRooms);

  const [adultCountToStore, setAdultCountToStore] = useAtom(AdultCountToStore);

  const [childCountToStore, setChildCountToStore] = useAtom(ChildCountToStore);

  const totalAdults =
    Number(adults || 0) +
    rooms.reduce((sum, room) => sum + Number(room?.adults || 0), 0);

  const totalChildren =
    Number(children || 0) +
    rooms.reduce((sum, room) => sum + Number(room?.children || 0), 0);

  const totalRooms = rooms.length + 1;

  const handleNextPull = async (
    requestBody,
    initialNextResultsKey,
    initialCorrelationId,
    initialToken,
    initialHotels = [],
  ) => {
    let allHotels = [...initialHotels];

    let nextResultsKey = initialNextResultsKey;
    let correlationId = initialCorrelationId;
    let token = initialToken;
    let finalResult = null;

    const MAX_PULLS = 30;
    const MAX_POLLING_TIME = 30000;
    const POLL_INTERVAL = 2500;
    const pollingStartedAt = Date.now();

    for (let attempt = 0; attempt < MAX_PULLS; attempt++) {
      if (Date.now() - pollingStartedAt >= MAX_POLLING_TIME) {
        console.warn("Hotel polling timed out.");
        break;
      }

      if (!nextResultsKey) {
        break;
      }

      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }

      const nextRequestBody = {
        ...requestBody,
        nextResultsKey,
        correlationId,
        token,
      };

      const res = await hotelNextPull({
        body: nextRequestBody,
      });

      const result = getHotelListingsResult(res);

      if (!result) {
        throw new Error("Invalid hotelNextPull response");
      }

      finalResult = result;

      const pulledHotels = getHotelsFromResult(result);

      allHotels = mergeHotels(allHotels, pulledHotels);

      setHotelGet([...allHotels]);

      if (allHotels.length > 0) {
        setHotelLoader(false);
      }

      const latestFilters = getFiltersFromResult(result);

      if (Object.keys(latestFilters).length > 0) {
        setApiFilters(latestFilters);
      }

      setParamsData(result);

      if (result?.token) {
        token = result.token;
        localStorage.setItem("hotelToken", result.token);
      }

      if (result?.correlationId) {
        correlationId = result.correlationId;
      }

      if (result?.nextResultsKey) {
        nextResultsKey = result.nextResultsKey;
      } else {
        nextResultsKey = null;
      }

      const status = getStatus(result);

      console.log(`Hotel pull ${attempt + 1}:`, {
        status: result?.status,
        hotels: allHotels.length,
      });

      if (status === "completed") {
        break;
      }

      if (!nextResultsKey) {
        console.warn(
          "Hotel search is not completed but no nextResultsKey was returned.",
        );

        break;
      }
    }

    setHotelGet(allHotels);

    if (finalResult) {
      setParamsData(finalResult);

      if (finalResult?.filters) {
        setApiFilters(finalResult.filters);
      }

      if (finalResult?.token) {
        localStorage.setItem("hotelToken", finalResult.token);
      }
    }

    return {
      result: finalResult,
      hotels: allHotels,
      correlationId,
      token,
      nextResultsKey,
    };
  };

  const handleSearchHotel = async ({
    destinationData = selectedDestination,

    checkIn = dateRange[0],

    checkOut = dateRange[1],

    roomData = roomDetails,
  } = {}) => {
    setHotelLoader(true);

    setHotelGet([]);

    setApiFilters({});

    setParamsData(null);

    setFilters({
      minPrice: 0,
      maxPrice: 10000,
      starRatings: [],
      propertyTypes: [],
      chains: [],
      freeCancellation: false,
      freeBreakfast: false,
      refundable: false,
      freeWifi: false,
      payAtHotel: false,
      sortBy: "",
    });

    try {
      const occupancies = roomData.map((room) => ({
        numOfAdults: Number(room?.adults || 0),

        childAges: (room?.childrenAges || [])
          .filter((age) => age !== "")
          .map((age) => Number(age)),
      }));

      const locationid =
        destinationData?.destinationId || hotelData.locationid || "";

      const lat = destinationData?.latitude ?? hotelData.lat ?? 25.27063;

      const long = destinationData?.longitude ?? hotelData.long ?? 55.30037;

      const destinationName =
        destinationData?.destination ||
        destination ||
        hotelData.destination ||
        "";

      const formattedCheckIn = checkIn
        ? new Date(checkIn).toISOString().split("T")[0]
        : hotelData.checkIn;

      const formattedCheckOut = checkOut
        ? new Date(checkOut).toISOString().split("T")[0]
        : hotelData.checkOut;

      const requestBody = {
        locationid,

        checkIn: formattedCheckIn,

        checkOut: formattedCheckOut,

        lat: Number(lat),

        long: Number(long),

        countryOfResidence: hotelData.countryOfResidence || "US",

        occupancies,
      };

      console.log("newHotelFetch request:", requestBody);

      const res = await newHotelFetch({
        body: requestBody,
      });

      console.log("newHotelFetch response:", res);

      const result = getHotelListingsResult(res);

      if (!result) {
        throw new Error("Invalid hotel search response");
      }

      const initialHotels = getHotelsFromResult(result);
      const collectedHotels = mergeHotels([], initialHotels);

      setHotelGet(collectedHotels);

      if (collectedHotels.length > 0) {
        setHotelLoader(false);
      }

      const initialFilters = getFiltersFromResult(result);

      setApiFilters(initialFilters);

      setParamsData(result);

      if (result?.token) {
        localStorage.setItem("hotelToken", result.token);
      }

      let finalHotels = collectedHotels;
      let finalResult = result;

      const status = getStatus(result);

      if (status === "completed") {
        finalHotels = collectedHotels;

        setHotelGet(finalHotels);
      } else if (result?.nextResultsKey) {
        setIsFetchingMoreHotels(true);

        const pullResult = await handleNextPull(
          requestBody,
          result.nextResultsKey,
          result.correlationId,
          result.token,
          collectedHotels,
        );

        setIsFetchingMoreHotels(false);

        finalHotels = pullResult.hotels;
        finalResult = pullResult.result || result;

        setHotelGet(finalHotels);
        setParamsData(finalResult);

        if (finalResult?.filters) {
          setApiFilters(finalResult.filters);
        }
      }

      setSearchData({
        destination: destinationName,

        checkIn: formattedCheckIn,

        checkOut: formattedCheckOut,

        adults: roomData.reduce(
          (sum, room) => sum + Number(room?.adults || 0),
          0,
        ),

        children: roomData.reduce(
          (sum, room) => sum + Number(room?.children || 0),
          0,
        ),

        rooms: roomData.length,

        locationid,

        lat,

        long,

        countryOfResidence: hotelData.countryOfResidence,

        roomDetails: roomData,
      });

      setDestination(destinationName);
      setDateRange([
        formattedCheckIn ? new Date(formattedCheckIn) : null,
        formattedCheckOut ? new Date(formattedCheckOut) : null,
      ]);
      setRoomDetails(roomData);
      setAdults(roomData?.[0]?.adults || 1);
      setChildren(roomData?.[0]?.children || 0);
      setChildrenAges(roomData?.[0]?.childrenAges || []);
      setRooms(roomData.slice(1));
      setSelectedDestination({
        destination: destinationName,
        destinationId: locationid,
        latitude: lat,
        longitude: long,
      });

      const urlParams = new URLSearchParams({
        destination: destinationName || "",

        locationid: locationid || "",

        checkIn: formattedCheckIn || "",

        checkOut: formattedCheckOut || "",

        lat: String(lat || ""),

        long: String(long || ""),

        countryOfResidence: hotelData.countryOfResidence || "US",

        adults: String(
          roomData.reduce((sum, room) => sum + Number(room?.adults || 0), 0),
        ),

        children: String(
          roomData.reduce((sum, room) => sum + Number(room?.children || 0), 0),
        ),

        rooms: String(roomData.length),

        roomDetails: JSON.stringify(roomData),
      });

      navigate(`/hotel-results?${urlParams.toString()}`, {
        replace: true,
      });
    } catch (error) {
      console.log("Hotel search error:", error);

      setHotelGet([]);

      setApiFilters({});
    } finally {
      setHotelLoader(false);
    }
  };

  useEffect(() => {
    handleSearchHotel();
  }, []);

  useEffect(() => {
    setSearchData(hotelData);
    setDestination(hotelData.destination || "");

    setDateRange([
      hotelData.checkIn ? new Date(hotelData.checkIn) : null,
      hotelData.checkOut ? new Date(hotelData.checkOut) : null,
    ]);

    const updatedRoomDetails = hotelData.roomDetails || [];

    setRoomDetails(updatedRoomDetails);
    setAdults(updatedRoomDetails?.[0]?.adults || 1);
    setChildren(updatedRoomDetails?.[0]?.children || 0);
    setChildrenAges(updatedRoomDetails?.[0]?.childrenAges || []);
    setRooms(updatedRoomDetails.slice(1));

    if (hotelData.destination) {
      setSelectedDestination({
        destination: hotelData.destination,
        destinationId: hotelData.locationid,
        latitude: hotelData.lat,
        longitude: hotelData.long,
      });
    }
  }, [hotelData]);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const totalGuests =
    Number(searchData.adults || 0) + Number(searchData.children || 0);

  const handleDestinationChange = async (e) => {
    const query = e.target.value;

    setDestination(query);

    setSelectedDestination(null);

    if (!query.trim()) {
      setHotelResults([]);

      setShowDropdown(false);

      return;
    }

    try {
      const res = await hotelShow({
        body: {
          query,

          type: "destination",
        },
      });

      setHotelResults(res?.result || []);

      setShowDropdown(true);
    } catch (error) {
      console.log(error);

      setHotelResults([]);

      setShowDropdown(false);
    }
  };

  const handleHotelClick = (hotel) => {
    const allChildAges = [
      ...childrenAges,

      ...rooms.flatMap((room) => room?.childrenAges || []),
    ].filter((age) => age !== "");

    const hotelParams = new URLSearchParams({
      hotelid: hotel?.id || "",

      checkIn: searchData.checkIn || "",

      checkOut: searchData.checkOut || "",

      countryOfResidence: "US",

      currencyrate: String(paramsData?.currencyrate || ""),

      hotelName: hotel?.name || "",

      correlationId: String(paramsData?.correlationId || ""),

      adults: String(totalAdults),

      children: String(totalChildren),

      childAges: JSON.stringify(allChildAges),
    });

    navigate(`/hotel-details?${hotelParams.toString()}`);
  };

  const apiPriceMin = Number(apiFilters?.price?.min) || 0;

  const apiPriceMax = Number(apiFilters?.price?.max) || 1000;

  const maxHotelPrice = useMemo(() => {
    if (Number(apiPriceMax) > 0) {
      return Math.ceil(apiPriceMax);
    }

    const prices = (hotelsGet || [])
      .map((hotel) => Number(hotel?.ourprice || 0))
      .filter((price) => price > 0);

    if (!prices.length) {
      return 1000;
    }

    return Math.max(1000, Math.ceil(Math.max(...prices)));
  }, [apiPriceMax, hotelsGet]);

  const propertyTypes = useMemo(() => {
    if (Array.isArray(apiFilters?.propertyType)) {
      return apiFilters.propertyType;
    }

    return [
      ...new Set(
        (hotelsGet || []).map((hotel) => hotel?.category).filter(Boolean),
      ),
    ];
  }, [apiFilters, hotelsGet]);

  const hotelChains = useMemo(() => {
    if (Array.isArray(apiFilters?.chain)) {
      return apiFilters.chain;
    }

    return [
      ...new Set(
        (hotelsGet || []).map((hotel) => hotel?.chain).filter(Boolean),
      ),
    ];
  }, [apiFilters, hotelsGet]);

  const starRatingCounts = apiFilters?.startrating || {};

  const availableMeals = Array.isArray(apiFilters?.meals)
    ? apiFilters.meals
    : [];

  const availableCancellation = Array.isArray(apiFilters?.cancellation)
    ? apiFilters.cancellation
    : [];

  const hasFreeBreakfastFilter = availableMeals.includes("freeBreakfast");

  const hasFreeCancellationFilter =
    availableCancellation.includes("freeCancellation");

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,

      minPrice: prev.minPrice === 0 ? apiPriceMin : prev.minPrice,

      maxPrice: apiPriceMax > 0 ? apiPriceMax : maxHotelPrice,
    }));
  }, [apiPriceMin, apiPriceMax, maxHotelPrice]);

  const hotelHasFacility = (hotel, searchText) => {
    const facilities = hotel?.facilities || [];

    return facilities.some((facility) =>
      String(facility?.name || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );
  };

  const filteredHotels = useMemo(() => {
    const filtered = (hotelsGet || []).filter((hotel) => {
      const price = Number(hotel?.ourprice || 0);

      const starRating = Number(hotel?.starRating || 0);

      const options = hotel?.options || {};

      const hasWifi = hotelHasFacility(hotel, "free wifi");

      if (price < Number(filters.minPrice)) {
        return false;
      }

      if (price > Number(filters.maxPrice)) {
        return false;
      }

      if (filters.starRatings.length > 0) {
        if (!filters.starRatings.includes(starRating)) {
          return false;
        }
      }

      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(hotel?.category)
      ) {
        return false;
      }

      if (filters.chains.length > 0 && !filters.chains.includes(hotel?.chain)) {
        return false;
      }

      if (filters.freeCancellation && !options?.freeCancellation) {
        return false;
      }

      if (filters.freeBreakfast && !options?.freeBreakfast) {
        return false;
      }

      if (filters.refundable && !options?.refundable) {
        return false;
      }

      if (filters.freeWifi && !hasWifi) {
        return false;
      }

      if (filters.payAtHotel && !hotel?.payAtHotel) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const getCalculatedDiscount = (hotel) => {
        const published = Number(hotel?.publishedRate || 0);

        const ourPrice = Number(hotel?.ourprice_before_credit || 0);

        if (published > 0 && ourPrice > 0 && published > ourPrice) {
          return Math.round(((published - ourPrice) / published) * 100);
        }

        return 0;
      };

      if (filters.sortBy === "discountHigh") {
        return getCalculatedDiscount(b) - getCalculatedDiscount(a);
      }

      if (filters.sortBy === "priceLow") {
        return Number(a?.ourprice || 0) - Number(b?.ourprice || 0);
      }

      if (filters.sortBy === "priceHigh") {
        return Number(b?.ourprice || 0) - Number(a?.ourprice || 0);
      }

      if (filters.sortBy === "ratingHigh") {
        return Number(b?.starRating || 0) - Number(a?.starRating || 0);
      }

      if (filters.sortBy === "distance") {
        return Number(a?.distancekm || 0) - Number(b?.distancekm || 0);
      }

      return getCalculatedDiscount(b) - getCalculatedDiscount(a);
    });
  }, [hotelsGet, filters]);

  const clearAllFilters = () => {
    setFilters({
      minPrice: apiPriceMin,
      maxPrice: apiPriceMax || maxHotelPrice,
      starRatings: [],
      propertyTypes: [],
      chains: [],
      freeCancellation: false,
      freeBreakfast: false,
      refundable: false,
      freeWifi: false,
      payAtHotel: false,
      sortBy: "",
    });
  };

  const handleStarFilter = (star) => {
    setFilters((prev) => ({
      ...prev,

      starRatings: prev.starRatings.includes(star)
        ? prev.starRatings.filter((item) => item !== star)
        : [...prev.starRatings, star],
    }));
  };

  const handlePropertyFilter = (type) => {
    setFilters((prev) => ({
      ...prev,

      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((item) => item !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const handleChainFilter = (chain) => {
    setFilters((prev) => ({
      ...prev,

      chains: prev.chains.includes(chain)
        ? prev.chains.filter((item) => item !== chain)
        : [...prev.chains, chain],
    }));
  };

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return (
    <>
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
              Searching the best hotels for you
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

      <HeaderInner />

      <div className="lux-results-page">
        <div className="container">
          <div className="lux-search-bar">
            <div>
              <h2>{searchData.destination}</h2>

              <p>
                {formatDate(searchData.checkIn)} -{" "}
                {formatDate(searchData.checkOut)} • {searchData.rooms} Room
                {searchData.rooms > 1 ? "s" : ""} • {totalGuests} Guest
                {totalGuests > 1 ? "s" : ""}
              </p>
            </div>

            <button
              className="lux-change-btn"
              type="button"
              onClick={() => setShowModifyForm((prev) => !prev)}
            >
              Modify Search
            </button>
          </div>

          {/* =================================================
              MODIFY SEARCH
          ================================================= */}

          {showModifyForm && (
            <form
              className="hotel-form"
              onSubmit={(e) => {
                e.preventDefault();

                const updatedRoomData = [
                  {
                    adults,

                    children,

                    childrenAges,
                  },

                  ...rooms,
                ];

                localStorage.setItem("roomCountToStore", totalRooms);

                localStorage.setItem("adultCountToStore", totalAdults);

                localStorage.setItem("childCountToStore", totalChildren);

                setRoomCountToStore(totalRooms);

                setAdultCountToStore(totalAdults);

                setChildCountToStore(totalChildren);

                setRoomDetails(updatedRoomData);

                handleSearchHotel({
                  destinationData: selectedDestination,

                  checkIn: dateRange[0],

                  checkOut: dateRange[1],

                  roomData: updatedRoomData,
                });

                setShowModifyForm(false);
              }}
            >
              {/* DESTINATION */}

              <div
                className="input-group"
                style={{
                  position: "relative",
                }}
              >
                <label>Destination</label>

                <input
                  type="text"
                  value={destination}
                  onChange={handleDestinationChange}
                  autoComplete="off"
                />

                {showDropdown && hotelResults.length > 0 && (
                  <div className="destination-dropdown">
                    {hotelResults.map((item) => (
                      <div
                        key={item.id}
                        className="destination-item"
                        onClick={() => {
                          setDestination(item.fullName);

                          setSelectedDestination({
                            destination: item.fullName,

                            destinationId: item.id,

                            destinationType: item.type,

                            latitude: item.coordinates?.lat,

                            longitude: item.coordinates?.long,
                          });

                          setHotelResults([]);

                          setShowDropdown(false);
                        }}
                      >
                        <strong
                          style={{
                            display: "block",

                            marginBottom: "10px",
                          }}
                        >
                          {item.fullName}
                        </strong>

                        <div>{item.country}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}

              <div className="input-group">
                <label>Check In - Check Out</label>

                <DatePicker
                  selected={dateRange[0]}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(update) => setDateRange(update)}
                  selectsRange
                  minDate={today}
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              {/* GUESTS */}

              <div className="input-group">
                <label>Guests and Rooms</label>

                <input
                  type="text"
                  readOnly
                  onClick={() => setShowPopup(true)}
                  value={`${totalAdults} Adult${totalAdults > 1 ? "s" : ""}${
                    totalChildren > 0
                      ? `, ${totalChildren} Child${
                          totalChildren > 1 ? "ren" : ""
                        }`
                      : ""
                  }, ${totalRooms} Room${totalRooms > 1 ? "s" : ""}`}
                />

                {showPopup && (
                  <div
                    className="travel-guest-popup"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* ROOM 1 */}

                    <div className="travel-room-title">Room 1</div>

                    {/* ADULTS */}

                    <div className="travel-guest-row">
                      <div className="travel-guest-info">
                        <h4>Adults</h4>
                      </div>

                      <div className="travel-counter">
                        <button
                          type="button"
                          onClick={() => setAdults(adults > 1 ? adults - 1 : 1)}
                        >
                          −
                        </button>

                        <span>{adults}</span>

                        <button
                          type="button"
                          onClick={() => setAdults(adults + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* CHILDREN */}

                    <div className="travel-guest-row">
                      <div className="travel-guest-info">
                        <h4>Children</h4>

                        <p>Age 1-17</p>
                      </div>

                      <div className="travel-counter">
                        <button
                          type="button"
                          onClick={() => {
                            if (children > 0) {
                              setChildren(children - 1);

                              setChildrenAges((prev) => prev.slice(0, -1));
                            }
                          }}
                        >
                          −
                        </button>

                        <span>{children}</span>

                        <button
                          type="button"
                          onClick={() => {
                            setChildren((prev) => prev + 1);

                            setChildrenAges((prev) => [...prev, ""]);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* CHILD AGES */}

                    {children > 0 && (
                      <div className="children-age-container">
                        {childrenAges.map((age, childIndex) => (
                          <div className="child-age-row" key={childIndex}>
                            <label>Child {childIndex + 1} Age</label>

                            <select
                              value={age || ""}
                              onChange={(e) => {
                                const updated = [...childrenAges];

                                updated[childIndex] = e.target.value;

                                setChildrenAges(updated);
                              }}
                            >
                              <option value="">Select age</option>

                              {Array.from(
                                {
                                  length: 17,
                                },
                                (_, i) => i + 1,
                              ).map((ageValue) => (
                                <option key={ageValue} value={ageValue}>
                                  {ageValue} {ageValue === 1 ? "year" : "years"}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* OTHER ROOMS */}

                    {rooms.map((room, index) => (
                      <React.Fragment key={index}>
                        <div
                          className="travel-room-header"
                          style={{
                            display: "flex",

                            justifyContent: "space-between",

                            alignItems: "center",
                          }}
                        >
                          <div className="travel-room-title">
                            Room {index + 2}
                          </div>

                          <button
                            type="button"
                            className="travel-remove-room-btn"
                            onClick={() => {
                              const updated = [...rooms];

                              updated.splice(index, 1);

                              setRooms(updated);
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* ROOM ADULTS */}

                        <div className="travel-guest-row">
                          <div className="travel-guest-info">
                            <h4>Adults</h4>
                          </div>

                          <div className="travel-counter">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...rooms];

                                updated[index] = {
                                  ...updated[index],

                                  adults:
                                    Number(updated[index]?.adults || 1) > 1
                                      ? Number(updated[index]?.adults || 1) - 1
                                      : 1,
                                };

                                setRooms(updated);
                              }}
                            >
                              −
                            </button>

                            <span>{room.adults}</span>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...rooms];

                                updated[index] = {
                                  ...updated[index],

                                  adults:
                                    Number(updated[index]?.adults || 1) + 1,
                                };

                                setRooms(updated);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* ROOM CHILDREN */}

                        <div className="travel-guest-row">
                          <div className="travel-guest-info">
                            <h4>Children</h4>

                            <p>Age 1-17</p>
                          </div>

                          <div className="travel-counter">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...rooms];

                                if (Number(updated[index]?.children || 0) > 0) {
                                  updated[index] = {
                                    ...updated[index],

                                    children:
                                      Number(updated[index]?.children || 0) - 1,

                                    childrenAges: (
                                      updated[index]?.childrenAges || []
                                    ).slice(0, -1),
                                  };

                                  setRooms(updated);
                                }
                              }}
                            >
                              −
                            </button>

                            <span>{room.children}</span>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...rooms];

                                updated[index] = {
                                  ...updated[index],

                                  children:
                                    Number(updated[index]?.children || 0) + 1,

                                  childrenAges: [
                                    ...(updated[index]?.childrenAges || []),

                                    "",
                                  ],
                                };

                                setRooms(updated);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* ROOM CHILD AGES */}

                        {Number(room.children || 0) > 0 && (
                          <div className="children-age-container">
                            {(room.childrenAges || []).map(
                              (age, childIndex) => (
                                <div className="child-age-row" key={childIndex}>
                                  <label>Child {childIndex + 1} Age</label>

                                  <select
                                    value={age || ""}
                                    onChange={(e) => {
                                      const updated = [...rooms];

                                      const updatedAges = [
                                        ...(updated[index]?.childrenAges || []),
                                      ];

                                      updatedAges[childIndex] = e.target.value;

                                      updated[index] = {
                                        ...updated[index],

                                        childrenAges: updatedAges,
                                      };

                                      setRooms(updated);
                                    }}
                                  >
                                    <option value="">Select age</option>

                                    {Array.from(
                                      {
                                        length: 17,
                                      },
                                      (_, i) => i + 1,
                                    ).map((ageValue) => (
                                      <option key={ageValue} value={ageValue}>
                                        {ageValue}{" "}
                                        {ageValue === 1 ? "year" : "years"}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}

                    {/* POPUP FOOTER */}

                    <div className="travel-popup-footer">
                      <button
                        className="travel-add-room-btn"
                        type="button"
                        onClick={() =>
                          setRooms((prev) => [
                            ...prev,

                            {
                              adults: 1,

                              children: 0,

                              childrenAges: [],
                            },
                          ])
                        }
                      >
                        + Add Room
                      </button>

                      <button
                        className="travel-apply-btn"
                        type="button"
                        onClick={() => setShowPopup(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="input-gang">
                <button className="search-btn" type="submit">
                  Search Hotels
                </button>
              </div>
            </form>
          )}

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <div className="hotel-sidebar">
            <div className="sidebar-right">
              <div className="hotel-filter-card">
                <div
                  className="hotel-filter-header"
                  style={{
                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    gap: "10px",
                  }}
                >
                  <h3 className="hotel-filter-title">Filter By</h3>

                  <button
                    type="button"
                    className="hotel-clear-filter-btn"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                </div>

                {/* =========================================
                    PRICE
                ========================================= */}

                <div className="hotel-filter-section">
                  <h4 className="hotel-filter-heading">Price Range</h4>

                  <div className="price-filter">
                    <label>Min Price: ${filters.minPrice}</label>

                    <input
                      type="range"
                      min={apiPriceMin}
                      max={maxHotelPrice}
                      step={1}
                      value={filters.minPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        setFilters((prev) => ({
                          ...prev,

                          minPrice: Math.min(value, prev.maxPrice),
                        }));
                      }}
                    />
                  </div>

                  <div className="price-filter">
                    <label>Max Price: ${filters.maxPrice}</label>

                    <input
                      type="range"
                      min={apiPriceMin}
                      max={maxHotelPrice}
                      step={1}
                      value={filters.maxPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        setFilters((prev) => ({
                          ...prev,

                          maxPrice: Math.max(value, prev.minPrice),
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* =========================================
                    STAR RATING
                ========================================= */}

                <div className="hotel-filter-section">
                  <h4 className="hotel-filter-heading">Star Rating</h4>

                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = Number(starRatingCounts?.[String(star)] || 0);

                    /*
                        Don't show star filters
                        which API says have no hotels.
                      */
                    if (count === 0) {
                      return null;
                    }

                    return (
                      <label
                        className="hotel-filter-checkbox"
                        key={star}
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: "8px",

                          marginBottom: "8px",

                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filters.starRatings.includes(star)}
                          onChange={() => handleStarFilter(star)}
                        />

                        <span
                          style={{
                            display: "flex",

                            alignItems: "center",

                            gap: "4px",
                          }}
                        >
                          {star}

                          <FaStar />

                          <span>Star</span>

                          <span>({count})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* =========================================
                    PROPERTY TYPE
                ========================================= */}

                {propertyTypes.length > 0 && (
                  <div className="hotel-filter-section">
                    <h4 className="hotel-filter-heading">Property Type</h4>

                    {propertyTypes.map((type) => (
                      <label
                        className="hotel-filter-checkbox"
                        key={type}
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: "8px",

                          marginBottom: "8px",

                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filters.propertyTypes.includes(type)}
                          onChange={() => handlePropertyFilter(type)}
                        />

                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* =========================================
                    HOTEL CHAIN
                ========================================= */}

                {hotelChains.length > 0 && (
                  <div className="hotel-filter-section">
                    <h4 className="hotel-filter-heading">Hotel Chain</h4>

                    {hotelChains.map((chain) => (
                      <label
                        className="hotel-filter-checkbox"
                        key={chain}
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: "8px",

                          marginBottom: "8px",

                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filters.chains.includes(chain)}
                          onChange={() => handleChainFilter(chain)}
                        />

                        <span>{chain}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* =========================================
                    BOOKING OPTIONS
                ========================================= */}

                <div className="hotel-filter-section">
                  <h4 className="hotel-filter-heading">Booking Options</h4>

                  {/* FREE CANCELLATION */}

                  {hasFreeCancellationFilter && (
                    <label
                      className="hotel-filter-checkbox"
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: "8px",

                        marginBottom: "8px",

                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.freeCancellation}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,

                            freeCancellation: e.target.checked,
                          }))
                        }
                      />

                      <span>Free Cancellation</span>
                    </label>
                  )}

                  {/* FREE BREAKFAST */}

                  {hasFreeBreakfastFilter && (
                    <label
                      className="hotel-filter-checkbox"
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: "8px",

                        marginBottom: "8px",

                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.freeBreakfast}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,

                            freeBreakfast: e.target.checked,
                          }))
                        }
                      />

                      <span>Free Breakfast</span>
                    </label>
                  )}

                  {/* REFUNDABLE */}

                  <label
                    className="hotel-filter-checkbox"
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: "8px",

                      marginBottom: "8px",

                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.refundable}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,

                          refundable: e.target.checked,
                        }))
                      }
                    />

                    <span>Refundable</span>
                  </label>

                  {/* FREE WIFI */}

                  <label
                    className="hotel-filter-checkbox"
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: "8px",

                      marginBottom: "8px",

                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.freeWifi}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,

                          freeWifi: e.target.checked,
                        }))
                      }
                    />

                    <span>Free WiFi</span>
                  </label>

                  {/* PAY AT HOTEL */}

                  <label
                    className="hotel-filter-checkbox"
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: "8px",

                      marginBottom: "8px",

                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.payAtHotel}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,

                          payAtHotel: e.target.checked,
                        }))
                      }
                    />

                    <span>Pay At Hotel</span>
                  </label>
                </div>
              </div>
            </div>

            {/* =================================================
                HOTEL RESULTS
            ================================================= */}

            <div className="sidebar-left">
              <div
                className="hotel-results-toolbar"
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  marginBottom: "20px",

                  gap: "15px",

                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong>{filteredHotels.length}</strong> Hotel
                  {filteredHotels.length !== 1 ? "s" : ""} Found
                </div>

                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,

                      sortBy: e.target.value,
                    }))
                  }
                  className="hotel-sort-select"
                >
                  <option value="">Sort By</option>

                  <option value="priceLow">Price: Low to High</option>

                  <option value="priceHigh">Price: High to Low</option>

                  <option value="ratingHigh">Rating: High to Low</option>

                  <option value="distance">Distance</option>
                </select>
              </div>

              {/* RESULTS */}

              {hotelLoader && filteredHotels.length === 0 ? (
                <HotelLoader />
              ) : filteredHotels.length > 0 ? (
                <>
                  {isFetchingMoreHotels && (
                    <div className="loading-more-hotels">
                      <span className="loading-more-hotels__spinner"></span>
                      <span>Finding more hotels...</span>
                    </div>
                  )}

                  {filteredHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      image={hotel.heroImage}
                      name={hotel.name}
                      location={`${hotel.contact?.address?.city?.name || ""}, ${
                        hotel.contact?.address?.country?.name || ""
                      }`}
                      newPrice={hotel.ourprice_before_credit}
                      publishedRate={hotel.publishedRate}
                      credit={hotel.credit}
                      starRating={hotel?.starRating}
                      facilities={hotel?.facilities}
                      options={hotel?.options}
                      payAtHotel={hotel?.payAtHotel}
                      onClick={() => handleHotelClick(hotel)}
                    />
                  ))}
                </>
              ) : (
                <div className="no-hotels-found">
                  <h3>No Hotels Found</h3>

                  <p>
                    We couldn't find any hotels matching your selected filters.
                  </p>

                  <button type="button" onClick={clearAllFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
