import Main from './pages/main'
import SignupPage from './pages/signupPage'
import LoginPage from './pages/loginPage'
import LandingPage from './pages/landingPage'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoutes from './components/protectedRoutes/ProtectedRoutes'
import Dashboard from './pages/dashboard'
import Study from './pages/study'
import './App.css'

function App() {
  

  return (
    <>
    <Routes>
      
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path='/record' element={<Main />} />
        <Route path='/study' element={<Study/>} /> */}
        <Route element={<ProtectedRoutes/>}>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/record' element={<Main />} />
          <Route path='/study' element={<Study/>} />
        </Route>
        
    </Routes>
    </>
  )
}

export default App


