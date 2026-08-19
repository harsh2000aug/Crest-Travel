import React, { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";
import "./Activity.css";
import { activityLocations } from "../../../store/Services/AllApi";

const ActivityForm = () => {
  const today = new Date();
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedDestinationId, setSelectedDestinationId] = useState("");

  const debounceTimer = useRef(null);
  const requestId = useRef(0);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      destination: "",
      destinationId: "",
      dateRange: [today, today],
    },
  });

  const getLocationName = (location) => {
    if (typeof location === "string") {
      return location;
    }

    return location?.name || "";
  };

  const formatDate = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleDestinationChange = (value, onChange) => {
    onChange(value);

    setSelectedDestination("");
    setSelectedDestinationId("");
    setValue("destinationId", "");

    clearTimeout(debounceTimer.current);

    const searchTerm = value.trim();
    const currentRequestId = ++requestId.current;

    if (searchTerm.length < 2) {
      setLocations([]);
      setShowDropdown(false);
      setLoadingLocations(false);
      return;
    }

    setShowDropdown(true);
    setLoadingLocations(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await activityLocations({
          body: {
            searchTerm,
          },
        });

        if (currentRequestId !== requestId.current) {
          return;
        }

        const locationList = res?.data?.locations?.result;

        console.log("locationList", locationList);

        setLocations(Array.isArray(locationList) ? locationList : []);
      } catch (error) {
        if (currentRequestId === requestId.current) {
          setLocations([]);
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setLoadingLocations(false);
        }
      }
    }, 500);
  };

  const handleLocationSelect = (location) => {
    clearTimeout(debounceTimer.current);
    requestId.current += 1;

    const locationName = getLocationName(location);
    const destinationId = location?.destinationId || "";

    setSelectedDestination(locationName);
    setSelectedDestinationId(destinationId);

    setValue("destination", locationName, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("destinationId", destinationId, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setLocations([]);
    setShowDropdown(false);
    setLoadingLocations(false);
  };

  const onSubmit = (data) => {
    const [fromDate, toDate] = data.dateRange;

    const destination = encodeURIComponent(data.destination.trim());
    const destinationId = data.destinationId;
    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);

    navigate(
      `/activities?destination=${destination}&destinationId=${destinationId}&fromDate=${formattedFromDate}&toDate=${formattedToDate}`,
    );
  };

  return (
    <form className="tripSearch__wrapper" onSubmit={handleSubmit(onSubmit)}>
      <div className="tripSearch__row">
        <div className="tripSearch__fieldWrapper">
          <div
            className={`tripSearch__destination ${
              errors.destination ? "tripSearch__inputError" : ""
            }`}
          >
            <span className="tripSearch__dateLabel">Where to</span>

            <Controller
              name="destination"
              control={control}
              rules={{
                required: "Please enter your destination",
                minLength: {
                  value: 2,
                  message: "Destination must be at least 2 characters",
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  autoComplete="off"
                  className="tripSearch__destinationInput"
                  placeholder="Where To"
                  onChange={(event) => {
                    handleDestinationChange(event.target.value, field.onChange);
                  }}
                  onFocus={() => {
                    if (
                      field.value.trim().length >= 2 &&
                      field.value !== selectedDestination
                    ) {
                      setShowDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    field.onBlur();
                    setShowDropdown(false);
                  }}
                />
              )}
            />
          </div>

          {showDropdown && (
            <div className="tripSearch__locationDropdown">
              {loadingLocations ? (
                <div className="tripSearch__dropdownMessage">Searching...</div>
              ) : locations.length > 0 ? (
                locations.map((location, index) => (
                  <button
                    type="button"
                    className="tripSearch__locationOption"
                    key={
                      location.activityCode ||
                      `${location.destinationId}-${index}`
                    }
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleLocationSelect(location);
                    }}
                  >
                    {location.thumbnailURL && (
                      <img
                        src={location.thumbnailURL}
                        alt={location.name}
                        className="tripSearch__locationImage"
                      />
                    )}

                    <div className="tripSearch__locationDetails">
                      <span className="tripSearch__locationName">
                        {location.name}
                      </span>

                      <span className="tripSearch__destinationName">
                        {location.destinationName}
                      </span>

                      <span className="tripSearch__locationType">
                        {location.type}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="tripSearch__dropdownMessage">
                  No locations found
                </div>
              )}
            </div>
          )}

          {errors.destination && (
            <span className="tripSearch__errorMessage">
              {errors.destination.message}
            </span>
          )}
        </div>

        <div className="tripSearch__fieldWrapper">
          <div
            className={`tripSearch__dateBox ${
              errors.dateRange ? "tripSearch__inputError" : ""
            }`}
          >
            <div className="tripSearch__dateContent">
              <span className="tripSearch__dateLabel">From & To</span>

              <Controller
                name="dateRange"
                control={control}
                rules={{
                  validate: (value) => {
                    if (!value?.[0]) {
                      return "Please select your starting date";
                    }

                    if (!value?.[1]) {
                      return "Please select your ending date";
                    }

                    return true;
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    selectsRange
                    selected={field.value?.[0]}
                    startDate={field.value?.[0]}
                    endDate={field.value?.[1]}
                    onChange={field.onChange}
                    minDate={today}
                    dateFormat="dd MMM yyyy"
                    className="tripSearch__datePicker"
                    placeholderText="Select dates"
                    popperPlacement="bottom-start"
                  />
                )}
              />
            </div>
          </div>

          {errors.dateRange && (
            <span className="tripSearch__errorMessage">
              {errors.dateRange.message}
            </span>
          )}
        </div>

        <button type="submit" className="tripSearch__button">
          Search
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
