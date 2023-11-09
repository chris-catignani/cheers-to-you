
import { useState } from 'react';

export const Event = ({onGenerateClick}) => {

    const [name, setName] = useState( '' );
    const [event, setEvent] = useState( '' );

    return (
        <div>
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <input
                type="text"
                value={event}
                onChange={e => setEvent(e.target.value)}
            />
            <button onClick={() => onGenerateClick(name, event)}>Generate</button>
        </div>
    )
}
