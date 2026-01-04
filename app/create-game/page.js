"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGameRoom } from '@/lib/firebaseGame';

export default function CreateGame() {
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('الرجاء إدخال اسمك');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Create room using Firebase
      const { roomCode, userId, playerName: name } = await createGameRoom(playerName);
      
      // Store minimal player info in localStorage (or useState context)
      localStorage.setItem('taboo_player', JSON.stringify({
        id: userId,
        name: name,
        roomCode: roomCode,
        isHost: true
      }));
      
      console.log(`Room created: ${roomCode}`);
      
      // Redirect to game room
      router.push(`/game/${roomCode}`);
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الغرفة. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-100/30 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-xl border border-white/30">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">إنشاء غرفة جديدة</h1>
        <p className="text-center text-foreground/70 mb-8">
          ادخل اسمك لتبدأ لعبة جديدة مع أصدقائك
        </p>
        
        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div>
            <label className="block text-foreground/80 mb-2">اسم اللاعب</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
              placeholder="ادخل اسمك هنا"
              maxLength={20}
              disabled={isCreating}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'جاري الإنشاء...' : 'إنشاء غرفة جديدة'}
          </button>
          
          <div className="text-center text-sm text-foreground/60">
            بعد إنشاء الغرفة، ستحصل على رمز لمشاركته مع أصدقائك للانضمام.
          </div>
        </form>
      </div>
    </div>
  );
}