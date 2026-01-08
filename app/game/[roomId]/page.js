// C:\Users\jafar\Desktop\mamnoo3\app\game\[roomId]\page.js

"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { subscribeToGame, startGame, chooseTeam, shuffleTeams, becomeHintGiver, leaveGame , kickPlayer, switchTeam} from '@/lib/firebaseGame';
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
      setActionMessage(`انضممت إلى الفريق ${team === 'A' ? '1' : '2'}`);
      setTimeout(() => setActionMessage(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSwitchTeam = async (newTeam) => {
    if (!player || !gameData || gameData.status === 'playing') return;
    
    try {
      await switchTeam(roomId, player.id, newTeam);
      setActionMessage(`انتقلت إلى الفريق ${newTeam === 'A' ? '1' : '2'}`);
      setTimeout(() => setActionMessage(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveTeam = async () => {
    if (!player || !gameData || gameData.status === 'playing') return;
    
    try {
      // Remove player from both teams
      if (playerTeam === 'A') {
        await updateDoc(roomRef, {
          teamA: arrayRemove(player.id)
        });
      } else if (playerTeam === 'B') {
        await updateDoc(roomRef, {
          teamB: arrayRemove(player.id)
        });
      }
      
      // Update player's team in players array
      const updatedPlayers = gameData.players.map(p => 
        p.id === player.id ? { ...p, team: null } : p
      );
      
      await updateDoc(roomRef, {
        players: updatedPlayers
      });
      
      setActionMessage('غادرت الفريق');
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
              {gameData.status === 'waiting' && isHost && (
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
                    {gameData.teamA?.length || 0} في الفريق 1، {gameData.teamB?.length || 0} في الفريق 2
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

      {/* Main Game Area - Codenames Style */}
      <div className="max-w-6xl mx-auto">
        {gameData.status === 'playing' ? (
          <div className="space-y-6">
            <GameBoard 
              gameData={gameData}
              player={currentPlayerInGame}
              roomCode={roomId}
            />
            <ScoreBoard 
              score={gameData.score || { teamA: 0, teamB: 0 }}
              currentTeam={gameData.currentTeam || 'A'}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT - Team 2 Rectangle */}
            <div className="lg:w-1/4">
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl shadow-lg h-[500px] flex flex-col">
                {/* Team Header */}
                <div className="bg-red-200 rounded-t-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-600"></div>
                    <h3 className="text-xl font-bold text-red-800">الفريق 2</h3>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                      {gameData.teamB?.length || 0}
                    </span>
                  </div>
                </div>
                
                {/* Team Actions */}
                <div className="p-6 flex justify-center">
                  {playerTeam === 'B' ? (
                    <div className="space-y-3 w-full">

                      <button
                        onClick={() => handleSwitchTeam('A')}
                        className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                      >
                        انتقل إلى الفريق 1
                      </button>

                    </div>
                  ) : playerTeam === 'A' ? (
                    <button
                      onClick={() => handleSwitchTeam('B')}
                      className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                    >
                      {playerTeam ? 'انتقل إلى الفريق 2' : 'انضم للفريق 2'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinTeam('B')}
                      className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                    >
                      انضم للفريق 2
                    </button>
                  )}
                </div>
                
                {/* Players List */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {gameData.teamB?.length > 0 ? (
                    <ul className="space-y-3">
                      {gameData.players.filter(p => gameData.teamB.includes(p.id)).map(player => (
                        <li key={player.id} className={`flex items-center gap-3 p-3 rounded-xl shadow-sm ${
                          player.id === currentPlayerInGame?.id ? 'bg-red-200 border-2 border-red-400' : 'bg-white/80'
                        }`}>
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                            {player.name.charAt(0)}
                          </div>
                          <span className="font-medium text-red-700">{player.name}</span>
                          {player.isHost && <span className="text-red-600">👑</span>}
                          {player.id === currentPlayerInGame?.id && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">أنت</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-red-300 text-5xl mb-3">👤</div>
                      <p className="text-red-400 font-medium">لا يوجد لاعبين</p>
                    </div>
                  )}
                </div>
                
                {/* Hint Giver Section - Bottom */}
                <div className="border-t border-red-300 p-4 bg-red-100/50 rounded-b-2xl">
                  <div className="text-center">
                    <div className="text-sm font-bold text-red-700 mb-1">معطي تلميح</div>
                    <div className="text-lg font-bold text-red-800">
                      {gameData.teamB?.length > 0 ? 
                        (gameData.currentHintGiver && gameData.teamB.includes(gameData.currentHintGiver.id) ? 
                          gameData.currentHintGiver.name : 'لم يتم الاختيار') 
                        : '---'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CENTER - Empty Square */}
            <div className="lg:w-2/4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 h-[500px] flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl mb-6 text-gray-300">🎮</div>
                  <h2 className="text-3xl font-bold text-gray-400 mb-3">
                    {gameData.status === 'waiting' ? 'في انتظار بدء اللعبة' : 'اللعبة متوقفة'}
                  </h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {gameData.status === 'waiting' ? (
                      playerTeam ? (
                        `أنت في الفريق ${playerTeam === 'A' ? '1' : '2'}. يمكنك تغيير الفريق في أي وقت قبل بدء اللعبة.`
                      ) : (
                        'اختر فريقاً للانضمام. يمكنك تغيير الفريق في أي وقت قبل بدء اللعبة.'
                      )
                    ) : (
                      'اللعبة جارية، لا يمكن تغيير الفرق الآن.'
                    )}
                  </p>
                  
                  <div className="inline-flex items-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-white/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{gameData.players?.length || 0}</div>
                      <div className="text-sm text-gray-600">لاعبين</div>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">500</div>
                      <div className="text-sm text-gray-600">كلمة</div>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">60</div>
                      <div className="text-sm text-gray-600">ثانية</div>
                    </div>
                  </div>
                  
                  {/* Team Switching Instructions */}
                  {gameData.status === 'waiting' && (
                    <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200 rounded-xl max-w-md mx-auto">
                      <div className="text-sm text-blue-700 font-medium">
                        💡 <span className="font-bold">تغيير الفريق:</span> انقر على زر "انضم" في الفريق الآخر للتبديل
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* RIGHT - Team 1 Rectangle */}
            <div className="lg:w-1/4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl shadow-lg h-[500px] flex flex-col">
                {/* Team Header */}
                <div className="bg-blue-200 rounded-t-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                    <h3 className="text-xl font-bold text-blue-800">الفريق 1</h3>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {gameData.teamA?.length || 0}
                    </span>
                  </div>
                </div>
                
                {/* Team Actions */}
                <div className="p-6 flex justify-center">
                  {playerTeam === 'A' ? (
                    <div className="space-y-3 w-full">

                      <button
                        onClick={() => handleSwitchTeam('B')}
                        className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                      >
                        انتقل إلى الفريق 2
                      </button>

                    </div>
                  ) : playerTeam === 'B' ? (
                    <button
                      onClick={() => handleSwitchTeam('A')}
                      className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                    >
                      {playerTeam ? 'انتقل إلى الفريق 1' : 'انضم للفريق 1'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinTeam('A')}
                      className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                    >
                      انضم للفريق 1
                    </button>
                  )}
                </div>
                
                {/* Players List */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {gameData.teamA?.length > 0 ? (
                    <ul className="space-y-3">
                      {gameData.players.filter(p => gameData.teamA.includes(p.id)).map(player => (
                        <li key={player.id} className={`flex items-center gap-3 p-3 rounded-xl shadow-sm ${
                          player.id === currentPlayerInGame?.id ? 'bg-blue-200 border-2 border-blue-400' : 'bg-white/80'
                        }`}>
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {player.name.charAt(0)}
                          </div>
                          <span className="font-medium text-blue-700">{player.name}</span>
                          {player.isHost && <span className="text-blue-600">👑</span>}
                          {player.id === currentPlayerInGame?.id && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">أنت</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-blue-300 text-5xl mb-3">👤</div>
                      <p className="text-blue-400 font-medium">لا يوجد لاعبين</p>
                    </div>
                  )}
                </div>
                
                {/* Hint Giver Section - Bottom */}
                <div className="border-t border-blue-300 p-4 bg-blue-100/50 rounded-b-2xl">
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-700 mb-1">معطي تلميح</div>
                    <div className="text-lg font-bold text-blue-800">
                      {gameData.teamA?.length > 0 ? 
                        (gameData.currentHintGiver && gameData.teamA.includes(gameData.currentHintGiver.id) ? 
                          gameData.currentHintGiver.name : 'لم يتم الاختيار') 
                        : '---'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}