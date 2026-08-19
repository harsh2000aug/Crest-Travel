import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../../../reuseable-components/Loader/Loader";
import { suggestionFlight } from "../../../store/Services/AllApi";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const FlightForm = () => {
  const [tripType, setTripType] = useState("round");
  const [returnDate, setReturnDate] = useState(null);
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");

  const [fromDropdown, setFromDropdown] = useState([]);
  const [toDropdown, setToDropdown] = useState([]);

  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);

  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const createMultiCityFlight = () => ({
    departure: "",
    destination: "",
    departureDate: null,
    fromAirport: null,
    toAirport: null,
    fromDropdown: [],
    toDropdown: [],
    showFrom: false,
    showTo: false,
  });

  const [multiCityFlights, setMultiCityFlights] = useState([
    createMultiCityFlight(),
    createMultiCityFlight(),
  ]);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      departure: "",
      destination: "",
      departureDate: null,
      returnDate: null,
      cabinClass: "Economy",
      multiCityFlights: [
        {
          departure: "",
          destination: "",
          departureDate: null,
          fromAirport: null,
          toAirport: null,
        },
        {
          departure: "",
          destination: "",
          departureDate: null,
          fromAirport: null,
          toAirport: null,
        },
      ],
    },
  });

  const watchedDepartureDate = watch("departureDate");

  const totalTravelers =
    travelers.adults + travelers.children + travelers.infants;

  const formatDate = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getAirportCode = (fullname = "") => {
    const match = fullname.match(/^\[([^\]]+)\]/);
    return match ? match[1] : "";
  };

  const handleTripType = (type) => {
    setTripType(type);

    if (type === "oneway") {
      setReturnDate(null);
    }

    if (type === "multicity") {
      setMultiCityFlights([createMultiCityFlight(), createMultiCityFlight()]);
    }
  };

  const increment = (type) => {
    setTravelers((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const decrement = (type) => {
    setTravelers((prev) => ({
      ...prev,
      [type]:
        type === "adults"
          ? Math.max(1, prev[type] - 1)
          : Math.max(0, prev[type] - 1),
    }));
  };

  const handleSearchDropdown = async (type, value) => {
    if (!value.trim()) {
      if (type === "from") {
        setFromDropdown([]);
      } else {
        setToDropdown([]);
      }

      return;
    }

    try {
      const res = await suggestionFlight({
        body: {
          term: value,
          sessionId: localStorage.getItem("sessionId"),
        },
      });

      const result = res?.data?.locations?.result || [];

      if (type === "from") {
        setFromDropdown(result);
      } else {
        setToDropdown(result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tripType === "multicity") return;

    const timer = setTimeout(() => {
      if (!fromAirport) {
        handleSearchDropdown("from", departure);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [departure, tripType, fromAirport]);

  useEffect(() => {
    if (tripType === "multicity") return;

    const timer = setTimeout(() => {
      if (!toAirport) {
        handleSearchDropdown("to", destination);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination, tripType, toAirport]);

  const handleMultiCityDropdown = async (index, type, value) => {
    if (!value.trim()) {
      setMultiCityFlights((prev) =>
        prev.map((flight, i) => {
          if (i !== index) return flight;

          return {
            ...flight,
            ...(type === "from"
              ? {
                  fromDropdown: [],
                  showFrom: false,
                }
              : {
                  toDropdown: [],
                  showTo: false,
                }),
          };
        }),
      );

      return;
    }

    try {
      const res = await suggestionFlight({
        body: {
          term: value,
          sessionId: localStorage.getItem("sessionId"),
        },
      });

      const result = res?.data?.locations?.result || [];

      setMultiCityFlights((prev) =>
        prev.map((flight, i) => {
          if (i !== index) return flight;

          return {
            ...flight,
            ...(type === "from"
              ? {
                  fromDropdown: result,
                  showFrom: true,
                }
              : {
                  toDropdown: result,
                  showTo: true,
                }),
          };
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tripType !== "multicity") return;

    const timers = [];

    multiCityFlights.forEach((flight, index) => {
      if (flight.departure && !flight.fromAirport) {
        const timer = setTimeout(() => {
          handleMultiCityDropdown(index, "from", flight.departure);
        }, 500);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [
    tripType,
    multiCityFlights
      .map(
        (flight) => `${flight.departure}-${flight.fromAirport?.fullname || ""}`,
      )
      .join("|"),
  ]);

  useEffect(() => {
    if (tripType !== "multicity") return;

    const timers = [];

    multiCityFlights.forEach((flight, index) => {
      if (flight.destination && !flight.toAirport) {
        const timer = setTimeout(() => {
          handleMultiCityDropdown(index, "to", flight.destination);
        }, 500);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [
    tripType,
    multiCityFlights
      .map(
        (flight) => `${flight.destination}-${flight.toAirport?.fullname || ""}`,
      )
      .join("|"),
  ]);

  const updateMultiCityFlight = (index, field, value) => {
    setMultiCityFlights((prev) =>
      prev.map((flight, i) =>
        i === index
          ? {
              ...flight,
              [field]: value,
            }
          : flight,
      ),
    );
  };

  const selectMultiCityAirport = (index, type, airport) => {
    setMultiCityFlights((prev) =>
      prev.map((flight, i) => {
        if (i !== index) return flight;

        if (type === "from") {
          return {
            ...flight,
            departure: airport.fullname,
            fromAirport: airport,
            fromDropdown: [],
            showFrom: false,
          };
        }

        return {
          ...flight,
          destination: airport.fullname,
          toAirport: airport,
          toDropdown: [],
          showTo: false,
        };
      }),
    );

    if (type === "from") {
      setValue(`multiCityFlights.${index}.departure`, airport.fullname, {
        shouldDirty: true,
        shouldValidate: false,
      });

      setValue(`multiCityFlights.${index}.fromAirport`, airport, {
        shouldDirty: true,
        shouldValidate: false,
      });

      clearErrors([
        `multiCityFlights.${index}.departure`,
        `multiCityFlights.${index}.fromAirport`,
      ]);
    } else {
      setValue(`multiCityFlights.${index}.destination`, airport.fullname, {
        shouldDirty: true,
        shouldValidate: false,
      });

      setValue(`multiCityFlights.${index}.toAirport`, airport, {
        shouldDirty: true,
        shouldValidate: false,
      });

      clearErrors([
        `multiCityFlights.${index}.destination`,
        `multiCityFlights.${index}.toAirport`,
      ]);
    }
  };

  const handleMultiCityDateChange = (index, date) => {
    setMultiCityFlights((prev) =>
      prev.map((flight, i) =>
        i === index
          ? {
              ...flight,
              departureDate: date,
            }
          : flight,
      ),
    );
  };

  const addMultiCityFlight = () => {
    if (multiCityFlights.length >= 6) return;

    setMultiCityFlights((prev) => [...prev, createMultiCityFlight()]);
  };

  const removeMultiCityFlight = (index) => {
    if (multiCityFlights.length <= 2) return;

    setMultiCityFlights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMultiCitySearch = (data) => {
    const segments = multiCityFlights.map((flight) => ({
      origin: getAirportCode(flight.fromAirport?.fullname),
      originName: flight.departure,
      destination: getAirportCode(flight.toAirport?.fullname),
      destinationName: flight.destination,
      departureDate: formatDate(flight.departureDate),
    }));

    const firstSegment = segments[0];

    const multiCityData = {
      tripType: "multicity",
      segments,
      adults: travelers.adults,
      children: travelers.children,
      infants: travelers.infants,
      cabinClass: data.cabinClass,
    };

    sessionStorage.setItem("multiCityFlights", JSON.stringify(multiCityData));

    const params = new URLSearchParams();

    params.set("tripType", "multicity");

    params.set("origin", firstSegment.origin);

    params.set("originName", firstSegment.originName);

    params.set("destination", firstSegment.destination);

    params.set("destinationName", firstSegment.destinationName);

    params.set("departureDate", firstSegment.departureDate);

    params.set("adults", String(travelers.adults));

    params.set("children", String(travelers.children));

    params.set("infants", String(travelers.infants));

    params.set("cabinClass", data.cabinClass);

    params.set("segments", JSON.stringify(segments));

    params.set("multiCityFlights", JSON.stringify(multiCityData));

    navigate(`/flight-result?${params.toString()}`);
  };

  const handleFlightResults = (data) => {
    if (tripType === "multicity") {
      handleMultiCitySearch(data);
      return;
    }

    const originCode = getAirportCode(fromAirport?.fullname);

    const destinationCode = getAirportCode(toAirport?.fullname);

    const params = new URLSearchParams({
      tripType,
      origin: originCode,
      originName: departure,
      destination: destinationCode,
      destinationName: destination,
      departureDate: formatDate(data.departureDate),
      returnDate:
        tripType === "round" && data.returnDate
          ? formatDate(data.returnDate)
          : "",
      adults: String(travelers.adults),
      children: String(travelers.children),
      infants: String(travelers.infants),
      cabinClass: data.cabinClass,
    });

    navigate(`/flight-result?${params.toString()}`);
  };

  return (
    <>
      {loading && <Loader />}

      <form onSubmit={handleSubmit(handleFlightResults)}>
        <div className="flight-card">
          <div className="trip-type">
            <button
              type="button"
              className={tripType === "round" ? "active" : ""}
              onClick={() => handleTripType("round")}
            >
              Round Trip
            </button>

            <button
              type="button"
              className={tripType === "oneway" ? "active" : ""}
              onClick={() => handleTripType("oneway")}
            >
              One Way
            </button>

            <button
              type="button"
              className={tripType === "multicity" ? "active" : ""}
              onClick={() => handleTripType("multicity")}
            >
              Multi City
            </button>
          </div>

          {tripType === "multicity" ? (
            <div className="multicity-flight-wrapper">
              {multiCityFlights.map((flight, index) => (
                <div
                  className="multicity-flight-row"
                  key={`multicity-${index}`}
                >
                  <div className="multicity-flight-header">
                    <h3>Flight {index + 1}</h3>

                    {multiCityFlights.length > 2 && (
                      <button
                        type="button"
                        className="multicity-remove-btn"
                        onClick={() => removeMultiCityFlight(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="multicity-flight-fields">
                    <div className="input-group">
                      <label>Flying From</label>

                      <input
                        {...register(`multiCityFlights.${index}.departure`, {
                          required: "Origin is required",
                          validate: () =>
                            flight.fromAirport
                              ? true
                              : "Please select an origin airport",
                        })}
                        type="text"
                        placeholder="London (LHR)"
                        value={flight.departure}
                        onChange={(e) => {
                          const value = e.target.value;

                          updateMultiCityFlight(index, "departure", value);
                          updateMultiCityFlight(index, "fromAirport", null);
                          updateMultiCityFlight(index, "showFrom", true);

                          setValue(
                            `multiCityFlights.${index}.departure`,
                            value,
                            {
                              shouldDirty: true,
                              shouldValidate: false,
                            },
                          );

                          setValue(
                            `multiCityFlights.${index}.fromAirport`,
                            null,
                            {
                              shouldDirty: true,
                              shouldValidate: false,
                            },
                          );

                          clearErrors([
                            `multiCityFlights.${index}.departure`,
                            `multiCityFlights.${index}.fromAirport`,
                          ]);
                        }}
                        onFocus={() => {
                          if (flight.fromDropdown.length > 0) {
                            updateMultiCityFlight(index, "showFrom", true);
                          }
                        }}
                      />

                      {errors.multiCityFlights?.[index]?.departure && (
                        <span className="error">
                          {errors.multiCityFlights[index].departure.message}
                        </span>
                      )}

                      {flight.showFrom && flight.fromDropdown?.length > 0 && (
                        <div className="dropdownFlight">
                          {flight.fromDropdown.map((airport, airportIndex) => (
                            <div
                              key={airportIndex}
                              className="dropdown-item"
                              onMouseDown={(e) => {
                                e.preventDefault();

                                selectMultiCityAirport(index, "from", airport);
                              }}
                            >
                              <div className="airport-row">
                                <div>
                                  <div className="city-name">
                                    {airport.fullname}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Flying To</label>

                      <input
                        {...register(`multiCityFlights.${index}.destination`, {
                          required: "Destination is required",
                          validate: () =>
                            flight.toAirport
                              ? true
                              : "Please select a destination airport",
                        })}
                        type="text"
                        placeholder="Boston (BOS)"
                        value={flight.destination}
                        onChange={(e) => {
                          const value = e.target.value;

                          updateMultiCityFlight(index, "destination", value);
                          updateMultiCityFlight(index, "toAirport", null);
                          updateMultiCityFlight(index, "showTo", true);

                          setValue(
                            `multiCityFlights.${index}.destination`,
                            value,
                            {
                              shouldDirty: true,
                              shouldValidate: false,
                            },
                          );

                          setValue(
                            `multiCityFlights.${index}.toAirport`,
                            null,
                            {
                              shouldDirty: true,
                              shouldValidate: false,
                            },
                          );

                          clearErrors([
                            `multiCityFlights.${index}.destination`,
                            `multiCityFlights.${index}.toAirport`,
                          ]);
                        }}
                        onFocus={() => {
                          if (flight.toDropdown.length > 0) {
                            updateMultiCityFlight(index, "showTo", true);
                          }
                        }}
                      />

                      {errors.multiCityFlights?.[index]?.destination && (
                        <span className="error">
                          {errors.multiCityFlights[index].destination.message}
                        </span>
                      )}

                      {flight.showTo && flight.toDropdown?.length > 0 && (
                        <div className="dropdownFlight">
                          {flight.toDropdown.map((airport, airportIndex) => (
                            <div
                              key={airportIndex}
                              className="dropdown-item"
                              onMouseDown={(e) => {
                                e.preventDefault();

                                selectMultiCityAirport(index, "to", airport);
                              }}
                            >
                              <div className="airport-row">
                                <div>
                                  <div className="city-name">
                                    {airport.fullname}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Departure Date</label>

                      <Controller
                        name={`multiCityFlights.${index}.departureDate`}
                        control={control}
                        rules={{
                          required: "Departure date is required",
                          validate: (date) => {
                            if (!date) return "Departure date is required";

                            if (
                              index > 0 &&
                              multiCityFlights[index - 1].departureDate &&
                              date < multiCityFlights[index - 1].departureDate
                            ) {
                              return "Date must be after previous flight";
                            }

                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={(date) => {
                              field.onChange(date);
                              handleMultiCityDateChange(index, date);
                            }}
                            minDate={
                              index === 0
                                ? new Date()
                                : multiCityFlights[index - 1].departureDate ||
                                  new Date()
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Departure Date"
                          />
                        )}
                      />

                      {errors.multiCityFlights?.[index]?.departureDate && (
                        <span className="error">
                          {errors.multiCityFlights[index].departureDate.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {multiCityFlights.length < 6 && (
                <button
                  type="button"
                  className="multicity-add-btn"
                  onClick={addMultiCityFlight}
                >
                  + Add Another Flight
                </button>
              )}

              <div className="multicity-bottom-section">
                <div className="input-group traveler-group">
                  <label>Travelers</label>

                  <div
                    className="traveler-input"
                    onClick={() =>
                      setShowTravelerDropdown(!showTravelerDropdown)
                    }
                  >
                    {totalTravelers} Traveler
                    {totalTravelers > 1 ? "s" : ""}
                  </div>

                  {showTravelerDropdown && (
                    <div className="traveler-dropdown">
                      <div className="traveler-row">
                        <div>
                          <h4>Adults</h4>
                          <span>12+ Years</span>
                        </div>

                        <div className="counter">
                          <button
                            type="button"
                            onClick={() => decrement("adults")}
                          >
                            -
                          </button>

                          <span>{travelers.adults}</span>

                          <button
                            type="button"
                            onClick={() => increment("adults")}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="traveler-row">
                        <div>
                          <h4>Children</h4>
                          <span>2 - 11 Years</span>
                        </div>

                        <div className="counter">
                          <button
                            type="button"
                            onClick={() => decrement("children")}
                          >
                            -
                          </button>

                          <span>{travelers.children}</span>

                          <button
                            type="button"
                            onClick={() => increment("children")}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="traveler-row">
                        <div>
                          <h4>Infants</h4>
                          <span>Under 2 Years</span>
                        </div>

                        <div className="counter">
                          <button
                            type="button"
                            onClick={() => decrement("infants")}
                          >
                            -
                          </button>

                          <span>{travelers.infants}</span>

                          <button
                            type="button"
                            onClick={() => increment("infants")}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="done-btn"
                        onClick={() => setShowTravelerDropdown(false)}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Class</label>

                  <select {...register("cabinClass")}>
                    <option value="Economy">Economy</option>

                    <option value="Premium">Premium Economy</option>

                    <option value="Business">Business</option>

                    <option value="First">First Class</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="display">search</label>

                  <button type="submit" className="multicity-search-btn">
                    Search Flights
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flight-form">
              <div className="top-three">
                <div className="input-group">
                  <label>Flying From</label>

                  <input
                    {...register("departure", {
                      required: "Origin is required",
                    })}
                    type="text"
                    placeholder="New York (JFK)"
                    value={departure}
                    onChange={(e) => {
                      setDeparture(e.target.value);
                      setFromAirport(null);
                      setShowFrom(true);
                    }}
                  />

                  {errors.departure && (
                    <span className="error">{errors.departure.message}</span>
                  )}

                  {showFrom && fromDropdown.length > 0 && (
                    <div className="dropdownFlight">
                      {fromDropdown.map((item, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onMouseDown={(e) => {
                            e.preventDefault();

                            setDeparture(item.fullname);
                            setFromAirport(item);
                            setShowFrom(false);
                            setFromDropdown([]);
                          }}
                        >
                          <div className="airport-row">
                            <div>
                              <div className="city-name">{item.fullname}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Flying To</label>

                  <input
                    {...register("destination", {
                      required: "Destination is required",
                    })}
                    type="text"
                    placeholder="London (LHR)"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setToAirport(null);
                      setShowTo(true);
                    }}
                  />

                  {errors.destination && (
                    <span className="error">{errors.destination.message}</span>
                  )}

                  {showTo && toDropdown.length > 0 && (
                    <div className="dropdownFlight">
                      {toDropdown.map((item, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onMouseDown={(e) => {
                            e.preventDefault();

                            setDestination(item.fullname);
                            setToAirport(item);
                            setShowTo(false);
                            setToDropdown([]);
                          }}
                        >
                          <div className="airport-row">
                            <div>
                              <div className="city-name">{item.fullname}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="input-group date-field">
                  <label>
                    {tripType === "round"
                      ? "Departure & Return"
                      : "Departure Date"}
                  </label>

                  {tripType === "round" ? (
                    <div className="date-range">
                      <div>
                        <Controller
                          name="departureDate"
                          control={control}
                          rules={{
                            required: "Departure date is required",
                          }}
                          render={({ field }) => (
                            <DatePicker
                              selected={field.value}
                              onChange={field.onChange}
                              minDate={new Date()}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Departure Date"
                            />
                          )}
                        />

                        {errors.departureDate && (
                          <span className="error">
                            {errors.departureDate.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <Controller
                          name="returnDate"
                          control={control}
                          rules={{
                            required: "Return date is required",
                          }}
                          render={({ field }) => (
                            <DatePicker
                              selected={field.value}
                              onChange={(date) => {
                                field.onChange(date);
                                setReturnDate(date);
                              }}
                              minDate={watchedDepartureDate || new Date()}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Return"
                            />
                          )}
                        />

                        {errors.returnDate && (
                          <span className="error">
                            {errors.returnDate.message}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Controller
                        name="departureDate"
                        control={control}
                        rules={{
                          required: "Departure date is required",
                        }}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Departure Date"
                          />
                        )}
                      />

                      {errors.departureDate && (
                        <span className="error">
                          {errors.departureDate.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bottom-three">
                <div className="input-group traveler-group">
                  <label>Travelers</label>

                  <div
                    className="traveler-input"
                    onClick={() =>
                      setShowTravelerDropdown(!showTravelerDropdown)
                    }
                  >
                    {totalTravelers} Traveler
                    {totalTravelers > 1 ? "s" : ""}
                  </div>

                  {showTravelerDropdown && (
                    <div className="traveler-dropdown">
                      <div className="traveler-row">
                        <div>
                          <h4>Adults</h4>
                          <span>12+ Years</span>
                        </div>

                        <div className="counter">
                          <button
                            type="button"
                            onClick={() => decrement("adults")}
                          >
                            -
                          </button>

                          <span>{travelers.adults}</span>

                          <button
                            type="button"
                            onClick={() => increment("adults")}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="traveler-row">
                        <div>
                          <h4>Children</h4>
                          <span>2 - 11 Years</span>
                        </div>

                        <div className="counter">
                          <button
                            type="button"
                            onClick={() => decrement("children")}
                          >
                            -
                          </button>

                          <span>{travelers.children}</span>

                          <button
                            type="button"
                            onClick={() => increment("children")}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="traveler-row">
                        <div>
                          <h4>Infants</h4>
                          <span>Under 2 Years</span>
                        </div>

                        <div className="counter">
                          <button
                            type="button"
                            onClick={() => decrement("infants")}
                          >
                            -
                          </button>

                          <span>{travelers.infants}</span>

                          <button
                            type="button"
                            onClick={() => increment("infants")}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="done-btn"
                        onClick={() => setShowTravelerDropdown(false)}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Class</label>

                  <select {...register("cabinClass")}>
                    <option value="Economy">Economy</option>

                    <option value="Premium">Premium Economy</option>

                    <option value="Business">Business</option>

                    <option value="First">First Class</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="display">search</label>

                  <button type="submit" className="search-btn">
                    Search Flights
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default FlightForm;
