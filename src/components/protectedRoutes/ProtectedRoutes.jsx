import { Navigate,Outlet } from "react-router-dom"
//import {useAuth} from '../../contexts/auth/auth_context'
import { useSelector } from "react-redux"

function ProtectedRoutes() {
  const user = useSelector(state => state.auth.user)

    //const {cookies} = useAuth()
  return user ? <Outlet/> : <Navigate to ='/login' />
}

export default ProtectedRoutes