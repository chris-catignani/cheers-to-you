import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { Event } from './features/event/Event';
import { Output } from './features/output/Output';

import {
  selectPersonsName,
  selectEventName
} from './features/event/eventSlice';

import { generateOutput } from './features/output/outputSlice';

export default function App() {
  const personsName = useSelector(selectPersonsName);
  const eventName = useSelector(selectEventName);
  const dispatch = useDispatch();

  const onGenerateClick = () => {
    dispatch(generateOutput(personsName, eventName))
  }

  return (
    <div className="App">
      <Event onGenerateClick={onGenerateClick}></Event>
      <Output></Output>
    </div>
  );
}
