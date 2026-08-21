import { defaults } from "../default";

export const allApi = {
  flightShow: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/flight/locations/",
    },
  },

  searchFlights: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/flight/search/",
    },
  },

  priceFetch: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/api/checkout",
    },
  },

  hotelFetch: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/hotel/search-destinations",
    },
  },

  hotelSearch: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/hotel/search-hotels",
    },
  },
  getHotelDetails: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/hotel/get-hotel-details",
    },
  },
  getFilters: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/hotel/get-rooms-and-rates",
    },
  },
  getHotelDetailsAndRates: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/hotel/get-hotel-details-and-rates",
    },
  },
  checkoutDetails: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/api/checkout",
    },
  },
  hotelPayment: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/hotel/get-payment-url",
    },
  },
  revalidate: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/hotel/revalidate",
    },
  },
  login: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphamember/login",
    },
  },
  memberProfile: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/member/profile",
    },
  },
  memberSignup: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/member/signup",
    },
  },
  memberPlans: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/member/plans",
    },
  },
  memberCancel: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/member/cancel-membership",
    },
  },
  newMemberDetails: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphamember/get",
    },
  },
  updateDetails: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphamember/update",
    },
  },
  newHotelGet: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphahotel/search-hotel",
    },
  },
  newHotelFetch: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphahotel/hotel-listings",
    },
  },
  changePassword: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphamember/change-password",
    },
  },
  detailHotels: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphahotel/hotel",
    },
  },
  priceCheck: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphahotel/price-check",
    },
  },
  payNow: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphahotel/pay-now",
    },
  },
  finaliseBooking: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphahotel/hotel-booking",
    },
  },
  sessionCreate: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaflight/session",
    },
  },
  suggestionFlight: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaflight/autosuggest",
    },
  },
  fligtsData: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaflight/search",
    },
  },
  flightPrices: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaflight/revalidate",
    },
  },
  flightBookOrder: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaflight/add-order",
    },
  },
  flightPayment: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaflight/payment",
    },
  },
  carSearchLocation: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphacar/search-locations",
    },
  },

  carSearchResults: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphacar/search",
    },
  },
  carAddOrder: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphacar/add-order",
    },
  },
  carRevalidate: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphacar/revalidate",
    },
  },
  carPayment: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphacar/pay-now",
      useCarHeaders: true,
    },
  },
  activityLocations: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaactivity/locations",
    },
  },
  activityAll: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaactivity/search",
    },
  },
  activityFilters: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaactivity/filters",
    },
  },
  activityDetail: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaactivity/details",
    },
  },
  activityReviews: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaactivity/reviews",
    },
  },
  activityCalendar: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaactivity/calendar",
      activitiesCalendar: true,
    },
  },
  activityCalendarAvail: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphaactivity/availability",
    },
  },

  // vacations api
  searchVacations: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphavr/search-locations",
    },
  },
  vacationFinalList: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphavr/map-list",
    },
  },
  vacationResortList: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphavr/resort-list",
      vacationResortFinal: true,
    },
  },
  resortDetails: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphavr/resort-details",
    },
  },
  resortAvailability: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphavr/availability",
      vacationResortFinal: true,
    },
  },
  vacationAddOrder: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphavr/add-order",
    },
  },
  vacationPay: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/alphavr/pay-now",
      vacationResortFinal: true,
    },
  },
};
