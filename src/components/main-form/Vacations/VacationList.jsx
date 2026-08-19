import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { FaBed, FaRegImage } from "react-icons/fa";

import "leaflet/dist/leaflet.css";
import "./VacationList.css";

import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import {
  searchVacationResorts,
  searchVacationResult,
} from "../../../store/Services/AllApi";
import VacationLoader from "../../../reuseable-components/VacationLoader/VacationLoader";

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

const VacationList = () => {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [mapResorts, setMapResorts] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [totalCount, setTotalCount] = useState(0);
  const [selectedResortId, setSelectedResortId] = useState(null);
  const [error, setError] = useState("");

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

  const getResortDetails = useCallback(
    async (resortIds) => {
      return searchVacationResorts({
        body: {
          location: vacationData.location,
          start_date: vacationData.start_date,
          end_date: vacationData.end_date,

          resortIds,
        },
      });
    },
    [vacationData],
  );

  const hotelLookup = useMemo(() => {
    return new Map(hotels.map((hotel) => [hotel.resortId, hotel]));
  }, [hotels]);

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

    const fetchVacationData = async () => {
      setLoading(true);
      setError("");
      setMapResorts([]);
      setHotels([]);
      setSelectedResortId(null);

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

        const mapResults =
          mapResponse?.data?.mapList?.result ||
          mapResponse?.data?.data?.mapList?.result ||
          [];

        setMapResorts(mapResults);

        const resortIds = [
          ...new Set(
            mapResults.map((resort) => resort.resortId).filter(Boolean),
          ),
        ];

        if (resortIds.length === 0) {
          setError("No vacation resorts found.");
          return;
        }

        const resortResponse = await getResortDetails(resortIds);

        if (ignoreResponse) {
          return;
        }

        const resortResult =
          resortResponse?.data?.resortList?.result ||
          resortResponse?.data?.data?.resortList?.result;

        setHotels(resortResult?.resorts || []);
        setTotalCount(resortResult?.totalCount || 0);
        setCurrency(resortResult?.currency || "USD");
      } catch (apiError) {
        if (!ignoreResponse) {
          setError(
            apiError?.response?.data?.message ||
              "Error fetching vacation resorts.",
          );
        }
      } finally {
        if (!ignoreResponse) {
          setLoading(false);
        }
      }
    };

    fetchVacationData();

    return () => {
      ignoreResponse = true;
    };
  }, [vacationData, getResortDetails]);

  return (
    <div className="vacationListPage">
      {loading && <VacationLoader />}

      <HeaderInner />

      <main className="vacationList">
        <aside className="vacationList__hotelPanel">
          <div className="vacationList__heading">
            <div>
              <h1>Vacation rentals</h1>

              <p>{[city, state, country].filter(Boolean).join(", ")}</p>
            </div>

            {!loading && <span>{totalCount} stays</span>}
          </div>

          {error && <div className="vacationList__error">{error}</div>}

          {!loading && !error && hotels.length === 0 && (
            <div className="vacationList__empty">No hotels found.</div>
          )}

          <div className="vacationList__cards">
            {hotels.map((hotel) => (
              <ResortCard
                key={hotel.resortId}
                resort={hotel}
                currency={currency}
                selected={selectedResortId === hotel.resortId}
                onSelect={() => setSelectedResortId(hotel.resortId)}
              />
            ))}
          </div>
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
                  click: () => {
                    if (group.resorts.length === 1) {
                      setSelectedResortId(group.resorts[0].resortId);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="vacationMap__popup">
                    {group.resorts.map((mapResort) => {
                      const hotel = hotelLookup.get(mapResort.resortId);

                      return (
                        <button
                          type="button"
                          key={mapResort.resortId}
                          onClick={() =>
                            setSelectedResortId(mapResort.resortId)
                          }
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
