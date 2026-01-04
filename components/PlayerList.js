"use client";

export default function PlayerList({ 
  players, 
  currentPlayer, 
  teamA, 
  teamB, 
  currentHintGiver,
  onKickPlayer,  // Add this prop
  isHost  // Add this prop
}) {
  const getTeamPlayers = (team) => {
    const teamIds = team === 'A' ? teamA : teamB;
    return players.filter(player => teamIds.includes(player.id));
  };

  const getPlayerTeam = (playerId) => {
    if (teamA.includes(playerId)) return 'A';
    if (teamB.includes(playerId)) return 'B';
    return null;
  };

  // Function to render player item with kick button
  const renderPlayerItem = (player, teamColor) => {
    const isCurrentPlayer = player.id === currentPlayer?.id;
    const isHintGiver = currentHintGiver?.id === player.id;
    const isPlayerHost = player.isHost;
    
    return (
      <div 
        key={player.id}
        className={`flex items-center justify-between p-3 rounded-xl border ${
          isCurrentPlayer 
            ? `${teamColor === 'blue' ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-300'}` 
            : `${teamColor === 'blue' ? 'bg-blue-50/50 border-blue-200' : 'bg-red-50/50 border-red-200'}`
        } ${isHintGiver ? 'ring-2 ring-blue-400' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${teamColor === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'} flex items-center justify-center font-bold`}>
            {player.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{player.name}</div>
            {isPlayerHost && (
              <div className="text-xs text-foreground/60">👑 صاحب الغرفة</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isHintGiver && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              معطي تلميح
            </span>
          )}
          
          {/* Kick button - only show if current user is host and player is not themselves */}
          {isHost && !isPlayerHost && player.id !== currentPlayer?.id && (
            <button
              onClick={() => onKickPlayer(player.id)}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-all duration-200"
              title="طرد اللاعب"
            >
              طرد
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 h-fit">
      <h3 className="text-xl font-bold text-foreground mb-4">اللاعبون ({players.length})</h3>
      
      <div className="space-y-6">
        {/* Team A */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h4 className="font-bold text-blue-700">الفريق أ</h4>
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {getTeamPlayers('A').length}
            </span>
          </div>
          
          <div className="space-y-2">
            {getTeamPlayers('A').map(player => renderPlayerItem(player, 'blue'))}
          </div>
        </div>

        {/* Team B */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h4 className="font-bold text-red-700">الفريق ب</h4>
            <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {getTeamPlayers('B').length}
            </span>
          </div>
          
          <div className="space-y-2">
            {getTeamPlayers('B').map(player => renderPlayerItem(player, 'red'))}
          </div>
        </div>

        {/* Unassigned Players (waiting for game to start) */}
        {players.filter(p => !getPlayerTeam(p.id)).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <h4 className="font-bold text-gray-700">في انتظار التوزيع</h4>
            </div>
            
            <div className="space-y-2">
              {players.filter(p => !getPlayerTeam(p.id)).map(player => {
                const isCurrentPlayer = player.id === currentPlayer?.id;
                const isPlayerHost = player.isHost;
                
                return (
                  <div 
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                        {player.name.charAt(0)}
                      </div>
                      <div className="font-medium">{player.name}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isPlayerHost && (
                        <div className="text-xs text-foreground/60">👑 صاحب الغرفة</div>
                      )}
                      
                      {/* Kick button for unassigned players */}
                      {isHost && !isPlayerHost && player.id !== currentPlayer?.id && (
                        <button
                          onClick={() => onKickPlayer(player.id)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-all duration-200"
                          title="طرد اللاعب"
                        >
                          طرد
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-foreground/60 mb-2">مفاتيح الألوان:</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">الفريق أ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">الفريق ب</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-blue-400"></div>
            <span className="text-xs">معطي تلميح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs">👑</div>
            <span className="text-xs">صاحب الغرفة</span>
          </div>
          {isHost && (
            <div className="flex items-center gap-2 col-span-2">
              <div className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">طرد</div>
              <span className="text-xs">زر طرد اللاعب (للإداريين فقط)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}