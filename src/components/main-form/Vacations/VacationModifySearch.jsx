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

  // Builds every month card that falls between start_date and end_date
  // (inclusive), so a saved multi-month range re-selects all of its months.
  const currentMonths = useMemo(() => {
    if (!currentStartDate) {
      return [];
    }

    const startValue = currentStartDate.slice(0, 7);
    const endValue = (currentEndDate || currentStartDate).slice(0, 7);

    const [startYear, startMonthNumber] = startValue.split("-").map(Number);
    const [endYear, endMonthNumber] = endValue.split("-").map(Number);

    if (
      !Number.isFinite(startYear) ||
      !Number.isFinite(startMonthNumber) ||
      !Number.isFinite(endYear) ||
      !Number.isFinite(endMonthNumber)
    ) {
      return [];
    }

    const result = [];
    let year = startYear;
    let monthNumber = startMonthNumber;

    while (
      year < endYear ||
      (year === endYear && monthNumber <= endMonthNumber)
    ) {
      const valueStr = `${year}-${String(monthNumber).padStart(2, "0")}`;
      const isFirstMonth = valueStr === startValue;
      const isLastMonth = valueStr === endValue;
      const existingMonth = months.find((month) => month.value === valueStr);

      if (existingMonth) {
        result.push({
          ...existingMonth,
          startDate: isFirstMonth ? currentStartDate : existingMonth.startDate,
          endDate: isLastMonth
            ? currentEndDate || existingMonth.endDate
            : existingMonth.endDate,
        });
      } else {
        const date = new Date(`${valueStr}-01T00:00:00`);

        if (!Number.isNaN(date.getTime())) {
          const lastDay = new Date(year, monthNumber, 0).getDate();

          result.push({
            value: valueStr,
            label: date.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            }),
            shortMonth: date.toLocaleString("en-US", {
              month: "short",
            }),
            shortYear: String(year).slice(-2),
            startDate: isFirstMonth ? currentStartDate : `${valueStr}-01`,
            endDate: isLastMonth
              ? currentEndDate ||
                `${valueStr}-${String(lastDay).padStart(2, "0")}`
              : `${valueStr}-${String(lastDay).padStart(2, "0")}`,
          });
        }
      }

      monthNumber += 1;

      if (monthNumber > 12) {
        monthNumber = 1;
        year += 1;
      }
    }

    return result;
  }, [currentStartDate, currentEndDate, months]);

  const destinationLabel = currentState
    ? [currentState, currentCountry].filter(Boolean).join(", ")
    : currentCountry || currentCity;

  const buildDatesLabel = (monthsList) => {
    if (monthsList.length === 0) return "";
    if (monthsList.length === 1) return monthsList[0].label;

    const first = monthsList[0];
    const last = monthsList[monthsList.length - 1];

    return `${first.shortMonth} ${first.shortYear} - ${last.shortMonth} ${last.shortYear}`;
  };

  const [selectedLocation, setSelectedLocation] = useState(currentLocation);

  const [selectedMonths, setSelectedMonths] = useState(currentMonths);

  const sortedSelectedMonths = useMemo(() => {
    return [...selectedMonths].sort((a, b) => (a.value > b.value ? 1 : -1));
  }, [selectedMonths]);

  const currentMonthIndex = months.findIndex(
    (month) => month.value === currentMonths[0]?.value,
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
      dates: buildDatesLabel(currentMonths),
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
    setSelectedMonths((previousMonths) => {
      const alreadySelected = previousMonths.some(
        (existingMonth) => existingMonth.value === month.value,
      );

      const updatedMonths = alreadySelected
        ? previousMonths.filter(
            (existingMonth) => existingMonth.value !== month.value,
          )
        : [...previousMonths, month];

      const sortedUpdatedMonths = [...updatedMonths].sort((a, b) =>
        a.value > b.value ? 1 : -1,
      );

      setValue("dates", buildDatesLabel(sortedUpdatedMonths), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      if (sortedUpdatedMonths.length > 0) {
        clearErrors("dates");
      }

      return updatedMonths;
    });
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
    setSelectedMonths([]);
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
    setSelectedMonths(currentMonths);

    reset({
      destination: destinationLabel,
      dates: buildDatesLabel(currentMonths),
    });

    setLocations([]);
    setShowSuggestions(false);
    setShowMonthDropdown(false);
    setEditing(false);
  };

  const onSubmit = () => {
    if (!selectedLocation || sortedSelectedMonths.length === 0) {
      return;
    }

    const firstMonth = sortedSelectedMonths[0];
    const lastMonth = sortedSelectedMonths[sortedSelectedMonths.length - 1];

    const updatedParams = new URLSearchParams(searchParams);

    updatedParams.set("city", selectedLocation.city || "");

    updatedParams.set("state", selectedLocation.state || "");

    updatedParams.set("country", selectedLocation.country || "");

    updatedParams.set("latitude", String(selectedLocation.latitude));

    updatedParams.set("longitude", String(selectedLocation.longitude));

    updatedParams.set("type", selectedLocation.type || "");

    updatedParams.set("start_date", firstMonth.startDate);

    updatedParams.set("end_date", lastMonth.endDate);

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
            {buildDatesLabel(currentMonths) || "Dates"}
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
                required: "Please select at least one month",
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
                {visibleMonths.map((month) => {
                  const isSelected = selectedMonths.some(
                    (existingMonth) => existingMonth.value === month.value,
                  );

                  return (
                    <button
                      type="button"
                      key={month.value}
                      className={`vacationModify__monthCard ${
                        isSelected ? "vacationModify__monthCard--selected" : ""
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleMonthSelect(month)}
                    >
                      <FaRegCalendarDays />
                      <span>{month.shortMonth}</span>
                      <span>{month.shortYear}</span>
                    </button>
                  );
                })}
              </div>

              <div className="vacationModify__monthFooter">
                <button
                  type="button"
                  className="vacationForm__monthDone"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowMonthDropdown(false)}
                >
                  Done
                </button>
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
