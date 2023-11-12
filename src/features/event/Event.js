
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button, Input } from '@chakra-ui/react';

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
        <Container maxW='md'>
            <Input
                placeholder='Persons Name'
                value={personsName}
                onChange={e => dispatch(setPersonsName(e.target.value))}
            />
            <Input
                placeholder='Event Name'
                value={eventName}
                onChange={e => dispatch(setEventName(e.target.value))}
            />
            <Button width='full' onClick={onGenerateClick}>Generate</Button>
        </Container>
    )
}
