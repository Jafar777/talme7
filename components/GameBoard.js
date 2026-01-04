"use client";

import { useState, useEffect } from 'react';
import { correctGuess } from '@/lib/firebaseGame';

export default function GameBoard({ gameData, player, roomCode }) {
  const [timer, setTimer] = useState(60);
  const [showWord, setShowWord] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Timer logic
  useEffect(() => {
    if (gameData?.status === 'playing' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameData?.status]);

  const isHintGiver = player?.id === gameData?.currentHintGiver?.id;
  const isInCurrentTeam = player?.team === gameData?.currentTeam;

  const handleCorrectGuess = async () => {
    if (isHintGiver) {
      try {
        await correctGuess(roomCode, gameData.currentTeam);
        setActionMessage('نقطة للفريق! ✓');
        setTimeout(() => setActionMessage(''), 2000);
      } catch (error) {
        console.error('Error updating score:', error);
      }
    }
  };

  const handleSkip = async () => {
    // Implement skip logic
  };

  const handleViolation = async () => {
    // Implement violation logic
  };

  if (!gameData?.currentWord) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h3 className="text-xl font-bold text-foreground mb-2">استعد للبدء</h3>
        <p className="text-foreground/60">انتظر حتى يبدأ صاحب الغرفة الجولة</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
      {/* Timer and Team Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl font-bold ${gameData.currentTeam === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
            فريق {gameData.currentTeam}
          </div>
          <div className="text-sm text-foreground/60">
            معطي التلميح: {gameData.currentHintGiver?.name}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-bold ${timer > 10 ? 'text-primary' : 'text-red-600'}`}>
            {timer}
          </div>
          <div className="text-sm text-foreground/60">ثانية متبقية</div>
        </div>
      </div>

      {/* Main Word Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-primary/20 mb-6 text-center">
        {showWord || isHintGiver ? (
          <>
            <div className="text-sm text-foreground/60 mb-2">الكلمة المستهدفة</div>
            <div className="text-4xl font-bold text-primary mb-8">
              {gameData.currentWord.word}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-sm text-foreground/60 mb-3">الكلمات الممنوعة</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {gameData.currentWord.tabooWords.map((taboo, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium"
                  >
                    {taboo}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {isInCurrentTeam ? 'احزر الكلمة!' : 'راقب اللاعبين'}
            </h3>
            <p className="text-foreground/60 mb-6">
              {isInCurrentTeam 
                ? 'استمع جيداً للتلميحات من زميلك'
                : 'راقب الفريق الآخر لاكتشاف أي مخالفة للقواعد'}
            </p>
            <button
              onClick={() => setShowWord(true)}
              className="px-6 py-2 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 transition-all duration-200"
            >
              عرض الكلمة (للمشاهدين)
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {actionMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isHintGiver ? (
          <>
            <button
              onClick={handleCorrectGuess}
              className="col-span-2 md:col-span-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              ✓ نجاح
            </button>
            <button
              onClick={handleSkip}
              className="col-span-2 md:col-span-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              ⏭️ تخطي
            </button>
            <div className="col-span-2 md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <div className="text-sm text-blue-700">أنت معطي التلميحات</div>
              <div className="text-xs text-blue-600/70 mt-1">اجعل فريقك يخمن الكلمة دون استخدام الكلمات الممنوعة</div>
            </div>
          </>
        ) : !isInCurrentTeam ? (
          <button
            onClick={handleViolation}
            className="col-span-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200"
          >
            ⚠️ مخالفة! (اضغط هنا عند استخدام كلمة ممنوعة)
          </button>
        ) : (
          <div className="col-span-2 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
            <div className="text-sm text-green-700">استمع واخمن الكلمة!</div>
            <div className="text-xs text-green-600/70 mt-1">يمكنك التحدث مع فريقك للمساعدة في التخمين</div>
          </div>
        )}
      </div>
    </div>
  );
}