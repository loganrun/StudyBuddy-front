import { useState } from 'react'
import { useAuth } from '../contexts/auth/auth_context'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from '../components/NavBar'
import { useDispatch } from 'react-redux';
import { signupSuccess, signupError } from '../reducers/signupReducer'
import axios from 'axios'
function signupPage() {

    const nav = useNavigate()
    const dispatch = useDispatch();
    //const { signUp } = useAuth()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const onChange = (e) =>{
        setFormData({
           ...formData,

            [e.target.name]: e.target.value
           
        })
        
        console.log(formData)
    }

    const onSubmit = async(e) =>{
        e.preventDefault()
        try {
            const response = await axios.post("https://studybuddy-api.onrender.com/api/users", formData);
            const user = response.data; // Assuming the API returns the user object upon successful signup
            console.log(user)
            dispatch(signupSuccess(user));
            //console.log(formData)
        // await signUp(formData)
        nav('/dashboard')
            
        } catch (error) {
            dispatch(signupError(error.message));
        }
        
    }
  return (
<>
<Navbar/>
    
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-white mt-32 ">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
       
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create Your Account
        </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={(e)=> onSubmit(e)} className="space-y-6" action="#" method="POST">
        <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Name
            </label>
            <div className="mt-2">
                <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                onChange={(e) =>{onChange(e)}}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
            </div>
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
                required
                onChange={(e) =>{onChange(e)}}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
            </div>

            <div>
            <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
                </label>
            </div>
            <div className="mt-2">
                <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                onChange={(e) =>{onChange(e)}}
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
                Sign Up
            </button>
            </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
            Already Have an Account?{' '}
             <Link to='/login' signup className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Login here
             </Link>
            
        </p>
        </div>
    </div>
    </>
    )
}

export default signupPage