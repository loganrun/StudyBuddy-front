import Main from './pages/main'
import SignupPage from './pages/signupPage'
import LoginPage from './pages/loginPage'
import LandingPage from './pages/landingPage'
import TutoringPage from './pages/tutoringPage'
import TutorLogin from './pages/tutorLogin'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoutes from './components/protectedRoutes/ProtectedRoutes'
import Dashboard from './pages/dashboard'
import Study from './pages/study'
import TutorDashboard from './pages/tutorDashboard'
import './App.css'

function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/tutorlogin" element={<TutorLogin />} />
        
        <Route path="/" element={<ProtectedRoutes userType="student" />}>
          <Route path='dashboard' element={<Dashboard/>}/>
          <Route path='record' element={<Main />} />
          <Route path='study' element={<Study/>} />
        </Route>
        
        <Route path="/" element={<ProtectedRoutes userType="teacher" />}>
          {/* <Route path="dashboard" element={<TeacherDashboard />} /> */}
          <Route path="tutoring" element={<TutoringPage />} />
          <Route path="tutordashboard" element={<TutorDashboard/>}/>
        </Route>
      
        {/* }/>
        <Route path="/signup" element={<SignupPage />} />
        
      
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path='/record' element={<Main />} />
        <Route path='/study' element={<Study/>} /> 
        <Route element={<ProtectedRoutes/>}>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/record' element={<Main />} />
          <Route path='/study' element={<Study/>} />
        </Route> */}
        
    </Routes>
    </>
  )
}

export default App


