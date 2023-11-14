import { useDispatch, useSelector } from 'react-redux';
import { selectBeerDict, selectBeerLetters, selectEventName, selectOpenBeerIdx, setBeerLetterAtIndex, setOpenBeerIdx } from './outputSlice';
import { Box, Button, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';

export const Output = () => {
    const dispatch = useDispatch();

    const eventName = useSelector(selectEventName);
    const beerLetters = useSelector(selectBeerLetters);

    const { isOpen, onOpen, onClose } = useDisclosure()

    const letters = beerLetters.map( ({letter, beer}, idx) => {
        return (
            <Letter 
                letter={letter}
                beer={beer}
                onClick={() => { dispatch(setOpenBeerIdx(idx)); onOpen(); }}
                key={`beer-letter-${idx}`}>
            </Letter>
        )
    })

    return (
        <Box m='10'>
            <Box textAlign='center'>{eventName}</Box>
            <BeerModal isOpen={isOpen} onClose={() => { dispatch(setOpenBeerIdx(-1)); onClose() }}/>
            <Flex justifyContent='center' gap='10' mt='5'>
                {letters}
            </Flex>
        </Box>
    )
}

export const BeerModal = ({isOpen, onClose}) => {
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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Pick Your Beer For "{letter.toUpperCase()}"</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Flex justifyContent='center' gap='10'>
                    {availableBeers}
                </Flex>
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

export const Letter = ({letter, beer, onClick}) => {
    return (
        <Box textAlign='center' onClick={onClick}>
            <Image src={beer['url']} alt={beer['name'] + beer['type']} boxSize='150px' fit='contain'/>
            <Box>{beer['brewer_name']}</Box>
            <Box>{beer['beer_name']}</Box>
            <Box textTransform='uppercase'>{letter}</Box>
        </Box>
    )
}
