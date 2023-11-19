import { useDispatch, useSelector } from 'react-redux';
import { selectBeerDict, selectBeerLetters, selectDownloadGeneratedImageStatus, selectEventName, selectOpenBeerIdx, setBeerLetterAtIndex, setDownloadGeneratedImageStatus, setOpenBeerIdx } from './outputSlice';
import { Box, Button, ButtonGroup, Flex, Heading, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, createIcon, useDisclosure } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import download from 'downloadjs';
import { DownloadIcon } from '@chakra-ui/icons';
import Webcam from 'react-webcam';

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

    const onPictureTaken = (image) => {
        dispatch(setBeerLetterAtIndex({
            idx: openBeerIdx,
            userGeneratedBeer: {
                'name': 'UGC',
                'type': 'UGC',
                'url': image,
                'brewer_name': 'UGC',
                'beer_name': 'UGC',
            }
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
                    onPictureTaken={onPictureTaken}
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

export const BeerModalContent = ({displayCamera, userGeneratedBeer, availableBeers, onPictureTaken}) => {
    if(displayCamera) {
        return (
            <BeerCaptureWebcam 
                onPictureTaken={onPictureTaken}
            />
        )
    }

    return (
        <Flex justifyContent='center' gap='10'>
            {userGeneratedBeer}
            {availableBeers}
        </Flex>
    )
}

export const BeerCaptureWebcam = ({onPictureTaken}) => {
    const videoConstraints = {
        facingMode: { ideal: ["environment", "user"] },
    };

    return (
        <Webcam 
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={(mediaStreamError) => console.error(mediaStreamError.name)}
        >
        {({ getScreenshot }) => (
            <Button
                onClick={() => {
                    const imageSrc = getScreenshot()
                    onPictureTaken(imageSrc)
                }}
            >
                Capture photo
            </Button>
            )}
        </Webcam>
    )
}

export const Letter = ({letter, beer, onClick}) => {
    return (
        <Box textAlign='center' width='150px' onClick={onClick}>
            <Image src={beer['url']} alt={beer['name'] + beer['type']} boxSize='150px' fit='contain'/>
            <Box>{beer['brewer_name']}</Box>
            <Box>{beer['beer_name']}</Box>
            <Box textTransform='uppercase'>{letter}</Box>
        </Box>
    )
}

// https://www.svgrepo.com/svg/904/photo-camera
export const CameraIcon = createIcon({
    displayName: 'CameraIcon',
    viewBox: '0 0 487 487',
    d: 'M308.1,277.95c0,35.7-28.9,64.6-64.6,64.6s-64.6-28.9-64.6-64.6s28.9-64.6,64.6-64.6S308.1,242.25,308.1,277.95z     M440.3,116.05c25.8,0,46.7,20.9,46.7,46.7v122.4v103.8c0,27.5-22.3,49.8-49.8,49.8H49.8c-27.5,0-49.8-22.3-49.8-49.8v-103.9    v-122.3l0,0c0-25.8,20.9-46.7,46.7-46.7h93.4l4.4-18.6c6.7-28.8,32.4-49.2,62-49.2h74.1c29.6,0,55.3,20.4,62,49.2l4.3,18.6H440.3z     M97.4,183.45c0-12.9-10.5-23.4-23.4-23.4c-13,0-23.5,10.5-23.5,23.4s10.5,23.4,23.4,23.4C86.9,206.95,97.4,196.45,97.4,183.45z     M358.7,277.95c0-63.6-51.6-115.2-115.2-115.2s-115.2,51.6-115.2,115.2s51.6,115.2,115.2,115.2S358.7,341.55,358.7,277.95z',
  })

export const UserGeneratedBeer = ({onClick}) => {
    return (
        <Box width='150px' height='150px'>
            <IconButton 
                aria-label='Upload Your Own Beer'
                icon={<CameraIcon />}
                onClick={onClick}
            />
        </Box>
    )
}
