import { Box, Image } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

export const SocialMedia = () => {

    const { appId, fileId } = useParams()

    // const imageUrl =

    return (
        <Box>
            <Image src={`https://upcdn.io/${appId}/raw/demo/${fileId}.jpeg`}/>
        </Box>
    )
}
