/**
 * Laravel Echo Configuration
 * WebSocket client untuk real-time updates
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Cookies from 'js-cookie';

// Only run on client-side
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

let echoInstance = null;

/**
 * Get or create Echo instance
 * @returns {Echo} Echo instance
 */
export const getEcho = () => {
  // Guard against server-side rendering
  if (typeof window === 'undefined') {
    console.warn('Echo can only be initialized on client-side');
    return null;
  }

  const token = Cookies.get('token');

  if (!token) {
    console.warn('[Echo] No auth token found via Cookies.');
    return null;
  }

  if (echoInstance) {
     return echoInstance;
  }

  // Ambil URL dari env, jangan hardcoded localhost
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  /**
   * Logic untuk bersihkan trailing slash kalau ada (biar ga double slash //)
   * Entahlah ini saran dari gemini.
   */
  const cleanBaseUrl = apiBaseUrl.replace(/\/+$/, '');

  const provider = process.env.NEXT_PUBLIC_BROADCAST_PROVIDER || 'reverb';

  let config;
  if (provider === 'pusher') {
    // Pusher (cloud) configuration
    config = {
      broadcaster: 'pusher',
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER, // let Pusher pick the correct host per cluster
      forceTLS: true,
      authEndpoint: `${cleanBaseUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      },
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          fetch(`${cleanBaseUrl}/broadcasting/auth`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ socket_id: socketId, channel_name: channel.name })
          })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              return callback(true, { status: res.status, error: text || 'Auth failed' });
            }
            const data = await res.json();
            callback(false, data);
          })
          .catch((err) => callback(true, err));
        }
      }),
    };
  } else {
    // Reverb (self-hosted) configuration
    // Normalize host: strip protocol and trailing slashes to avoid
    // constructing URLs like "wss://https://host/..."
    const rawHost = process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost';
    const normalizedHost = rawHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

    // Choose sensible default ports based on TLS flag
    const tlsEnabled = (process.env.NEXT_PUBLIC_REVERB_TLS || 'false') === 'true';
    const defaultPort = tlsEnabled ? 443 : 80;
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || defaultPort);

    config = {
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || process.env.NEXT_PUBLIC_REVERB_KEY || 'rfmp9pmudhfkb6dvdybr',
      wsHost: normalizedHost,
      wsPort: port,
      wssPort: port,
      forceTLS: tlsEnabled,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authEndpoint: `${cleanBaseUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      },
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          fetch(`${cleanBaseUrl}/broadcasting/auth`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ socket_id: socketId, channel_name: channel.name })
          })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              return callback(true, { status: res.status, error: text || 'Auth failed' });
            }
            const data = await res.json();
            callback(false, data);
          })
          .catch((err) => callback(true, err));
        }
      }),
    };
  }

  console.log('[Echo] Initializing with config:', {
    provider,
    wsHost: config.wsHost,
    wsPort: config.wsPort,
    key: (config.key || '').substring(0, 8) + '...',
    hasToken: !!token,
  });

  echoInstance = new Echo(config);

    // Add connection state listeners for debugging
  if (echoInstance.connector && echoInstance.connector.pusher) {
    const pusher = echoInstance.connector.pusher;
    
    pusher.connection.bind('connected', () => {
      console.log('[Echo] ✅ WebSocket connected');
    });
    
    pusher.connection.bind('disconnected', () => {
      console.warn('[Echo] ❌ WebSocket disconnected');
    });
    
    pusher.connection.bind('error', (err) => {
      console.error('[Echo] ❌ WebSocket error:', err);
    });

    pusher.connection.bind('state_change', (states) => {
      console.log('[Echo] Connection state changed:', states.previous, '→', states.current);
    });
  }

  return echoInstance;
};

/**
 * Disconnect Echo
 */
export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};

export default getEcho;
