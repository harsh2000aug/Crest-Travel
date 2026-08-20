import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import "./VacationForm.css";
import Image1 from "../../../assets/images/hotel1.webp";
import Image2 from "../../../assets/images/hotel2.webp";
import Image3 from "../../../assets/images/hotel3.webp";
import { FaArrowLeft, FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";
import { FaRegCalendarDays } from "react-icons/fa6";
import { searchVacationLocation } from "../../../store/Services/AllApi";
import { useNavigate } from "react-router-dom";
const VacationForm = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [visibleMonthStart, setVisibleMonthStart] = useState(0);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      destination: "",
      dates: "",
    },
  });

  const destination = watch("destination");

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

  const visibleMonths = months.slice(visibleMonthStart, visibleMonthStart + 4);

  useEffect(() => {
    if (selectedLocation) {
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
        const res = await searchVacationLocation({
          body: {
            searchText: destination.trim(),
          },
        });

        if (!ignoreResponse) {
          const locationResults =
            res?.data?.locations?.result ||
            res?.data?.data?.locations?.result ||
            [];

          setLocations(locationResults);
          setShowSuggestions(true);
        }
      } catch (error) {
        if (!ignoreResponse) {
          setLocations([]);
          setShowSuggestions(true);
          console.log("error in finding vacation location", error);
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
  }, [destination, selectedLocation]);

  const handleLocationSelect = (location) => {
    const destinationName = location.state
      ? [location.state, location.country].filter(Boolean).join(", ")
      : location.country || "";

    setSelectedLocation(location);

    setValue("destination", destinationName, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });

    clearErrors("destination");
    setLocations([]);
    setShowSuggestions(false);
  };

  const handleMonthSelect = (month) => {
    setValue("dates", month.label, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setSelectedMonth(month);
    setShowMonthDropdown(false);
  };

  const handlePreviousMonths = () => {
    setVisibleMonthStart((previous) => Math.max(previous - 1, 0));
  };

  const handleNextMonths = () => {
    setVisibleMonthStart((previous) =>
      Math.min(previous + 1, months.length - 4),
    );
  };

  const onSubmit = () => {
    if (!selectedLocation || !selectedMonth) {
      return;
    }

    const params = new URLSearchParams({
      city: selectedLocation.city,
      state: selectedLocation.state || "",
      country: selectedLocation.country,
      latitude: String(selectedLocation.latitude),
      longitude: String(selectedLocation.longitude),
      type: selectedLocation.type,
      start_date: selectedMonth.startDate,
      end_date: selectedMonth.endDate,
    });

    navigate(`/vacation-list?${params.toString()}`);
  };

  return (
    <section className="vacationForm">
      <p className="vacationForm__description">
        Don’t know when or where to go? Search by <strong>destinations</strong>{" "}
        or <strong>dates</strong>, or click <strong>See 1000+ Rentals</strong>{" "}
        to explore them all.
      </p>

      <form className="vacationForm__search" onSubmit={handleSubmit(onSubmit)}>
        <div className="vacationForm__destinationWrapper">
          <div
            className={`vacationForm__inputGroup ${
              errors.destination ? "vacationForm__inputGroup--error" : ""
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
                  "Please select a destination from the suggestions",
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Destination"
                  autoComplete="off"
                  onChange={(e) => {
                    field.onChange(e.target.value);
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

            {locationLoading && (
              <span className="vacationForm__loader" aria-label="Loading" />
            )}
          </div>

          {showSuggestions &&
            !locationLoading &&
            destination.trim().length >= 2 && (
              <div className="vacationForm__dropdown">
                {locations.length > 0 ? (
                  locations.map((location, index) => (
                    <button
                      type="button"
                      className="vacationForm__suggestion"
                      key={`${location.city}-${location.country}-${index}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <span className="vacationForm__suggestionIcon">
                        <FaMapMarkerAlt />
                      </span>

                      <span className="vacationForm__suggestionContent">
                        <strong className="vacationForm__suggestionPrimary">
                          {location.state || location.country}
                        </strong>

                        {location.state && location.country && (
                          <span className="vacationForm__suggestionCountry">
                            {location.country}
                          </span>
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="vacationForm__noResult">
                    No locations found
                  </div>
                )}
              </div>
            )}

          {errors.destination && (
            <span className="vacationForm__errorMessage">
              {errors.destination.message}
            </span>
          )}
        </div>

        <div className="vacationForm__monthWrapper">
          <div
            className={`vacationForm__inputGroup vacationForm__monthInput ${
              errors.dates ? "vacationForm__inputGroup--error" : ""
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
          </div>

          {showMonthDropdown && (
            <div className="vacationForm__monthDropdown">
              <div className="vacationForm__monthHeader">
                <span>When do you want to go?</span>

                <div className="vacationForm__monthNavigation">
                  <button
                    type="button"
                    disabled={visibleMonthStart === 0}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handlePreviousMonths}
                  >
                    <FaArrowLeft />
                  </button>

                  <button
                    type="button"
                    disabled={visibleMonthStart >= months.length - 4}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleNextMonths}
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>

              <div className="vacationForm__monthList">
                {visibleMonths.map((month) => (
                  <button
                    type="button"
                    key={month.value}
                    className={`vacationForm__monthCard ${
                      selectedMonth?.value === month.value
                        ? "vacationForm__monthCard--selected"
                        : ""
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
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
            <span className="vacationForm__errorMessage">
              {errors.dates.message}
            </span>
          )}
        </div>

        <button className="vacationForm__submit" type="submit">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 4a6 6 0 1 0 3.86 10.6L19.25 20 21 18.25l-5.4-5.39A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
          </svg>
          See 1000+ Rentals
        </button>
      </form>

      <div className="vacationForm__recommendations">
        <div className="vacationForm__price">
          7 Nights from <strong>$ 499</strong>
        </div>

        <div className="vacationForm__destinations">
          <button type="button" className="vacationForm__destinationCard">
            <img src={Image1} alt="United States" />
            <span>United States ...</span>
            <span className="vacationForm__arrow">→</span>
          </button>

          <button type="button" className="vacationForm__destinationCard">
            <img src={Image2} alt="Mexico" />
            <span>Mexico</span>
            <span className="vacationForm__arrow">→</span>
          </button>

          <button type="button" className="vacationForm__destinationCard">
            <img src={Image3} alt="Argentina" />
            <span>Argentina</span>
            <span className="vacationForm__arrow">→</span>
          </button>
        </div>

        <button type="button" className="vacationForm__seeAll">
          <span>•••</span>
          See all
        </button>
      </div>
    </section>
  );
};

export default VacationForm;
