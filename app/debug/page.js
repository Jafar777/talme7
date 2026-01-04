"use client";

import { useState, useEffect } from 'react';
import { roomManager } from '@/lib/roomManager';

export default function DebugPage() {
  const [rooms, setRooms] = useState([]);
  const [localStorageRooms, setLocalStorageRooms] = useState({});

  useEffect(() => {
    // Get rooms from roomManager
    const roomsArray = Array.from(roomManager.rooms.values());
    setRooms(roomsArray);
    
    // Get raw localStorage data
    const stored = localStorage.getItem('taboo_rooms');
    if (stored) {
      setLocalStorageRooms(JSON.parse(stored));
    }
  }, []);

  const clearAllRooms = () => {
    if (confirm('هل أنت متأكد من حذف جميع الغرف؟')) {
      localStorage.removeItem('taboo_rooms');
      localStorage.removeItem('taboo_player');
      // Reset roomManager
      roomManager.rooms.clear();
      setRooms([]);
      setLocalStorageRooms({});
      alert('تم حذف جميع الغرف');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">تصحيح الغرف</h1>
      
      <div className="mb-6">
        <button
          onClick={clearAllRooms}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          حذف جميع الغرف
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Manager Rooms */}
        <div>
          <h2 className="text-xl font-semibold mb-4">الغرف في RoomManager ({rooms.length})</h2>
          {rooms.map(room => (
            <div key={room.id} className="p-4 mb-4 border rounded-lg">
              <h3 className="font-bold">غرفة: {room.id}</h3>
              <p>المضيف: {room.host}</p>
              <p>عدد اللاعبين: {room.players?.length || 0}</p>
              <p>الحالة: {room.gameState}</p>
              <p>تم الإنشاء: {new Date(room.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {rooms.length === 0 && (
            <p className="text-gray-500">لا توجد غرف في الذاكرة</p>
          )}
        </div>

        {/* LocalStorage Rooms */}
        <div>
          <h2 className="text-xl font-semibold mb-4">الغرف في localStorage ({Object.keys(localStorageRooms).length})</h2>
          {Object.entries(localStorageRooms).map(([roomId, room]) => (
            <div key={roomId} className="p-4 mb-4 border rounded-lg">
              <h3 className="font-bold">غرفة: {roomId}</h3>
              <p>المضيف: {room.host}</p>
              <p>عدد اللاعبين: {room.players?.length || 0}</p>
              <p>الحالة: {room.gameState}</p>
              <p>تم الإنشاء: {new Date(room.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {Object.keys(localStorageRooms).length === 0 && (
            <p className="text-gray-500">لا توجد غرف في localStorage</p>
          )}
        </div>
      </div>
    </div>
  );
}