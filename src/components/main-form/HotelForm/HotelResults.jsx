import React, { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt, FaStar, FaWifi } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { hotelShow, newHotelFetch } from "../../../store/Services/AllApi";
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
  starRating,
  facilities,
  options,
  payAtHotel,
  onClick,
}) {
  return (
    <div className="lux-hotel-card" onClick={onClick}>
      <div className="lux-hotel-img-wrap">
        <img
          src={image || "/images/hotel-placeholder.jpg"}
          alt={name || "Hotel"}
        />
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

          {facilities?.some((facility) =>
            facility?.name?.toLowerCase().includes("free wifi"),
          ) && (
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
                {[...Array(Math.floor(Number(starRating) || 0))].map(
                  (_, index) => (
                    <FaStar key={index} />
                  ),
                )}
              </span>
            </span>
          </div>

          <div className="lux-price-box">
            <h2>${Number(newPrice || 0).toFixed(2)}</h2>

            <small>Includes taxes & fees</small>

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

export default function HotelResults() {
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [hotelsGet, setHotelGet] = useState([]);
  const [hotelLoader, setHotelLoader] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [hotelResults, setHotelResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [paramsData, setParamsData] = useState(null);

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
      countryOfResidence: params.get("countryOfResidence") || "AE",
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

  const handleSearchHotel = async ({
    destinationData = selectedDestination,
    checkIn = dateRange[0],
    checkOut = dateRange[1],
    roomData = roomDetails,
  } = {}) => {
    setHotelLoader(true);

    try {
      const occupancies = roomData.map((room) => ({
        numOfAdults: Number(room?.adults || 0),
        childAges: (room?.childrenAges || [])
          .filter((age) => age !== "")
          .map((age) => Number(age)),
      }));

      const locationid = destinationData?.destinationId || hotelData.locationid;

      const lat = destinationData?.latitude ?? hotelData.lat;

      const long = destinationData?.longitude ?? hotelData.long;

      const destinationName = destinationData?.destination || destination;

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
        countryOfResidence: hotelData.countryOfResidence || "AE",
        occupancies,
      };

      const res = await newHotelFetch({
        body: requestBody,
      });

      const result = res?.data?.hotelListings?.result;

      const hotelList = result?.result || [];

      setHotelGet(hotelList);
      setParamsData(result || null);

      localStorage.setItem("hotelToken", result?.token || "");

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

      const urlParams = new URLSearchParams({
        destination: destinationName || "",
        locationid: locationid || "",
        checkIn: formattedCheckIn || "",
        checkOut: formattedCheckOut || "",
        lat: String(lat || ""),
        long: String(long || ""),
        countryOfResidence: hotelData.countryOfResidence || "AE",
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
    } finally {
      setHotelLoader(false);
    }
  };

  useEffect(() => {
    handleSearchHotel();
  }, []);

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

  const maxHotelPrice = useMemo(() => {
    const prices = (hotelsGet || [])
      .map((hotel) => Number(hotel?.ourprice || 0))
      .filter((price) => price > 0);

    if (!prices.length) {
      return 1000;
    }

    return Math.max(1000, Math.ceil(Math.max(...prices)));
  }, [hotelsGet]);

  const propertyTypes = useMemo(() => {
    return [
      ...new Set(
        (hotelsGet || []).map((hotel) => hotel?.category).filter(Boolean),
      ),
    ];
  }, [hotelsGet]);

  const hotelChains = useMemo(() => {
    return [
      ...new Set(
        (hotelsGet || []).map((hotel) => hotel?.chain).filter(Boolean),
      ),
    ];
  }, [hotelsGet]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      maxPrice: maxHotelPrice,
    }));
  }, [maxHotelPrice]);

  const filteredHotels = useMemo(() => {
    const filtered = (hotelsGet || []).filter((hotel) => {
      const price = Number(hotel?.ourprice || 0);

      const starRating = Number(hotel?.starRating || 0);

      const facilities = hotel?.facilities || [];

      const options = hotel?.options || {};

      const hasWifi = facilities.some((facility) =>
        facility?.name?.toLowerCase().includes("free wifi"),
      );

      if (price < Number(filters.minPrice)) {
        return false;
      }

      if (price > Number(filters.maxPrice)) {
        return false;
      }

      if (
        filters.starRatings.length > 0 &&
        !filters.starRatings.includes(starRating)
      ) {
        return false;
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

      if (filters.freeCancellation && !options.freeCancellation) {
        return false;
      }

      if (filters.freeBreakfast && !options.freeBreakfast) {
        return false;
      }

      if (filters.refundable && !options.refundable) {
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

      return 0;
    });
  }, [hotelsGet, filters]);

  const clearAllFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: maxHotelPrice,
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
                    <div className="travel-room-title">Room 1</div>

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

                <div className="hotel-filter-section">
                  <h4 className="hotel-filter-heading">Price Range</h4>

                  <div className="price-filter">
                    <label>Min Price: ${filters.minPrice}</label>

                    <input
                      type="range"
                      min={0}
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
                      min={0}
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

                <div className="hotel-filter-section">
                  <h4 className="hotel-filter-heading">Star Rating</h4>

                  {[5, 4, 3, 2, 1].map((star) => (
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
                      </span>
                    </label>
                  ))}
                </div>

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

                <div className="hotel-filter-section">
                  <h4 className="hotel-filter-heading">Booking Options</h4>

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

              {hotelLoader ? (
                <HotelLoader />
              ) : filteredHotels.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    image={hotel.heroImage}
                    name={hotel.name}
                    location={`${hotel.contact?.address?.city?.name || ""}, ${
                      hotel.contact?.address?.country?.name || ""
                    }`}
                    newPrice={hotel.ourprice}
                    starRating={hotel?.starRating}
                    facilities={hotel?.facilities}
                    options={hotel?.options}
                    payAtHotel={hotel?.payAtHotel}
                    onClick={() => handleHotelClick(hotel)}
                  />
                ))
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
