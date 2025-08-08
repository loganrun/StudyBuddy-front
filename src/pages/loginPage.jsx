import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/NavBar'
import { useDispatch } from 'react-redux';
import { loginSuccess, loginError } from '../reducers/authReducer';
import { Link } from 'react-router-dom';
import axios from 'axios'
const apiAuth = import.meta.env.VITE_AUTH_URL;

function loginPage() {
    const nav = useNavigate()
    const dispatch = useDispatch();


    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePassword = (password) => {
        return password.length >= 6
    }

    const onChange = (e) => {
        const { name, value } = e.target
        const processedValue = name === 'email' ? value.toLowerCase().trim() : value
        
        setFormData({
           ...formData,
            [name]: processedValue
        })

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }

    const onSubmit = async(e) => {
        e.preventDefault()
        
        // Reset errors
        setErrors({})
        
        // Validate form
        const newErrors = {}
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 6 characters long'
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)
        
        try {
            const response = await axios.post(apiAuth, formData);
            const user = response.data; 
        
            dispatch(loginSuccess(user));
            nav('/dashboard')
            
        } catch (error) {
            setIsLoading(false)
            
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const status = error.response.status
                const message = error.response.data?.message || error.response.data?.error || 'Login failed'
                
                if (status === 401 || status === 400) {
                    setErrors({ general: 'Invalid email or password' })
                } else if (status === 404) {
                    setErrors({ general: 'Account not found' })
                } else {
                    setErrors({ general: message })
                }
            } else if (error.request) {
                // Network error
                setErrors({ general: 'Network error. Please check your connection and try again.' })
            } else {
                // Other error
                setErrors({ general: 'An unexpected error occurred. Please try again.' })
            }
            
            dispatch(loginError(error.message));
        }
    }
  return (
    <>
     <Navbar />
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white mt-32 ">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Login to your account
        </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={(e)=> onSubmit(e)} className="space-y-6" action="#" method="POST">
            {/* General Error Message */}
            {errors.general && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">
                        ⚠️ {errors.general}
                    </div>
                </div>
            )}

            <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
            </label>
            <div className="mt-2">
                <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                autoComplete="email"
                onChange={(e) =>{onChange(e)}}
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.email ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">⚠️ {errors.email}</p>
                )}
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
                value={formData.password}
                autoComplete="current-password"
                onChange={(e) =>{onChange(e)}}
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.password ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">⚠️ {errors.password}</p>
                )}
            </div>
            </div>

            <div>
            <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
            
             <Link to='/tutorlogin' signup className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Tutors Login Here
             </Link>
            
        </p>
        </div>
    </div>
    </>
)
}

export default loginPage