import { GameRoom } from './gameRoom';

export class RoomManager {
  constructor() {
    this.rooms = new Map();
    
    // Only try to load rooms if we're on the client side
    if (typeof window !== 'undefined') {
      this.loadRooms(); // Load rooms from localStorage on initialization
      this.cleanupInterval = setInterval(() => this.cleanupRooms(), 5 * 60 * 1000);
    }
  }
  
  // Load rooms from localStorage
  loadRooms() {
    try {
      // Check if localStorage is available (client-side only)
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log('localStorage not available (server-side rendering)');
        return;
      }
      
      const storedRooms = localStorage.getItem('taboo_rooms');
      if (storedRooms) {
        const roomsData = JSON.parse(storedRooms);
        for (const [roomId, roomData] of Object.entries(roomsData)) {
          // Recreate GameRoom from stored data
          const room = new GameRoom(roomId, roomData.host);
          
          // Only copy properties that exist in GameRoom class
          Object.keys(roomData).forEach(key => {
            if (key !== 'createdAt' && key in room) {
              room[key] = roomData[key];
            }
          });
          
          room.createdAt = new Date(roomData.createdAt);
          this.rooms.set(roomId, room);
        }
        console.log(`Loaded ${this.rooms.size} rooms from localStorage`);
      }
    } catch (error) {
      console.error('Error loading rooms from localStorage:', error);
    }
  }
  
  // Save rooms to localStorage
  saveRooms() {
    try {
      // Check if localStorage is available (client-side only)
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      const roomsToSave = {};
      for (const [roomId, room] of this.rooms.entries()) {
        // Convert room to plain object, excluding methods
        const roomData = {
          id: room.id,
          host: room.host,
          players: room.players,
          teamA: room.teamA,
          teamB: room.teamB,
          currentTeam: room.currentTeam,
          currentPlayerIndex: room.currentPlayerIndex,
          usedWords: room.usedWords,
          currentWord: room.currentWord,
          score: room.score,
          gameState: room.gameState,
          timer: room.timer,
          maxPlayers: room.maxPlayers,
          minPlayers: room.minPlayers,
          currentHintGiver: room.currentHintGiver,
          words: room.words, // This might be large, but we need it for the game
          createdAt: room.createdAt.toISOString()
        };
        
        roomsToSave[roomId] = roomData;
      }
      localStorage.setItem('taboo_rooms', JSON.stringify(roomsToSave));
    } catch (error) {
      console.error('Error saving rooms to localStorage:', error);
    }
  }
  
  generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    
    for (let i = 0; i < 6; i++) {
      roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return roomId;
  }
  
  createRoom(hostName) {
    let roomId;
    let attempts = 0;
    
    do {
      roomId = this.generateRoomId();
      attempts++;
    } while (this.rooms.has(roomId) && attempts < 10);
    
    if (attempts >= 10) {
      throw new Error('Could not generate unique room ID');
    }
    
    const room = new GameRoom(roomId, hostName);
    this.rooms.set(roomId, room);
    this.saveRooms(); // Save after creating room
    
    console.log(`Created room ${roomId} for host ${hostName}`);
    return roomId;
  }
  
  getRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      return room;
    }
    
    // Try to load from localStorage if not found in memory
    this.loadRooms();
    return this.rooms.get(roomId);
  }
  
  joinRoom(roomId, playerName, playerId) {
    const room = this.getRoom(roomId);
    
    if (!room) {
      console.log(`Room ${roomId} not found. Available rooms:`, Array.from(this.rooms.keys()));
      throw new Error('Room not found');
    }
    
    const player = room.addPlayer(playerName, playerId);
    this.saveRooms(); // Save after adding player
    
    console.log(`Player ${playerName} joined room ${roomId}`);
    return player;
  }
  
  leaveRoom(roomId, playerId) {
    const room = this.getRoom(roomId);
    
    if (room) {
      room.removePlayer(playerId);
      
      // If room is empty, remove it
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
      
      this.saveRooms(); // Save after changes
    }
  }
  
  startGame(roomId) {
    const room = this.getRoom(roomId);
    
    if (!room) {
      throw new Error('Room not found');
    }
    
    room.startGame();
    this.saveRooms(); // Save after starting game
  }
  
  cleanupRooms() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.createdAt < oneHourAgo && room.gameState === 'waiting') {
        this.rooms.delete(roomId);
        console.log(`Cleaned up room ${roomId}`);
      }
    }
    
    this.saveRooms(); // Save after cleanup
  }
}

// Create a singleton instance
let roomManagerInstance = null;

export function getRoomManager() {
  if (!roomManagerInstance) {
    roomManagerInstance = new RoomManager();
  }
  return roomManagerInstance;
}

export const roomManager = getRoomManager();