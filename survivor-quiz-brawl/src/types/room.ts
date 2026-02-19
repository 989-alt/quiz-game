export interface Room {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  quizSetId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: RoomPlayer[];
  settings: RoomSettings;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface RoomPlayer {
  id: string;
  name: string;
  avatar?: string;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  level: number;
  isAlive: boolean;
  correctAnswers: number;
  totalAnswers: number;
}

export interface RoomSettings {
  maxPlayers: number;
  gameDuration: number; // in seconds
  quizTimeLimit: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  allowLateJoin: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  level: number;
  correctAnswers: number;
  isAlive: boolean;
}

export interface RoomMessage {
  type: 'join' | 'leave' | 'ready' | 'start' | 'state' | 'leaderboard' | 'quiz' | 'end';
  payload: unknown;
  timestamp: number;
  senderId: string;
}
