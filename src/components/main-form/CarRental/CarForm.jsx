import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CarRental.css";
import {
  carSearchLocation,
  carSearchResults,
} from "../../../store/Services/AllApi";
import { useNavigate } from "react-router-dom";

const CarForm = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pickupLocation: "",
      pickupLocationCode: "",
      dropoffLocation: "",
      dropoffLocationCode: "",
      rentalDates: [new Date(), new Date()],
      pickupTime: "12:00",
      dropoffTime: "23:45",
    },
  });
  const navigate = useNavigate();
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
      if (type === "pickup" && requestId !== pickupRequestRef.current) {
        return;
      }

      if (type === "dropoff" && requestId !== dropoffRequestRef.current) {
        return;
      }

      console.error(`${type} Location API Error:`, error);

      if (type === "pickup") {
        setPickupSuggestions([]);
        setShowPickupSuggestions(true);
        setPickupLoading(false);
      } else {
        setDropoffSuggestions([]);
        setShowDropoffSuggestions(true);
        setDropoffLoading(false);
      }
    }
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;

    if (pickupDebounceRef.current) {
      clearTimeout(pickupDebounceRef.current);
    }

    pickupRequestRef.current += 1;

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

  const handleDropoffChange = (e) => {
    const value = e.target.value;

    if (dropoffDebounceRef.current) {
      clearTimeout(dropoffDebounceRef.current);
    }

    dropoffRequestRef.current += 1;

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

  const handlePickupSelect = (location) => {
    const locationName = location?.name || "";
    const locationCode = location?.code || "";

    setValue("pickupLocation", locationName, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("pickupLocationCode", locationCode, {
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
    const locationName = location?.name || "";
    const locationCode = location?.code || "";

    setValue("dropoffLocation", locationName, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("dropoffLocationCode", locationCode, {
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

  const formatLocalDate = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const onSubmit = (data) => {
    const pickupDate = formatLocalDate(data.rentalDates?.[0]);
    const dropoffDate = formatLocalDate(data.rentalDates?.[1]);

    const params = new URLSearchParams({
      pickupLocation: data.pickupLocation || "",
      pickupLocationCode: data.pickupLocationCode || "",
      dropoffLocation: data.dropoffLocation || "",
      dropoffLocationCode: data.dropoffLocationCode || "",
      pickupDate,
      dropoffDate,
      pickupTime: data.pickupTime || "",
      dropoffTime: data.dropoffTime || "",
    });

    navigate(`/car-result?${params.toString()}`);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const pickupField = event.target.closest(".car-location-field");
      const dropoffField = event.target.closest(".car-dropoff-location-field");

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

  return (
    <form className="car-rental-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="car-input-box car-location-field">
        <label>Pick-Up</label>

        <input
          type="text"
          placeholder="Enter Pick-Up Location"
          autoComplete="off"
          {...register("pickupLocation", {
            required: "Pick-Up location is required",
            onChange: handlePickupChange,
          })}
          onFocus={(e) => {
            if (e.target.value.trim() && pickupSuggestions.length > 0) {
              setShowPickupSuggestions(true);
            }
          }}
        />

        {pickupLoading && (
          <div className="car-pickup-loading">Searching...</div>
        )}

        {showPickupSuggestions && pickupSuggestions.length > 0 && (
          <ul className="car-pickup-suggestions">
            {pickupSuggestions.map((location, index) => (
              <li
                key={location?.code || index}
                className="car-pickup-suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handlePickupSelect(location);
                }}
              >
                <div className="car-pickup-suggestion-name">
                  {location?.name || "Unknown Location"}
                </div>

                {location?.state && (
                  <div className="car-pickup-suggestion-detail">
                    {location.state}
                  </div>
                )}

                {location?.country && (
                  <div className="car-pickup-suggestion-detail">
                    {location.country}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {showPickupSuggestions &&
          !pickupLoading &&
          pickupSuggestions.length === 0 && (
            <div className="car-pickup-no-results">No locations found</div>
          )}

        {errors.pickupLocation && (
          <span className="car-error">{errors.pickupLocation.message}</span>
        )}
      </div>

      <div className="car-input-box car-dropoff-location-field">
        <label>Drop-Off (Optional)</label>

        <input
          type="text"
          placeholder="Enter Drop-Off Location"
          autoComplete="off"
          {...register("dropoffLocation", {
            onChange: handleDropoffChange,
          })}
          onFocus={(e) => {
            if (e.target.value.trim() && dropoffSuggestions.length > 0) {
              setShowDropoffSuggestions(true);
            }
          }}
        />

        {dropoffLoading && (
          <div className="car-dropoff-loading">Searching...</div>
        )}

        {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
          <ul className="car-dropoff-suggestions">
            {dropoffSuggestions.map((location, index) => (
              <li
                key={location?.code || index}
                className="car-dropoff-suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleDropoffSelect(location);
                }}
              >
                <div className="car-dropoff-suggestion-name">
                  {location?.name || "Unknown Location"}
                </div>

                {location?.state && (
                  <div className="car-dropoff-suggestion-detail">
                    {location.state}
                  </div>
                )}

                {location?.country && (
                  <div className="car-dropoff-suggestion-detail">
                    {location.country}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="car-input-box car-rental-date-field">
        <label>Pick-up & Drop-off Date</label>

        <Controller
          control={control}
          name="rentalDates"
          rules={{
            validate: (value) =>
              value?.[0] && value?.[1] ? true : "Please select rental dates",
          }}
          render={({ field }) => (
            <DatePicker
              className="car-date-field"
              selectsRange
              startDate={field.value?.[0]}
              endDate={field.value?.[1]}
              minDate={new Date()}
              dateFormat="dd MMM yyyy"
              placeholderText="Select Dates"
              onChange={(dates) => field.onChange(dates)}
            />
          )}
        />

        {errors.rentalDates && (
          <span className="car-error">{errors.rentalDates.message}</span>
        )}
      </div>

      <div className="car-time-box car-pickup-time-field">
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
          <span className="car-error">{errors.pickupTime.message}</span>
        )}
      </div>

      <div className="car-time-box car-dropoff-time-field">
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
          <span className="car-error">{errors.dropoffTime.message}</span>
        )}
      </div>

      <div className="car-search-btn-wrap car-search-action-field">
        <button type="submit" className="car-search-btn">
          Search
        </button>
      </div>
    </form>
  );
};

export default CarForm;
