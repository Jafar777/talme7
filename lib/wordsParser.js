import fs from 'fs';
import path from 'path';

export function parseWordsFromTxt(content) {
  const words = [];
  const lines = content.split('\n');
  
  let currentWord = null;
  let currentTaboos = [];
  
  for (let line of lines) {
    line = line.trim();
    
    if (!line) continue;
    
    // Check if line starts with a number (new word entry)
    if (/^\d+\.\s/.test(line)) {
      // Save previous word if exists
      if (currentWord) {
        words.push({
          id: words.length + 1,
          word: currentWord,
          tabooWords: [...new Set(currentTaboos)] // Remove duplicates
        });
      }
      
      // Start new word
      currentWord = line.replace(/^\d+\.\s/, '').trim();
      currentTaboos = [];
    } 
    // Check if line contains taboo words
    else if (line.startsWith('محظورات:')) {
      const tabooLine = line.replace('محظورات:', '').trim();
      const tabooList = tabooLine.split('،').map(t => t.trim()).filter(t => t);
      currentTaboos = [...currentTaboos, ...tabooList];
    }
    // If line doesn't match patterns but we have a current word, add to taboos
    else if (currentWord) {
      const extraTaboos = line.split('،').map(t => t.trim()).filter(t => t);
      currentTaboos = [...currentTaboos, ...extraTaboos];
    }
  }
  
  // Add the last word
  if (currentWord) {
    words.push({
      id: words.length + 1,
      word: currentWord,
      tabooWords: [...new Set(currentTaboos)]
    });
  }
  
  return words;
}