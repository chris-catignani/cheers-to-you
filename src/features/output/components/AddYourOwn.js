import { AddIcon } from "@chakra-ui/icons"
import { Box, Center, Text } from "@chakra-ui/react"

export const AddYourOwn = ({onClick}) => {
    return (
        <Box as='button' width='100px' height='100px' onClick={onClick}>
            <Center flexDirection='column' width='100px' height='100px'>
                <AddIcon />
                <Text>
                    Add your own
                </Text>
            </Center>
        </Box>
    )
}
