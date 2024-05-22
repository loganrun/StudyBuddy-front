import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DisplayLecture from '../components/DisplayLecture';
import Navbar from '../components/NavBar';
import { setLectures } from '../reducers/lecturesSlice';
import axios from 'axios';



function Dashboard() {
  const lectures = useSelector((state) => state.lectures.lectures);
  const isLoading = useSelector((state) => state.lectures.isLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    const findLectures = async () => {
      try {
        let response = await axios({
          method: 'get',
          url: 'https://studybuddy-api.onrender.com/api/lecture/',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        //console.log(response);
        dispatch(setLectures(response.data));
      } catch (error) {
        console.error(error.message);
      }
    };
    findLectures();
  }, [dispatch]);

    

  return (
    <>
    <Navbar id="dashboard" />
    <div className="container mx-auto mt-4">
    <h1 className="text-2xl font-bold mb-4">Lessons</h1>
    <div className="grid gap-1 gap-y-4 mt-20 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    
{isLoading ? (
        <p className="text-center">Loading...</p>
    ) : (
        lectures.map((item) => (
        <DisplayLecture key={item._id} data={item} /> 
        ))
    )}
    </div>
    </div>
    </>    
)
}

export default Dashboard
