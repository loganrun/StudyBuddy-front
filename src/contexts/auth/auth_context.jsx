import { createContext, useContext, useMemo, useState } from "react"
import {useCookies} from 'react-cookie'
import axios from "axios"

const AppContext = createContext()

export function UserProvider({children}) {
    const [cookies, setCookie, removeCookie] = useCookies(['token'])
    const [lectures, setLectures] =useState(null)
    

    const login = async(formData)=>{

        try {
            let response = await axios({
                method: "post",
                url: "http://localhost:3000/api/auth",
                data: formData,
                headers: {
                    "Content-Type": "application/json"
                }
            })
    
            setCookie('token', response.data.token)
    
        } catch (error) {
            console.log(error)
            
        }
    }
    
    const signUp = async(formData)=>{
        try {
            let response = await axios({
                method: "post",
                url: "http://localhost:3000/api/users",
                data: formData,
                headers: {
                    "Content-Type": "application/json"
                }
            })
        
        } catch (error) {
            
            
        }
    
    }

    const logout = () => {
        ['token'].forEach((obj)=>{removeCookie(obj);});
        setToken(null)
        setUserId(null)
        setUserName(null)
        setUserEmail(null)
        setUserPhone(null)
        setUserAddress(null)
        setUserCity(null)
        setUserState(null)
        setUserZip(null)
        setUserCountry(null)
        setUserImage(null)
    }

const uploadAudio = async(data) =>{
    try {
        const file = data
        const formData = new FormData();
        formData.append('file', file);
        

        const response = await axios.post("http://localhost:3000/api/audio/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });

        console.log('File uploaded successfully:', response.data);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

    const value = useMemo(
        () => ({
            cookies,
            login,
            signUp,
            logout,
            uploadAudio,
            lectures
        }),
        [cookies])
  return (
    <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
  )
}

export const useAuth = () =>{
    return useContext(AppContext)
}