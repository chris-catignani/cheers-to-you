import { useSelector } from 'react-redux';
import { selectBeerLetters, selectEventName } from './outputSlice';
import { Box, Flex, Image } from '@chakra-ui/react';

export const Output = () => {

    const eventName = useSelector(selectEventName);
    const beerLetters = useSelector(selectBeerLetters)

    const letters = []
    for (var i = 0; i < beerLetters.length; i++) {
        letters.push(
            <Letter 
                letter={beerLetters[i]['letter']}
                beer={beerLetters[i]['beer']}
                key={i}>
            </Letter>
        )
    }

    return (
        <Box m='10'>
            <Box textAlign='center'>{eventName}</Box>
            <Flex justifyContent='center' gap='10' mt='5'>
                {letters}
            </Flex>
        </Box>
    )
}

export const Letter = ({letter, beer}) => {
    return (
        <Box textAlign='center' boxSize='150px'>
            <Image src={beer['url']} alt={beer['name'] + beer['type']} boxSize='150px' fit='contain'/>
            <Box>{beer['brewer_name']}</Box>
            <Box>{beer['beer_name']}</Box>
            <Box textTransform='uppercase'>{letter}</Box>
        </Box>
    )
}
