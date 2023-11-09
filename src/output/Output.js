import './Output.css';

import { sample } from 'lodash-es';

export const Output = ({name, event}) => {

    const letters = []
    for (var i = 0; i < name.length; i++) {
        const letter = name.charAt(i)
        letters.push(<Letter letter={letter} beer={sample(beers[letter])} key={i}></Letter>)
    }

    return (
        <div className='output'>
            <div>{event}</div>
            <div className='letters'>
                {letters}
            </div>
        </div>
    )
}

export const Letter = ({letter, beer}) => {
    return (
        <div className='letter'>
            <img src={process.env.PUBLIC_URL + beer['url']} alt={beer['name'] + beer['type']} />
            <div>{letter}</div>
        </div>
    )
}

const beers = {
    'c': [
        {
            'name': 'Carling',
            'type': 'Lager',
            'url': '/labels/carling.jpeg'
        },
        {
            'name': 'Carlsburg',
            'type': 'Lager',
            'url': '/labels/carlsburg.jpeg'
        }
    ],
    'h': [
        {
            'name': 'Heineken',
            'type': 'Lager',
            'url': '/labels/heineken.jpeg'
        },
        {
            'name': 'Hoegaarden',
            'type': 'Wheat',
            'url': '/labels/hoegaarden.jpeg'
        }
    ],
    'r': [
        {
            'name': 'Red Stripe',
            'type': 'Lager',
            'url': '/labels/red_stripe.jpg'
        },
        {
            'name': 'Rolling Rock',
            'type': 'Lager',
            'url': '/labels/rolling-rock.jpeg'
        }
    ],
}