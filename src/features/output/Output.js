import { useDispatch, useSelector } from 'react-redux';
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { toJpeg } from 'html-to-image';
import download from 'downloadjs';
import { AddIcon, DownloadIcon } from '@chakra-ui/icons';
import { CameraIcon } from './assets/cameraIcon';
import { selectBeerDict, selectBeerLetters, selectDownloadGeneratedImageStatus, selectEventName, selectOpenBeerIdx, setBeerLetterAtIndex, setDownloadGeneratedImageStatus, setOpenBeerIdx } from './outputSlice';
import { Box, Button, ButtonGroup, Center, Flex, Heading, IconButton, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text, useDisclosure } from '@chakra-ui/react';


export const Output = () => {
    const dispatch = useDispatch();

    const [isCameraDisplayed, setIsCameraDisplayed] = useState(false);

    const eventName = useSelector(selectEventName);
    const beerLetters = useSelector(selectBeerLetters);
    const downloadGeneratedImageStatus = useSelector(selectDownloadGeneratedImageStatus);

    const generatedPicRef = useRef(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const letters = beerLetters.map( ({letter, beer, userGeneratedBeer}, idx) => {
        return (
            <Letter 
                letter={letter}
                beer={beer || userGeneratedBeer}
                onClick={() => { dispatch(setOpenBeerIdx(idx)); onOpen(); }}
                key={`beer-letter-${idx}`}>
            </Letter>
        )
    })

    const donwloadOutput = async (ref) => {
        dispatch(setDownloadGeneratedImageStatus('saving'))
        const dataUrl = await toJpeg(ref.current, { backgroundColor: 'white', cacheBust: true })
        download(dataUrl, 'my-pic.jpg');
        dispatch(setDownloadGeneratedImageStatus('success'))
    }

    if (!letters || letters.length === 0) {
        return <></>
    }

    return (
        <Box m='10'>
            <Box ref={generatedPicRef}>
                <Heading as='h3' size='lg' textAlign='center'>{eventName}</Heading>
                <Flex justifyContent='center' gap='10' p='5'>
                    {letters}
                </Flex>
            </Box>
            <BeerModal
                isOpen={isOpen}
                isCameraDisplayed={isCameraDisplayed}
                setIsCameraDisplayed={setIsCameraDisplayed}
                onClose={() => {
                    setIsCameraDisplayed(false);
                    dispatch(setOpenBeerIdx(-1));
                    onClose()
                }
            }/>
            <ButtonGroup float={'right'}>
                <IconButton
                    isLoading={downloadGeneratedImageStatus === 'saving'}
                    onClick={() => donwloadOutput(generatedPicRef)}
                    icon={<DownloadIcon />} />
            </ButtonGroup>
        </Box>
    )
}

export const BeerModal = ({isOpen, onClose, isCameraDisplayed, setIsCameraDisplayed}) => {
    const dispatch = useDispatch();

    const beerLetters = useSelector(selectBeerLetters);
    const beerDict = useSelector(selectBeerDict)
    const openBeerIdx = useSelector(selectOpenBeerIdx);
    if (openBeerIdx === -1) {
        return <></>
    }

    const {letter} = beerLetters[openBeerIdx]

    const availableBeers = beerDict[letter].map( (beer, idx) => {
        return (
            <Letter 
                beer={beer}
                onClick={() => {
                    dispatch(setBeerLetterAtIndex({idx: openBeerIdx, beer}));
                    onClose();
                }}
                key={`beer-picker-${idx}}`}>
            </Letter>
        )
    })

    const userGeneratedBeer = (
        <UserGeneratedBeer 
            onClick={() => setIsCameraDisplayed(true)}
        />
    )

    const onUserGeneratedBeerCreation = (userGeneratedBeer) => {
        dispatch(setBeerLetterAtIndex({
            idx: openBeerIdx,
            userGeneratedBeer,
        }));
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Pick Your Beer For "{letter.toUpperCase()}"</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <BeerModalContent
                    displayCamera={isCameraDisplayed}
                    onUserGeneratedBeerCreation={onUserGeneratedBeerCreation}
                    userGeneratedBeer={userGeneratedBeer}
                    availableBeers={availableBeers}
                />
            </ModalBody>
  
            <ModalFooter>
              <Button onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    )
}

export const BeerModalContent = ({displayCamera, userGeneratedBeer, availableBeers, onUserGeneratedBeerCreation}) => {
    const [ugcBeerPic, setUgcBeerPic] = useState('');
    const [beerName, setBeerName] = useState('');
    const [beerType, setBeerType] = useState('');
    const [brewery, setBrewery] = useState('');

    if(displayCamera) {
        return (
            <>
                <BeerCaptureWebcam 
                    onPictureTaken={(image) => setUgcBeerPic(image)}
                    currentPicture={ugcBeerPic}
                />
                <Input
                    placeholder='Beer Name'
                    value={beerName}
                    onChange={e => setBeerName(e.target.value)}
                />
                <Input
                    placeholder='Beer Type'
                    value={beerType}
                    onChange={e => setBeerType(e.target.value)}
                />
                <Input
                    placeholder='Brewery'
                    value={brewery}
                    onChange={e => setBrewery(e.target.value)}
                />
                <Button onClick={() => onUserGeneratedBeerCreation({
                    'url': ugcBeerPic,
                    'beer_name': beerName,
                    'beer_type': beerType,
                    'brewer_name': brewery,
                })}>
                    Save
                </Button>
            </>
        )
    }

    return (
        <Flex justifyContent='center' gap='10'>
            {userGeneratedBeer}
            {availableBeers}
        </Flex>
    )
}

export const BeerCaptureWebcam = ({onPictureTaken, currentPicture}) => {
    const [cameraLoading, setCameraLoading] = useState(true);

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
        height: 1280,
        width: 1280,
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

export const Letter = ({letter, beer, onClick}) => {
    return (
        <Box textAlign='center' width='150px' onClick={onClick}>
            <Image src={beer['url']} alt={beer['beer_name'] + beer['beer_type']} boxSize='150px' fit='contain'/>
            <Box>{beer['brewer_name']}</Box>
            <Box>{beer['beer_name']}</Box>
            <Box textTransform='uppercase'>{letter}</Box>
        </Box>
    )
}

export const UserGeneratedBeer = ({onClick}) => {
    return (
        <Box as='button' width='150px' height='150px' onClick={onClick}>
            <Center flexDirection='column' width='150px' height='150px'>
                <AddIcon />
                <Text>
                    Add your own
                </Text>
            </Center>
        </Box>
    )
}
