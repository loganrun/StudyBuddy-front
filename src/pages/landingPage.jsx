import boy from'../assets/images/boy1.jpg'
import { Link } from 'react-router-dom'
import './landing.css'

function landingPage() {
  return (
    <div className="relative h-screen">
    <img
      src={boy}
      alt="Background Image"
      className="w-full h-full object-cover"
    />
    <div
      className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center flex-col"
    >
      <h1 className="text-4xl font-bold text-white mb-6">Study Buddy</h1>
      
  
      <Link to='/login'
        className="px-6 py-3 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors duration-300"
      >
        Enter 
      </Link>
      
    </div>
  </div>
  )
}

export default landingPage