// C:\Users\jafar\Desktop\mamnoo3\lib\wordsService.js

// First, make sure your words.json has the right structure:
// [
//   {
//     "word": "مدرسة",
//     "tabooWords": ["تعليم", "طلاب", "معلم", "صف", "كتاب"]
//   },
//   ...
// ]

import words from './words.json';

class WordsService {
  constructor() {
    this.allWords = words;
  }

  // Get a random word that hasn't been used
  getRandomWord(usedWords = []) {
    if (!this.allWords || this.allWords.length === 0) {
      console.error('No words loaded in words.json');
      return {
        word: "مثال",
        tabooWords: ["كلمة", "مرادف", "معنى", "تعريف", "مفهوم"]
      };
    }
    
    const availableWords = this.allWords.filter(
      word => !usedWords.includes(word.word)
    );
    
    if (availableWords.length === 0) {
      // Reset if all words used
      return this.allWords[0];
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    return availableWords[randomIndex];
  }

  // Get multiple random words
  getRandomWords(count, usedWords = []) {
    const results = [];
    for (let i = 0; i < count; i++) {
      const word = this.getRandomWord([...usedWords, ...results.map(w => w.word)]);
      if (!word) break;
      results.push(word);
    }
    return results;
  }

  // Get all words
  getAllWords() {
    return this.allWords;
  }
}

export default new WordsService();