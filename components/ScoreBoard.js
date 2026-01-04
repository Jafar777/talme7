"use client";

export default function ScoreBoard({ score, currentTeam }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
      <h3 className="text-xl font-bold text-foreground mb-4">النتيجة</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Team A Score */}
        <div className={`p-4 rounded-xl border-2 ${
          currentTeam === 'A' 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-blue-200 bg-blue-50/50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-bold text-blue-700">الفريق أ</span>
            </div>
            {currentTeam === 'A' && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">نشط</span>
            )}
          </div>
          <div className="text-4xl font-bold text-center text-blue-700">{score.teamA}</div>
          <div className="text-xs text-center text-blue-600/70 mt-1">نقطة</div>
        </div>

        {/* Team B Score */}
        <div className={`p-4 rounded-xl border-2 ${
          currentTeam === 'B' 
            ? 'border-red-400 bg-red-50' 
            : 'border-red-200 bg-red-50/50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-bold text-red-700">الفريق ب</span>
            </div>
            {currentTeam === 'B' && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">نشط</span>
            )}
          </div>
          <div className="text-4xl font-bold text-center text-red-700">{score.teamB}</div>
          <div className="text-xs text-center text-red-600/70 mt-1">نقطة</div>
        </div>
      </div>

      {/* Score Difference */}
      <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl text-center">
        <div className="text-sm font-medium text-foreground mb-1">الفرق بين الفريقين</div>
        <div className={`text-xl font-bold ${
          score.teamA === score.teamB 
            ? 'text-foreground' 
            : score.teamA > score.teamB 
              ? 'text-blue-600' 
              : 'text-red-600'
        }`}>
          {Math.abs(score.teamA - score.teamB)} نقطة
          {score.teamA === score.teamB 
            ? ' (تعادل)' 
            : score.teamA > score.teamB 
              ? ' لصالح الفريق أ' 
              : ' لصالح الفريق ب'}
        </div>
      </div>
    </div>
  );
}