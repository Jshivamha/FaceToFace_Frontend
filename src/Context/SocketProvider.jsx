import React from 'react'
import { useContext } from 'react'
import { useMemo } from 'react'
import { createContext } from 'react'
const socketContext = createContext(null)
import {io} from 'socket.io-client'
export const useSocket = ()=>{
    const socket = useContext(socketContext)
    return socket
}
const SocketProvider = (props) => {
    const socket = useMemo(()=>io('https://facetoface-backend.onrender.com'), [])
  return (
    <socketContext.Provider value={socket}>
        {props.children}
    </socketContext.Provider>
  )
}

export default SocketProvider
