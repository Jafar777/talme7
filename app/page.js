"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  
  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isRulesOpen) {
        setIsRulesOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isRulesOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isRulesOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isRulesOpen]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-100/30 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Rules Modal */}
      {isRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-white to-amber-50/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-white/30">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm px-6 py-4 border-b border-white/40">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">قواعد اللعبة</h2>
                <button
                  onClick={() => setIsRulesOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-white/40 shadow-md flex items-center justify-center text-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="إغلاق القواعد"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 md:p-8 max-h-[calc(85vh-80px)]">
              <div className="space-y-6 text-foreground/90 leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold mb-3 text-primary">إعداد اللعبة:</h3>
                  <ul className="list-disc pr-5 space-y-2">
                    <li>يتم تقسيم ستة لاعبين أو أكثر إلى فريقين، يُشار إلى أحدهما باسم الفريق أ والآخر باسم الفريق ب.</li>
                    <li>توضع 500 بطاقات في حامل البطاقات، ويختار الفريق أ شخصًا من مجموعته ليكون مُعطي التلميح.</li>
                    <li>يأخذ هذا الشخص حامل البطاقات ويضع البطاقة الأولى بعيدًا عن فريقه بحيث لا يتمكنون من رؤيتها.</li>
                  </ul>
                  <p className="mt-3">
                    تحتوي بطاقات التلميح على كلمة التلميح في أعلى البطاقة، وتُدرج الكلمات المحظورة أسفل كلمة التلميح. يبدأ مُعطو التلميح اللعب، ويتولّون تشغيل المؤقّت، ويجب عليهم جعل فريقهم ينطق كلمة التخمين الموجودة على البطاقة دون استخدام أي من الكلمات المحظورة في تلميحاتهم. إذا تم استخدام كلمة محظورة، يجب على الفريق ب الضغط على الجرس، مما يعاقب الفريق أ بوضع بطاقة التخمين الحالية في كومة البطاقات المستبعَدة.
                  </p>
                  <p className="mt-3">
                    يستمر اللعب حتى ينتهي الوقت. في كل مرة ينجح أحد أعضاء الفريق في تخمين كلمة التلميح بنجاح، توضع بطاقة جديدة فوق السابقة، وتمثّل كل بطاقة في هذه الكومة نقطة واحدة للفريق أ.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-primary">طريقة اللعب وتسجيل النقاط:</h3>
                  <ul className="list-disc pr-5 space-y-2">
                    <li>يجب على الفريق الذي لا يعطي التلميحات مراقبة أي استخدام للكلمات المحظورة أو أي مخالفة أخرى للقواعد.</li>
                    <li>إذا نجحوا في اكتشاف مخالفة، يمكنهم استخدام الجرس لإيقاف اللعب وشرح المخالفة بإيجاز شديد.</li>
                    <li>عندها يجب على مُعطي التلميح وضع البطاقة الحالية في كومة البطاقات المستبعَدة وسحب بطاقة جديدة.</li>
                    <li>تمثّل كل بطاقة في كومة البطاقات المستبعَدة نقطة واحدة للفريق الآخر.</li>
                    <li>عند انتهاء الوقت، يتم تبديل الفرق وعكس الأدوار.</li>
                    <li>تنتهي اللعبة بعد أن يأخذ كل لاعب دوره كمُعطي تلميح.</li>
                    <li>وإذا كان عدد اللاعبين في الفريقين غير متساوٍ، فإن لاعبًا من الفريق الأصغر سيكون مُعطي تلميح مرتين.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-primary">القواعد:</h3>
                  <ul className="list-disc pr-5 space-y-2">
                    <li>لا يجوز لمُعطي التلميح استخدام أي من الكلمات المحظورة، بما في ذلك الاختصارات أو أي جزء من الكلمة المحظورة.</li>
                    <li>لا يجوز لمُعطي التلميح استخدام المؤثرات الصوتية أو الإشارات الجسدية للدلالة على كلمة التلميح.</li>
                    <li>يجوز لمُعطي التلميح تجاوز أي بطاقة في أي وقت، ولكن يتم حينها وضع البطاقة في كومة البطاقات المستبعَدة.</li>
                    <li>عند الإعلان عن انتهاء الوقت، لا توضع البطاقة الأخيرة في كومة البطاقات المستبعَدة، بل تُزال من اللعب.</li>
                  </ul>
                </div>
              </div>

              {/* Quick Tips Section */}
              <div className="mt-8 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20 mb-10">
                <h4 className="font-bold text-lg mb-2 text-foreground">نصائح سريعة:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>استخدم مرادفات الكلمات المحظورة</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>كن مبدعًا في اختيار التلميحات</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>تعاون مع فريقك للفهم السريع</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>استمع جيدًا لخصومك لاكتشاف المخالفات</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent px-6 py-4 text-center">
              <button
                onClick={() => setIsRulesOpen(false)}
                className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg"
              >
                فهمت، لنبدأ اللعب!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl"></div>
        
        {/* Floating word bubbles - decorative elements */}
        {['كلمة', 'لعبة', 'فريق', 'تحدي', 'ممنوع', 'نقاط'].map((word, idx) => (
          <div 
            key={idx}
            className="absolute opacity-5"
            style={{
              top: `${10 + idx * 15}%`,
              left: `${5 + idx * 12}%`,
              transform: `rotate(${idx * 15}deg)`,
              fontSize: `${3 + idx * 0.5}rem`,
              fontWeight: 'bold'
            }}
          >
            {word}
          </div>
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center space-y-12 md:space-y-16">
        
        {/* Logo/Title section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent leading-tight tracking-tight ">
              تلميح
            </h1>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-full blur-sm"></div>
          </div>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground/90">
              لعبة الكلمات الممنوعة
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed px-4">
              تحدَّ أصدقاءك في لعبة الذكاء والسرعة! احزر الكلمة دون استخدام الكلمات الممنوعة. 
              هل تستطيع الفوز قبل انتهاء الوقت؟
            </p>
          </div>
        </div>

        {/* Game stats or features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl">
          {[
            { title: 'لعبة جماعية', desc: '4-12 لاعبين', icon: '👥' },
            { title: 'وقت سريع', desc: 'جولات 3 دقائق', icon: '⏱️' },
            { title: 'كلمات متجددة', desc: 'أكثر من 1000 كلمة', icon: '📚' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-1 text-foreground">{feature.title}</h3>
              <p className="text-foreground/60 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Main CTA Button */}
        <div className="relative group animate-bounce-slow">
          <div className="absolute -inset-3 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition duration-500"></div>
<Link 
  href="/create-game" 
  className="relative px-12 py-5 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white font-bold text-xl md:text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 min-w-[280px]"
>
  <span>إنشاء لعبة جديدة</span>
  <span className="text-2xl animate-pulse-slow">🎮</span>
</Link>
        </div>

        {/* Additional options */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
<Link 
  href="/join-game"
  className="px-8 py-3 bg-white/80 backdrop-blur-sm rounded-xl text-foreground font-medium border border-white/40 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white"
>
  الانضمام إلى لعبة
</Link>
          <button 
            onClick={() => setIsRulesOpen(true)}
            className="px-8 py-3 bg-white/80 backdrop-blur-sm rounded-xl text-foreground font-medium border border-white/40 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white flex items-center justify-center gap-2"
          >
            <span>قواعد اللعبة</span>
            <span className="text-lg">📖</span>
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-white/30 text-center">
          <p className="text-foreground/50 text-sm">
            استمتع بلعب <span className="font-semibold text-primary">ممنوع</span> مع أصدقائك من أي مكان في العالم!
          </p>
        </div>

      </div>
    </main>
  );
}