
import { useState } from 'react';

export const Event = ({onGenerateClick}) => {

    const [name, setName] = useState( '' );
    const [event, setEvent] = useState( '' );

    return (
        <div>
            <label htmlFor='name'>Persons name:</label>
            <input
                id='name'
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <label htmlFor='event'>Celebration name:</label>
            <input
                id='event'
                type="text"
                value={event}
                onChange={e => setEvent(e.target.value)}
            />
            <button onClick={() => onGenerateClick(name, event)}>Generate</button>
        </div>
    )
}
