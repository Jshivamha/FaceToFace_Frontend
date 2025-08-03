import React from 'react'
import {Routes, Route, Navigate } from 'react-router-dom'
import Lobby from './Screens/Lobby'
import Home from "./pages/Home";   
import Room from './Screens/Room'
export default function App() {
  return (
     <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* (Optional) Lobby */}
      <Route path="/lobby" element={<Lobby />} />

      {/* Room */}
      <Route path="/room/:roomId" element={<Room />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}