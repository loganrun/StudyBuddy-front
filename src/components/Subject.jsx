import React,{useState} from 'react'
import { useDispatch } from 'react-redux';
import { addSubject } from '../reducers/lecturesSlice';

function Subject() {
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState('');
    const handleChange = (e) => {
        const newValue = e.target.value
        setInputValue(e.target.value);
        console.log(newValue);
        dispatch(addSubject(newValue));
      };
  return (
    <input 
          type="text"
          value={inputValue}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-l-lg flex-grow mr-6 text-black"
          placeholder="Subject"
        />
  )
}

export default Subject