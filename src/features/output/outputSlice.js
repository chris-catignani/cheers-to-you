import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import beers from '../../data/beers2.json';
import beerRules from '../../data/beer_rules.json';
import { sample } from 'lodash-es';
import Fuse from 'fuse.js';
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';

const formattedBeers = ((beers) => {
    const breweryWordsToTrim = new RegExp(beerRules['brewery']['wordsToTrim'].join('|'), 'gi')
    const multispaceRegex = new RegExp(' {2,}', 'g')

    const formatBreweryName = (breweryName) => {
        return breweryName.replace(breweryWordsToTrim, '').trim().replace(multispaceRegex, ' ')
    }

    return Object.values(beers).map(beer => {
        console.log("\"" + beer['brewer_name'] + "\" -> \"" + formatBreweryName(beer['brewer_name']) + "\"")
        return {
            'beer_name': beer['beer_name'],
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
    personsName: sessionStorage.getItem('output.personsName') || '',
    beerLetters: JSON.parse(sessionStorage.getItem('output.beerLetters') || '[]'),
    openedBeerIdx: -1,
    beerSearchResults: [],
    uploadedSocialMediaData: {},
    
    downloadGeneratedImageStatus: '',
    uploadSocialMediaStatus: '',
};

export const uploadSocialMedia = createAsyncThunk(
    'output/uploadSocialMedia',
    async ({dataUrlPromise, personsName, eventName}) => {
        const dataUrl = await dataUrlPromise

        const uploadManager = new UploadManager({
            apiKey: "free", // Get API key: https://www.bytescale.com/get-started
        });
    
        const { fileUrl } = await uploadManager.upload({
            data: JSON.stringify({
                dataUrl,
                personsName,
                eventName,
            }),
            originalFileName: 'example.json',
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
    dispatch(setPersonsName(personsName));

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

export const outputSlice = createSlice({
    name: 'output',
    initialState,
    reducers: {
        setEventName: (state, action) => {
            state.eventName = action.payload
            sessionStorage.setItem('output.eventName', action.payload)
        },
        setPersonsName: (state, action) => {
            state.personsName = action.payload
            sessionStorage.setItem('output.personsName', action.payload)
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
        setUploadedSocialMediaData: (state, action) => {
            state.uploadedSocialMediaData = action.payload
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
        [uploadSocialMedia.pending]: (state) => {
            state.uploadSocialMediaStatus = 'uploading';
            state.uploadedSocialMediaData = {}
        },
        [uploadSocialMedia.fulfilled]: (state, action) => {
            state.uploadSocialMediaStatus = ''
            state.uploadedSocialMediaData = action.payload
        },
        [uploadSocialMedia.rejected]: (state) => {
            state.uploadSocialMediaStatus = ''
            state.uploadedSocialMediaData = {}
        },
    }
});

export const { setEventName, setPersonsName, setBeerLetterAtIndex, setBeerLetters, setOpenBeerIdx, setBeerSearchResults, setUploadedSocialMediaData } = outputSlice.actions;

export const selectEventName = (state) => state.output.eventName;
export const selectPersonsName = (state) => state.output.personsName;
export const selectBeerLetters = (state) => state.output.beerLetters;
export const selectOpenBeerIdx = (state) => state.output.openedBeerIdx;
export const selectBeerSearchResults = (state) => state.output.beerSearchResults;
export const selectDownloadGeneratedImageStatus = (state) => state.output.downloadGeneratedImageStatus;
export const selectUploadSocialMediaStatus = (state) => state.output.uploadSocialMediaStatus;
export const selectUploadedSocialMediaData = (state) => state.output.uploadedSocialMediaData;

export default outputSlice.reducer;
