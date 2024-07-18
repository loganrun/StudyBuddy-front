import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ userType }) {
  const user = useSelector(state => state.auth.user);
  const tutor = useSelector(state => state.tutorauth.tutor?.payload?.tutor);

  const isAuthenticated = userType === 'student' ? user : tutor;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;


// import { Navigate,Outlet } from "react-router-dom"
// import { useSelector } from "react-redux"

// function ProtectedRoutes() {
//   const student = useSelector(state => state.auth.user)
//   const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor);

    
//   return student ? <Outlet/> : <Navigate to ='/login' />
// }

// export default ProtectedRoutes