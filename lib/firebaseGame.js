// C:\Users\jafar\Desktop\mamnoo3\lib\firebaseGame.js

import { db, auth } from './firebase';
import { 
  doc, setDoc, getDoc, updateDoc, arrayUnion, 
  onSnapshot, serverTimestamp, increment, arrayRemove 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import wordsService from './wordsService';

// REMOVE THIS LINE - it's causing the circular import:
// import { correctGuess, skipWord, endTurn, reportViolation } from '@/lib/firebaseGame';

// Generate 6-character room code
export function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new game room
export async function createGameRoom(playerName) {
  try {
    // 1. Sign in anonymously
    const userCred = await signInAnonymously(auth);
    const userId = userCred.user.uid;
    
    // 2. Generate room code
    const roomCode = generateRoomCode();
    
    // 3. Create game document
    await setDoc(doc(db, 'games', roomCode), {
      hostId: userId,
      hostName: playerName,
      status: 'waiting',
      players: [{ 
        id: userId, 
        name: playerName, 
        team: null, 
        isHost: true, 
        score: 0 
      }],
      teamA: [],
      teamB: [],
      currentTeam: 'A',
      currentPlayerIndex: 0,
      currentWord: null,
      score: { teamA: 0, teamB: 0 },
      maxPlayers: 12,
      minPlayers: 2,
      currentHintGiver: null,
      usedWords: [],
      remainingTime: 60,
      turnStartTime: null,
      createdAt: serverTimestamp()
    });
    
    // 4. Return room code and user info
    return {
      roomCode,
      userId,
      playerName
    };
    
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Join an existing game room
export async function joinGameRoom(roomCode, playerName) {
  try {
    // 1. Sign in anonymously
    const userCred = await signInAnonymously(auth);
    const userId = userCred.user.uid;
    
    // 2. Check if room exists
    const roomRef = doc(db, 'games', roomCode.toUpperCase());
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomSnap.data();
    
    // 3. Check if room is full
    if (roomData.players.length >= roomData.maxPlayers) {
      throw new Error('Room is full');
    }
    
    // 4. Check if player already exists
    const playerExists = roomData.players.some(p => p.id === userId);
    if (playerExists) {
      throw new Error('Player already in room');
    }
    
    // 5. Add player to room
    await updateDoc(roomRef, {
      players: arrayUnion({ 
        id: userId, 
        name: playerName, 
        team: null, 
        isHost: false, 
        score: 0 
      })
    });
    
    return {
      roomCode: roomCode.toUpperCase(),
      userId,
      playerName
    };
    
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

// Player chooses a team
export async function chooseTeam(roomCode, playerId, team) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  // Check if game has started
  if (roomData.status === 'playing') {
    throw new Error('Cannot change teams after game has started');
  }
  
  // Remove player from both teams first
  if (roomData.teamA && roomData.teamA.includes(playerId)) {
    await updateDoc(roomRef, {
      teamA: arrayRemove(playerId)
    });
  }
  
  if (roomData.teamB && roomData.teamB.includes(playerId)) {
    await updateDoc(roomRef, {
      teamB: arrayRemove(playerId)
    });
  }
  
  // Add player to chosen team
  if (team === 'A') {
    await updateDoc(roomRef, {
      teamA: arrayUnion(playerId)
    });
  } else if (team === 'B') {
    await updateDoc(roomRef, {
      teamB: arrayUnion(playerId)
    });
  }
  
  // Update player's team in players array
  const updatedPlayers = roomData.players.map(player => 
    player.id === playerId ? { ...player, team } : player
  );
  
  await updateDoc(roomRef, {
    players: updatedPlayers
  });
}

// Shuffle teams (host only)
export async function shuffleTeams(roomCode) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  // Check if game has started
  if (roomData.status === 'playing') {
    throw new Error('Cannot shuffle teams after game has started');
  }
  
  const players = roomData.players || [];
  
  // Reset teams
  const teamA = [];
  const teamB = [];
  
  // Randomly assign teams
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  
  shuffledPlayers.forEach((player, index) => {
    const team = index % 2 === 0 ? 'A' : 'B';
    if (team === 'A') {
      teamA.push(player.id);
    } else {
      teamB.push(player.id);
    }
    
    // Update player's team
    player.team = team;
  });
  
  await updateDoc(roomRef, {
    teamA,
    teamB,
    players: shuffledPlayers
  });
}

// Start the game
export async function startGame(roomCode) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  // Check if we have enough players
  if (roomData.players.length < 2) {
    throw new Error('Need at least 2 players to start');
  }
  
  // Auto-assign teams if not already assigned
  let teamA = roomData.teamA || [];
  let teamB = roomData.teamB || [];
  
  if (teamA.length === 0 && teamB.length === 0) {
    // Split players into two teams
    const shuffledPlayers = [...roomData.players].sort(() => Math.random() - 0.5);
    
    shuffledPlayers.forEach((player, index) => {
      const team = index % 2 === 0 ? 'A' : 'B';
      if (team === 'A') {
        teamA.push(player.id);
      } else {
        teamB.push(player.id);
      }
      
      // Update player's team
      player.team = team;
    });
  }
  
  // Check each team has at least 1 player
  if (teamA.length === 0 || teamB.length === 0) {
    throw new Error('Each team must have at least 1 player');
  }
  
  // Get first word
  const firstWord = wordsService.getRandomWord(roomData.usedWords || []);
  
  // Set first hint giver (first player in Team A)
  const firstHintGiverId = teamA[0];
  const firstHintGiver = roomData.players.find(p => p.id === firstHintGiverId);
  
  // Update game state
  await updateDoc(roomRef, {
    status: 'playing',
    teamA,
    teamB,
    players: roomData.players.map(p => ({
      ...p,
      team: p.team || (teamA.includes(p.id) ? 'A' : teamB.includes(p.id) ? 'B' : null)
    })),
    currentTeam: 'A',
    currentHintGiver: {
      id: firstHintGiverId,
      name: firstHintGiver?.name || 'لاعب'
    },
    currentWord: firstWord,
    usedWords: arrayUnion(firstWord.word),
    score: { teamA: 0, teamB: 0 },
    remainingTime: 60,
    turnStartTime: serverTimestamp()
  });
}

// Become hint giver
export async function becomeHintGiver(roomCode, playerId) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  if (roomData.status !== 'playing') {
    throw new Error('Game is not playing');
  }
  
  const player = roomData.players.find(p => p.id === playerId);
  
  if (!player) {
    throw new Error('Player not found');
  }
  
  // Check if player is in current team
  const playerTeam = roomData.teamA.includes(playerId) ? 'A' : 
                     roomData.teamB.includes(playerId) ? 'B' : null;
  
  if (playerTeam !== roomData.currentTeam) {
    throw new Error('You are not in the current playing team');
  }
  
  await updateDoc(roomRef, {
    currentHintGiver: {
      id: playerId,
      name: player.name
    }
  });
}

// Correct guess
export async function correctGuess(roomCode) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  if (roomData.status !== 'playing') {
    throw new Error('Game is not playing');
  }
  
  // Increment score
  const scoreField = `score.team${roomData.currentTeam}`;
  
  // Get next word
  const nextWord = wordsService.getRandomWord(roomData.usedWords || []);
  
  await updateDoc(roomRef, {
    [scoreField]: increment(1),
    currentWord: nextWord,
    usedWords: arrayUnion(nextWord.word)
  });
}

// Skip word
export async function skipWord(roomCode) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  if (roomData.status !== 'playing') {
    throw new Error('Game is not playing');
  }
  
  // Get next word
  const nextWord = wordsService.getRandomWord(roomData.usedWords || []);
  
  await updateDoc(roomRef, {
    currentWord: nextWord,
    usedWords: arrayUnion(nextWord.word)
  });
}

// End turn (switch to other team)
export async function endTurn(roomCode) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  if (roomData.status !== 'playing') {
    throw new Error('Game is not playing');
  }
  
  // Switch teams
  const nextTeam = roomData.currentTeam === 'A' ? 'B' : 'A';
  const nextTeamPlayers = nextTeam === 'A' ? roomData.teamA : roomData.teamB;
  
  if (nextTeamPlayers.length === 0) {
    throw new Error('No players in next team');
  }
  
  // Get next hint giver (rotate within team)
  let nextHintGiverId;
  const currentHintGiverId = roomData.currentHintGiver?.id;
  
  if (currentHintGiverId && nextTeamPlayers.includes(currentHintGiverId)) {
    // Current hint giver is in next team, keep them or move to next
    const currentIndex = nextTeamPlayers.indexOf(currentHintGiverId);
    const nextIndex = (currentIndex + 1) % nextTeamPlayers.length;
    nextHintGiverId = nextTeamPlayers[nextIndex];
  } else {
    // Start with first player in team
    nextHintGiverId = nextTeamPlayers[0];
  }
  
  const nextHintGiver = roomData.players.find(p => p.id === nextHintGiverId);
  
  // Get new word for next team
  const nextWord = wordsService.getRandomWord(roomData.usedWords || []);
  
  await updateDoc(roomRef, {
    currentTeam: nextTeam,
    currentHintGiver: {
      id: nextHintGiverId,
      name: nextHintGiver?.name || 'لاعب'
    },
    currentWord: nextWord,
    usedWords: arrayUnion(nextWord.word),
    remainingTime: 60,
    turnStartTime: serverTimestamp()
  });
}

// Violation (other team gets point)
export async function reportViolation(roomCode) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  if (roomData.status !== 'playing') {
    throw new Error('Game is not playing');
  }
  
  // Other team gets point
  const otherTeam = roomData.currentTeam === 'A' ? 'B' : 'A';
  const scoreField = `score.team${otherTeam}`;
  
  // Get next word
  const nextWord = wordsService.getRandomWord(roomData.usedWords || []);
  
  await updateDoc(roomRef, {
    [scoreField]: increment(1),
    currentWord: nextWord,
    usedWords: arrayUnion(nextWord.word)
  });
}

// Listen to real-time game updates
export function subscribeToGame(roomCode, callback) {
  const roomRef = doc(db, 'games', roomCode);
  
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback(null);
    }
  });
}

// Leave game
export async function leaveGame(roomCode, playerId) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    return; // Room already deleted
  }
  
  const roomData = roomSnap.data();
  
  // Remove player from players array
  const updatedPlayers = roomData.players.filter(p => p.id !== playerId);
  
  // Remove player from teams
  const updatedTeamA = roomData.teamA.filter(id => id !== playerId);
  const updatedTeamB = roomData.teamB.filter(id => id !== playerId);
  
  // If host leaves and there are other players, assign new host
  let updates = {
    players: updatedPlayers,
    teamA: updatedTeamA,
    teamB: updatedTeamB
  };
  
  if (roomData.hostId === playerId && updatedPlayers.length > 0) {
    updates.hostId = updatedPlayers[0].id;
    updates.hostName = updatedPlayers[0].name;
    updatedPlayers[0].isHost = true;
  }
  
  // If no players left, delete the room
  if (updatedPlayers.length === 0) {
    // In a real app, you'd delete the document here
    // await deleteDoc(roomRef);
    return;
  }
  
  await updateDoc(roomRef, updates);
}


// Kick a player (host only)
export async function kickPlayer(roomCode, hostId, playerIdToKick) {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  
  // Check if the requester is the host
  if (roomData.hostId !== hostId) {
    throw new Error('Only the host can kick players');
  }
  
  // Check if trying to kick themselves
  if (playerIdToKick === hostId) {
    throw new Error('Host cannot kick themselves');
  }
  
  // Check if player exists in the game
  const playerExists = roomData.players.some(p => p.id === playerIdToKick);
  if (!playerExists) {
    throw new Error('Player not found in this room');
  }
  
  // Remove player from players array
  const updatedPlayers = roomData.players.filter(p => p.id !== playerIdToKick);
  
  // Remove player from teams
  const updatedTeamA = roomData.teamA.filter(id => id !== playerIdToKick);
  const updatedTeamB = roomData.teamB.filter(id => id !== playerIdToKick);
  
  // Prepare update object
  const updates = {
    players: updatedPlayers,
    teamA: updatedTeamA,
    teamB: updatedTeamB
  };
  
  // Handle special cases if game is playing
  if (roomData.status === 'playing') {
    // If kicked player was the current hint giver, assign new one
    if (roomData.currentHintGiver?.id === playerIdToKick) {
      const currentTeam = roomData.currentTeam;
      const currentTeamPlayers = currentTeam === 'A' ? updatedTeamA : updatedTeamB;
      
      if (currentTeamPlayers.length > 0) {
        const newHintGiverId = currentTeamPlayers[0];
        const newHintGiver = updatedPlayers.find(p => p.id === newHintGiverId);
        
        updates.currentHintGiver = {
          id: newHintGiverId,
          name: newHintGiver?.name || 'لاعب'
        };
      } else {
        // No players left in current team, switch teams
        const otherTeam = currentTeam === 'A' ? 'B' : 'A';
        const otherTeamPlayers = otherTeam === 'A' ? updatedTeamA : updatedTeamB;
        
        if (otherTeamPlayers.length > 0) {
          updates.currentTeam = otherTeam;
          const newHintGiverId = otherTeamPlayers[0];
          const newHintGiver = updatedPlayers.find(p => p.id === newHintGiverId);
          
          updates.currentHintGiver = {
            id: newHintGiverId,
            name: newHintGiver?.name || 'لاعب'
          };
        } else {
          // No players left at all, end game
          updates.status = 'waiting';
          updates.currentHintGiver = null;
          updates.currentWord = null;
        }
      }
    }
    
    // If kicked player was in current team and there are no players left in that team
    const kickedPlayerTeam = updatedTeamA.includes(playerIdToKick) ? 'A' : 
                           updatedTeamB.includes(playerIdToKick) ? 'B' : null;
    
    if (kickedPlayerTeam === roomData.currentTeam) {
      const currentTeamPlayers = kickedPlayerTeam === 'A' ? updatedTeamA : updatedTeamB;
      if (currentTeamPlayers.length === 0) {
        // Switch to other team
        const otherTeam = kickedPlayerTeam === 'A' ? 'B' : 'A';
        const otherTeamPlayers = otherTeam === 'A' ? updatedTeamA : updatedTeamB;
        
        if (otherTeamPlayers.length > 0) {
          updates.currentTeam = otherTeam;
          const newHintGiverId = otherTeamPlayers[0];
          const newHintGiver = updatedPlayers.find(p => p.id === newHintGiverId);
          
          updates.currentHintGiver = {
            id: newHintGiverId,
            name: newHintGiver?.name || 'لاعب'
          };
        } else {
          // No players left in either team, end game
          updates.status = 'waiting';
          updates.currentTeam = 'A';
          updates.currentHintGiver = null;
          updates.currentWord = null;
        }
      }
    }
  }
  
  await updateDoc(roomRef, updates);
  
  return { kickedPlayerId: playerIdToKick };
}