import React, { useEffect, useMemo, useRef, useState } from "react";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  carSearchLocation,
  carSearchResults,
} from "../../../store/Services/AllApi";
import "./CarRental.css";

const CarResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCarType, setSelectedCarType] = useState("All");
  const [selectedAgency, setSelectedAgency] = useState("All");
  const [selectedTransmission, setSelectedTransmission] = useState("All");
  const [selectedFuelType, setSelectedFuelType] = useState("All");
  const [selectedMileage, setSelectedMileage] = useState("All");
  const [selectedCancellation, setSelectedCancellation] = useState(false);
  const [sortOption, setSortOption] = useState("low");
  const [carResponse, setCarResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [mobilePopup, setMobilePopup] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [dropoffLoading, setDropoffLoading] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const pickupDebounceRef = useRef(null);
  const dropoffDebounceRef = useRef(null);
  const pickupRequestRef = useRef(0);
  const dropoffRequestRef = useRef(0);

  const carsPerPage = 20;

  const pickupLocation = searchParams.get("pickupLocation") || "";
  const dropoffLocation = searchParams.get("dropoffLocation") || "";
  const pickupDate = searchParams.get("pickupDate") || "";
  const dropoffDate = searchParams.get("dropoffDate") || "";
  const pickupTime = searchParams.get("pickupTime") || "12:00";
  const dropoffTime = searchParams.get("dropoffTime") || "23:45";
  const pickupLocationCode = searchParams.get("pickupLocationCode") || "";
  const dropoffLocationCode = searchParams.get("dropoffLocationCode") || "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pickupLocation,
      pickupLocationCode,
      dropoffLocation,
      dropoffLocationCode,
      rentalDates: [
        pickupDate ? new Date(`${pickupDate}T00:00:00`) : new Date(),
        dropoffDate ? new Date(`${dropoffDate}T00:00:00`) : new Date(),
      ],
      pickupTime,
      dropoffTime,
    },
  });

  useEffect(() => {
    reset({
      pickupLocation,
      pickupLocationCode,
      dropoffLocation,
      dropoffLocationCode,
      rentalDates: [
        pickupDate ? new Date(`${pickupDate}T00:00:00`) : new Date(),
        dropoffDate ? new Date(`${dropoffDate}T00:00:00`) : new Date(),
      ],
      pickupTime: pickupTime || "12:00",
      dropoffTime: dropoffTime || "23:45",
    });
  }, [
    pickupLocation,
    pickupLocationCode,
    dropoffLocation,
    dropoffLocationCode,
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    reset,
  ]);

  const searchLocation = async (value, type, requestId) => {
    if (!value.trim()) {
      if (type === "pickup") {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
        setPickupLoading(false);
      } else {
        setDropoffSuggestions([]);
        setShowDropoffSuggestions(false);
        setDropoffLoading(false);
      }

      return;
    }

    try {
      const response = await carSearchLocation({
        body: {
          term: value.trim(),
        },
      });

      if (type === "pickup" && requestId !== pickupRequestRef.current) {
        return;
      }

      if (type === "dropoff" && requestId !== dropoffRequestRef.current) {
        return;
      }

      const locations =
        response?.data?.locations?.result ||
        response?.data?.data?.locations?.result ||
        response?.locations?.result ||
        [];

      const results = Array.isArray(locations)
        ? locations.map((location) => ({
            code: location?.code || "",
            name: location?.name || "",
            state: location?.state || "",
            country: location?.country || "",
          }))
        : [];

      if (type === "pickup") {
        setPickupSuggestions(results);
        setShowPickupSuggestions(true);
        setPickupLoading(false);
      } else {
        setDropoffSuggestions(results);
        setShowDropoffSuggestions(true);
        setDropoffLoading(false);
      }
    } catch (error) {
      console.error(`${type} Location API Error:`, error);

      if (type === "pickup") {
        setPickupSuggestions([]);
        setPickupLoading(false);
        setShowPickupSuggestions(false);
      } else {
        setDropoffSuggestions([]);
        setDropoffLoading(false);
        setShowDropoffSuggestions(false);
      }
    }
  };

  const handlePickupChange = (event) => {
    const value = event.target.value;

    if (pickupDebounceRef.current) {
      clearTimeout(pickupDebounceRef.current);
    }

    pickupRequestRef.current += 1;

    setValue("pickupLocationCode", "");

    if (!value.trim()) {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
      setPickupLoading(false);
      return;
    }

    setPickupLoading(true);
    setShowPickupSuggestions(true);

    const requestId = pickupRequestRef.current;

    pickupDebounceRef.current = setTimeout(() => {
      searchLocation(value, "pickup", requestId);
    }, 500);
  };

  const handleDropoffChange = (event) => {
    const value = event.target.value;

    if (dropoffDebounceRef.current) {
      clearTimeout(dropoffDebounceRef.current);
    }

    dropoffRequestRef.current += 1;

    setValue("dropoffLocationCode", "");

    if (!value.trim()) {
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
      setDropoffLoading(false);
      return;
    }

    setDropoffLoading(true);
    setShowDropoffSuggestions(true);

    const requestId = dropoffRequestRef.current;

    dropoffDebounceRef.current = setTimeout(() => {
      searchLocation(value, "dropoff", requestId);
    }, 500);
  };

  const handlePickupSelect = (location) => {
    setValue("pickupLocation", location?.name || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("pickupLocationCode", location?.code || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    pickupRequestRef.current += 1;

    if (pickupDebounceRef.current) {
      clearTimeout(pickupDebounceRef.current);
    }

    setPickupSuggestions([]);
    setShowPickupSuggestions(false);
    setPickupLoading(false);
  };

  const handleDropoffSelect = (location) => {
    setValue("dropoffLocation", location?.name || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("dropoffLocationCode", location?.code || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    dropoffRequestRef.current += 1;

    if (dropoffDebounceRef.current) {
      clearTimeout(dropoffDebounceRef.current);
    }

    setDropoffSuggestions([]);
    setShowDropoffSuggestions(false);
    setDropoffLoading(false);
  };

  useEffect(() => {
    return () => {
      if (pickupDebounceRef.current) {
        clearTimeout(pickupDebounceRef.current);
      }

      if (dropoffDebounceRef.current) {
        clearTimeout(dropoffDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const pickupField = event.target.closest(
        ".car-results-modify-pickup-field",
      );

      const dropoffField = event.target.closest(
        ".car-results-modify-dropoff-field",
      );

      if (!pickupField) {
        setShowPickupSuggestions(false);
      }

      if (!dropoffField) {
        setShowDropoffSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const generateTimeOptions = () => {
    const times = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const period = hour < 12 ? "AM" : "PM";

        let displayHour = hour % 12;
        displayHour = displayHour === 0 ? 12 : displayHour;

        const formattedHour = String(displayHour).padStart(2, "0");
        const formattedMinute = String(minute).padStart(2, "0");

        times.push({
          value: `${String(hour).padStart(2, "0")}:${formattedMinute}`,
          label: `${formattedHour}:${formattedMinute} ${period}`,
        });
      }
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  const formatDateForApi = (date) => {
    if (!date) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const onModifySearch = (data) => {
    const newPickupDate = formatDateForApi(data.rentalDates?.[0]);
    const newDropoffDate = formatDateForApi(data.rentalDates?.[1]);
    const params = new URLSearchParams();
    params.set("pickupLocation", data.pickupLocation || "");
    params.set("pickupLocationCode", data.pickupLocationCode || "");
    params.set("dropoffLocation", data.dropoffLocation || "");
    params.set("dropoffLocationCode", data.dropoffLocationCode || "");
    params.set("pickupDate", newPickupDate);
    params.set("dropoffDate", newDropoffDate);
    params.set("pickupTime", data.pickupTime || "");
    params.set("dropoffTime", data.dropoffTime || "");
    setCurrentPage(1);
    setSearchParams(params);
    setSelectedCarType("All");
    setSelectedAgency("All");
    setSelectedTransmission("All");
    setSelectedFuelType("All");
    setSelectedMileage("All");
    setSelectedCancellation(false);
    setMobilePopup(null);
  };

  useEffect(() => {
    const fetchCarResults = async () => {
      try {
        setLoading(true);
        const res = await carSearchResults({
          body: {
            filter: {
              pickup: {
                name: pickupLocation,
                code: pickupLocationCode,
                date: pickupDate,
                time: pickupTime,
              },
              dropoff: {
                name: dropoffLocation,
                code: dropoffLocationCode,
                date: dropoffDate,
                time: dropoffTime,
              },
              sortBy: {},
              findData: {},
              page: currentPage,
              limit: carsPerPage,
            },
          },
        });
        setCarResponse(res);
        setTotalCars(res?.data?.newsearch?.result?.count || 0);
      } catch (error) {
        console.log("Car Search Error:", error);
        setCarResponse(null);
        setTotalCars(0);
        toast.error("Possible pickup/dropoff outside business hours");
      } finally {
        setLoading(false);
      }
    };

    fetchCarResults();
  }, [
    pickupLocation,
    pickupLocationCode,
    dropoffLocation,
    dropoffLocationCode,
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    currentPage,
  ]);

  const resultData = carResponse?.data?.newsearch?.result || {};

  const cars = resultData?.cars || [];
  const filters = resultData?.filters || {};
  const currency = resultData?.currency || "USD";
  const partners = filters?.partners || [];
  const carTypes = filters?.carTypes || [];
  const transmissions = filters?.transmission || [];
  const fuelTypes = filters?.fuelType || [];
  const mileageOptions = filters?.miles || [];
  const cancellationOptions = filters?.cancellation || [];

  const filteredCars = useMemo(() => {
    let filtered = [...cars];

    if (selectedCarType !== "All") {
      filtered = filtered.filter((car) => car.type === selectedCarType);
    }

    if (selectedAgency !== "All") {
      filtered = filtered.filter((car) => car.partner?.code === selectedAgency);
    }

    if (selectedTransmission !== "All") {
      filtered = filtered.filter((car) => {
        const transmission = car?.features?.some((feature) =>
          feature.toLowerCase().includes(selectedTransmission.toLowerCase()),
        );

        return transmission;
      });
    }

    if (selectedFuelType !== "All") {
      filtered = filtered.filter((car) => car.fuelType === selectedFuelType);
    }

    if (selectedMileage !== "All") {
      const unlimited = carHasUnlimitedMileage(filtered[0]);

      filtered = filtered.filter((car) => {
        const hasUnlimited = car?.price_postpaid?.mileage === true;

        if (selectedMileage === "true") {
          return hasUnlimited;
        }

        if (selectedMileage === "false") {
          return !hasUnlimited;
        }

        return unlimited;
      });
    }

    if (selectedCancellation) {
      filtered = filtered.filter(
        (car) => car?.price_postpaid?.free_cancellation === true,
      );
    }

    filtered.sort((a, b) => {
      const priceA = Number(a?.display_price || 0);
      const priceB = Number(b?.display_price || 0);

      if (sortOption === "high") {
        return priceB - priceA;
      }

      return priceA - priceB;
    });

    return filtered;
  }, [
    cars,
    selectedCarType,
    selectedAgency,
    selectedTransmission,
    selectedFuelType,
    selectedMileage,
    selectedCancellation,
    sortOption,
  ]);

  const totalPages = Math.ceil(totalCars / carsPerPage);
  const paginatedCars = filteredCars;
  console.log(paginatedCars);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetFilters = () => {
    setSelectedCarType("All");
    setSelectedAgency("All");
    setSelectedTransmission("All");
    setSelectedFuelType("All");
    setSelectedMileage("All");
    setSelectedCancellation(false);
    setCurrentPage(1);
  };

  const formatFuelType = (fuelType) => {
    if (!fuelType) return "";

    return fuelType
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatLocation = (location) => {
    if (!location) return "Location unavailable";

    const parts = location.split(",");

    if (parts.length > 2) {
      return `${parts[0]}, ${parts[1]}`;
    }

    return location;
  };

  const getTransmission = (car) => {
    const automatic = car?.features?.some((feature) =>
      feature.toLowerCase().includes("automatic"),
    );

    return automatic ? "Automatic" : "Manual";
  };

  useEffect(() => {
    document.body.style.overflow = mobilePopup ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobilePopup]);

  const handleSelectCar = (car) => {
    const bookingData = {
      car: {
        vehicleCode: car?.vehicle_code || "",
        name: car?.name || "",
        description: car?.description || "",
        type: car?.type || "",
        typeName: car?.type_name || "",
        heroImage: car?.heroImage || "",
        passengers: car?.passengers || "",
        bags: car?.bags || "",
        doors: car?.doors || "",
        hasAC: car?.hasAC || false,
        fuelType: car?.fuelType || "",
        transmission: getTransmission(car),
        partner: {
          code: car?.partner?.code || "",
          name: car?.partner?.name || "",
          logo: car?.partner?.logo || "",
        },
        price: car?.price_postpaid?.total || car?.display_price || 0,
        days: car?.price_postpaid?.days || 1,
        mileage: car?.price_postpaid?.mileage || false,
        freeCancellation: car?.price_postpaid?.free_cancellation || false,
        inclusions: car?.inclusions || [],
        pickup: {
          location: car?.pickup?.location || "",
          locationInformation: car?.pickup?.location_information || "",
        },
        dropoff: {
          location: car?.dropoff?.location || "",
          locationInformation: car?.dropoff?.location_information || "",
        },
        fareCode: car?.price_postpaid?.fareCode,
      },

      search: {
        pickupLocation,
        pickupLocationCode,
        pickupDate,
        pickupTime,
        dropoffLocation,
        dropoffLocationCode,
        dropoffDate,
        dropoffTime,
      },

      currency,
    };
    sessionStorage.setItem("carBookingData", JSON.stringify(bookingData));
    console.log(bookingData);
    navigate("/car-book");
  };

  if (loading) {
    return (
      <div className="car-results-loading-page">
        <HeaderInner />

        <div className="car-results-loader-wrapper">
          <div className="car-results-loader-circle"></div>
          <h3>Finding the best rental cars...</h3>
          <p>Please wait while we search available vehicles.</p>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="car-results-page">
        <HeaderInner />

        <main className="car-results-main-wrapper container">
          <div className="car-results-mobile-tools">
            <button
              type="button"
              className="car-results-mobile-tool-pill"
              onClick={() => setMobilePopup("search")}
            >
              <span>⚙</span>
              Modify Search
            </button>

            <button
              type="button"
              className="car-results-mobile-tool-pill"
              onClick={() => setMobilePopup("filters")}
            >
              <span>☰</span>
              Filters
            </button>
            {mobilePopup && (
              <div
                className="car-results-mobile-popup-backdrop"
                onClick={() => setMobilePopup(null)}
              />
            )}
          </div>
          <section
            className={`car-results-search-summary ${
              mobilePopup === "search" ? "car-results-mobile-popup-open" : ""
            }`}
          >
            <div className="car-results-mobile-popup-header">
              <h3>Modify Search</h3>

              <button
                type="button"
                className="car-results-mobile-popup-close"
                onClick={() => setMobilePopup(null)}
              >
                ×
              </button>
            </div>
            <form
              className="car-results-modify-search-form"
              onSubmit={handleSubmit(onModifySearch)}
            >
              <div className="car-results-modify-field car-results-modify-pickup-field">
                <label>Pick-Up</label>

                <input
                  type="text"
                  placeholder="Enter Pick-Up Location"
                  autoComplete="off"
                  {...register("pickupLocation", {
                    required: "Pick-Up location is required",
                    onChange: handlePickupChange,
                  })}
                  onFocus={(event) => {
                    if (
                      event.target.value.trim() &&
                      pickupSuggestions.length > 0
                    ) {
                      setShowPickupSuggestions(true);
                    }
                  }}
                />

                {pickupLoading && (
                  <div className="car-results-location-loading">
                    Searching...
                  </div>
                )}

                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <ul className="car-results-location-suggestions">
                    {pickupSuggestions.map((location, index) => (
                      <li
                        key={location?.code || index}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handlePickupSelect(location);
                        }}
                      >
                        <strong>{location?.name || "Unknown Location"}</strong>

                        {location?.state && <span>{location.state}</span>}

                        {location?.country && <span>{location.country}</span>}
                      </li>
                    ))}
                  </ul>
                )}

                {errors.pickupLocation && (
                  <span className="car-results-form-error">
                    {errors.pickupLocation.message}
                  </span>
                )}
              </div>

              <div className="car-results-modify-field car-results-modify-dropoff-field">
                <label>Drop-Off</label>

                <input
                  type="text"
                  placeholder="Enter Drop-Off Location"
                  autoComplete="off"
                  {...register("dropoffLocation", {
                    onChange: handleDropoffChange,
                  })}
                  onFocus={(event) => {
                    if (
                      event.target.value.trim() &&
                      dropoffSuggestions.length > 0
                    ) {
                      setShowDropoffSuggestions(true);
                    }
                  }}
                />

                {dropoffLoading && (
                  <div className="car-results-location-loading">
                    Searching...
                  </div>
                )}

                {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                  <ul className="car-results-location-suggestions">
                    {dropoffSuggestions.map((location, index) => (
                      <li
                        key={location?.code || index}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleDropoffSelect(location);
                        }}
                      >
                        <strong>{location?.name || "Unknown Location"}</strong>

                        {location?.state && <span>{location.state}</span>}

                        {location?.country && <span>{location.country}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="car-results-modify-field">
                <label>Pick-up & Drop-off Date</label>

                <Controller
                  control={control}
                  name="rentalDates"
                  rules={{
                    validate: (value) =>
                      value?.[0] && value?.[1]
                        ? true
                        : "Please select rental dates",
                  }}
                  render={({ field }) => (
                    <DatePicker
                      className="car-results-modify-date-input"
                      selectsRange
                      startDate={field.value?.[0]}
                      endDate={field.value?.[1]}
                      minDate={new Date()}
                      dateFormat="dd MMM yyyy"
                      placeholderText="Select Dates"
                      onChange={(dates) => {
                        field.onChange(dates);
                      }}
                    />
                  )}
                />

                {errors.rentalDates && (
                  <span className="car-results-form-error">
                    {errors.rentalDates.message}
                  </span>
                )}
              </div>

              <div className="car-results-modify-field">
                <label>Pick-up Time</label>

                <select
                  {...register("pickupTime", {
                    required: "Pick-up time is required",
                  })}
                >
                  {timeOptions.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>

                {errors.pickupTime && (
                  <span className="car-results-form-error">
                    {errors.pickupTime.message}
                  </span>
                )}
              </div>

              <div className="car-results-modify-field">
                <label>Drop-off Time</label>

                <select
                  {...register("dropoffTime", {
                    required: "Drop-off time is required",
                  })}
                >
                  {timeOptions.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>

                {errors.dropoffTime && (
                  <span className="car-results-form-error">
                    {errors.dropoffTime.message}
                  </span>
                )}
              </div>

              <div className="car-results-modify-search-action">
                <button type="submit">Search</button>
              </div>
            </form>
          </section>

          <section className="car-results-content-layout">
            <aside
              className={`car-results-filter-sidebar ${
                mobilePopup === "filters" ? "car-results-mobile-popup-open" : ""
              }`}
            >
              <div className="car-results-filter-header">
                <h3>Filters</h3>
                <button
                  type="button"
                  className="car-results-mobile-popup-close"
                  onClick={() => setMobilePopup(null)}
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="car-results-reset-button"
                >
                  Reset
                </button>
              </div>

              <div className="car-results-filter-section">
                <h4>Car Type</h4>

                <label className="car-results-radio-row">
                  <input
                    type="radio"
                    name="carType"
                    checked={selectedCarType === "All"}
                    onChange={() => setSelectedCarType("All")}
                  />

                  <span>All Cars</span>

                  <small>{cars.length}</small>
                </label>

                {carTypes.map((item) => (
                  <label className="car-results-radio-row" key={item.type}>
                    <input
                      type="radio"
                      name="carType"
                      checked={selectedCarType === item.type}
                      onChange={() => setSelectedCarType(item.type)}
                    />

                    <span>{item.type_name}</span>

                    <small>{item.count}</small>
                  </label>
                ))}
              </div>

              <div className="car-results-filter-section">
                <h4>Rental Agency</h4>

                <label className="car-results-radio-row">
                  <input
                    type="radio"
                    name="agency"
                    checked={selectedAgency === "All"}
                    onChange={() => setSelectedAgency("All")}
                  />

                  <span>All Agencies</span>
                </label>

                {partners.map((partner) => (
                  <label className="car-results-radio-row" key={partner.code}>
                    <input
                      type="radio"
                      name="agency"
                      checked={selectedAgency === partner.code}
                      onChange={() => setSelectedAgency(partner.code)}
                    />

                    <span>{partner.name}</span>

                    <small>{partner.count}</small>
                  </label>
                ))}
              </div>

              <div className="car-results-filter-section">
                <h4>Transmission</h4>

                <label className="car-results-radio-row">
                  <input
                    type="radio"
                    name="transmission"
                    checked={selectedTransmission === "All"}
                    onChange={() => setSelectedTransmission("All")}
                  />

                  <span>All</span>
                </label>

                {transmissions.map((item) => (
                  <label className="car-results-radio-row" key={item.value}>
                    <input
                      type="radio"
                      name="transmission"
                      checked={selectedTransmission === item.label}
                      onChange={() => setSelectedTransmission(item.label)}
                    />

                    <span>{item.label}</span>

                    <small>{item.count}</small>
                  </label>
                ))}
              </div>

              <div className="car-results-filter-section">
                <h4>Fuel Type</h4>

                <label className="car-results-radio-row">
                  <input
                    type="radio"
                    name="fuel"
                    checked={selectedFuelType === "All"}
                    onChange={() => setSelectedFuelType("All")}
                  />

                  <span>All</span>
                </label>

                {fuelTypes.map((item) => (
                  <label className="car-results-radio-row" key={item.value}>
                    <input
                      type="radio"
                      name="fuel"
                      checked={selectedFuelType === item.value}
                      onChange={() => setSelectedFuelType(item.value)}
                    />

                    <span>{item.label}</span>

                    <small>{item.count}</small>
                  </label>
                ))}
              </div>

              <div className="car-results-filter-section">
                <h4>Mileage</h4>

                <label className="car-results-radio-row">
                  <input
                    type="radio"
                    name="mileage"
                    checked={selectedMileage === "All"}
                    onChange={() => setSelectedMileage("All")}
                  />

                  <span>All</span>
                </label>

                {mileageOptions.map((item) => (
                  <label className="car-results-radio-row" key={item.value}>
                    <input
                      type="radio"
                      name="mileage"
                      checked={selectedMileage === item.value}
                      onChange={() => setSelectedMileage(item.value)}
                    />

                    <span>{item.label}</span>

                    <small>{item.count}</small>
                  </label>
                ))}
              </div>

              {cancellationOptions.length > 0 && (
                <div className="car-results-filter-section">
                  <h4>Cancellation</h4>

                  <label className="car-results-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedCancellation}
                      onChange={(event) =>
                        setSelectedCancellation(event.target.checked)
                      }
                    />

                    <span>Free Cancellation</span>

                    <small>{cancellationOptions[0]?.count || 0}</small>
                  </label>
                </div>
              )}
            </aside>

            <section className="car-results-list-section">
              <div className="car-results-list-topbar">
                <div>
                  <h2>Rental Cars</h2>

                  <p>{filteredCars.length} cars available</p>
                </div>

                <div className="car-results-sort-wrapper">
                  <label htmlFor="car-sort">Sort by:</label>

                  <select
                    id="car-sort"
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value)}
                  >
                    <option value="low">Price: Low to High</option>

                    <option value="high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {filteredCars.length === 0 ? (
                <div className="car-results-empty-state">
                  <div className="car-results-empty-icon">🚗</div>

                  <h3>No cars found</h3>

                  <p>Try changing or resetting your filters.</p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="car-results-empty-button"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="car-results-cards-wrapper">
                  {paginatedCars.map((car, index) => {
                    const price =
                      car?.price_postpaid?.total ?? car?.display_price ?? 0;

                    const transmission = getTransmission(car);

                    return (
                      <article
                        className="car-results-card"
                        key={`${car.vehicle_code}-${index}`}
                      >
                        <div className="car-results-card-image-area">
                          <img
                            src={car.heroImage}
                            alt={car.name}
                            className="car-results-vehicle-image"
                          />

                          {car?.price_postpaid?.free_cancellation && (
                            <span className="car-results-cancellation-badge">
                              Free Cancellation
                            </span>
                          )}
                        </div>

                        <div className="car-results-card-main">
                          <div className="car-results-card-heading">
                            <div>
                              <h3>{car.name}</h3>

                              <p>{car.description || car.type_name}</p>
                            </div>

                            <img
                              src={car.partner?.logo}
                              alt={car.partner?.name}
                              className="car-results-agency-logo"
                            />
                          </div>

                          <div className="car-results-spec-grid">
                            <span>👤 {car.passengers} Passengers</span>

                            <span>🧳 {car.bags} Bags</span>

                            <span>🚪 {car.doors} Doors</span>

                            <span>
                              ❄️ {car.hasAC ? "Air Conditioning" : "No AC"}
                            </span>

                            <span>⚙️ {transmission}</span>

                            <span>⛽ {formatFuelType(car.fuelType)}</span>
                          </div>

                          <div className="car-results-location-box">
                            <div className="car-results-location-item">
                              <span className="car-results-location-dot pickup"></span>

                              <div>
                                <small>Pick-up</small>

                                <p>{formatLocation(car.pickup?.location)}</p>

                                <em>
                                  {car.pickup?.location_information || ""}
                                </em>
                              </div>
                            </div>

                            <div className="car-results-location-item">
                              <span className="car-results-location-dot dropoff"></span>

                              <div>
                                <small>Drop-off</small>

                                <p>{formatLocation(car.dropoff?.location)}</p>

                                <em>
                                  {car.dropoff?.location_information || ""}
                                </em>
                              </div>
                            </div>
                          </div>

                          <div className="car-results-benefits-row">
                            <span>✓ Pay Later</span>

                            {car?.price_postpaid?.mileage ? (
                              <span>✓ Unlimited Mileage</span>
                            ) : (
                              <span>✓ Limited Mileage</span>
                            )}

                            {car?.inclusions?.map(
                              (inclusion, inclusionIndex) => (
                                <span key={`${inclusion}-${inclusionIndex}`}>
                                  ✓ {inclusion}
                                </span>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="car-results-card-price">
                          <span className="car-results-price-label">
                            Total price
                          </span>

                          <strong>
                            {currency} {Number(price).toFixed(2)}
                          </strong>

                          <small>
                            for {car?.price_postpaid?.days || 1} day
                            {(car?.price_postpaid?.days || 1) > 1 ? "s" : ""}
                          </small>

                          <button
                            type="button"
                            className="car-results-select-button"
                            onClick={() => handleSelectCar(car)}
                          >
                            Select Car
                          </button>

                          <span className="car-results-agency-name">
                            {car.partner?.name}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="car-results-pagination">
                  <button
                    type="button"
                    className="car-results-pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>

                  <div className="car-results-pagination-pages">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        type="button"
                        key={page}
                        className={`car-results-pagination-page ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="car-results-pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

const carHasUnlimitedMileage = (car) => {
  return car?.price_postpaid?.mileage === true;
};

export default CarResults;
