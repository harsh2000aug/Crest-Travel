import React, { useEffect, useRef, useState } from "react";
import "./forms.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useForm } from "react-hook-form";
import { hotelShow, newHotelGet } from "../../../store/Services/AllApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAtom, useAtomValue } from "jotai";
import {
  AdultCountToStore,
  ChildCountToStore,
  TotalRooms,
} from "../../../atoms/userAtom";
const HotelForm = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState([]);

  const [rooms, setRooms] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const [roomCountToStore, setRoomCountToStore] = useAtom(TotalRooms);
  const [adultCountToStore, setAdultCountToStore] = useAtom(AdultCountToStore);
  const [childCountToStore, setChildCountToStore] = useAtom(ChildCountToStore);

  const totalAdults =
    adults + rooms.reduce((sum, room) => sum + room.adults, 0);

  const totalChildren =
    children + rooms.reduce((sum, room) => sum + room.children, 0);

  const totalRooms = rooms.length + 1;

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      destination: "",
      dateRange: [null, null],
    },
  });

  const destination = watch("destination");
  const [selectedHotel, setSelectedHotel] = useState(null);

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setLocationId(hotel.id);
    setValue("destination", hotel.fullName);
    setShowDropdown(false);
  };
  const onSubmit = (data) => {
    const [checkIn, checkOut] = data.dateRange;

    // Room 1
    const room1 = {
      adults,
      children,
      childrenAges: childrenAges,
    };

    // All rooms
    const roomDetails = [room1, ...rooms];

    // Check whether every child has an age selected
    const hasMissingChildAge = roomDetails.some(
      (room) =>
        room.children > 0 &&
        (!room.childrenAges ||
          room.childrenAges.length !== room.children ||
          room.childrenAges.some((age) => age === "")),
    );

    if (hasMissingChildAge) {
      toast.error("Please select age for all children.");
      return;
    }

    const formData = {
      destination: data.destination,
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      guests: {
        adults: totalAdults,
        children: totalChildren,
        rooms: totalRooms,
        roomDetails: roomDetails,
      },
    };

    // Convert room details to JSON
    const encodedRoomDetails = encodeURIComponent(
      JSON.stringify(formData.guests.roomDetails),
    );

    const params = new URLSearchParams({
      destination: data.destination,
      adults: formData.guests.adults,
      children: formData.guests.children,
      rooms: formData.guests.rooms,
      locationid: locationId || "",
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      lat: selectedHotel?.coordinates?.lat || 25.27063,
      long: selectedHotel?.coordinates?.long || 55.30037,
      countryOfResidence: "AE",
      roomDetails: encodedRoomDetails,
    });

    navigate(`/hotel-results?${params.toString()}`);
    setRoomCountToStore(totalRooms);
    setAdultCountToStore(totalAdults);
    setChildCountToStore(totalChildren);
    localStorage.setItem("roomCountToStore", totalRooms);
    localStorage.setItem("adultCountToStore", totalAdults);
    localStorage.setItem("childCountToStore", totalChildren);
  };
  console.log("hoja", roomCountToStore);
  const handleDestinationChange = async (e) => {
    const query = e.target.value;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setHotelResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const res = await newHotelGet({
          body: {
            term: query,
            // term: "destination",
          },
        });

        setHotelResults(res?.data?.locations?.result || []);
        setShowDropdown(true);
      } catch (error) {
        console.log(error);
      }
    }, 500);
  };
  const handleAddChild = () => {
    setChildren((prev) => prev + 1);
    setChildrenAges((prev) => [...prev, ""]);
  };

  const handleRemoveChild = () => {
    if (children === 0) return;

    setChildren((prev) => prev - 1);
    setChildrenAges((prev) => prev.slice(0, -1));
  };

  const handleChildAgeChange = (index, age) => {
    setChildrenAges((prev) => {
      const updated = [...prev];
      updated[index] = age;
      return updated;
    });
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="input-group" style={{ position: "relative" }}>
        <label>Destination</label>
        <input
          type="text"
          placeholder="Search for hotels"
          autoComplete="off"
          {...register("destination", {
            required: "Destination is required",
            onChange: handleDestinationChange,
          })}
        />

        {errors.destination && (
          <span className="error">{errors.destination.message}</span>
        )}

        {showDropdown && hotelResults.length > 0 && (
          <div className="destination-dropdown">
            {hotelResults.map((item) => (
              <div
                key={item.id}
                className="destination-item"
                onClick={() => {
                  setValue("destination", item.fullName);
                  setSelectedDestination(item);
                  setShowDropdown(false);
                  handleSelectHotel(item);
                }}
              >
                <strong
                  style={{
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
        <Controller
          name="dateRange"
          control={control}
          rules={{
            validate: (value) =>
              (value?.[0] && value?.[1]) ||
              "Please select check-in and check-out dates",
          }}
          render={({ field }) => (
            <DatePicker
              selectsRange
              startDate={field.value?.[0]}
              endDate={field.value?.[1]}
              onChange={(dates) => field.onChange(dates)}
              minDate={new Date()}
              placeholderText="Select Check In - Check Out"
              dateFormat="dd/MM/yyyy"
              isClearable
              className="hotel-date-input"
            />
          )}
        />

        {errors.dateRange && (
          <span className="error">{errors.dateRange.message}</span>
        )}
      </div>
      <div className="input-group">
        <label>Guests and Rooms</label>

        <input
          type="text"
          onClick={() => setShowPopup(true)}
          readOnly
          value={`${totalAdults} Adult${totalAdults > 1 ? "s" : ""}${
            totalChildren > 0
              ? `, ${totalChildren} Child${totalChildren > 1 ? "ren" : ""}`
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

                <button type="button" onClick={() => setAdults(adults + 1)}>
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
                  // onClick={() => setChildren(children > 0 ? children - 1 : 0)}
                  onClick={handleRemoveChild}
                >
                  −
                </button>

                <span>{children}</span>

                <button
                  type="button"
                  // onClick={() => setChildren(children + 1)}
                  onClick={handleAddChild}
                >
                  +
                </button>
              </div>
            </div>
            {children > 0 && (
              <div className="children-age-container">
                {childrenAges.map((age, index) => (
                  <div className="child-age-row" key={index}>
                    <label>Child {index + 1} Age</label>

                    <select
                      value={age}
                      onChange={(e) =>
                        handleChildAgeChange(index, e.target.value)
                      }
                    >
                      <option value="">Select age</option>

                      {Array.from({ length: 17 }, (_, i) => i + 1).map(
                        (ageValue) => (
                          <option key={ageValue} value={ageValue}>
                            {ageValue} {ageValue === 1 ? "year" : "years"}
                          </option>
                        ),
                      )}
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
                  <div className="travel-room-title">Room {index + 2}</div>

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
                        updated[index].adults =
                          updated[index].adults > 1
                            ? updated[index].adults - 1
                            : 1;
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
                        updated[index].adults += 1;
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

                        if (updated[index].children > 0) {
                          updated[index] = {
                            ...updated[index],
                            children: updated[index].children - 1,
                            childrenAges: (
                              updated[index].childrenAges || []
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
                          children: updated[index].children + 1,
                          childrenAges: [
                            ...(updated[index].childrenAges || []),
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
                {room.children > 0 && (
                  <div className="children-age-container">
                    {(room.childrenAges || []).map((age, childIndex) => (
                      <div className="child-age-row" key={childIndex}>
                        <label>Child {childIndex + 1} Age</label>

                        <select
                          value={age}
                          onChange={(e) => {
                            const updated = [...rooms];

                            const updatedAges = [
                              ...(updated[index].childrenAges || []),
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

                          {Array.from({ length: 17 }, (_, i) => i + 1).map(
                            (ageValue) => (
                              <option key={ageValue} value={ageValue}>
                                {ageValue} {ageValue === 1 ? "year" : "years"}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}

            <div className="travel-popup-footer">
              <button
                className="travel-add-room-btn"
                type="button"
                onClick={() =>
                  setRooms([
                    ...rooms,
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
                onClick={() => setShowPopup(!showPopup)}
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
  );
};

export default HotelForm;
