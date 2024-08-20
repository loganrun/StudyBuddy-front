import React from 'react';
import { Link } from 'react-router-dom'
import { LogOut, Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutSuccess, logoutError } from '../reducers/authReducer';
import { Button } from "../components/Button";
import { useNavigate } from 'react-router-dom'

const Navbar = (props) => {
  const {id} = props
  const dispatch = useDispatch();
  const nav = useNavigate()

  const handleLogOut = () => {
   try {
    dispatch(logoutSuccess())
    nav('/')
    
   } catch (error) {
    dispatch(logoutError({ error}))
   }
  }

  const renderButtons = () => {
    switch (id) {
      case 'admin':
        return (
          <>
          
            <Link to="/record" className="bg-rose-600 hover:bg-rose-300 text-white font-bold py-2 px-4 rounded">
              New Lesson?
            </Link>
            <Link to="/admin" className="bg-rose-600 hover:bg-rose-300 text-white font-bold py-2 px-4 rounded">
              Admin Dashboard
            </Link>
            
            <button
              className="bg-rose-600 hover:bg-rose-300 text-white font-bold py-2 px-4 rounded"
              onClick={handleLogOut}
            >
              Log Out
            </button>
          </>
        );
      case 'dashboard':
        return (
          <>
          <Button variant="outline">
          <Link to="/joinsession" >
            Start Tutoring
          </Link>
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            <Link to="/record">
              New Lesson?
            </Link> 
          </Button>
    
          <Button variant="ghost">
          <LogOut className="h-4 w-4 mr-2" onClick={handleLogOut} /> Log Out
          </Button>

          </>
        );
        case 'study':
          return (
            <>
              <Button variant="outline">
            <Link to="/dashboard" >
                Dashboard
            </Link>
            
            </Button>
           <Button variant="ghost">
              <LogOut className="h-4 w-4 mr-2" onClick={handleLogOut} /> Log Out
            </Button>
              
            </>
          );
          case 'record':
          return (
            <>
            <Button variant="outline">
            <Link to="/dashboard" >
                Dashboard
            </Link>

            </Button>
           <Button variant="ghost">
              <LogOut className="h-4 w-4 mr-2" onClick={handleLogOut} /> Log Out
            </Button>
            </>
          );
      default:
        return (
          <button
            className="bg-rose-200 hover:bg-rose-300 text-white font-bold py-2 px-4 rounded"
            
            
          >
            Sign Up
          </button>
        );
    }
  };
  
  return (
    
      <nav className="bg-gray-600 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">Study Buddy</div>
        <div className="flex space-x-4 ml-auto">{renderButtons()}</div>
      </div>
    </nav>
  );
};

export default Navbar;