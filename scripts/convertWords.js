const fs = require('fs');
const path = require('path');

function convertTextToJSON(content) {
  const words = [];
  const lines = content.split('\n');
  
  let currentWord = null;
  let currentTaboos = [];
  
  for (let line of lines) {
    line = line.trim();
    
    if (!line) {
      // Empty line means end of current word entry
      if (currentWord) {
        words.push({
          id: words.length + 1,
          word: currentWord,
          tabooWords: [...new Set(currentTaboos.filter(t => t))] // Remove duplicates and empty
        });
        currentWord = null;
        currentTaboos = [];
      }
      continue;
    }
    
    // Check if line starts with a number (new word entry)
    if (/^\d+\.\s/.test(line)) {
      if (currentWord) {
        words.push({
          id: words.length + 1,
          word: currentWord,
          tabooWords: [...new Set(currentTaboos.filter(t => t))]
        });
      }
      
      currentWord = line.replace(/^\d+\.\s/, '').trim();
      currentTaboos = [];
    } 
    // Check if line contains taboo words
    else if (line.includes('محظورات:')) {
      const tabooLine = line.replace('محظورات:', '').trim();
      const tabooList = tabooLine.split(/[،,]/).map(t => t.trim()).filter(t => t);
      currentTaboos.push(...tabooList);
    }
    // If line doesn't match patterns but we have a current word, assume it's more taboos
    else if (currentWord) {
      const extraTaboos = line.split(/[،,]/).map(t => t.trim()).filter(t => t);
      currentTaboos.push(...extraTaboos);
    }
  }
  
  // Add the last word if exists
  if (currentWord) {
    words.push({
      id: words.length + 1,
      word: currentWord,
      tabooWords: [...new Set(currentTaboos.filter(t => t))]
    });
  }
  
  return words;
}

// Read the text file
const txtPath = path.join(__dirname, '../public/talme7.txt');
const txtContent = fs.readFileSync(txtPath, 'utf8');

// Convert to JSON
const wordsArray = convertTextToJSON(txtContent);

// Write to JSON file
const jsonPath = path.join(__dirname, '../lib/words.json');
fs.writeFileSync(jsonPath, JSON.stringify(wordsArray, null, 2), 'utf8');

console.log(`✅ Converted ${wordsArray.length} words to JSON`);
console.log(`📁 Saved to: ${jsonPath}`);