import { Box, Image } from "@chakra-ui/react"
import { Helmet } from "react-helmet"
import { useParams } from "react-router-dom"

export const SocialMedia = () => {
    const { appId, fileId } = useParams()

    const imageUrl = `https://upcdn.io/${appId}/raw/demo/${fileId}.jpeg`

    return (
        <>
            <SocialMediaHeader 
                title={`Cheers2You!`}
                description={`Celebrate with Cheers2You!`}
                imageUrl={imageUrl}
            />
            <Box>
                <Image src={imageUrl}/>
            </Box>
        </>
    )
}

export const SocialMediaHeader = ({title, description, imageUrl}) => {
    return (
        <Helmet>
            { /* Standard metadata tags */ }
            <title>{title}</title>
            <meta name='description' content={description} />
            { /* End standard metadata tags */ }

            { /* Facebook tags */ }
            {/* <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} /> */}
            { /* End Facebook tags */ }

            { /* Twitter tags */ }
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={description} />
            <meta name='twitter:image' content={imageUrl} />
            { /* End Twitter tags */ }
        </Helmet>
    )
}