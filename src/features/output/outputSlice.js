import { createSlice } from '@reduxjs/toolkit';
import { beers } from './beers.js'
import { sample } from 'lodash-es';

const initialState = {
    eventName: '',
    personsName: '',
    beerDict: {},
    beerLetters: [],
};

export const outputSlice = createSlice({
    name: 'output',
    initialState,
    reducers: {
        setPersonsName: (state, action) => {
            state.personsName = action.payload
        },
        setEventName: (state, action) => {
            state.eventName = action.payload
        },
        setBeerDict: (state, action) => {
            state.beerDict = action.payload
        },
        setBeerLetters: (state, action) => {
            state.beerLetters = action.payload
        },
    }
});

export const { setPersonsName, setEventName, setBeerDict, setBeerLetters } = outputSlice.actions;

export const selectPersonsName = (state) => state.output.personsName;
export const selectEventName = (state) => state.output.eventName;
export const selectBeerLetters = (state) => state.output.beerLetters

export const generateOutput = (personsName, eventName) => (dispatch, getState) => {
    dispatch(setPersonsName(personsName));
    dispatch(setEventName(eventName));

    // TODO this can be done once on intial page load
    const beerDict = {}
    beers.forEach(beer => {
        beer['beer_name_match_initial'].toLowerCase().split(',').forEach(letter => {
            if (!(letter in beerDict)) {
                beerDict[letter] = []
            }

            beerDict[letter].push({
                'name': beer['beer_name'],
                'type': beer['beer_type'],
                'url': beer['beer_label_file'],
                'brewer_name': beer['brewer_name'],
                'beer_name': beer['beer_name']
            })
        })
    })

    dispatch(setBeerDict(beerDict))

    const beerLetters = [];
    for (var i = 0; i < personsName.length; i++) {
        const letter = personsName.charAt(i).toLowerCase();
        beerLetters.push({
            letter: letter,
            beer: sample(beerDict[letter]),
        })
    }

    dispatch(setBeerLetters(beerLetters))

};

export default outputSlice.reducer;
