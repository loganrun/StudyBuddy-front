import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/NavBar'
import { useDispatch } from 'react-redux';
import { loginSuccess, loginError } from '../reducers/tutorauthReducer';
import { Link } from 'react-router-dom';
import axios from 'axios'
const tutorAuth = import.meta.env.VITE_TUTOR_AUTH_URL;

function tutorLogin() {
    const nav = useNavigate()
    const dispatch = useDispatch();


    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const onChange = (e) =>{
        setFormData({
           ...formData,

            [e.target.name]: e.target.value
           
        })
        
    }

    const onSubmit = async(e) =>{
        e.preventDefault()
        //console.log(formData)
        try {
            const response = await axios.post(tutorAuth, formData);
            const tutor = response.data; 
            dispatch(loginSuccess(tutor));
            // await login(formData)
            nav('/tutordashboard')
            
        } catch (error) {
            dispatch(loginError(error.message));

        }
       
    }
  return (
    <>
     <Navbar />
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white mt-32 ">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Tutor's Login
        </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={(e)=> onSubmit(e)} className="space-y-6" action="#" method="POST">
            <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
            </label>
            <div className="mt-2">
                <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                onChange={(e) =>{onChange(e)}}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
            </div>

            <div>
            <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 ">
                Password
                </label>
                <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                </a>
                </div>
            </div>
            <div className="mt-2">
                <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                onChange={(e) =>{onChange(e)}}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
            </div>

            <div>
            <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={(e)=> onSubmit(e)}
            >
                Login 
            </button>
            </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
        
             <Link to='/login' signup className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Students Login Here
             </Link>
            
        </p>
        </div>
    </div>
    </>
)
}

export default tutorLogin