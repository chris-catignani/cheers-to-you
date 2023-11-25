import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { FileApi } from '@bytescale/sdk';

const initialState = {
    downloadStatus: '',
    data: {},
};

export const downloadSocialMediaInfo = createAsyncThunk(
    'socialMedia/downloadInfo',
    async ({appId, fileId}) => {
        
        const fileApi = new FileApi({
            apiKey: "free"
        });
        
        const responseJson = await fileApi
            .downloadFile({
                accountId: appId,
                filePath: `/demo/${fileId}.json`
            })
            .then(response => response.json())
        
        return responseJson
    }
)

export const socialMediaSlice = createSlice({
    name: 'socialMedia',
    initialState,
    reducers: {},
    extraReducers: {
        [downloadSocialMediaInfo.pending]: (state) => {
            state.downloadStatus = 'downloading';
            state.data = {}
        },
        [downloadSocialMediaInfo.fulfilled]: (state, action) => {
            state.downloadStatus = ''
            state.data = action.payload
        },
        [downloadSocialMediaInfo.rejected]: (state) => {
            state.downloadStatus = ''
            state.data = {}
        },
    }
});

export const selectPersonsName = (state) => state.socialMedia.data.personsName;
export const selectEventName = (state) => state.socialMedia.data.eventName;
export const selectImageUrl = (state) => state.socialMedia.data.dataUrl;

export default socialMediaSlice.reducer;
