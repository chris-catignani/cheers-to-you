import { createSlice } from '@reduxjs/toolkit';
import beers from './data/beers.json';
import { sample } from 'lodash-es';
import Fuse from 'fuse.js';

const fuse = new Fuse(beers, {
    keys: [
        'beer_name',
        'brewer_name',
    ],
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
});

const initialState = {
    eventName: sessionStorage.getItem('output.eventName') || '',
    beerLetters: JSON.parse(sessionStorage.getItem('output.beerLetters') || '[]'),
    openedBeerIdx: -1,
    beerSearchResults: [],
    
    downloadGeneratedImageStatus: '',
};

export const outputSlice = createSlice({
    name: 'output',
    initialState,
    reducers: {
        setEventName: (state, action) => {
            state.eventName = action.payload
            sessionStorage.setItem('output.eventName', action.payload)
        },
        setBeerLetterAtIndex: (state, action) => {
            state.beerLetters[action.payload.idx] = {
                ...state.beerLetters[action.payload.idx],
                beer: action.payload.beer,
                userGeneratedBeer: action.payload.userGeneratedBeer,
            }
            sessionStorage.setItem('output.beerLetters', JSON.stringify(state.beerLetters))
        },
        setBeerLetters: (state, action) => {
            state.beerLetters = action.payload
            sessionStorage.setItem('output.beerLetters', JSON.stringify(action.payload))
        },
        setOpenBeerIdx: (state, action) => {
            state.openedBeerIdx = action.payload
        },
        setBeerSearchResults: (state, action) => {
            state.beerSearchResults = action.payload;
        },
        setDownloadGeneratedImageStatus: (state, action) => {
            state.downloadGeneratedImageStatus = action.payload
        },
    }
});

export const { setEventName, setBeerLetterAtIndex, setBeerLetters, setOpenBeerIdx, setBeerSearchResults, setDownloadGeneratedImageStatus } = outputSlice.actions;

export const selectEventName = (state) => state.output.eventName;
export const selectBeerLetters = (state) => state.output.beerLetters;
export const selectOpenBeerIdx = (state) => state.output.openedBeerIdx;
export const selectBeerSearchResults = (state) => state.output.beerSearchResults;
export const selectDownloadGeneratedImageStatus = (state) => state.output.downloadGeneratedImageStatus;

export const generateOutput = (personsName, eventName) => (dispatch, getState) => {
    dispatch(setEventName(eventName));

    const beerLetters = [];
    for (var i = 0; i < personsName.length; i++) {
        const letter = personsName.charAt(i).toLowerCase();
        
        beerLetters.push({
            letter: letter,
            userGeneratedBeer: {},
            beer: sample(getDefaultBeersForLetter(letter)),
        })
    }

    dispatch(setBeerLetters(beerLetters))
};

export const searchForBeer = (beerSearchQuery) => (dispatch, getState) => {
    const beerSearchResults = fuseSearch(beerSearchQuery)
    dispatch(setBeerSearchResults(beerSearchResults, {scoreThreshold: 0.40}))
}

const getDefaultBeersForLetter = (letter) => {
    const fuseSearchQuery = {
        $or: [
            { beer_name: `^${letter}` },
            { beer_name: `" ${letter}"` },
            { brewer_name: `^${letter}` },
            { brewer_name: `" ${letter}"` },
        ]
    }

    return fuseSearch(fuseSearchQuery, {scoreThreshold: 0.5})
}

const fuseSearch = (query, {limit = 10, scoreThreshold = 0.5} = {}) => {
    if (!query) {
        return []
    }

    const fuseResults = fuse.search(query, {limit})
    // console.log(fuseResults)
    return fuseResults.reduce((results, result) => {
        if (result['score'] < scoreThreshold) {
            results.push(result['item'])
        }
        return results
    }, [])
}

export default outputSlice.reducer;
