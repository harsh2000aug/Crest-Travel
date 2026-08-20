import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import VacationModifySearch from "./VacationModifySearch";
import {
  FaBed,
  FaChevronDown,
  FaClock,
  FaHome,
  FaHotel,
  FaRegImage,
  FaTimes,
  FaUsers,
  FaWallet,
} from "react-icons/fa";

import "leaflet/dist/leaflet.css";
import "./VacationList.css";

import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import {
  searchVacationResorts,
  searchVacationResult,
} from "../../../store/Services/AllApi";
import VacationLoader from "../../../reuseable-components/VacationLoader/VacationLoader";

const LIMIT = 10;
const VACATION_DETAILS_ROUTE = "/vacation-details";

const createMarkerIcon = (count) => {
  return L.divIcon({
    className: "vacationMap__icon",
    html:
      count > 1
        ? `<span class="vacationMap__cluster">${count}</span>`
        : '<span class="vacationMap__pin"><i></i></span>',
    iconSize: count > 1 ? [42, 42] : [30, 40],
    iconAnchor: count > 1 ? [21, 21] : [15, 38],
    popupAnchor: [0, -25],
  });
};

const MapController = ({
  mapResorts,
  selectedResortId,
  defaultLatitude,
  defaultLongitude,
}) => {
  const map = useMap();

  useEffect(() => {
    const selectedLocation = mapResorts.find(
      (resort) => resort.resortId === selectedResortId,
    );

    if (selectedLocation) {
      map.flyTo(
        [Number(selectedLocation.latitude), Number(selectedLocation.longitude)],
        15,
        {
          duration: 0.8,
        },
      );

      return;
    }

    const positions = mapResorts
      .filter(
        (resort) =>
          Number.isFinite(Number(resort.latitude)) &&
          Number.isFinite(Number(resort.longitude)),
      )
      .map((resort) => [Number(resort.latitude), Number(resort.longitude)]);

    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }

    if (positions.length > 1) {
      map.fitBounds(positions, {
        padding: [45, 45],
        maxZoom: 14,
      });

      return;
    }

    map.setView([defaultLatitude, defaultLongitude], 12);
  }, [mapResorts, selectedResortId, defaultLatitude, defaultLongitude, map]);

  return null;
};

const ResortCard = ({ resort, currency, selected, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  const price = Number(resort?.price?.ourPrice || 0);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <button
      type="button"
      className={`vacationList__card ${
        selected ? "vacationList__card--selected" : ""
      }`}
      onClick={onSelect}
    >
      <div className="vacationList__imageWrapper">
        {resort.image && !imageError ? (
          <img
            src={resort.image}
            alt={resort.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="vacationList__imageFallback">
            <FaRegImage />
          </div>
        )}
      </div>

      <div className="vacationList__cardContent">
        <h3>{resort.name}</h3>

        <p className="vacationList__address">
          {[resort.location?.city, resort.location?.state]
            .filter(Boolean)
            .join(", ")}
        </p>

        <div className="vacationList__unit">
          <FaBed />

          <span>
            {resort.unitType} · {resort.maxOccupancy} people Max
          </span>
        </div>

        <div className="vacationList__divider" />

        <div className="vacationList__price">
          <span>
            From <strong>{formattedPrice}</strong>
          </span>

          <small>
            for {resort.numberOfNights} Nights Includes taxes and fees
          </small>
        </div>
      </div>
    </button>
  );
};

const formatUnitType = (unitType) => {
  if (!unitType) {
    return "Unknown";
  }

  if (unitType.toUpperCase() === "HOTEL UNIT") {
    return "HOTEL UNIT";
  }

  return unitType
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const VacationFilters = ({ hotels, currency, onFilteredHotelsChange }) => {
  const filterRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [stayType, setStayType] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedOccupancies, setSelectedOccupancies] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [show499Only, setShow499Only] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const sizeOptions = useMemo(() => {
    const optionMap = new Map();

    hotels.forEach((hotel) => {
      const value = hotel.unitType?.trim().toUpperCase();

      if (!value || optionMap.has(value)) {
        return;
      }

      optionMap.set(value, {
        value,
        label: formatUnitType(value),
      });
    });

    return Array.from(optionMap.values()).sort((firstOption, secondOption) =>
      firstOption.label.localeCompare(secondOption.label),
    );
  }, [hotels]);

  const durationOptions = useMemo(() => {
    return [
      ...new Set(
        hotels
          .map((hotel) => Number(hotel.numberOfNights))
          .filter(Number.isFinite),
      ),
    ].sort((first, second) => first - second);
  }, [hotels]);

  const occupancyOptions = useMemo(() => {
    return [
      ...new Set(
        hotels
          .map((hotel) => Number(hotel.maxOccupancy))
          .filter(Number.isFinite),
      ),
    ].sort((first, second) => first - second);
  }, [hotels]);

  const priceRanges = useMemo(() => {
    const prices = hotels
      .map((hotel) => Number(hotel?.price?.ourPrice))
      .filter(Number.isFinite);

    if (prices.length === 0) {
      return [];
    }

    const minimumPrice = Math.min(...prices);
    const maximumPrice = Math.max(...prices);

    if (minimumPrice === maximumPrice) {
      return [
        {
          id: "price-0",
          minimum: minimumPrice,
          maximum: maximumPrice,
          includeMaximum: true,
          count: prices.length,
        },
      ];
    }

    const rangeSize = (maximumPrice - minimumPrice) / 3;

    return Array.from({ length: 3 }, (_, index) => {
      const minimum = minimumPrice + rangeSize * index;

      const maximum =
        index === 2 ? maximumPrice : minimumPrice + rangeSize * (index + 1);

      const includeMaximum = index === 2;

      const count = prices.filter((price) => {
        return (
          price >= minimum &&
          (includeMaximum ? price <= maximum : price < maximum)
        );
      }).length;

      return {
        id: `price-${index}`,
        minimum,
        maximum,
        includeMaximum,
        count,
      };
    });
  }, [hotels]);

  const formatFilterPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const toggleArrayValue = (value, setSelectedValues) => {
    setSelectedValues((currentValues) => {
      if (currentValues.includes(value)) {
        return currentValues.filter((currentValue) => currentValue !== value);
      }

      return [...currentValues, value];
    });
  };

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const unitType = hotel.unitType?.trim().toUpperCase();

      const numberOfNights = Number(hotel.numberOfNights);

      const maxOccupancy = Number(hotel.maxOccupancy);

      const price = Number(hotel?.price?.ourPrice);

      const isResort = unitType === "HOTEL" || unitType === "HOTEL UNIT";

      if (stayType === "resorts" && !isResort) {
        return false;
      }

      if (stayType === "homes" && isResort) {
        return false;
      }

      if (selectedSizes.length > 0 && !selectedSizes.includes(unitType)) {
        return false;
      }

      if (
        selectedDurations.length > 0 &&
        !selectedDurations.includes(numberOfNights)
      ) {
        return false;
      }

      if (
        selectedOccupancies.length > 0 &&
        !selectedOccupancies.includes(maxOccupancy)
      ) {
        return false;
      }

      if (selectedPriceRanges.length > 0) {
        if (!Number.isFinite(price)) {
          return false;
        }

        const matchesPrice = priceRanges.some((priceRange) => {
          if (!selectedPriceRanges.includes(priceRange.id)) {
            return false;
          }

          return (
            price >= priceRange.minimum &&
            (priceRange.includeMaximum
              ? price <= priceRange.maximum
              : price < priceRange.maximum)
          );
        });

        if (!matchesPrice) {
          return false;
        }
      }

      if (show499Only && (!Number.isFinite(price) || price > 499)) {
        return false;
      }

      return true;
    });
  }, [
    hotels,
    stayType,
    selectedSizes,
    selectedDurations,
    selectedOccupancies,
    selectedPriceRanges,
    priceRanges,
    show499Only,
  ]);

  useEffect(() => {
    onFilteredHotelsChange(filteredHotels);
  }, [filteredHotels, onFilteredHotelsChange]);

  const handleDropdown = (dropdownName) => {
    setActiveDropdown((currentDropdown) =>
      currentDropdown === dropdownName ? null : dropdownName,
    );
  };

  const handleStayType = (newStayType) => {
    setStayType(newStayType);
    setActiveDropdown(null);
  };

  return (
    <div className="vacationFilters" ref={filterRef}>
      <div className="vacationFilters__stayTypes">
        <button
          type="button"
          className={`vacationFilters__stayButton ${
            stayType === "all" ? "vacationFilters__stayButton--active" : ""
          }`}
          onClick={() => handleStayType("all")}
        >
          <FaBed />
          All Stays
        </button>

        <button
          type="button"
          className={`vacationFilters__stayButton ${
            stayType === "resorts" ? "vacationFilters__stayButton--active" : ""
          }`}
          onClick={() => handleStayType("resorts")}
        >
          <FaHotel />
          Resorts
        </button>

        <button
          type="button"
          className={`vacationFilters__stayButton ${
            stayType === "homes" ? "vacationFilters__stayButton--active" : ""
          }`}
          onClick={() => handleStayType("homes")}
        >
          <FaHome />
          Homes
        </button>
      </div>

      <div className="vacationFilters__controls">
        <div className="vacationFilters__dropdownWrapper">
          <button
            type="button"
            className={`vacationFilters__filterButton ${
              activeDropdown === "size"
                ? "vacationFilters__filterButton--active"
                : ""
            }`}
            onClick={() => handleDropdown("size")}
          >
            <FaBed />

            <span>
              Size
              {selectedSizes.length > 0 && ` (${selectedSizes.length})`}
            </span>

            <FaChevronDown />
          </button>

          {activeDropdown === "size" && (
            <div className="vacationFilters__menu">
              <div className="vacationFilters__menuHeader">
                <strong>Size</strong>

                <button type="button" onClick={() => setActiveDropdown(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="vacationFilters__options">
                {sizeOptions.length > 0 ? (
                  sizeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="vacationFilters__option"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(option.value)}
                        onChange={() =>
                          toggleArrayValue(option.value, setSelectedSizes)
                        }
                      />

                      <span>{option.label}</span>
                    </label>
                  ))
                ) : (
                  <p className="vacationFilters__noOptions">No size options</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="vacationFilters__dropdownWrapper">
          <button
            type="button"
            className={`vacationFilters__filterButton ${
              activeDropdown === "duration"
                ? "vacationFilters__filterButton--active"
                : ""
            }`}
            onClick={() => handleDropdown("duration")}
          >
            <FaClock />

            <span>
              Duration
              {selectedDurations.length > 0 && ` (${selectedDurations.length})`}
            </span>

            <FaChevronDown />
          </button>

          {activeDropdown === "duration" && (
            <div className="vacationFilters__menu">
              <div className="vacationFilters__menuHeader">
                <strong>Duration</strong>

                <button type="button" onClick={() => setActiveDropdown(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="vacationFilters__options">
                {durationOptions.length > 0 ? (
                  durationOptions.map((duration) => (
                    <label key={duration} className="vacationFilters__option">
                      <input
                        type="checkbox"
                        checked={selectedDurations.includes(duration)}
                        onChange={() =>
                          toggleArrayValue(duration, setSelectedDurations)
                        }
                      />

                      <span>
                        {duration} {duration === 1 ? "Night" : "Nights"}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="vacationFilters__noOptions">
                    No duration options
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="vacationFilters__dropdownWrapper">
          <button
            type="button"
            className={`vacationFilters__filterButton ${
              activeDropdown === "occupancy"
                ? "vacationFilters__filterButton--active"
                : ""
            }`}
            onClick={() => handleDropdown("occupancy")}
          >
            <FaUsers />

            <span>
              Occupancy
              {selectedOccupancies.length > 0 &&
                ` (${selectedOccupancies.length})`}
            </span>

            <FaChevronDown />
          </button>

          {activeDropdown === "occupancy" && (
            <div className="vacationFilters__menu vacationFilters__menu--scroll">
              <div className="vacationFilters__menuHeader">
                <strong>Occupancy</strong>

                <button type="button" onClick={() => setActiveDropdown(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="vacationFilters__options">
                {occupancyOptions.length > 0 ? (
                  occupancyOptions.map((occupancy) => (
                    <label key={occupancy} className="vacationFilters__option">
                      <input
                        type="checkbox"
                        checked={selectedOccupancies.includes(occupancy)}
                        onChange={() =>
                          toggleArrayValue(occupancy, setSelectedOccupancies)
                        }
                      />

                      <span>{occupancy}</span>
                    </label>
                  ))
                ) : (
                  <p className="vacationFilters__noOptions">
                    No occupancy options
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="vacationFilters__dropdownWrapper vacationFilters__dropdownWrapper--price">
          <button
            type="button"
            className={`vacationFilters__filterButton ${
              activeDropdown === "price"
                ? "vacationFilters__filterButton--active"
                : ""
            }`}
            onClick={() => handleDropdown("price")}
          >
            <FaWallet />

            <span>
              Price
              {selectedPriceRanges.length > 0 &&
                ` (${selectedPriceRanges.length})`}
            </span>

            <FaChevronDown />
          </button>

          {activeDropdown === "price" && (
            <div className="vacationFilters__menu vacationFilters__menu--price">
              <div className="vacationFilters__menuHeader">
                <strong>Price</strong>

                <button type="button" onClick={() => setActiveDropdown(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="vacationFilters__options">
                {priceRanges.length > 0 ? (
                  priceRanges.map((priceRange) => (
                    <label
                      key={priceRange.id}
                      className="vacationFilters__option"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceRanges.includes(priceRange.id)}
                        onChange={() =>
                          toggleArrayValue(
                            priceRange.id,
                            setSelectedPriceRanges,
                          )
                        }
                      />

                      <span className="vacationFilters__priceLabel">
                        {formatFilterPrice(priceRange.minimum)} -{" "}
                        {formatFilterPrice(priceRange.maximum)}
                      </span>

                      <small>{priceRange.count}</small>
                    </label>
                  ))
                ) : (
                  <p className="vacationFilters__noOptions">No price options</p>
                )}
              </div>
            </div>
          )}
        </div>

        <label className="vacationFilters__only499">
          <input
            type="checkbox"
            checked={show499Only}
            onChange={(event) => setShow499Only(event.target.checked)}
          />

          <span>Show $499 only</span>
        </label>

        {/* <span className="vacationFilters__resultCount">
          {filteredHotels.length} of {hotels.length}
        </span> */}
      </div>
    </div>
  );
};

const VacationList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hotelPanelRef = useRef(null);
  const mapSpotRequestRef = useRef(0);

  const [mapLoading, setMapLoading] = useState(true);
  const [resortLoading, setResortLoading] = useState(false);
  const [mapSpotLoading, setMapSpotLoading] = useState(false);
  const [mapResorts, setMapResorts] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [mapSpotHotels, setMapSpotHotels] = useState(null);
  const [mapSpotTotalCount, setMapSpotTotalCount] = useState(0);
  const [selectedMapSpotKey, setSelectedMapSpotKey] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [totalCount, setTotalCount] = useState(0);
  const [selectedResortId, setSelectedResortId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [resortSearch, setResortSearch] = useState({
    searchKey: "",
    resortIds: [],
  });

  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const country = searchParams.get("country") || "";

  const latitude = Number(searchParams.get("latitude"));

  const longitude = Number(searchParams.get("longitude"));

  const type = searchParams.get("type") || "";

  const startDate = searchParams.get("start_date") || "";

  const endDate = searchParams.get("end_date") || "";

  const vacationData = useMemo(
    () => ({
      location: {
        city,
        state,
        country,
        latitude,
        longitude,
        type,
      },
      start_date: startDate,
      end_date: endDate,
    }),
    [city, state, country, latitude, longitude, type, startDate, endDate],
  );

  const searchKey = useMemo(() => JSON.stringify(vacationData), [vacationData]);

  const handleHotelClick = useCallback(
    (hotel) => {
      if (!hotel?.resortId) {
        return;
      }

      const detailsParams = new URLSearchParams({
        resortId: String(hotel.resortId),
        checkInDate: vacationData.start_date,
        checkOutDate: vacationData.end_date,
      });

      navigate(`${VACATION_DETAILS_ROUTE}?${detailsParams.toString()}`);
    },
    [navigate, vacationData.start_date, vacationData.end_date],
  );

  const getResortDetails = useCallback(
    async (resortIds, currentPage) => {
      return searchVacationResorts({
        body: {
          location: vacationData.location,
          start_date: vacationData.start_date,
          end_date: vacationData.end_date,
          resortIds,
          page: currentPage,
          limit: LIMIT,
        },
      });
    },
    [vacationData],
  );

  const hotelLookup = useMemo(() => {
    return new Map(hotels.map((hotel) => [hotel.resortId, hotel]));
  }, [hotels]);

  const mapHotelLookup = useMemo(() => {
    const combinedHotels = [...hotels, ...(mapSpotHotels || [])];

    return new Map(combinedHotels.map((hotel) => [hotel.resortId, hotel]));
  }, [hotels, mapSpotHotels]);

  const groupedMapResorts = useMemo(() => {
    const groups = {};

    mapResorts.forEach((resort) => {
      const resortLatitude = Number(resort.latitude);

      const resortLongitude = Number(resort.longitude);

      if (
        !Number.isFinite(resortLatitude) ||
        !Number.isFinite(resortLongitude)
      ) {
        return;
      }

      const coordinateKey = `${resortLatitude.toFixed(
        6,
      )}-${resortLongitude.toFixed(6)}`;

      if (!groups[coordinateKey]) {
        groups[coordinateKey] = {
          latitude: resortLatitude,
          longitude: resortLongitude,
          resorts: [],
        };
      }

      groups[coordinateKey].resorts.push(resort);
    });

    return Object.values(groups);
  }, [mapResorts]);

  useEffect(() => {
    let ignoreResponse = false;

    const fetchMapData = async () => {
      setMapLoading(true);
      setResortLoading(false);
      setError("");
      setMapResorts([]);
      setHotels([]);
      setFilteredHotels([]);
      mapSpotRequestRef.current += 1;
      setMapSpotHotels(null);
      setMapSpotTotalCount(0);
      setSelectedMapSpotKey("");
      setMapSpotLoading(false);
      setTotalCount(0);
      setSelectedResortId(null);
      setPage(1);

      setResortSearch({
        searchKey: "",
        resortIds: [],
      });

      try {
        const mapResponse = await searchVacationResult({
          body: {
            location: vacationData.location,
            start_date: vacationData.start_date,
            end_date: vacationData.end_date,
          },
        });

        if (ignoreResponse) {
          return;
        }
        localStorage.setItem(
          "CorelationIdOfVacation",
          mapResponse.correlationid,
        );

        const mapResults =
          mapResponse?.data?.mapList?.result ||
          mapResponse?.data?.data?.mapList?.result ||
          [];

        const resortIds = [
          ...new Set(
            mapResults.map((resort) => resort.resortId).filter(Boolean),
          ),
        ];

        setMapResorts(mapResults);

        if (resortIds.length === 0) {
          setError("No vacation resorts found.");
          return;
        }

        setResortLoading(true);

        setResortSearch({
          searchKey,
          resortIds,
        });
      } catch (apiError) {
        if (!ignoreResponse) {
          setError(
            apiError?.response?.data?.message ||
              "Unable to get vacation locations.",
          );
        }
      } finally {
        if (!ignoreResponse) {
          setMapLoading(false);
        }
      }
    };

    fetchMapData();

    return () => {
      ignoreResponse = true;
    };
  }, [vacationData, searchKey]);

  useEffect(() => {
    if (
      resortSearch.resortIds.length === 0 ||
      resortSearch.searchKey !== searchKey
    ) {
      return;
    }

    let ignoreResponse = false;

    const fetchResortDetails = async () => {
      setResortLoading(true);
      setError("");
      setSelectedResortId(null);
      mapSpotRequestRef.current += 1;
      setMapSpotHotels(null);
      setMapSpotTotalCount(0);
      setSelectedMapSpotKey("");
      setMapSpotLoading(false);
      setHotels([]);
      setFilteredHotels([]);

      try {
        const resortResponse = await getResortDetails(
          resortSearch.resortIds,
          page,
        );

        if (ignoreResponse) {
          return;
        }

        const resortResult =
          resortResponse?.data?.resortList?.result ||
          resortResponse?.data?.data?.resortList?.result;

        const currentPageHotels = resortResult?.resorts || [];

        setHotels(currentPageHotels);
        setFilteredHotels(currentPageHotels);

        setTotalCount(resortResult?.totalCount || 0);

        setCurrency(resortResult?.currency || "USD");
      } catch (apiError) {
        if (!ignoreResponse) {
          setHotels([]);
          setFilteredHotels([]);

          setError(
            apiError?.response?.data?.message ||
              "Unable to get vacation resort details.",
          );
        }
      } finally {
        if (!ignoreResponse) {
          setResortLoading(false);
        }
      }
    };

    fetchResortDetails();

    return () => {
      ignoreResponse = true;
    };
  }, [
    resortSearch.resortIds,
    resortSearch.searchKey,
    searchKey,
    page,
    getResortDetails,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const visiblePages = useMemo(() => {
    const pages = [];

    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    startPage = Math.max(1, endPage - 4);

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      pages.push(pageNumber);
    }

    return pages;
  }, [page, totalPages]);

  const handleMapSpotClick = async (spotResorts) => {
    const spotResortIds = [
      ...new Set(spotResorts.map((resort) => resort.resortId).filter(Boolean)),
    ];

    if (spotResortIds.length === 0) {
      return;
    }

    const requestId = mapSpotRequestRef.current + 1;
    mapSpotRequestRef.current = requestId;

    const spotKey = [...spotResortIds].sort().join("|");

    setSelectedMapSpotKey(`${spotKey}-${requestId}`);
    setMapSpotLoading(true);
    setMapSpotHotels([]);
    setFilteredHotels([]);
    setMapSpotTotalCount(0);
    setError("");
    setSelectedResortId(spotResortIds.length === 1 ? spotResortIds[0] : null);

    hotelPanelRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    try {
      const hotelsAlreadyLoaded = spotResortIds
        .map((resortId) => hotelLookup.get(resortId))
        .filter(Boolean);

      if (hotelsAlreadyLoaded.length === spotResortIds.length) {
        if (requestId !== mapSpotRequestRef.current) {
          return;
        }

        setMapSpotHotels(hotelsAlreadyLoaded);
        setFilteredHotels(hotelsAlreadyLoaded);
        setMapSpotTotalCount(hotelsAlreadyLoaded.length);
        return;
      }

      const response = await searchVacationResorts({
        body: {
          location: vacationData.location,
          start_date: vacationData.start_date,
          end_date: vacationData.end_date,
          resortIds: spotResortIds,
          page: 1,
          limit: Math.max(LIMIT, spotResortIds.length),
        },
      });

      if (requestId !== mapSpotRequestRef.current) {
        return;
      }

      const result =
        response?.data?.resortList?.result ||
        response?.data?.data?.resortList?.result;

      const selectedHotels = result?.resorts || [];

      setMapSpotHotels(selectedHotels);
      setFilteredHotels(selectedHotels);
      setMapSpotTotalCount(result?.totalCount || selectedHotels.length);
    } catch (apiError) {
      if (requestId === mapSpotRequestRef.current) {
        setMapSpotHotels([]);
        setFilteredHotels([]);
        setError(
          apiError?.response?.data?.message ||
            "Unable to get resorts at the selected map location.",
        );
      }
    } finally {
      if (requestId === mapSpotRequestRef.current) {
        setMapSpotLoading(false);
      }
    }
  };

  const handleClearMapSpot = () => {
    mapSpotRequestRef.current += 1;
    setMapSpotHotels(null);
    setMapSpotTotalCount(0);
    setSelectedMapSpotKey("");
    setSelectedResortId(null);
    setMapSpotLoading(false);
    setError("");
    setFilteredHotels(hotels);

    hotelPanelRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page ||
      resortLoading
    ) {
      return;
    }

    mapSpotRequestRef.current += 1;
    setMapSpotHotels(null);
    setMapSpotTotalCount(0);
    setSelectedMapSpotKey("");
    setMapSpotLoading(false);
    setResortLoading(true);
    setPage(newPage);

    hotelPanelRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const hotelPanelLoading = resortLoading || mapSpotLoading;
  const loading = mapLoading || hotelPanelLoading;

  const filterSourceHotels = mapSpotHotels !== null ? mapSpotHotels : hotels;

  return (
    <div className="vacationListPage">
      <HeaderInner />
      {mapLoading && <VacationLoader />}
      <VacationModifySearch key={searchKey} totalCount={totalCount} />

      <VacationFilters
        key={`${searchKey}-${page}-${selectedMapSpotKey || "page-results"}`}
        hotels={filterSourceHotels}
        currency={currency}
        onFilteredHotelsChange={setFilteredHotels}
      />

      <main className="vacationList">
        <aside className="vacationList__hotelPanel" ref={hotelPanelRef}>
          <div className="vacationList__heading">
            <div>
              <h1>Vacation rentals</h1>

              <p>{[city, state, country].filter(Boolean).join(", ")}</p>
            </div>

            {mapSpotHotels !== null ? (
              <div className="vacationList__mapSelection">
                <span className="vacationList__mapSelectionCount">
                  {mapSpotLoading
                    ? "Loading stays at this location..."
                    : `${mapSpotTotalCount} ${
                        mapSpotTotalCount === 1 ? "stay" : "stays"
                      } at this location`}
                </span>

                <button
                  type="button"
                  className="vacationList__showPageResults"
                  onClick={handleClearMapSpot}
                >
                  <FaTimes />
                  Show page results
                </button>
              </div>
            ) : (
              !mapLoading && (
                <span>
                  {resortLoading ? "Loading stays..." : `${totalCount} stays`}
                </span>
              )
            )}
          </div>

          {error && <div className="vacationList__error">{error}</div>}

          {hotelPanelLoading && !mapLoading && (
            <div
              className="vacationList__mapSpotLoader"
              role="status"
              aria-live="polite"
            >
              <span className="vacationList__mapSpotSpinner" />
              <p>
                {mapSpotLoading
                  ? "Finding vacation rentals at this location..."
                  : "Loading vacation rentals..."}
              </p>
            </div>
          )}

          {!loading && !error && filteredHotels.length === 0 && (
            <div className="vacationList__empty">
              {mapSpotHotels !== null
                ? "No resorts found at this map location."
                : "No resorts match the selected filters."}
            </div>
          )}

          <div className="vacationList__cards">
            {filteredHotels.map((hotel) => (
              <ResortCard
                key={hotel.resortId}
                resort={hotel}
                currency={currency}
                selected={selectedResortId === hotel.resortId}
                onSelect={() => handleHotelClick(hotel)}
              />
            ))}
          </div>

          {mapSpotHotels === null && totalPages > 1 && (
            <div className="vacationList__pagination">
              <button
                type="button"
                className="vacationList__paginationButton"
                disabled={page === 1 || resortLoading}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>

              <div className="vacationList__pageNumbers">
                {visiblePages.map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    className={`vacationList__pageButton ${
                      page === pageNumber
                        ? "vacationList__pageButton--active"
                        : ""
                    }`}
                    disabled={resortLoading}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="vacationList__paginationButton"
                disabled={page === totalPages || resortLoading}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </aside>

        <section className="vacationMap">
          <MapContainer
            center={[
              Number.isFinite(latitude) ? latitude : 0,
              Number.isFinite(longitude) ? longitude : 0,
            ]}
            zoom={12}
            scrollWheelZoom
            className="vacationMap__container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
              mapResorts={mapResorts}
              selectedResortId={selectedResortId}
              defaultLatitude={Number.isFinite(latitude) ? latitude : 0}
              defaultLongitude={Number.isFinite(longitude) ? longitude : 0}
            />

            {groupedMapResorts.map((group) => (
              <Marker
                key={`${group.latitude}-${group.longitude}`}
                position={[group.latitude, group.longitude]}
                icon={createMarkerIcon(group.resorts.length)}
                eventHandlers={{
                  click: () => handleMapSpotClick(group.resorts),
                }}
              >
                <Popup>
                  <div className="vacationMap__popup">
                    {group.resorts.map((mapResort) => {
                      const hotel = mapHotelLookup.get(mapResort.resortId);

                      return (
                        <button
                          type="button"
                          key={mapResort.resortId}
                          onClick={() => handleHotelClick(mapResort)}
                        >
                          <strong>{hotel?.name || mapResort.resortId}</strong>

                          <span>{mapResort.country}</span>
                        </button>
                      );
                    })}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VacationList;
