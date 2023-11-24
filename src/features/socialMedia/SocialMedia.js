import { Box, Image } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

export const SocialMedia = () => {

    const { sharedId } = useParams()

    return (
        <Box>
            <Image src={sharedId}/>
        </Box>
    )
}
