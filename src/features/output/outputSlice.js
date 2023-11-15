import { createSlice } from '@reduxjs/toolkit';
import beers from './data/beers.json';
import { sample } from 'lodash-es';

const initialState = {
    eventName: '',
    beerDict: {},
    beerLetters: [],
    openedBeerIdx: -1,
    
    downloadGeneratedImageStatus: '',
};

export const outputSlice = createSlice({
    name: 'output',
    initialState,
    reducers: {
        setEventName: (state, action) => {
            state.eventName = action.payload
        },
        setBeerDict: (state, action) => {
            state.beerDict = action.payload
        },
        setBeerLetterAtIndex: (state, action) => {
            state.beerLetters[action.payload.idx].beer = action.payload.beer
        },
        setBeerLetters: (state, action) => {
            state.beerLetters = action.payload
        },
        setOpenBeerIdx: (state, action) => {
            state.openedBeerIdx = action.payload
        },
        setDownloadGeneratedImageStatus: (state, action) => {
            state.downloadGeneratedImageStatus = action.payload
        },
    }
});

export const { setEventName, setBeerDict, setBeerLetterAtIndex, setBeerLetters, setOpenBeerIdx, setDownloadGeneratedImageStatus } = outputSlice.actions;

export const selectEventName = (state) => state.output.eventName;
export const selectBeerLetters = (state) => state.output.beerLetters;
export const selectBeerDict = (state) => state.output.beerDict;
export const selectOpenBeerIdx = (state) => state.output.openedBeerIdx;
export const selectDownloadGeneratedImageStatus = (state) => state.output.downloadGeneratedImageStatus;

export const generateBeerDict = () => (dispatch, getState) => {
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
}

export const generateOutput = (personsName, eventName) => (dispatch, getState) => {
    dispatch(setEventName(eventName));

    const { beerDict } = getState().output;
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
