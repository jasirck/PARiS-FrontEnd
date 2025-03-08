import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users : null,
    package:  null,
    holiday:  null,
    resort: null,  
    visa: null,
    booked_holidays: null,
    booked_resorts: null,
    booked_packages: null,
    booked_visa: null,
    home:  {package: null, holiday: null, resort: null, visa: null},
    profile_holiday : null,
    profile_resort : null,
    profile_package : null,
    profile_visa : null,
    profile_flight : null,
};




const appSlice = createSlice({
    name: 'api',
    initialState,
    reducers: {
        setUsers(state, action) {
            state.users = action.payload;
        },
        setPackage(state, action) {
            state.package = action.payload;
        },
        setHoliday(state, action) {
            state.holiday = action.payload;
        },
        setResort(state, action) {
            state.resort = action.payload;
        },
        setVisa(state, action) {
            state.visa = action.payload;
        },
        setHomePackage(state, action) {
            state.home.package = action.payload;
        },
        setHomeHoliday(state, action) {
            state.home.holiday = action.payload;
        },
        setHomeResort(state, action) {
            state.home.resort = action.payload;
        },
        setHomeVisa(state, action) {
            state.home.visa = action.payload;
        }, 
        setsliceHolidays(state, action) {
            state.booked_holidays = action.payload;
        },
        setsliceResorts(state, action) {
            state.booked_resorts = action.payload;
        },
        setslicePackages(state, action) {
            state.booked_packages = action.payload;
        },
        setsliceVisa(state, action) {
            state.booked_visa = action.payload;
        },
        setProfileHoliday(state, action) {
            state.profile_holiday = action.payload;
        },
        setProfileResort(state, action) {
            state.profile_resort = action.payload;
        },
        setProfilePackage(state, action) {
            state.profile_package = action.payload;
        },
        setProfileVisa(state, action) {
            state.profile_visa = action.payload;
        },
        setProfileFlight(state, action) {
            state.profile_flight = action.payload;
        },
    },
});

export const {
    setUsers,
    setPackage,
    setHoliday,
    setResort,
    setVisa,
    setHomePackage,
    setHomeHoliday,
    setHomeResort,
    setHomeVisa,
    setsliceHolidays,
    setsliceResorts,
    setslicePackages,
    setsliceVisa,
    resetState,
    setProfileHoliday,
    setProfileResort,
    setProfilePackage,
    setProfileVisa,
    setProfileFlight
} = appSlice.actions;

export default appSlice.reducer;