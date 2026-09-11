const DAILY_API_BASE = "https://api.daily.co/v1";

function getDailyApiKey(): string {
  const key = process.env.DAILY_API_KEY;
  if (!key || key === "your-daily-co-api-key-here") {
    throw new Error(
      "DAILY_API_KEY belum dikonfigurasi. Silakan set di file .env"
    );
  }
  return key;
}

function getDailyDomain(): string {
  return process.env.NEXT_PUBLIC_DAILY_DOMAIN || "your-subdomain.daily.co";
}

export interface DailyRoomResponse {
  id: string;
  name: string;
  url: string;
  api_created: boolean;
  privacy: string;
  created_at: string;
  config: {
    max_participants?: number;
    enable_recording?: string;
    start_video_off?: boolean;
    nbf?: number | null;
    exp?: number | null;
  };
}

export interface DailyTokenResponse {
  token: string;
}

/**
 * Create a new Daily.co room via REST API
 */
export async function createDailyRoom(
  roomName: string,
  options?: {
    privacy?: "public" | "private";
    maxParticipants?: number;
    exp?: number;
  }
): Promise<DailyRoomResponse> {
  const apiKey = getDailyApiKey();

  const properties: Record<string, unknown> = {
    enable_people_ui: true,
    enable_chat: true,
    enable_screenshare: true,
    enable_hand_raising: true,
    start_video_off: false,
    start_audio_off: false,
    lang: "id",
  };

  if (options?.maxParticipants) {
    properties.max_participants = options.maxParticipants;
  }

  if (options?.exp) {
    properties.exp = options.exp;
  }

  const body: Record<string, unknown> = {
    name: roomName,
    privacy: options?.privacy || "private",
    properties,
  };

  const res = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create Daily room: ${res.status} ${JSON.stringify(errorData)}`
    );
  }

  return res.json();
}

/**
 * Create a meeting token for a specific room
 */
export async function createMeetingToken(options: {
  room_name: string;
  user_name: string;
  is_owner?: boolean;
  exp?: number;
}): Promise<DailyTokenResponse> {
  const apiKey = getDailyApiKey();

  const body = {
    properties: {
      room_name: options.room_name,
      user_name: options.user_name,
      is_owner: options.is_owner || false,
      exp: options.exp || Math.floor(Date.now() / 1000) + 60 * 60 * 4, // 4 hours default
      enable_screenshare: true,
      start_video_off: false,
      start_audio_off: false,
    },
  };

  const res = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create meeting token: ${res.status} ${JSON.stringify(errorData)}`
    );
  }

  return res.json();
}

/**
 * Delete a Daily.co room
 */
export async function deleteDailyRoom(roomName: string): Promise<void> {
  const apiKey = getDailyApiKey();

  const res = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    console.error(`Failed to delete Daily room ${roomName}: ${res.status}`);
  }
}

/**
 * Generate a unique room name based on kelas and timestamp
 */
export function generateRoomName(kelas: string): string {
  const sanitized = kelas
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const timestamp = Date.now().toString(36);
  return `alazhar-${sanitized}-${timestamp}`;
}

/**
 * Build the full Daily.co room URL
 */
export function buildRoomUrl(roomName: string): string {
  const domain = getDailyDomain();
  return `https://${domain}/${roomName}`;
}
