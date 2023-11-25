import { Box, Image } from "@chakra-ui/react"
import { useEffect } from "react"
import { Helmet } from "react-helmet"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { downloadSocialMediaInfo, selectEventName, selectImageUrl, selectPersonsName } from "./socialMediaSlice"

export const SocialMedia = () => {
    const dispatch = useDispatch()
    const { appId, fileId } = useParams()
    const personsName = useSelector(selectPersonsName)
    const eventName = useSelector(selectEventName)
    const imageUrl = useSelector(selectImageUrl)

    useEffect(() => {
        dispatch(downloadSocialMediaInfo({appId,  fileId}))
    }, [dispatch, appId, fileId]);

    return (
        <>
            <SocialMediaHeader 
                title={`Cheers2You ${personsName}!`}
                description={`Celebrate ${personsName} at ${eventName} with Cheers2You!`}
            />
            <Box>
                {/* <Image src={`https://upcdn.io/${appId}/raw/demo/${fileId}.jpeg`}/> */}
                <Image src={imageUrl}/>
            </Box>
        </>
    )
}

export const SocialMediaHeader = ({title, description}) => {
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
            { /* End Twitter tags */ }
        </Helmet>
    )
}
