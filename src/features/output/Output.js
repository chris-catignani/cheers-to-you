import { useSelector } from 'react-redux';
import './Output.css';
import { selectBeerLetters, selectEventName } from './outputSlice';

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
        <div className='output'>
            <div>{eventName}</div>
            <div className='letters'>
                {letters}
            </div>
        </div>
    )
}

export const Letter = ({letter, beer}) => {
    return (
        <div className='letter'>
            <img src={beer['url']} alt={beer['name'] + beer['type']} />
            <div className='brewary'>{beer['brewer_name']}</div>
            <div className='beerName'>{beer['beer_name']}</div>
            <div className='letterChar'>{letter}</div>
        </div>
    )
}
