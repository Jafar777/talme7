import  wordsService  from './wordsService';

export class GameRoom {
  constructor(roomId, hostName) {
    this.id = roomId;
    this.host = hostName;
    this.players = [];
    this.teamA = [];
    this.teamB = [];
    this.currentTeam = 'A';
    this.currentPlayerIndex = 0;
    this.words = [...wordsService.getAllWords()];
    this.usedWords = [];
    this.currentWord = null;
    this.score = { teamA: 0, teamB: 0 };
    this.gameState = 'waiting'; // waiting, playing, paused, finished
    this.timer = 60; // 60 seconds per turn
    this.maxPlayers = 12;
    this.minPlayers = 4;
    this.createdAt = new Date();
    this.currentHintGiver = null;
  }
  
  addPlayer(playerName, playerId) {
    if (this.players.length >= this.maxPlayers) {
      throw new Error('Room is full');
    }
    
    // Check if player already exists
    const existingPlayer = this.players.find(p => p.id === playerId);
    if (existingPlayer) {
      return existingPlayer;
    }
    
    const player = {
      id: playerId,
      name: playerName,
      team: null,
      isHost: this.players.length === 0,
      score: 0
    };
    
    this.players.push(player);
    return player;
  }
  
  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    
    // If host leaves, assign new host
    if (this.players.length > 0 && !this.players.some(p => p.isHost)) {
      this.players[0].isHost = true;
      this.host = this.players[0].name;
    }
    
    // Remove from teams
    this.teamA = this.teamA.filter(id => id !== playerId);
    this.teamB = this.teamB.filter(id => id !== playerId);
  }
  
  assignTeams() {
    // Reset teams
    this.teamA = [];
    this.teamB = [];
    
    // Assign teams to players
    this.players.forEach((player, index) => {
      if (index % 2 === 0) {
        player.team = 'A';
        this.teamA.push(player.id);
      } else {
        player.team = 'B';
        this.teamB.push(player.id);
      }
    });
  }
  
  startGame() {
    if (this.players.length < this.minPlayers) {
      throw new Error(`Need at least ${this.minPlayers} players to start`);
    }
    
    this.assignTeams();
    this.gameState = 'playing';
    this.currentTeam = 'A';
    this.currentPlayerIndex = 0;
    this.nextTurn();
  }
  
  nextTurn() {
    const currentTeamPlayers = this.currentTeam === 'A' ? this.teamA : this.teamB;
    
    if (currentTeamPlayers.length === 0) {
      console.error('No players in current team');
      return;
    }
    
    // Get next hint giver
    const currentPlayerId = currentTeamPlayers[this.currentPlayerIndex % currentTeamPlayers.length];
    this.currentHintGiver = this.players.find(p => p.id === currentPlayerId);
    
    // Get new word
    this.currentWord = this.getNextWord();
    
    // Reset timer
    this.timer = 60;
    
    this.currentPlayerIndex++;
    
    // If all players have had a turn, switch teams
    if (this.currentPlayerIndex >= currentTeamPlayers.length) {
      this.currentPlayerIndex = 0;
      this.currentTeam = this.currentTeam === 'A' ? 'B' : 'A';
    }
  }
  
  getNextWord() {
    // Remove used words from available pool
    const availableWords = this.words.filter(w => !this.usedWords.includes(w.id));
    
    if (availableWords.length === 0) {
      // Reset used words if all have been used
      this.usedWords = [];
      return this.words[0];
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const word = availableWords[randomIndex];
    this.usedWords.push(word.id);
    
    return word;
  }
  
  correctGuess() {
    this.score[`team${this.currentTeam}`] += 1;
    this.nextTurn();
  }
  
  skipWord() {
    // No points, just move to next word
    this.nextTurn();
  }
  
  tabooViolation() {
    // Other team gets a point
    const otherTeam = this.currentTeam === 'A' ? 'B' : 'A';
    this.score[`team${otherTeam}`] += 1;
    this.nextTurn();
  }
  
  getGameState() {
    return {
      id: this.id,
      host: this.host,
      players: this.players,
      teamA: this.teamA,
      teamB: this.teamB,
      currentTeam: this.currentTeam,
      currentWord: this.currentWord,
      score: this.score,
      gameState: this.gameState,
      timer: this.timer,
      currentHintGiver: this.currentHintGiver,
      currentPlayerIndex: this.currentPlayerIndex,
      usedWordsCount: this.usedWords.length,
      totalWords: this.words.length
    };
  }
}