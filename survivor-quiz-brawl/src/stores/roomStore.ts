import { create } from 'zustand';
import type { Room, RoomPlayer, RoomSettings, LeaderboardEntry } from '../types/room';

interface RoomState {
  // Current room
  currentRoom: Room | null;
  isHost: boolean;
  localPlayerId: string | null;

  // Connection state
  isConnecting: boolean;
  isConnected: boolean;
  connectionError: string | null;

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // Actions
  createRoom: (hostName: string, quizSetId: string, settings: RoomSettings) => Room;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;

  // Room management
  setRoom: (room: Room | null) => void;
  updateRoomStatus: (status: Room['status']) => void;
  updateRoomSettings: (settings: Partial<RoomSettings>) => void;

  // Player management
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<RoomPlayer>) => void;
  setPlayerReady: (playerId: string, isReady: boolean) => void;

  // Local player
  setLocalPlayerId: (id: string) => void;
  updateLocalPlayerState: (updates: Partial<RoomPlayer>) => void;

  // Game actions
  startGame: () => void;
  endGame: () => void;

  // Leaderboard
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;

  // Connection
  setConnecting: (isConnecting: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setConnectionError: (error: string | null) => void;

  // Reset
  resetRoom: () => void;
}

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  isHost: false,
  localPlayerId: null,
  isConnecting: false,
  isConnected: false,
  connectionError: null,
  leaderboard: [],

  createRoom: (hostName: string, quizSetId: string, settings: RoomSettings) => {
    const hostId = crypto.randomUUID();
    const room: Room = {
      id: crypto.randomUUID(),
      code: generateRoomCode(),
      hostId,
      hostName,
      quizSetId,
      status: 'waiting',
      players: [
        {
          id: hostId,
          name: hostName,
          isReady: true,
          isConnected: true,
          score: 0,
          level: 1,
          isAlive: true,
          correctAnswers: 0,
          totalAnswers: 0,
        },
      ],
      settings,
      createdAt: Date.now(),
    };

    set({
      currentRoom: room,
      isHost: true,
      localPlayerId: hostId,
      isConnected: true,
    });

    return room;
  },

  joinRoom: (roomCode: string, playerName: string) => {
    const playerId = crypto.randomUUID();
    const player: RoomPlayer = {
      id: playerId,
      name: playerName,
      isReady: false,
      isConnected: true,
      score: 0,
      level: 1,
      isAlive: true,
      correctAnswers: 0,
      totalAnswers: 0,
    };

    set({
      localPlayerId: playerId,
      isConnecting: true,
    });

    // The actual room join will be handled by Ably
    // This just sets up the local player state
  },

  leaveRoom: () => {
    get().resetRoom();
  },

  setRoom: (room: Room | null) => {
    set({ currentRoom: room });
  },

  updateRoomStatus: (status: Room['status']) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        status,
        startedAt: status === 'playing' ? Date.now() : currentRoom.startedAt,
        endedAt: status === 'finished' ? Date.now() : currentRoom.endedAt,
      },
    });
  },

  updateRoomSettings: (settings: Partial<RoomSettings>) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        settings: { ...currentRoom.settings, ...settings },
      },
    });
  },

  addPlayer: (player: RoomPlayer) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        players: [...currentRoom.players, player],
      },
    });
  },

  removePlayer: (playerId: string) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        players: currentRoom.players.filter((p) => p.id !== playerId),
      },
    });
  },

  updatePlayer: (playerId: string, updates: Partial<RoomPlayer>) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        players: currentRoom.players.map((p) =>
          p.id === playerId ? { ...p, ...updates } : p
        ),
      },
    });
  },

  setPlayerReady: (playerId: string, isReady: boolean) => {
    get().updatePlayer(playerId, { isReady });
  },

  setLocalPlayerId: (id: string) => {
    set({ localPlayerId: id });
  },

  updateLocalPlayerState: (updates: Partial<RoomPlayer>) => {
    const { localPlayerId } = get();
    if (!localPlayerId) return;
    get().updatePlayer(localPlayerId, updates);
  },

  startGame: () => {
    get().updateRoomStatus('playing');
  },

  endGame: () => {
    get().updateRoomStatus('finished');
  },

  updateLeaderboard: (entries: LeaderboardEntry[]) => {
    set({ leaderboard: entries });
  },

  setConnecting: (isConnecting: boolean) => set({ isConnecting }),

  setConnected: (isConnected: boolean) => set({ isConnected, isConnecting: false }),

  setConnectionError: (error: string | null) => set({ connectionError: error }),

  resetRoom: () => {
    set({
      currentRoom: null,
      isHost: false,
      localPlayerId: null,
      isConnecting: false,
      isConnected: false,
      connectionError: null,
      leaderboard: [],
    });
  },
}));
