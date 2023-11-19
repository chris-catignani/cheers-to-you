import { useDispatch, useSelector } from 'react-redux';
import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { toJpeg } from 'html-to-image';
import download from 'downloadjs';
import { DownloadIcon } from '@chakra-ui/icons';
import { CameraIcon } from './assets/cameraIcon';
import { selectBeerDict, selectBeerLetters, selectDownloadGeneratedImageStatus, selectEventName, selectOpenBeerIdx, setBeerLetterAtIndex, setDownloadGeneratedImageStatus, setOpenBeerIdx } from './outputSlice';
import { Box, Button, ButtonGroup, Flex, Heading, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';


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
        facingMode: { ideal: "environment" },
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
