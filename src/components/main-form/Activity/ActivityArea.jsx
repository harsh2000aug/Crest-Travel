import React, { useEffect, useRef, useState } from "react";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import {
  activityAll,
  activityFilters,
  activityLocations,
} from "../../../store/Services/AllApi";
import "react-datepicker/dist/react-datepicker.css";
import "./Activity.css";

const ActivityArea = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialDestination = searchParams.get("destination") || "";
  const initialDestinationId = searchParams.get("destinationId") || "";
  const initialFromDate = searchParams.get("fromDate") || "";
  const initialToDate = searchParams.get("toDate") || "";

  const today = new Date();

  const [searchDestination, setSearchDestination] =
    useState(initialDestination);
  const [searchDestinationId, setSearchDestinationId] =
    useState(initialDestinationId);
  const [searchFromDate, setSearchFromDate] = useState(initialFromDate);
  const [searchToDate, setSearchToDate] = useState(initialToDate);

  const [locations, setLocations] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const locationDebounceTimer = useRef(null);
  const locationRequestId = useRef(0);
  const priceDebounceTimer = useRef(null);

  const [activities, setActivities] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterData, setFilterData] = useState({
    rating: [],
    price: {
      min: 0,
      max: 500,
    },
    duration: [],
    categories: [],
  });

  const [selectedRating, setSelectedRating] = useState(null);

  const [selectedPrice, setSelectedPrice] = useState({
    min: 0,
    max: 500,
  });
  const [showModifySearch, setShowModifySearch] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState({});

  const parseInitialDate = (value) => {
    if (!value) {
      return today;
    }

    const parsedDate = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return today;
    }

    return parsedDate < today ? today : parsedDate;
  };

  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    setValue: setSearchValue,
    formState: { errors: searchErrors },
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      destination: initialDestination,
      destinationId: initialDestinationId,
      dateRange: [
        parseInitialDate(initialFromDate),
        parseInitialDate(initialToDate),
      ],
    },
  });

  const getDiscountPercentage = (fromPrice, originalPrice) => {
    if (!fromPrice || !originalPrice || originalPrice <= fromPrice) {
      return 0;
    }

    return Math.round(((originalPrice - fromPrice) / originalPrice) * 100);
  };

  const getLocationName = (location) => {
    if (typeof location === "string") {
      return location;
    }

    return location?.name || "";
  };

  const formatSearchDate = (date) => {
    if (!date) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleSearchDestinationChange = (value, onChange) => {
    onChange(value);

    setSearchDestination(value);
    setSearchDestinationId("");

    setSearchValue("destinationId", "", {
      shouldValidate: false,
      shouldDirty: true,
    });

    clearTimeout(locationDebounceTimer.current);

    const searchTerm = value.trim();
    const currentRequestId = ++locationRequestId.current;

    if (searchTerm.length < 2) {
      setLocations([]);
      setShowLocationDropdown(false);
      setLoadingLocations(false);
      return;
    }

    setShowLocationDropdown(true);
    setLoadingLocations(true);

    locationDebounceTimer.current = setTimeout(async () => {
      try {
        const response = await activityLocations({
          body: {
            searchTerm,
          },
        });

        if (currentRequestId !== locationRequestId.current) {
          return;
        }

        const locationList = response?.data?.locations?.result;

        setLocations(Array.isArray(locationList) ? locationList : []);
      } catch (error) {
        if (currentRequestId === locationRequestId.current) {
          setLocations([]);
        }
      } finally {
        if (currentRequestId === locationRequestId.current) {
          setLoadingLocations(false);
        }
      }
    }, 500);
  };

  const handleSearchLocationSelect = (location) => {
    clearTimeout(locationDebounceTimer.current);

    locationRequestId.current += 1;

    const locationName = getLocationName(location);
    const selectedId = String(location?.destinationId || "");

    setSearchDestination(locationName);
    setSearchDestinationId(selectedId);

    setSearchValue("destination", locationName, {
      shouldValidate: false,
      shouldDirty: true,
    });

    setSearchValue("destinationId", selectedId, {
      shouldValidate: false,
      shouldDirty: true,
    });

    setLocations([]);
    setShowLocationDropdown(false);
    setLoadingLocations(false);
  };

  const fetchActivities = async ({
    destination = searchDestination,
    destinationId = searchDestinationId,
    fromDate = searchFromDate,
    toDate = searchToDate,
    rating = selectedRating,
    price = selectedPrice,
    duration = selectedDuration,
    categories = selectedCategories,
  } = {}) => {
    try {
      setLoading(true);
      setError("");

      const hasPriceFilter =
        price &&
        (Number(price.min) > Number(filterData.price.min) ||
          Number(price.max) < Number(filterData.price.max));

      const response = await activityAll({
        body: {
          destination: destinationId,
          locationName: destination,
          startDate: fromDate,
          endDate: toDate,
          start: 1,
          count: 20,
          durationInMinutes: duration || null,
          rating: rating || null,
          price: hasPriceFilter ? price : null,
          categories: categories.length > 0 ? categories : null,
          sort: "DEFAULT",
          order: "DESCENDING",
        },
      });
      const result = response?.data?.searchV2?.result;
      console.log(result);
      setActivities(Array.isArray(result?.activities) ? result.activities : []);
      setCurrency(result?.currency || "USD");
      setTotalCount(result?.totalCount || 0);
    } catch (error) {
      console.log("Activity API Error:", error);
      setError("Unable to load activities. Please try again.");
      setActivities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFilterLoading(true);

        const response = await activityFilters({
          body: {},
        });

        const result = response?.data?.getActivityFilters?.result;
        if (result) {
          const minPrice = Number(result?.price?.min || 0);
          const maxPrice = Number(result?.price?.max || 500);

          setFilterData({
            rating: Array.isArray(result?.rating) ? result.rating : [],
            price: {
              min: minPrice,
              max: maxPrice,
            },
            duration: Array.isArray(result?.duration) ? result.duration : [],
            categories: Array.isArray(result?.categories)
              ? result.categories
              : [],
          });

          setSelectedPrice({
            min: minPrice,
            max: maxPrice,
          });
        }
      } catch (error) {
        console.log("Activity Filter API Error:", error);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    if (
      !initialDestination ||
      !initialDestinationId ||
      !initialFromDate ||
      !initialToDate
    ) {
      setLoading(false);
      return;
    }

    if (filterLoading) {
      return;
    }

    fetchActivities({
      destination: initialDestination,
      destinationId: initialDestinationId,
      fromDate: initialFromDate,
      toDate: initialToDate,
      rating: null,
      price: {
        min: filterData.price.min,
        max: filterData.price.max,
      },
      duration: null,
      categories: [],
    });
  }, [
    initialDestination,
    initialDestinationId,
    initialFromDate,
    initialToDate,
    filterLoading,
  ]);

  useEffect(() => {
    return () => {
      clearTimeout(locationDebounceTimer.current);
      clearTimeout(priceDebounceTimer.current);
    };
  }, []);

  const handleActivitySearch = async (data) => {
    const [from, to] = data.dateRange || [];

    const newDestination = data.destination?.trim() || "";
    const newDestinationId = data.destinationId || "";
    const newFromDate = formatSearchDate(from);
    const newToDate = formatSearchDate(to);

    if (!newDestination || !newDestinationId) {
      return;
    }

    const defaultPrice = {
      min: filterData.price.min,
      max: filterData.price.max,
    };

    setSearchDestination(newDestination);
    setSearchDestinationId(newDestinationId);
    setSearchFromDate(newFromDate);
    setSearchToDate(newToDate);

    setSearchParams({
      destination: newDestination,
      destinationId: newDestinationId,
      fromDate: newFromDate,
      toDate: newToDate,
    });

    setSelectedRating(null);
    setSelectedDuration(null);
    setSelectedCategories([]);
    setSelectedPrice(defaultPrice);

    setMobileFilterOpen(false);
    setShowModifySearch(false);

    await fetchActivities({
      destination: newDestination,
      destinationId: newDestinationId,
      fromDate: newFromDate,
      toDate: newToDate,
      rating: null,
      price: defaultPrice,
      duration: null,
      categories: [],
    });
  };

  const handleRatingChange = (rating) => {
    const newRating = selectedRating === rating ? null : rating;

    setSelectedRating(newRating);

    fetchActivities({
      rating: newRating,
      price: selectedPrice,
      duration: selectedDuration,
      categories: selectedCategories,
    });
  };

  const handleDurationChange = (duration) => {
    const newDuration =
      selectedDuration?.min === duration?.value?.min &&
      selectedDuration?.max === duration?.value?.max
        ? null
        : duration?.value;

    setSelectedDuration(newDuration);

    fetchActivities({
      rating: selectedRating,
      price: selectedPrice,
      duration: newDuration,
      categories: selectedCategories,
    });
  };

  const triggerPriceSearch = (newPrice) => {
    clearTimeout(priceDebounceTimer.current);

    priceDebounceTimer.current = setTimeout(() => {
      fetchActivities({
        rating: selectedRating,
        price: newPrice,
        duration: selectedDuration,
        categories: selectedCategories,
      });
    }, 400);
  };

  const handlePriceMinChange = (event) => {
    const value = Math.min(Number(event.target.value), selectedPrice.max - 1);

    const newPrice = {
      ...selectedPrice,
      min: value,
    };

    setSelectedPrice(newPrice);

    triggerPriceSearch(newPrice);
  };

  const handlePriceMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), selectedPrice.min + 1);

    const newPrice = {
      ...selectedPrice,
      max: value,
    };

    setSelectedPrice(newPrice);

    triggerPriceSearch(newPrice);
  };

  const handleCategoryChange = (tagId) => {
    setSelectedCategories((previous) => {
      const exists = previous.includes(tagId);

      const updatedCategories = exists
        ? previous.filter((id) => id !== tagId)
        : [...previous, tagId];

      fetchActivities({
        rating: selectedRating,
        price: selectedPrice,
        duration: selectedDuration,
        categories: updatedCategories,
      });

      return updatedCategories;
    });
  };

  const toggleCategory = (tagId) => {
    setExpandedCategories((previous) => ({
      ...previous,
      [tagId]: !previous[tagId],
    }));
  };

  const clearAllFilters = () => {
    setSelectedRating(null);
    setSelectedDuration(null);
    setSelectedCategories([]);

    const defaultPrice = {
      min: filterData.price.min,
      max: filterData.price.max,
    };

    setSelectedPrice(defaultPrice);

    fetchActivities({
      rating: null,
      price: defaultPrice,
      duration: null,
      categories: [],
    });
  };

  const renderCategory = (category, level = 0) => {
    if (!category) {
      return null;
    }

    const hasChildren =
      Array.isArray(category.items) && category.items.length > 0;

    const isExpanded = expandedCategories[category.tagId];

    return (
      <div
        className={`activityArea__categoryItem activityArea__categoryLevel${level}`}
        key={category.tagId}
      >
        <div className="activityArea__categoryHeader">
          <label className="activityArea__checkboxLabel">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.tagId)}
              onChange={() => handleCategoryChange(category.tagId)}
              disabled={category.disabled === true}
            />

            <span className="activityArea__customCheckbox" />

            <span className="activityArea__categoryName">
              {category.name?.trim()}
            </span>
          </label>

          {hasChildren && (
            <button
              type="button"
              className="activityArea__categoryToggle"
              onClick={() => toggleCategory(category.tagId)}
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="activityArea__categoryChildren">
            {category.items.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <>
        <div className="activityArea__filterHeader">
          <h3>Filters</h3>

          <button
            type="button"
            className="activityArea__clearButton"
            onClick={clearAllFilters}
          >
            Clear all
          </button>
        </div>

        <div className="activityArea__filterSection">
          <h4 className="activityArea__filterTitle">Rating</h4>

          <div className="activityArea__ratingOptions">
            {filterData.rating.map((rating) => (
              <label className="activityArea__ratingOption" key={rating}>
                <input
                  type="radio"
                  name="activityRating"
                  checked={selectedRating === rating}
                  onChange={() => handleRatingChange(rating)}
                />

                <span className="activityArea__radioCircle" />

                <span className="activityArea__filterStars">
                  {"★".repeat(rating)}

                  <span className="activityArea__emptyStars">
                    {"★".repeat(5 - rating)}
                  </span>
                </span>

                <span className="activityArea__ratingText">{rating}+</span>
              </label>
            ))}
          </div>
        </div>

        <div className="activityArea__filterSection">
          <h4 className="activityArea__filterTitle">Price</h4>

          <div className="activityArea__rangeWrapper">
            <span>Min</span>

            <input
              type="range"
              min={filterData.price.min}
              max={filterData.price.max}
              value={selectedPrice.min}
              onChange={handlePriceMinChange}
              className="activityArea__rangeInput"
            />

            <span>Max</span>

            <input
              type="range"
              min={filterData.price.min}
              max={filterData.price.max}
              value={selectedPrice.max}
              onChange={handlePriceMaxChange}
              className="activityArea__rangeInput"
            />
          </div>
        </div>

        <div className="activityArea__filterSection">
          <h4 className="activityArea__filterTitle">Duration</h4>

          <div className="activityArea__durationOptions">
            {filterData.duration.map((duration, index) => {
              const disabled = duration?.disabled === true;

              const selected =
                selectedDuration?.min === duration?.value?.min &&
                selectedDuration?.max === duration?.value?.max;

              return (
                <label
                  className={`activityArea__durationOption ${
                    disabled ? "activityArea__optionDisabled" : ""
                  }`}
                  key={`${duration?.label}-${index}`}
                >
                  <input
                    type="radio"
                    name="activityDuration"
                    checked={selected}
                    disabled={disabled}
                    onChange={() => handleDurationChange(duration)}
                  />

                  <span className="activityArea__radioCircle" />

                  <span>{duration?.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="activityArea__filterSection activityArea__categorySection">
          <h4 className="activityArea__filterTitle">Categories</h4>

          <div className="activityArea__categoryList">
            {filterData.categories.map((category) => renderCategory(category))}
          </div>
        </div>
      </>
    );
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return (
      <div className="activityArea__ratingStars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= numericRating
                ? "activityArea__star activityArea__starActive"
                : "activityArea__star"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleViewActivity = (activity) => {
    const activityCode = activity?.activityCode;

    if (!activityCode) {
      return;
    }

    const params = new URLSearchParams();

    params.set("activityCode", activityCode);
    params.set("travelDate", searchFromDate);

    navigate(`/activity-details?${params.toString()}`);
  };
  return (
    <div className="activityArea__page">
      <HeaderInner />

      <main className="activityArea__main">
        <section className="activityArea__hero">
          <div className="container">
            <div className="activityArea__heroContent">
              <span className="activityArea__heroLabel">
                Activities & Experiences
              </span>

              <h1 className="activityArea__heroTitle">
                Things to do in {searchDestination}
              </h1>

              <p className="activityArea__heroDescription">
                Discover tours, attractions and unforgettable experiences in{" "}
                {searchDestination}.
              </p>

              <button
                type="button"
                className="activityArea__modifySearchButton"
                onClick={() => setShowModifySearch((previous) => !previous)}
              >
                {showModifySearch ? "Close Search" : "Modify Search"}
              </button>
            </div>
            {showModifySearch && (
              <form
                className="activityArea__searchForm"
                onSubmit={handleSearchSubmit(handleActivitySearch)}
              >
                <div className="activityArea__searchRow">
                  <div className="activityArea__searchFieldWrapper">
                    <div
                      className={`activityArea__searchDestination ${
                        searchErrors.destination
                          ? "activityArea__searchInputError"
                          : ""
                      }`}
                    >
                      <span className="activityArea__searchLabel">
                        Where to
                      </span>

                      <Controller
                        name="destination"
                        control={searchControl}
                        rules={{
                          required: "Please enter your destination",
                          validate: (value) =>
                            value?.trim()
                              ? true
                              : "Please enter your destination",
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            autoComplete="off"
                            className="activityArea__searchDestinationInput"
                            placeholder="Where To"
                            onChange={(event) => {
                              handleSearchDestinationChange(
                                event.target.value,
                                field.onChange,
                              );
                            }}
                            onFocus={() => {
                              if (
                                field.value &&
                                field.value.trim().length >= 2
                              ) {
                                setShowLocationDropdown(true);
                              }
                            }}
                            onBlur={() => {
                              field.onBlur();

                              setTimeout(() => {
                                setShowLocationDropdown(false);
                              }, 150);
                            }}
                          />
                        )}
                      />
                    </div>

                    {showLocationDropdown && (
                      <div className="activityArea__locationDropdown">
                        {loadingLocations ? (
                          <div className="activityArea__dropdownMessage">
                            Searching...
                          </div>
                        ) : locations.length > 0 ? (
                          locations.map((location, index) => (
                            <button
                              type="button"
                              className="activityArea__locationOption"
                              key={
                                location.activityCode ||
                                `${location.destinationId}-${index}`
                              }
                              onMouseDown={(event) => {
                                event.preventDefault();

                                handleSearchLocationSelect(location);
                              }}
                            >
                              {location.thumbnailURL && (
                                <img
                                  src={location.thumbnailURL}
                                  alt={location.name || "Location"}
                                  className="activityArea__locationImage"
                                />
                              )}

                              <div className="activityArea__locationDetails">
                                <span className="activityArea__locationName">
                                  {location.name}
                                </span>

                                {location.destinationName && (
                                  <span className="activityArea__destinationName">
                                    {location.destinationName}
                                  </span>
                                )}

                                {location.type && (
                                  <span className="activityArea__locationType">
                                    {location.type}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="activityArea__dropdownMessage">
                            No locations found
                          </div>
                        )}
                      </div>
                    )}

                    {searchErrors.destination && (
                      <span className="activityArea__searchErrorMessage">
                        {searchErrors.destination.message}
                      </span>
                    )}
                  </div>

                  <div className="activityArea__searchFieldWrapper">
                    <div
                      className={`activityArea__searchDateBox ${
                        searchErrors.dateRange
                          ? "activityArea__searchInputError"
                          : ""
                      }`}
                    >
                      <div className="activityArea__searchDateContent">
                        <span className="activityArea__searchLabel">
                          From & To
                        </span>

                        <Controller
                          name="dateRange"
                          control={searchControl}
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
                              className="activityArea__searchDatePicker"
                              placeholderText="Select dates"
                              popperPlacement="bottom-start"
                            />
                          )}
                        />
                      </div>
                    </div>

                    {searchErrors.dateRange && (
                      <span className="activityArea__searchErrorMessage">
                        {searchErrors.dateRange.message}
                      </span>
                    )}
                  </div>

                  <button type="submit" className="activityArea__searchButton">
                    Search
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="activityArea__content">
          <div className="activityArea__searchSummary">
            <div className="activityArea__summaryLeft">
              <h2 className="activityArea__summaryTitle">
                Activities in {searchDestination}
              </h2>

              {!loading && !error && (
                <p className="activityArea__summaryCount">
                  {totalCount > 0
                    ? `${totalCount.toLocaleString()} activities found`
                    : "No activities found"}
                </p>
              )}
            </div>

            <div className="activityArea__dateSummary">
              <div className="activityArea__dateItem">
                <span className="activityArea__dateLabel">From</span>

                <strong>{searchFromDate || "-"}</strong>
              </div>

              <div className="activityArea__dateDivider">→</div>

              <div className="activityArea__dateItem">
                <span className="activityArea__dateLabel">To</span>

                <strong>{searchToDate || "-"}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="activityArea__mobileFilterButton"
            onClick={() => setMobileFilterOpen(true)}
          >
            <span>☰</span>
            Filters
          </button>

          <div className="activityArea__resultsLayout">
            <aside className="activityArea__desktopFilters">
              {filterLoading ? (
                <div className="activityArea__filterLoading">
                  Loading filters...
                </div>
              ) : (
                renderFilters()
              )}
            </aside>

            <div className="activityArea__resultsArea">
              {loading && (
                <div className="activityArea__loadingGrid">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div className="activityArea__skeletonCard" key={index}>
                      <div className="activityArea__skeletonImage" />

                      <div className="activityArea__skeletonBody">
                        <div className="activityArea__skeletonLine activityArea__skeletonLineLarge" />
                        <div className="activityArea__skeletonLine" />
                        <div className="activityArea__skeletonLine activityArea__skeletonLineSmall" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="activityArea__messageBox">
                  <div className="activityArea__messageIcon">!</div>

                  <h3>Something went wrong</h3>

                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && activities.length === 0 && (
                <div className="activityArea__messageBox">
                  <div className="activityArea__messageIcon">!</div>

                  <h3>No activities found</h3>

                  <p>
                    We couldn't find any activities for {searchDestination}. Try
                    changing your filters or search dates.
                  </p>
                </div>
              )}

              {!loading && !error && activities.length > 0 && (
                <div className="activityArea__activityGrid">
                  {activities.map((activity, index) => {
                    const fromPrice = Number(activity?.pricing?.fromPrice || 0);

                    const originalPrice = Number(
                      activity?.pricing?.fromPriceBeforeDiscount || 0,
                    );

                    const ourPrice = Number(activity?.ourPrice || 0);

                    const discountPercentage = getDiscountPercentage(
                      fromPrice,
                      originalPrice,
                    );

                    const activityImage =
                      activity?.thumbnailHiResURL ||
                      activity?.thumbnailURL ||
                      "";

                    return (
                      <article
                        className="activityArea__card"
                        key={
                          activity?.activityCode ||
                          `${activity?.title}-${index}`
                        }
                      >
                        <div className="activityArea__imageWrapper">
                          {activityImage ? (
                            <img
                              src={activityImage}
                              alt={activity?.title || "Activity"}
                              className="activityArea__image"
                            />
                          ) : (
                            <div className="activityArea__imagePlaceholder">
                              <span>Activity</span>
                            </div>
                          )}

                          {activity?.freeCancellation && (
                            <span className="activityArea__cancellationBadge">
                              Free cancellation
                            </span>
                          )}

                          {discountPercentage > 0 && (
                            <span className="activityArea__discountBadge">
                              {discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        <div className="activityArea__cardBody">
                          <div className="activityArea__cardTop">
                            {activity?.duration && (
                              <span className="activityArea__duration">
                                <span className="activityArea__durationIcon">
                                  ◷
                                </span>

                                {activity.duration}
                              </span>
                            )}
                          </div>

                          <h3 className="activityArea__cardTitle">
                            {activity?.title || "Activity"}
                          </h3>

                          <p className="activityArea__description">
                            {activity?.shortDescription ||
                              "Experience this amazing activity and discover the best attractions."}
                          </p>

                          <div className="activityArea__ratingRow">
                            <span className="activityArea__ratingValue">
                              {activity?.rating || 0}
                            </span>
                            {renderStars(activity?.rating)}
                            <span className="activityArea__reviewCount">
                              (
                              {Number(
                                activity?.reviewCount || 0,
                              ).toLocaleString()}{" "}
                              reviews)
                            </span>
                          </div>

                          <div className="activityArea__priceSection">
                            <div className="activityArea__priceContent">
                              <span className="activityArea__priceLabel">
                                From
                              </span>

                              {originalPrice > fromPrice && (
                                <span className="activityArea__oldPrice">
                                  {currency} {originalPrice.toFixed(2)}
                                </span>
                              )}

                              <div className="activityArea__priceRow">
                                <span className="activityArea__currency">
                                  {activity?.pricing?.currency || currency}
                                </span>

                                <strong className="activityArea__price">
                                  {fromPrice.toFixed(2)}
                                </strong>
                              </div>
                            </div>

                            {/* {ourPrice > 0 && (
                              <div className="activityArea__ourPrice">
                                <span>Our price</span>

                                <strong>
                                  {activity?.pricing?.currency || currency}{" "}
                                  {ourPrice.toFixed(2)}
                                </strong>
                              </div>
                            )} */}
                          </div>

                          <button
                            type="button"
                            className="activityArea__viewButton"
                            onClick={() => handleViewActivity(activity)}
                          >
                            View Activity
                            <span>→</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {mobileFilterOpen && (
        <div
          className="activityArea__mobileOverlay"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="activityArea__mobileDrawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="activityArea__mobileDrawerHeader">
              <h3>Filters</h3>

              <button type="button" onClick={() => setMobileFilterOpen(false)}>
                ×
              </button>
            </div>

            <div className="activityArea__mobileDrawerContent">
              {filterLoading ? (
                <div className="activityArea__filterLoading">
                  Loading filters...
                </div>
              ) : (
                renderFilters()
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ActivityArea;
