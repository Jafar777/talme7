// C:\Users\jafar\Desktop\mamnoo3\app\game\[roomId]\page.js

"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { subscribeToGame, startGame, chooseTeam, shuffleTeams, becomeHintGiver, leaveGame , kickPlayer} from '@/lib/firebaseGame';
import GameBoard from '@/components/GameBoard';
import PlayerList from '@/components/PlayerList';
import ScoreBoard from '@/components/ScoreBoard';

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId;
  
  const [gameData, setGameData] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    // Load player from localStorage
    const playerData = localStorage.getItem('taboo_player');
    if (!playerData) {
      router.push('/join-game');
      return;
    }

    const playerInfo = JSON.parse(playerData);
    
    // Check if player is in the right room
    if (playerInfo.roomCode !== roomId) {
      setError('أنت لست في هذه الغرفة. يرجى الانضمام أولاً.');
      setIsLoading(false);
      return;
    }

    setPlayer(playerInfo);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToGame(roomId, (data) => {
      if (data === null) {
        setError('الغرفة غير موجودة أو انتهت صلاحيتها');
        setIsLoading(false);
      } else {
        setGameData(data);
        setIsLoading(false);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [roomId, router]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleKickPlayer = async (playerIdToKick) => {
  if (!isHost || !player) return;
  
  try {
    await kickPlayer(roomId, player.id, playerIdToKick);
    setActionMessage('تم طرد اللاعب بنجاح');
    setTimeout(() => setActionMessage(''), 2000);
  } catch (err) {
    setError(err.message);
  }
};

  const handleStartGame = async () => {
    if (gameData && player && player.id === gameData.hostId) {
      try {
        await startGame(roomId);
        setActionMessage('تم بدء اللعبة!');
        setTimeout(() => setActionMessage(''), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleJoinTeam = async (team) => {
    if (!player || !gameData) return;
    
    try {
      await chooseTeam(roomId, player.id, team);
      setActionMessage(`انضممت إلى الفريق ${team}`);
      setTimeout(() => setActionMessage(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShuffleTeams = async () => {
    if (!isHost) return;
    
    try {
      await shuffleTeams(roomId);
      setActionMessage('تم خلط الفرق عشوائياً');
      setTimeout(() => setActionMessage(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBecomeHintGiver = async () => {
    if (!player || gameData?.status !== 'playing') return;
    
    try {
      await becomeHintGiver(roomId, player.id);
      setActionMessage('أنت الآن معطي التلميح!');
      setTimeout(() => setActionMessage(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      if (player && gameData) {
        await leaveGame(roomId, player.id);
      }
    } catch (err) {
      console.error('Error leaving game:', err);
    }
    
    localStorage.removeItem('taboo_player');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-100/30 flex items-center justify-center">
        <div className="text-xl font-semibold text-foreground/70">جاري تحميل الغرفة...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-100/30 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-xl border border-white/30 text-center">
          <div className="text-2xl text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-foreground mb-4">{error}</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all duration-200"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!gameData || !player) {
    return null;
  }

  const isHost = player?.id === gameData.hostId;
  const currentPlayerInGame = gameData.players?.find(p => p.id === player.id);
  const playerTeam = currentPlayerInGame?.team;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-100/30 p-4">
      {/* Room Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
          {actionMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
              {actionMessage}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary">غرفة اللعبة</h1>
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {gameData.status === 'waiting' ? 'في انتظار اللاعبين' : 'جاري اللعب'}
                </span>
              </div>
              <div className="mt-2">
                <button
                  onClick={copyRoomCode}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-primary/30 rounded-xl hover:bg-primary/5 transition-all duration-200"
                >
                  <span className="font-mono text-lg font-bold tracking-wider">{roomId}</span>
                  <span className="text-sm text-foreground/60">
                    {copied ? 'تم النسخ! ✓' : 'رمز الغرفة - انسخ'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {gameData.status === 'waiting' && (
                <>
                  {!playerTeam && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinTeam('A')}
                        className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-xl hover:bg-blue-200 transition-all duration-200 border border-blue-300"
                      >
                        انضم للفريق أ
                      </button>
                      <button
                        onClick={() => handleJoinTeam('B')}
                        className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-xl hover:bg-red-200 transition-all duration-200 border border-red-300"
                      >
                        انضم للفريق ب
                      </button>
                    </div>
                  )}
                  
                  {isHost && (
                    <>
                      <button
                        onClick={handleShuffleTeams}
                        className="px-4 py-2 bg-amber-100 text-amber-700 font-medium rounded-xl hover:bg-amber-200 transition-all duration-200 border border-amber-300"
                      >
                        خلط الفرق
                      </button>
                      <button
                        onClick={handleStartGame}
                        className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                        disabled={gameData.players?.length < 2}
                      >
                        بدء اللعبة
                      </button>
                    </>
                  )}
                </>
              )}
              
              {gameData.status === 'playing' && playerTeam === gameData.currentTeam && (
                <button
                  onClick={handleBecomeHintGiver}
                  className="px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-all duration-200 border border-purple-300"
                  disabled={gameData.currentHintGiver?.id === player.id}
                >
                  {gameData.currentHintGiver?.id === player.id ? 'أنت معطي التلميح' : 'كن معطي تلميح'}
                </button>
              )}
              
              <button
                onClick={handleLeaveRoom}
                className="px-6 py-2 bg-white border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all duration-200"
              >
                مغادرة الغرفة
              </button>
            </div>
          </div>
          
          {isHost && gameData.status === 'waiting' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
              {gameData.players?.length < 2 ? (
                `تحتاج إلى ${2 - gameData.players?.length} لاعبين إضافيين لبدء اللعبة`
              ) : (
                <div className="flex justify-between items-center">
                  <span>
                    {gameData.teamA?.length || 0} في الفريق أ، {gameData.teamB?.length || 0} في الفريق ب
                  </span>
                  <span className="text-xs">
                    يمكن للاعبين اختيار فريق أو اضغط "خلط الفرق" للتوزيع العشوائي
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Players */}
        <div className="lg:col-span-1">
          <PlayerList 
            players={gameData.players || []}
            currentPlayer={currentPlayerInGame}
            teamA={gameData.teamA || []}
            teamB={gameData.teamB || []}
            currentHintGiver={gameData.currentHintGiver}
              onKickPlayer={handleKickPlayer} 
  isHost={isHost}  
          />
        </div>

        {/* Center Column - Game Board */}
        <div className="lg:col-span-2 space-y-6">
          {gameData.status === 'playing' ? (
            <GameBoard 
              gameData={gameData}
              player={currentPlayerInGame}
              roomCode={roomId}
            />
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
              <div className="text-5xl mb-4 text-center">🎮</div>
              <h2 className="text-2xl font-bold text-foreground mb-3 text-center">
                {gameData.status === 'waiting' ? 'في انتظار بدء اللعبة' : 'اللعبة متوقفة'}
              </h2>
              
              {gameData.status === 'waiting' && (
                <>
                  <p className="text-foreground/70 mb-6 text-center">
                    شارك رمز الغرفة <span className="font-mono font-bold">{roomId}</span> مع أصدقائك للانضمام.
                    {playerTeam ? (
                      ` أنت في الفريق ${playerTeam}`
                    ) : (
                      ' اختر فريقاً أو انتظر خلط الفرق.'
                    )}
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 text-foreground">توزيع الفرق:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <h4 className="font-bold text-blue-700">الفريق أ</h4>
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {gameData.teamA?.length || 0}
                          </span>
                        </div>
                        {gameData.teamA?.length > 0 ? (
                          <ul className="space-y-1">
                            {gameData.players.filter(p => gameData.teamA.includes(p.id)).map(player => (
                              <li key={player.id} className="text-sm text-blue-600/80">
                                {player.name} {player.isHost && '👑'}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-blue-600/60">لا يوجد لاعبين</p>
                        )}
                      </div>
                      
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <h4 className="font-bold text-red-700">الفريق ب</h4>
                          <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {gameData.teamB?.length || 0}
                          </span>
                        </div>
                        {gameData.teamB?.length > 0 ? (
                          <ul className="space-y-1">
                            {gameData.players.filter(p => gameData.teamB.includes(p.id)).map(player => (
                              <li key={player.id} className="text-sm text-red-600/80">
                                {player.name} {player.isHost && '👑'}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-600/60">لا يوجد لاعبين</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="inline-flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{gameData.players?.length || 0}</div>
                  <div className="text-sm text-foreground/60">لاعبين</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500</div>
                  <div className="text-sm text-foreground/60">كلمة</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">60</div>
                  <div className="text-sm text-foreground/60">ثانية</div>
                </div>
              </div>
            </div>
          )}
          
          <ScoreBoard 
            score={gameData.score || { teamA: 0, teamB: 0 }}
            currentTeam={gameData.currentTeam || 'A'}
          />
        </div>
      </div>
    </div>
  );
}