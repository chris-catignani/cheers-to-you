import { Box, Image } from "@chakra-ui/react"

export const Letter = ({letter, beer, onClick, width='150px'}) => {
    return (
        <Box textAlign='center' width={width} minWidth={width} onClick={onClick}>
            <Image src={beer['url']} alt={beer['beer_name'] + beer['beer_type']} boxSize={width} fit='contain'/>
            <Box>{beer['brewer_name']}</Box>
            <Box>{beer['beer_name']}</Box>
            <Box textTransform='uppercase'>{letter}</Box>
        </Box>
    )
}
