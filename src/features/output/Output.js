import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import download from 'downloadjs';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { BeerUGCInput } from './components/BeerUGCInput';
import { AddYourOwn } from './components/AddYourOwn';
import { Letter } from './components/Letter';
import { searchForBeer, selectBeerLetters, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectEventName, selectOpenBeerIdx, selectUploadGeneratedImageStatus, selectUploadedImageData, setBeerLetterAtIndex, setBeerSearchResults, setDownloadGeneratedImageStatus, setOpenBeerIdx, setsUploadedImageData, uploadImage } from './outputSlice';
import { Box, Button, ButtonGroup, Flex, Heading, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import { FacebookIcon, FacebookShareButton, TwitterShareButton, XIcon } from 'react-share';


export const Output = () => {
    const dispatch = useDispatch();

    const eventName = useSelector(selectEventName);
    const beerLetters = useSelector(selectBeerLetters);
    const downloadGeneratedImageStatus = useSelector(selectDownloadGeneratedImageStatus);
    const uploadGeneratedImageStatus = useSelector(selectUploadGeneratedImageStatus)

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
        const node = ref.current;
        const dataUrl = await toJpeg(node, { backgroundColor: 'white', cacheBust: true, width: node.scrollWidth, height: node.scrollHeight })
        download(dataUrl, 'my-pic.jpg');
        dispatch(setDownloadGeneratedImageStatus('success'))
    }

    // TODO move to action/reducer
    const uploadOutput = async (ref) => {
        const node = ref.current;
        const dataUrl = await toJpeg(node, { backgroundColor: 'white', cacheBust: true, width: node.scrollWidth, height: node.scrollHeight })
        dispatch(uploadImage(dataUrl))
    }

    if (!letters || letters.length === 0) {
        return <></>
    }

    return (
        <Box m='10'>
            {/* Outer Flex enabling the header and content to handle overflow together without repositioning */}
            <Flex ref={generatedPicRef} overflowX='auto' flexDirection='column' flexWrap='wrap'>
                <Heading as='h3' size='lg' textAlign='center'>{eventName}</Heading>
                <Flex justifyContent='safe center' gap='10' p='5'>
                    {letters}
                </Flex>
            </Flex>
            <BeerModal
                isOpen={isOpen}
                onClose={() => {
                    dispatch(setOpenBeerIdx(-1));
                    dispatch(setBeerSearchResults([]))
                    onClose()
                }
            }/>
            <ShareModal />
            <ButtonGroup float={'right'}>
                <IconButton
                    isLoading={uploadGeneratedImageStatus === 'uploading'}
                    onClick={() => uploadOutput(generatedPicRef)} 
                    icon={<ExternalLinkIcon />}/>
                <IconButton
                    isLoading={downloadGeneratedImageStatus === 'saving'}
                    onClick={() => donwloadOutput(generatedPicRef)}
                    icon={<DownloadIcon />} />
            </ButtonGroup>
        </Box>
    )
}

export const ShareModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const eventName = useSelector(selectEventName);
    const uploadedImageData = useSelector(selectUploadedImageData)
    const shareUrl = 'https://chris-catignani.github.io/cheers-to-you/#/shared/' + uploadedImageData['appId'] + '/' + uploadedImageData['fileId']

    // Open the Modal if we have uploaded the image data
    useEffect(() => {
        if (Object.keys(uploadedImageData).length === 0) {return}
        onOpen()
    }, [uploadedImageData, onOpen])

    const clearDataOnClose = () => {
        dispatch(setsUploadedImageData({}))
        onClose()
    }
    
    return (
        <Modal isOpen={isOpen} onClose={clearDataOnClose} size='xl'>
            <ModalOverlay />
            <ModalContent margin='auto'>
            <ModalHeader margin='auto'></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <FacebookShareButton url={shareUrl}>
                    <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton
                    url={shareUrl}
                    title={eventName}
                >
                    <XIcon size={32} round />
                </TwitterShareButton>
            </ModalBody>
            <ModalFooter>
                <Button onClick={clearDataOnClose}>
                    Cancel
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export const BeerModal = ({isOpen, onClose}) => {
    const beerLetters = useSelector(selectBeerLetters);
    const openBeerIdx = useSelector(selectOpenBeerIdx);
    if (openBeerIdx === -1) {
        return <></>
    }

    const {letter} = beerLetters[openBeerIdx]

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent margin='auto'>
                <ModalHeader margin='auto'>Pick Your Beer For "{letter.toUpperCase()}"</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <BeerModalContent
                        openBeerIdx={openBeerIdx}
                        onClose={onClose}
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

export const BeerModalContent = ({openBeerIdx, onClose}) => {
    const dispatch = useDispatch();
    const [isInBeerUGCMode, setIsInBeerUGCMode] = useState(false);

    if (isInBeerUGCMode) {
        return (
            <BeerUGCInput onClick={(userGeneratedBeer) => {
                dispatch(setBeerLetterAtIndex({
                    idx: openBeerIdx,
                    userGeneratedBeer,
                }));
                onClose();
            }} />
        )
    }

    return (
        <Flex justifyContent='safe center' flexWrap='wrap' gap='10'>
            <BeerSearch openBeerIdx={openBeerIdx} onClose={onClose}/>
            <AddYourOwn 
                onClick={() => setIsInBeerUGCMode(true)}
            />
        </Flex>
    )
}

export const BeerSearch = ({openBeerIdx, onClose}) => {
    const dispatch = useDispatch();
    const beerSearchResults = useSelector(selectBeerSearchResults);

    const [beerSearchQuery, setBeerSearchQuery] = useState('');

    const beerSearchResultsAsLetters = beerSearchResults.map( (beer, idx) => {
        return (
            <Letter 
                beer={beer}
                width='100px'
                onClick={() => {
                    dispatch(setBeerLetterAtIndex({idx: openBeerIdx, beer}));
                    onClose();
                }}
                key={`beer-picker-${idx}}`}>
            </Letter>
        )
    })

    return (
        <>
            <Input
                placeholder='Search for beer'
                value={beerSearchQuery}
                onChange={e => {
                    setBeerSearchQuery(e.target.value);
                    dispatch(searchForBeer(e.target.value));
                }}
            />
            {beerSearchResultsAsLetters}
        </>
    )
}
