import Ably from 'ably';
import type { Room, RoomPlayer, LeaderboardEntry } from '../types/room';

let ablyClient: Ably.Realtime | null = null;
let currentChannel: Ably.RealtimeChannel | null = null;

export interface RoomCallbacks {
  onPlayerJoin?: (player: RoomPlayer) => void;
  onPlayerLeave?: (playerId: string) => void;
  onPlayerUpdate?: (playerId: string, updates: Partial<RoomPlayer>) => void;
  onGameStart?: () => void;
  onGameEnd?: () => void;
  onLeaderboardUpdate?: (entries: LeaderboardEntry[]) => void;
  onRoomUpdate?: (room: Partial<Room>) => void;
  onError?: (error: Error) => void;
}

export function initializeAbly(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      ablyClient = new Ably.Realtime({
        key: apiKey,
        clientId: crypto.randomUUID(),
      });

      ablyClient.connection.on('connected', () => {
        console.log('Connected to Ably');
        resolve();
      });

      ablyClient.connection.on('failed', (err) => {
        console.error('Ably connection failed:', err);
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function getClientId(): string | undefined {
  return ablyClient?.auth.clientId;
}

export async function createRoom(roomCode: string, callbacks: RoomCallbacks): Promise<void> {
  if (!ablyClient) {
    throw new Error('Ably not initialized');
  }

  currentChannel = ablyClient.channels.get(`room:${roomCode}`);

  await currentChannel.presence.enter({
    isHost: true,
    joinedAt: Date.now(),
  });

  setupChannelListeners(callbacks);
}

export async function joinRoom(roomCode: string, playerData: Partial<RoomPlayer>, callbacks: RoomCallbacks): Promise<void> {
  if (!ablyClient) {
    throw new Error('Ably not initialized');
  }

  currentChannel = ablyClient.channels.get(`room:${roomCode}`);

  await currentChannel.presence.enter({
    ...playerData,
    isHost: false,
    joinedAt: Date.now(),
  });

  setupChannelListeners(callbacks);
}

function setupChannelListeners(callbacks: RoomCallbacks): void {
  if (!currentChannel) return;

  // Presence events
  currentChannel.presence.subscribe('enter', (member) => {
    if (callbacks.onPlayerJoin) {
      callbacks.onPlayerJoin({
        id: member.clientId,
        name: member.data?.name || 'Player',
        isReady: false,
        isConnected: true,
        score: 0,
        level: 1,
        isAlive: true,
        correctAnswers: 0,
        totalAnswers: 0,
        ...member.data,
      });
    }
  });

  currentChannel.presence.subscribe('leave', (member) => {
    if (callbacks.onPlayerLeave) {
      callbacks.onPlayerLeave(member.clientId);
    }
  });

  currentChannel.presence.subscribe('update', (member) => {
    if (callbacks.onPlayerUpdate) {
      callbacks.onPlayerUpdate(member.clientId, member.data);
    }
  });

  // Game events
  currentChannel.subscribe('game:start', () => {
    if (callbacks.onGameStart) {
      callbacks.onGameStart();
    }
  });

  currentChannel.subscribe('game:end', () => {
    if (callbacks.onGameEnd) {
      callbacks.onGameEnd();
    }
  });

  currentChannel.subscribe('leaderboard:update', (message) => {
    if (callbacks.onLeaderboardUpdate) {
      callbacks.onLeaderboardUpdate(message.data);
    }
  });

  currentChannel.subscribe('room:update', (message) => {
    if (callbacks.onRoomUpdate) {
      callbacks.onRoomUpdate(message.data);
    }
  });
}

export async function updatePlayerState(updates: Partial<RoomPlayer>): Promise<void> {
  if (!currentChannel) return;

  await currentChannel.presence.update(updates);
}

export async function publishGameStart(): Promise<void> {
  if (!currentChannel) return;

  await currentChannel.publish('game:start', { startedAt: Date.now() });
}

export async function publishGameEnd(): Promise<void> {
  if (!currentChannel) return;

  await currentChannel.publish('game:end', { endedAt: Date.now() });
}

export async function publishLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
  if (!currentChannel) return;

  await currentChannel.publish('leaderboard:update', entries);
}

export async function getPresenceMembers(): Promise<RoomPlayer[]> {
  if (!currentChannel) return [];

  const members = await currentChannel.presence.get();

  return members.map((member) => ({
    id: member.clientId,
    name: member.data?.name || 'Player',
    isReady: member.data?.isReady || false,
    isConnected: true,
    score: member.data?.score || 0,
    level: member.data?.level || 1,
    isAlive: member.data?.isAlive !== false,
    correctAnswers: member.data?.correctAnswers || 0,
    totalAnswers: member.data?.totalAnswers || 0,
  }));
}

export async function leaveRoom(): Promise<void> {
  if (currentChannel) {
    await currentChannel.presence.leave();
    currentChannel.unsubscribe();
    currentChannel = null;
  }
}

export function disconnect(): void {
  if (ablyClient) {
    ablyClient.close();
    ablyClient = null;
  }
}
