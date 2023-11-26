import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { CopyIcon, DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { BeerUGCInput } from './components/BeerUGCInput';
import { AddYourOwn } from './components/AddYourOwn';
import { Letter } from './components/Letter';
import { wrapIndex } from '../../utils/utils'
import { downloadImage, generateOutput, searchForBeer, selectBeerLetters, selectBeerOptionsAtIdx, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectEventName, selectLockedBeerLetterIdxs, selectOpenBeerIdx, selectPersonsName, selectUploadGeneratedImageStatus, selectUploadedImageData, setBeerLetterAtIndex, setBeerSearchResults, setOpenBeerIdx, setsUploadedImageData, toggleLockedBeerLetterIdx, uploadImage } from './outputSlice';
import { Box, Button, ButtonGroup, Container, Flex, Heading, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, TwitterShareButton, WhatsappIcon, WhatsappShareButton, XIcon } from 'react-share';
import { AnimatePresence, motion } from 'framer-motion';

const CYCLE_LENGTH = 8
const SLOT_MS = 250 // in ms


export const Output = () => {
    const dispatch = useDispatch();

    const eventName = useSelector(selectEventName);
    const personsName = useSelector(selectPersonsName);
    const beerLetters = useSelector(selectBeerLetters);
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);
    const beerOptionsAtIdx = useSelector(selectBeerOptionsAtIdx);
    const downloadGeneratedImageStatus = useSelector(selectDownloadGeneratedImageStatus);
    const uploadGeneratedImageStatus = useSelector(selectUploadGeneratedImageStatus)

    const [page, setPage] = useState(-1)

    const generatedPicRef = useRef(null)
    const letters = beerLetters.map( ({letter, beer, userGeneratedBeer}, idx) => {
        let beerToShow = beer || userGeneratedBeer
        if(page !== -1 && !lockedBeerIdxs[idx]) {
            const animateIdx = wrapIndex(0, beerOptionsAtIdx[idx].length, page)
            beerToShow = beerOptionsAtIdx[idx][animateIdx]
        }
        return (
            <Flex flexDirection='column' key={`beer-letter-${idx}`}>
                <AnimatePresence initial={false}>
                    <motion.div>
                        <Letter 
                            letter={letter}
                            beer={beerToShow}
                            onClick={() => dispatch(setOpenBeerIdx(idx)) } >
                        </Letter>
                    </motion.div>
                </AnimatePresence>
                <Button onClick={() => dispatch(toggleLockedBeerLetterIdx(idx))}>
                    {lockedBeerIdxs[idx] ? 'Unlock beer' : 'Lock beer'}
                </Button>
            </Flex>
        )
    })

    const donwloadOutput = async (ref) => {
        const node = ref.current;
        const dataUrlPromise = toJpeg(node, { backgroundColor: 'white', cacheBust: true, width: node.scrollWidth, height: node.scrollHeight })
        dispatch(downloadImage(dataUrlPromise))
    }

    const uploadOutput = async (ref) => {
        const node = ref.current;
        const dataUrlPromise = toJpeg(node, { backgroundColor: 'white', cacheBust: true, width: node.scrollWidth, height: node.scrollHeight })
        dispatch(uploadImage(dataUrlPromise))
    }

    return (
        <Box>
            <UserInput
                personsName={personsName}
                eventName={eventName}
                onClick={() => {
                    let curRunCount = 0
                    const intervalId = setInterval(() => {
                        curRunCount += 1
                        if(curRunCount >= CYCLE_LENGTH) {
                            clearInterval(intervalId)
                            setPage(-1)
                            return
                        }
                        setPage((page) => page + 1)
                    }, SLOT_MS);
                }}
            />
            {/* TODO content below only if output has been produced */}
            {/* Outer Flex enabling the header and content to handle overflow together without repositioning */}
            <Flex ref={generatedPicRef} overflowX='auto' flexDirection='column' flexWrap='wrap'>
                <Heading as='h3' size='lg' textAlign='center'>{eventName}</Heading>
                <Flex justifyContent='safe center' gap='10' p='5'>
                    {letters}
                </Flex>
            </Flex>
            <BeerModal />
            <ShareModal />
            <ButtonGroup float={'right'}>
                <IconButton
                    isLoading={uploadGeneratedImageStatus === 'uploading'}
                    onClick={() => uploadOutput(generatedPicRef)} 
                    icon={<ExternalLinkIcon />}/>
                <IconButton
                    isLoading={downloadGeneratedImageStatus === 'downloading'}
                    onClick={() => donwloadOutput(generatedPicRef)}
                    icon={<DownloadIcon />} />
            </ButtonGroup>
        </Box>
    )
}

export const UserInput = ({personsName, eventName, onClick}) => {
    const dispatch = useDispatch()
    const [tempPersonsName, setTempPersonsName] = useState(personsName)
    const [tempEventName, setTempEventName] = useState(eventName)

    return (
        <Container maxW='md'>
            <Input
                placeholder='Persons Name'
                value={tempPersonsName}
                onChange={e => setTempPersonsName(e.target.value)}
            />
            <Input
                placeholder='Event Name'
                value={tempEventName}
                onChange={e => setTempEventName(e.target.value)}
            />
            <Button
                width='full'
                onClick={() => {
                    dispatch(generateOutput(tempPersonsName, tempEventName))
                    onClick()
                }}>
                Generate
            </Button>
        </Container>
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
            <ModalHeader margin='auto'>Share your design</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Flex gap='2'>
                    <FacebookShareButton url={shareUrl}>
                        <FacebookIcon size={40} round />
                    </FacebookShareButton>
                    <TwitterShareButton
                        url={shareUrl}
                        title={eventName}
                    >
                        <XIcon size={40} round />
                    </TwitterShareButton>
                    <WhatsappShareButton
                        url={shareUrl}
                        title={eventName}
                        separator=":: "
                    >
                        <WhatsappIcon size={40} round />
                    </WhatsappShareButton>
                    <EmailShareButton
                        url={shareUrl}
                        subject={eventName}
                        body="body"
                    >
                        <EmailIcon size={40} round />
                    </EmailShareButton>
                    <IconButton
                        isRound={true}
                        onClick={() => navigator.clipboard.writeText(shareUrl)} 
                        icon={<CopyIcon />}/>
                </Flex>
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

export const BeerModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const beerLetters = useSelector(selectBeerLetters);
    const openBeerIdx = useSelector(selectOpenBeerIdx);

    const clearDataOnClose = () => {
        dispatch(setOpenBeerIdx(-1));
        dispatch(setBeerSearchResults([]))
        onClose()
    }

    // Open the Modal if we have an openBeerIndex
    useEffect(() => {
        if (openBeerIdx !== -1) {
            onOpen()
        }
    }, [openBeerIdx, onOpen])

    const letter = openBeerIdx !== -1 ? beerLetters[openBeerIdx]['letter'] : ''

    return (
        <Modal isOpen={isOpen} onClose={clearDataOnClose} size='xl'>
            <ModalOverlay />
            <ModalContent margin='auto'>
                <ModalHeader margin='auto'>Pick Your Beer For "{letter.toUpperCase()}"</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <BeerModalContent
                        openBeerIdx={openBeerIdx}
                        onClose={clearDataOnClose}
                    />
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
