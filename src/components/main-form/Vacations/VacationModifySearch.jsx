import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { FaRegCalendarDays } from "react-icons/fa6";
import { searchVacationLocation } from "../../../store/Services/AllApi";
import "./VacationModifySearch.css";

const VacationModifySearch = ({ totalCount }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [editing, setEditing] = useState(false);
  const [locations, setLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const currentCity = searchParams.get("city") || "";
  const currentState = searchParams.get("state") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentLatitude = Number(searchParams.get("latitude"));
  const currentLongitude = Number(searchParams.get("longitude"));
  const currentType = searchParams.get("type") || "";
  const currentStartDate = searchParams.get("start_date") || "";
  const currentEndDate = searchParams.get("end_date") || "";

  const months = useMemo(() => {
    const currentDate = new Date();

    return Array.from({ length: 24 }, (_, index) => {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + index + 1,
        1,
      );

      const year = monthDate.getFullYear();
      const monthNumber = String(monthDate.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, monthDate.getMonth() + 1, 0).getDate();

      return {
        value: `${year}-${monthNumber}`,
        label: monthDate.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        }),
        shortMonth: monthDate.toLocaleString("en-US", {
          month: "short",
        }),
        shortYear: String(year).slice(-2),
        startDate: `${year}-${monthNumber}-01`,
        endDate: `${year}-${monthNumber}-${String(lastDay).padStart(2, "0")}`,
      };
    });
  }, []);

  const currentLocation = useMemo(() => {
    if (!currentCity && !currentState && !currentCountry) {
      return null;
    }

    return {
      city: currentCity,
      state: currentState,
      country: currentCountry,
      latitude: currentLatitude,
      longitude: currentLongitude,
      type: currentType,
    };
  }, [
    currentCity,
    currentState,
    currentCountry,
    currentLatitude,
    currentLongitude,
    currentType,
  ]);

  const currentMonth = useMemo(() => {
    if (!currentStartDate) {
      return null;
    }

    const monthValue = currentStartDate.slice(0, 7);
    const existingMonth = months.find((month) => month.value === monthValue);

    if (existingMonth) {
      return {
        ...existingMonth,
        startDate: currentStartDate,
        endDate: currentEndDate || existingMonth.endDate,
      };
    }

    const date = new Date(`${currentStartDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return {
      value: monthValue,
      label: date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      shortMonth: date.toLocaleString("en-US", {
        month: "short",
      }),
      shortYear: String(date.getFullYear()).slice(-2),
      startDate: currentStartDate,
      endDate: currentEndDate,
    };
  }, [currentStartDate, currentEndDate, months]);

  const destinationLabel = currentState
    ? [currentState, currentCountry].filter(Boolean).join(", ")
    : currentCountry || currentCity;

  const [selectedLocation, setSelectedLocation] = useState(currentLocation);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const currentMonthIndex = months.findIndex(
    (month) => month.value === currentMonth?.value,
  );

  const [visibleMonthStart, setVisibleMonthStart] = useState(() => {
    if (currentMonthIndex < 0) {
      return 0;
    }

    return Math.min(currentMonthIndex, Math.max(0, months.length - 4));
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      destination: destinationLabel,
      dates: currentMonth?.label || "",
    },
  });

  const destination = watch("destination");

  const visibleMonths = months.slice(visibleMonthStart, visibleMonthStart + 4);

  useEffect(() => {
    if (!editing || selectedLocation) {
      return;
    }

    if (destination.trim().length < 2) {
      setLocations([]);
      setShowSuggestions(false);
      setLocationLoading(false);
      return;
    }

    let ignoreResponse = false;

    const debounceTimer = setTimeout(async () => {
      setLocationLoading(true);

      try {
        const response = await searchVacationLocation({
          body: {
            searchText: destination.trim(),
          },
        });

        if (!ignoreResponse) {
          const locationResults =
            response?.data?.locations?.result ||
            response?.data?.data?.locations?.result ||
            [];

          setLocations(locationResults);
          setShowSuggestions(true);
        }
      } catch (error) {
        if (!ignoreResponse) {
          setLocations([]);
          setShowSuggestions(true);
          console.log("Error finding vacation locations", error);
        }
      } finally {
        if (!ignoreResponse) {
          setLocationLoading(false);
        }
      }
    }, 500);

    return () => {
      ignoreResponse = true;
      clearTimeout(debounceTimer);
    };
  }, [destination, selectedLocation, editing]);

  const handleLocationSelect = (location) => {
    const selectedDestination = location.state
      ? [location.state, location.country].filter(Boolean).join(", ")
      : location.country || "";

    setSelectedLocation(location);

    setValue("destination", selectedDestination, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });

    clearErrors("destination");
    setLocations([]);
    setShowSuggestions(false);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);

    setValue("dates", month.label, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    clearErrors("dates");
    setShowMonthDropdown(false);
  };

  const handleClearDestination = () => {
    setSelectedLocation(null);
    setValue("destination", "", {
      shouldDirty: true,
    });
    setLocations([]);
    setShowSuggestions(false);
  };

  const handleClearMonth = () => {
    setSelectedMonth(null);
    setValue("dates", "", {
      shouldDirty: true,
    });
    setShowMonthDropdown(false);
  };

  const handlePreviousMonths = () => {
    setVisibleMonthStart((currentStart) => Math.max(currentStart - 1, 0));
  };

  const handleNextMonths = () => {
    setVisibleMonthStart((currentStart) =>
      Math.min(currentStart + 1, months.length - 4),
    );
  };

  const handleCancel = () => {
    setSelectedLocation(currentLocation);
    setSelectedMonth(currentMonth);

    reset({
      destination: destinationLabel,
      dates: currentMonth?.label || "",
    });

    setLocations([]);
    setShowSuggestions(false);
    setShowMonthDropdown(false);
    setEditing(false);
  };

  const onSubmit = () => {
    if (!selectedLocation || !selectedMonth) {
      return;
    }

    const updatedParams = new URLSearchParams(searchParams);

    updatedParams.set("city", selectedLocation.city || "");

    updatedParams.set("state", selectedLocation.state || "");

    updatedParams.set("country", selectedLocation.country || "");

    updatedParams.set("latitude", String(selectedLocation.latitude));

    updatedParams.set("longitude", String(selectedLocation.longitude));

    updatedParams.set("type", selectedLocation.type || "");

    updatedParams.set("start_date", selectedMonth.startDate);

    updatedParams.set("end_date", selectedMonth.endDate);

    setSearchParams(updatedParams, {
      replace: true,
    });

    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="vacationModify vacationModify--summary">
        <div className="vacationModify__summaryContent">
          <span className="vacationModify__found">
            Found <strong>{totalCount}</strong> Rentals for:
          </span>

          <span className="vacationModify__summaryItem">
            <FaLocationArrow color="#fff" />
            {destinationLabel || "Destination"}
          </span>

          <span className="vacationModify__summaryItem">
            <FaRegCalendarDays color="#fff" />
            {currentMonth?.label || "Dates"}
          </span>
        </div>

        <button
          type="button"
          className="vacationModify__changeButton"
          onClick={() => setEditing(true)}
        >
          <FaPencilAlt />
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="vacationModify vacationModify--editing">
      <form className="vacationModify__form" onSubmit={handleSubmit(onSubmit)}>
        <span className="vacationModify__formTitle">Modify your search:</span>

        <div className="vacationModify__field">
          <span className="vacationModify__fieldLabel">Destination</span>

          <div
            className={`vacationModify__inputGroup ${
              errors.destination ? "vacationModify__inputGroup--error" : ""
            }`}
          >
            <FaMapMarkerAlt />

            <Controller
              name="destination"
              control={control}
              rules={{
                required: "Please select a destination",
                minLength: {
                  value: 2,
                  message: "Enter at least 2 characters",
                },
                validate: () =>
                  selectedLocation !== null ||
                  "Select a destination from the suggestions",
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Destination"
                  autoComplete="off"
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    setSelectedLocation(null);
                    setShowSuggestions(true);
                    setShowMonthDropdown(false);
                  }}
                  onFocus={() => {
                    setShowMonthDropdown(false);

                    if (locations.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    field.onBlur();

                    setTimeout(() => {
                      setShowSuggestions(false);
                    }, 150);
                  }}
                />
              )}
            />

            {locationLoading ? (
              <span className="vacationModify__loader" />
            ) : destination ? (
              <button
                type="button"
                className="vacationModify__clearButton"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClearDestination}
              >
                <FaTimes />
              </button>
            ) : null}
          </div>

          {showSuggestions &&
            !locationLoading &&
            destination.trim().length >= 2 && (
              <div className="vacationModify__suggestions">
                {locations.length > 0 ? (
                  locations.map((location, index) => (
                    <button
                      type="button"
                      className="vacationModify__suggestion"
                      key={`${location.state}-${location.country}-${index}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <span className="vacationModify__suggestionIcon">
                        <FaMapMarkerAlt />
                      </span>

                      <span className="vacationModify__suggestionText">
                        <strong>{location.state || location.country}</strong>

                        {location.state && location.country && (
                          <span>{location.country}</span>
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="vacationModify__noResult">
                    No locations found
                  </div>
                )}
              </div>
            )}

          {errors.destination && (
            <span className="vacationModify__error">
              {errors.destination.message}
            </span>
          )}
        </div>

        <div className="vacationModify__field">
          <span className="vacationModify__fieldLabel">Dates</span>

          <div
            className={`vacationModify__inputGroup vacationModify__dateInput ${
              errors.dates ? "vacationModify__inputGroup--error" : ""
            }`}
            onClick={() => {
              setShowMonthDropdown(true);
              setShowSuggestions(false);
            }}
          >
            <FaRegCalendarDays />

            <Controller
              name="dates"
              control={control}
              rules={{
                required: "Please select a month",
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Dates"
                  readOnly
                  onFocus={() => {
                    setShowMonthDropdown(true);
                    setShowSuggestions(false);
                  }}
                  onBlur={() => {
                    field.onBlur();

                    setTimeout(() => {
                      setShowMonthDropdown(false);
                    }, 150);
                  }}
                />
              )}
            />

            {watch("dates") && (
              <button
                type="button"
                className="vacationModify__clearButton"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.stopPropagation();
                  handleClearMonth();
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {showMonthDropdown && (
            <div className="vacationModify__monthDropdown">
              <div className="vacationModify__monthHeader">
                <span>When do you want to go?</span>

                <div className="vacationModify__monthNavigation">
                  <button
                    type="button"
                    disabled={visibleMonthStart === 0}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={handlePreviousMonths}
                  >
                    <FaArrowLeft />
                  </button>

                  <button
                    type="button"
                    disabled={visibleMonthStart >= months.length - 4}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={handleNextMonths}
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>

              <div className="vacationModify__monthList">
                {visibleMonths.map((month) => (
                  <button
                    type="button"
                    key={month.value}
                    className={`vacationModify__monthCard ${
                      selectedMonth?.value === month.value
                        ? "vacationModify__monthCard--selected"
                        : ""
                    }`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleMonthSelect(month)}
                  >
                    <FaRegCalendarDays />
                    <span>{month.shortMonth}</span>
                    <span>{month.shortYear}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errors.dates && (
            <span className="vacationModify__error">
              {errors.dates.message}
            </span>
          )}
        </div>

        <button type="submit" className="vacationModify__submit">
          <FaSearch />
          See Rentals
        </button>

        <button
          type="button"
          className="vacationModify__close"
          onClick={handleCancel}
          aria-label="Close modify search"
        >
          <FaTimes />
        </button>
      </form>
    </div>
  );
};

export default VacationModifySearch;
