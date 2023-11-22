import { useState } from "react";
import { Camera } from "./Camera";
import { Button, Input } from "@chakra-ui/react";

export const BeerUGCInput = ({onClick}) => {
    const [ugcBeerPic, setUgcBeerPic] = useState('');
    const [beerName, setBeerName] = useState('');
    const [beerType, setBeerType] = useState('');
    const [brewery, setBrewery] = useState('');

    return (
        <>
            <Camera
                onPictureTaken={(image) => setUgcBeerPic(image)}
                currentPicture={ugcBeerPic}
            />
            <Input
                placeholder='Beer Name'
                value={beerName}
                onChange={e => setBeerName(e.target.value)}
            />
            <Input
                placeholder='Beer Type'
                value={beerType}
                onChange={e => setBeerType(e.target.value)}
            />
            <Input
                placeholder='Brewery'
                value={brewery}
                onChange={e => setBrewery(e.target.value)}
            />
            <Button onClick={() => onClick({
                'beer_label_file': ugcBeerPic,
                'beer_name': beerName,
                'beer_type': beerType,
                'brewer_name': brewery,
            })}>
                Save
            </Button>
        </>
    )
}
