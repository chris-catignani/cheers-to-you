import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    personsName: '',
    eventName: '',
};

export const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        setPersonsName: (state, action) => {
            state.personsName = action.payload
        },
        setEventName: (state, action) => {
            state.eventName = action.payload
        }
    },
});

export const { setPersonsName, setEventName } = eventSlice.actions;

export const selectPersonsName = (state) => state.event.personsName;
export const selectEventName = (state) => state.event.eventName;

export default eventSlice.reducer;
