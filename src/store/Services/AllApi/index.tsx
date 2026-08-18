import { callApi } from "../../../Utils/api/apiUtils";
import { allApi } from "../../Endpoints/AllApi/index";

export const flightShowCase = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.flightShow.v1,
    body,
  });
export const searchFlightsShow = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.searchFlights.v1,
    body,
  });
export const priceShow = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.priceFetch.v1,
    body,
  });
export const hotelShow = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.hotelFetch.v1,
    body,
  });
export const hotelSearch = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.hotelSearch.v1,
    body,
  });
export const getHotelDetails = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.getHotelDetails.v1,
    body,
  });
export const getFilters = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.getFilters.v1,
    body,
  });
export const getHotelDetailsAndRates = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.getHotelDetailsAndRates.v1,
    body,
  });
export const checkoutDetails = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.checkoutDetails.v1,
    body,
  });
export const hotelPayment = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.hotelPayment.v1,
    body,
  });
export const revalidate = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.revalidate.v1,
    body,
  });
export const login = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.login.v1,
    body,
  });
export const memberProfile = () =>
  callApi({
    uriEndPoint: allApi.memberProfile.v1,
  });
export const memberSignup = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.memberSignup.v1,
    body,
  });
export const memberPlans = () =>
  callApi({
    uriEndPoint: allApi.memberPlans.v1,
  });
export const memberCancel = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.memberCancel.v1,
    body,
  });

// new apis
export const newMemberDetails = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.newMemberDetails.v1,
    body,
  });
export const updateDetails = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.updateDetails.v1,
    body,
  });
export const newHotelGet = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.newHotelGet.v1,
    body,
  });
export const newHotelFetch = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.newHotelFetch.v1,
    body,
  });
export const changePassword = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.changePassword.v1,
    body,
  });
export const detailHotels = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.detailHotels.v1,
    body,
  });
export const priceCheck = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.priceCheck.v1,
    body,
  });
export const payNow = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.payNow.v1,
    body,
  });
export const finaliseBooking = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.finaliseBooking.v1,
    body,
  });
export const sessionCreate = () =>
  callApi({
    uriEndPoint: allApi.sessionCreate.v1,
  });
export const suggestionFlight = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.suggestionFlight.v1,
    body,
  });
export const fligtsData = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.fligtsData.v1,
    body,
  });

export const flightPrices = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.flightPrices.v1,
    body,
  });
export const flightOrder = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.flightBookOrder.v1,
    body,
  });
export const flightPayment = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.flightPayment.v1,
    body,
  });
export const carSearchLocation = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.carSearchLocation.v1,
    body,
  });
export const carSearchResults = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.carSearchResults.v1,
    body,
  });
export const carAddOrder = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.carAddOrder.v1,
    body,
  });
export const carRevalidate = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.carRevalidate.v1,
    body,
  });
export const carPayment = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.carPayment.v1,
    body,
  });
export const activityLocations = ({ body }: any) =>
  callApi({
    uriEndPoint: allApi.activityLocations.v1,
    body,
  });
