import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { Event } from './features/event/Event';
import { Output } from './features/output/Output';

import {
  selectPersonsName,
  selectEventName,
} from './features/event/eventSlice';

import { generateOutput, generateBeerDict } from './features/output/outputSlice';

export default function App() {
  const personsName = useSelector(selectPersonsName);
  const eventName = useSelector(selectEventName);
  const dispatch = useDispatch();

  // On page load, create the beer dicts
  useEffect(() => {
    dispatch(generateBeerDict())
  }, [dispatch])

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
