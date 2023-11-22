import { Box, Center, IconButton, Image, Spinner } from '@chakra-ui/react';
import { CameraIcon } from '../assets/cameraIcon';
import Webcam from 'react-webcam';
import React from 'react';

export const Camera = ({onPictureTaken, currentPicture}) => {
    const [cameraLoading, setCameraLoading] = React.useState(true);

    const webcamRef = React.useRef(null);
    const capture = React.useCallback(
        () => {onPictureTaken(webcamRef.current.getScreenshot())},
        [webcamRef, onPictureTaken]
    );

    if(currentPicture) {
        return (
            <Image src={currentPicture} alt={'User Taken Picture'} fit='contain'/>
        )
    }

    const videoConstraints = {
        facingMode: { ideal: "environment" },
    };

    const CameraLoadingElement = ({cameraLoading}) => {
        if (!cameraLoading) {
            return <></>
        }
        return (
            <Center flexDirection='column'>
                <Spinner/>
                <Box>Initializing Camera</Box>
            </Center>
        )
    }

    return (
        <Box position='relative'>
            <CameraLoadingElement cameraLoading={cameraLoading} />
            <Webcam 
                audio={false}
                screenshotFormat="image/jpeg"
                height='1280'
                width='1280'
                ref={webcamRef}
                videoConstraints={videoConstraints}
                onUserMedia={() => setCameraLoading(false)}
                onUserMediaError={(mediaStreamError) => {
                    setCameraLoading(false);
                    console.error(mediaStreamError)}
                }
            />
            <IconButton
                isRound={true}
                icon={<CameraIcon />}
                aria-label='Take Picture'
                onClick={capture}
                hidden={cameraLoading}
                position='absolute'
                left='50%'
                bottom='10px'
                transform='translate(-50%, 0%)'
            />
        </Box>
    )
}
