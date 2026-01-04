"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinGameRoom } from '@/lib/firebaseGame';

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim() || !playerName.trim()) {
      setError('الرجاء إدخال رمز الغرفة واسمك');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Join room using Firebase
      const { roomCode: joinedRoomCode, userId, playerName: name } = await joinGameRoom(roomCode, playerName);
      
      // Store player info
      localStorage.setItem('taboo_player', JSON.stringify({
        id: userId,
        name: name,
        roomCode: joinedRoomCode,
        isHost: false
      }));
      
      console.log(`Successfully joined room ${joinedRoomCode} as ${name}`);
      
      // Redirect to game room
      router.push(`/game/${joinedRoomCode}`);
    } catch (err) {
      console.error('Join error:', err);
      setError('تعذر الانضمام للغرفة. تحقق من رمز الغرفة وحاول مرة أخرى.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-100/30 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-xl border border-white/30">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">الانضمام إلى لعبة</h1>
        <p className="text-center text-foreground/70 mb-8">
          ادخل رمز الغرفة واسمك للانضمام إلى اللعبة
        </p>
        
        <form onSubmit={handleJoinRoom} className="space-y-6">
          <div>
            <label className="block text-foreground/80 mb-2">رمز الغرفة</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-mono text-lg tracking-wider"
              placeholder="مثل: ABC123"
              maxLength={6}
              disabled={isJoining}
            />
          </div>
          
          <div>
            <label className="block text-foreground/80 mb-2">اسم اللاعب</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
              placeholder="ادخل اسمك هنا"
              maxLength={20}
              disabled={isJoining}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isJoining}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'جاري الانضمام...' : 'انضم الآن'}
          </button>
          
          <div className="text-center text-sm text-foreground/60">
            اطلب رمز الغرفة من صاحب اللعبة للانضمام.
          </div>
        </form>
      </div>
    </div>
  );
}