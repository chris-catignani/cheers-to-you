import './Output.css';

import { sample } from 'lodash-es';
import { beers } from './beers.js'

export const Output = ({name, event}) => {

    const beerDict = {}
    beers.forEach(beer => {
        beer['beer_name_match_initial'].toLowerCase().split(',').forEach(letter => {
            if (!(letter in beerDict)) {
                beerDict[letter] = []
            }

            beerDict[letter].push({
                'name': beer['beer_name'],
                'type': beer['beer_type'],
                'url': beer['beer_label_file'],
                'brewer_name': beer['brewer_name'],
                'beer_name': beer['beer_name']
            })
        })
    })

    console.log(beerDict)

    const letters = []
    for (var i = 0; i < name.length; i++) {
        const letter = name.charAt(i).toLowerCase();
        letters.push(<Letter letter={letter} beer={sample(beerDict[letter])} key={i}></Letter>)
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
    console.log(beer)
    return (
        <div className='letter'>
            <img src={beer['url']} alt={beer['name'] + beer['type']} />
            <div className='brewary'>{beer['brewer_name']}</div>
            <div className='beerName'>{beer['beer_name']}</div>
            <div className='letterChar'>{letter}</div>
        </div>
    )
}
