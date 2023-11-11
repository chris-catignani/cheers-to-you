
import { useDispatch, useSelector } from 'react-redux';

import {
    selectPersonsName,
    selectEventName,
    setPersonsName,
    setEventName
} from './eventSlice'

export const Event = ({onGenerateClick}) => {
    const personsName = useSelector(selectPersonsName);
    const eventName = useSelector(selectEventName);
    const dispatch = useDispatch();

    return (
        <div>
            <label htmlFor='name'>Persons name:</label>
            <input
                id='name'
                type="text"
                value={personsName}
                onChange={e => dispatch(setPersonsName(e.target.value))}
            />
            <label htmlFor='event'>Celebration name:</label>
            <input
                id='event'
                type="text"
                value={eventName}
                onChange={e => dispatch(setEventName(e.target.value))}
            />
            <button onClick={onGenerateClick}>Generate</button>
        </div>
    )
}
