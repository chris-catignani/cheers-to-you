import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import beers from '../../data/beers2.json';
import beerRules from '../../data/beer_rules.json';
import { sample } from 'lodash-es';
import Fuse from 'fuse.js';
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';

const formattedBeers = ((beers) => {
    const breweryWordsToTrim = new RegExp(beerRules['brewery']['wordsToTrim'].join('|'), 'gi')
    const beerNameWordsToTrim = new RegExp(beerRules['beerName']['wordsToTrim'].join('|'), 'gi')
    const multispaceRegex = new RegExp(' {2,}', 'g')

    const formatBreweryName = (breweryName) => {
        return formatString(breweryName, breweryWordsToTrim)
    }

    const formatBeerName = (beerName) => {
        return formatString(beerName, beerNameWordsToTrim)

    }

    const formatString = (aString, wordRegex) => {
        // remove words
        const trimmedString = aString.replace(wordRegex, '').trim().replace(multispaceRegex, ' ')
        
        // make title case
        return trimmedString.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())
    }

    return Object.values(beers).map(beer => {
        console.log("formatted brewery: \"" + beer['brewer_name'] + "\" -> \"" + formatBreweryName(beer['brewer_name']) + "\"")
        console.log("formatted beer: \"" + beer['beer_name'] + "\" -> \"" + formatBeerName(beer['beer_name']) + "\"")
        return {
            'beer_name': formatBeerName(beer['beer_name']),
            'brewer_name': formatBreweryName(beer['brewer_name']),
            'beer_type': beer['beer_type'],
            'beer_label_file': beer['beer_label_file_small'],
        }
    })
})(beers)

const fuse = new Fuse(formattedBeers, {
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
    lockedBeerLetterIdxs: JSON.parse(sessionStorage.getItem('output.lockedBeerLetterIdxs') || '[]'),
    openedBeerIdx: -1,
    beerSearchResults: [],
    uploadedImageData: {},
    
    downloadGeneratedImageStatus: '',
    uploadGeneratedImageStatus: '',
};

export const uploadImage = createAsyncThunk(
    'output/uploadImage',
    async (dataUrlPromise) => {
        const dataUrl = await dataUrlPromise
        const image = await fetch(dataUrl)
        const imageArrayBuffer = await image.arrayBuffer()

        const uploadManager = new UploadManager({
            apiKey: "free", // Get API key: https://www.bytescale.com/get-started
        });
    
        const { fileUrl } = await uploadManager.upload({
            data: imageArrayBuffer,
            mime: 'image/jpeg',
            originalFileName: 'example.jpeg',
        });

        const urlSegments = fileUrl.split('/')
        return {
            appId: urlSegments[3],
            fileId: urlSegments[6].slice(0, -5)
        }
    }
)

export const downloadImage = createAsyncThunk(
    'output/downloadImage',
    async (dataUrlPromise) => {
        const dataUrl = await dataUrlPromise
        download(dataUrl, 'my-pic.jpg');
    }
)

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
    dispatch(setLockedBeerLetterIdx(new Array(beerLetters.length).fill(false)))
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
        setLockedBeerLetterIdx: (state, action) => {
            state.lockedBeerLetterIdxs = action.payload
        },
        toggleLockedBeerLetterIdx: (state, action) => {
            const tempLockedBeerLetterIdxs = [...state.lockedBeerLetterIdxs]
            tempLockedBeerLetterIdxs[action.payload] = !tempLockedBeerLetterIdxs[action.payload]
            state.lockedBeerLetterIdxs = tempLockedBeerLetterIdxs
            sessionStorage.setItem('output.lockBeerLetterIdx', JSON.stringify(state.lockedBeerLetterIdxs))
        },
        setOpenBeerIdx: (state, action) => {
            state.openedBeerIdx = action.payload
        },
        setBeerSearchResults: (state, action) => {
            state.beerSearchResults = action.payload;
        },
        setsUploadedImageData: (state, action) => {
            state.uploadedImageData = action.payload
        },
        setDownloadGeneratedImageStatus: (state, action) => {
            state.downloadGeneratedImageStatus = action.payload
        },
    },
    extraReducers: {
        [downloadImage.pending]: (state) => {
            state.downloadGeneratedImageStatus = 'downloading';
        },
        [downloadImage.fulfilled]: (state, action) => {
            state.downloadGeneratedImageStatus = ''
        },
        [downloadImage.rejected]: (state) => {
            state.downloadGeneratedImageStatus = ''
        },
        [uploadImage.pending]: (state) => {
            state.uploadGeneratedImageStatus = 'uploading';
            state.uploadedImageData = {}
        },
        [uploadImage.fulfilled]: (state, action) => {
            state.uploadGeneratedImageStatus = ''
            state.uploadedImageData = action.payload
        },
        [uploadImage.rejected]: (state) => {
            state.uploadGeneratedImageStatus = ''
            state.uploadedImageData = {}
        },
    }
});

export const { setEventName, setBeerLetterAtIndex, setBeerLetters, setLockedBeerLetterIdx, toggleLockedBeerLetterIdx, setOpenBeerIdx, setBeerSearchResults, setsUploadedImageData } = outputSlice.actions;

export const selectEventName = (state) => state.output.eventName;
export const selectBeerLetters = (state) => state.output.beerLetters;
export const selectLockedBeerLetterIdxs = (state) => state.output.lockedBeerLetterIdxs;
export const selectOpenBeerIdx = (state) => state.output.openedBeerIdx;
export const selectBeerSearchResults = (state) => state.output.beerSearchResults;
export const selectDownloadGeneratedImageStatus = (state) => state.output.downloadGeneratedImageStatus;
export const selectUploadGeneratedImageStatus = (state) => state.output.uploadGeneratedImageStatus;
export const selectUploadedImageData = (state) => state.output.uploadedImageData;

export default outputSlice.reducer;
