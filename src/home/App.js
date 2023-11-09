import './App.css';
import { useState } from 'react';

import { Event } from '../event/Event';
import { Output } from '../output/Output';

export default function App() {

  const [name, setName] = useState( '' );
  const [event, setEvent] = useState( '' );

  const onGenerateClick = (name, event) => {
    setName('')
    setEvent('')
    setName(name)
    setEvent(event)
  }

  return (
    <div className="App">
      <Event onGenerateClick={onGenerateClick}></Event>
      <Output name={name} event={event}></Output>
    </div>
  );
}
