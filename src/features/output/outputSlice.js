import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import beers from '../../data/beers2.json';
import beerRules from '../../data/beer_rules.json';
import { sample, shuffle } from 'lodash-es';
import Fuse from 'fuse.js';
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';
import { isAtoZ } from '../../utils/utils';

const formattedBeers = ((beers) => {
    const breweryWordsToTrim = new RegExp(beerRules['brewery']['wordsToTrim'].join('|'), 'gi')
    const beerNameRegexes = [
        {
            regex: new RegExp(beerRules['beerName']['wordsToTrim'].join('|'), 'gi'),
            replacement: '',
        },
        ...beerRules.beerName.regexes.map(({regex, replacement}) => {
            return {
                regex: new RegExp(regex),
                replacement,
            }
        })
    ]
    const multispaceRegex = new RegExp(' {2,}', 'g')

    const formatBreweryName = (breweryName) => {
        const trimmedString = breweryName.replace(breweryWordsToTrim, '').trim().replace(multispaceRegex, ' ')
        return trimmedString.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) // title case
    }

    const formatBeerName = (beerName, breweryName) => {
        let formattedBeerName = beerName
        beerNameRegexes.forEach( ({regex, replacement}) => {
            formattedBeerName = formattedBeerName.replace(regex, replacement).trim().replace(multispaceRegex, ' ')
        })
        formattedBeerName = formattedBeerName.replace(new RegExp(`^${breweryName} `,'i'), '')
        return formattedBeerName.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) // title case
    }

    return Object.values(beers).map(beer => {
        const breweryName = formatBreweryName(beer['brewer_name'])
        const beerName = formatBeerName(beer['beer_name'], breweryName)
        console.log("formatted brewery: \"" + beer['brewer_name'] + "\" -> \"" + breweryName + "\"")
        console.log("formatted beer: \"" + beer['beer_name'] + "\" -> \"" + beerName + "\"")
        return {
            'beer_name': beerName,
            'brewer_name': breweryName,
            'beer_type': beer['beer_type'],
            'beer_label_file': beer['beer_label_file_big'],
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
    lockedBeerLetterIdxs: JSON.parse(sessionStorage.getItem('output.lockedBeerLetterIdxs') || '[]'),
    beerOptionsAtIdx: [],
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
    const state = getState()

    const beerLetters = []
    const beerOptionsAtIdx = []

    if (state.output.personsName !== personsName) {
        Array.from(personsName).forEach((letter, idx) => {
            if(!isAtoZ(letter)) {
                beerLetters.push({
                    letter, 
                    isSpecialCharacter: true,
                })
                beerOptionsAtIdx.push([])
            } else {
                const beerOptions = getDefaultBeersForLetter(letter)
                beerOptionsAtIdx.push(beerOptions)
                beerLetters.push({
                    letter: letter.toUpperCase(),
                    userGeneratedBeer: {},
                    beer: sample(beerOptions),
                })
            }
        })
        dispatch(setLockedBeerLetterIdxs(new Array(beerLetters.length).fill(false)))
    } else {
        Array.from(personsName).forEach( (letter, idx) => {
            if(!isAtoZ(letter)) {
                beerLetters.push({
                    letter, 
                    isSpecialCharacter: true,
                })
                beerOptionsAtIdx.push([])
            } else if (state.output.lockedBeerLetterIdxs[idx]) {
                beerLetters.push(state.output.beerLetters[idx])
                beerOptionsAtIdx.push(state.output.beerOptionsAtIdx[idx])
            } else {
                const beerOptions = getDefaultBeersForLetter(letter)
                beerOptionsAtIdx.push(beerOptions)
                beerLetters.push({
                    letter: letter.toUpperCase(),
                    userGeneratedBeer: {},
                    beer: sample(beerOptions),
                })
            }
        })
    }

    dispatch(setBeerLetters(beerLetters))
    dispatch(setBeerOptionsAtIdx(beerOptionsAtIdx))
    dispatch(setEventName(eventName));
    dispatch(setPersonsName(personsName));
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

    return shuffle(fuseSearch(fuseSearchQuery, {scoreThreshold: 0.5}))
}

const fuseSearch = (query, {limit = 10, scoreThreshold = 0.5} = {}) => {
    if (!query) {
        return []
    }

    const fuseResults = fuse.search(query, {limit})
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
        setLockedBeerLetterIdxs: (state, action) => {
            state.lockedBeerLetterIdxs = action.payload
            sessionStorage.setItem('output.lockedBeerLetterIdxs', JSON.stringify(action.payload))
        },
        toggleLockedBeerLetterIdx: (state, action) => {
            const tempLockedBeerLetterIdxs = [...state.lockedBeerLetterIdxs]
            tempLockedBeerLetterIdxs[action.payload] = !tempLockedBeerLetterIdxs[action.payload]
            state.lockedBeerLetterIdxs = tempLockedBeerLetterIdxs
            sessionStorage.setItem('output.lockedBeerLetterIdxs', JSON.stringify(state.lockedBeerLetterIdxs))
        },
        setBeerOptionsAtIdx: (state, action) => {
            state.beerOptionsAtIdx = action.payload
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

export const { setEventName, setPersonsName, setBeerLetterAtIndex, setBeerLetters, setLockedBeerLetterIdxs, toggleLockedBeerLetterIdx, setBeerOptionsAtIdx, setOpenBeerIdx, setBeerSearchResults, setsUploadedImageData } = outputSlice.actions;

export const selectEventName = (state) => state.output.eventName;
export const selectPersonsName = (state) => state.output.personsName;
export const selectBeerLetters = (state) => state.output.beerLetters;
export const selectLockedBeerLetterIdxs = (state) => state.output.lockedBeerLetterIdxs;
export const selectBeerOptionsAtIdx = (state) => state.output.beerOptionsAtIdx;
export const selectOpenBeerIdx = (state) => state.output.openedBeerIdx;
export const selectBeerSearchResults = (state) => state.output.beerSearchResults;
export const selectDownloadGeneratedImageStatus = (state) => state.output.downloadGeneratedImageStatus;
export const selectUploadGeneratedImageStatus = (state) => state.output.uploadGeneratedImageStatus;
export const selectUploadedImageData = (state) => state.output.uploadedImageData;

export default outputSlice.reducer;
