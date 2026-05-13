// @ts-nocheck
import { describe, expect, it, vi } from 'vitest';
import spotifyHelpers from './spotify-player.js';

const {
  loadSpotifySdk,
  createSpotifyPlayer,
  buildSpotifyRegistrationPayload,
  mapSpotifyPlayerState,
} = spotifyHelpers;

function createMockRoot() {
  const appendedScripts = [];
  const scriptElements = [];

  const root = {
    Spotify: undefined,
    appendedScripts,
    scriptElements,
    document: {
      head: {
        appendChild: vi.fn((node) => {
          appendedScripts.push(node);
          return node;
        }),
      },
      body: {
        appendChild: vi.fn((node) => {
          appendedScripts.push(node);
          return node;
        }),
      },
      createElement: vi.fn((tagName) => {
        const element = {
          tagName,
          async: false,
          defer: false,
          src: '',
          dataset: {},
          onload: null,
          onerror: null,
          setAttribute(name, value) {
            this[name] = value;
          },
        };
        scriptElements.push(element);
        return element;
      }),
      querySelector: vi.fn(() => null),
      documentElement: {
        appendChild: vi.fn((node) => {
          appendedScripts.push(node);
          return node;
        }),
      },
    },
  };

  return root;
}

describe('kiosk spotify helpers', () => {
  it('resolves immediately when the spotify sdk is already loaded', async () => {
    const root = createMockRoot();
    root.Spotify = { Player: vi.fn() };

    const result = await loadSpotifySdk({ root });

    expect(result).toBe(root.Spotify);
    expect(root.document.createElement).not.toHaveBeenCalled();
  });

  it('rejects and resets the load promise when the sdk script fails to load', async () => {
    const root = createMockRoot();

    const loadPromise = loadSpotifySdk({ root, scriptUrl: 'https://sdk.scdn.co/spotify-player.js' });

    const script = root.scriptElements[0];
    script.onerror();

    await expect(loadPromise).rejects.toThrow('Failed to load Spotify Web Playback SDK');

    root.Spotify = { Player: vi.fn() };
    const retryPromise = loadSpotifySdk({ root, scriptUrl: 'https://sdk.scdn.co/spotify-player.js' });
    expect(retryPromise).not.toBe(loadPromise);
  });

  it('loads the Spotify SDK only once and resolves when the ready callback fires', async () => {
    const root = createMockRoot();

    const firstLoad = loadSpotifySdk({ root, scriptUrl: 'https://sdk.scdn.co/spotify-player.js' });
    const secondLoad = loadSpotifySdk({ root, scriptUrl: 'https://sdk.scdn.co/spotify-player.js' });

    expect(firstLoad).toBe(secondLoad);
    expect(root.document.createElement).toHaveBeenCalledWith('script');
    expect(root.document.head.appendChild).toHaveBeenCalledTimes(1);

    root.Spotify = { Player: vi.fn() };
    root.onSpotifyWebPlaybackSDKReady();

    await expect(firstLoad).resolves.toBe(root.Spotify);
  });

  it('builds a normalized spotify registration payload', () => {
    const payload = buildSpotifyRegistrationPayload({
      deviceId: 'device-1',
      spotifyDeviceId: 'browser-device-1',
      playerName: '  Kiosk Browser  ',
      state: {
        paused: false,
        position: 45000,
        track_window: {
          current_track: {
            uri: 'spotify:track:track-1',
            id: 'track-1',
            name: 'Track 1',
            duration_ms: 180000,
            artists: [{ name: 'Artist 1' }],
          },
        },
      },
    });

    expect(payload).toEqual({
      device_id: 'device-1',
      spotify_device_id: 'browser-device-1',
      player_name: 'Kiosk Browser',
      player_state: {
        paused: false,
        position_ms: 45000,
        duration_ms: 180000,
        track_ended: false,
        track_uri: 'spotify:track:track-1',
        track_id: 'track-1',
        track_name: 'Track 1',
        track_artists: ['Artist 1'],
      },
    });
  });

  it('maps spotify player state into a compact normalized payload', () => {
    const mapped = mapSpotifyPlayerState({
      paused: true,
      position: 12000,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          name: 'Song Name',
          duration_ms: 240000,
          artists: [{ name: 'Artist A' }, { name: 'Artist B' }],
        },
      },
    });

    expect(mapped).toEqual({
      paused: true,
      position_ms: 12000,
      duration_ms: 240000,
      track_ended: false,
      track_uri: 'spotify:track:123',
      track_id: '123',
      track_name: 'Song Name',
      track_artists: ['Artist A', 'Artist B'],
    });
  });

  it('does not mark track end when previous position was not near the end', () => {
    const mapped = mapSpotifyPlayerState({
      paused: true,
      position: 0,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          name: 'Song Name',
          duration_ms: 240000,
          artists: [{ name: 'Artist A' }],
        },
      },
    }, {
      paused: false,
      position_ms: 100000,
      duration_ms: 240000,
      track_ended: false,
      track_uri: 'spotify:track:123',
      track_id: '123',
      track_name: 'Song Name',
      track_artists: ['Artist A'],
    });

    expect(mapped.track_ended).toBe(false);
  });

  it('does not mark track end when previous state has no track_uri', () => {
    const mapped = mapSpotifyPlayerState({
      paused: true,
      position: 0,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          name: 'Song Name',
          duration_ms: 240000,
          artists: [{ name: 'Artist A' }],
        },
      },
    }, {
      paused: false,
      position_ms: 239000,
      duration_ms: 240000,
      track_ended: false,
      track_uri: null,
      track_id: null,
      track_name: null,
      track_artists: [],
    });

    expect(mapped.track_ended).toBe(false);
  });

  it('marks track end when near end and next state has no current track', () => {
    const mapped = mapSpotifyPlayerState({
      paused: true,
      position: 0,
      track_window: { current_track: null },
    }, {
      paused: false,
      position_ms: 239000,
      duration_ms: 240000,
      track_ended: false,
      track_uri: 'spotify:track:123',
      track_id: '123',
      track_name: 'Song Name',
      track_artists: ['Artist A'],
    });

    expect(mapped.track_ended).toBe(true);
  });

  it('marks track end when the same song resets after reaching the end', () => {
    const mapped = mapSpotifyPlayerState({
      paused: true,
      position: 0,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          name: 'Song Name',
          duration_ms: 240000,
          artists: [{ name: 'Artist A' }],
        },
      },
    }, {
      paused: false,
      position_ms: 239500,
      duration_ms: 240000,
      track_ended: false,
      track_uri: 'spotify:track:123',
      track_id: '123',
      track_name: 'Song Name',
      track_artists: ['Artist A'],
    });

    expect(mapped.track_ended).toBe(true);
  });

  it('creates a spotify player wrapper that wires sdk callbacks', async () => {
    const readyHandler = vi.fn();
    const stateHandler = vi.fn();
    const notReadyHandler = vi.fn();

    class FakePlayer {
      constructor(config) {
        this.config = config;
        this.listeners = {};
      }

      addListener(name, callback) {
        this.listeners[name] = callback;
      }

      connect = vi.fn();
      activateElement = vi.fn();
      disconnect = vi.fn();

      emit(name, payload) {
        this.listeners[name]?.(payload);
      }
    }

    const root = createMockRoot();
    const playerInstances = [];
    root.Spotify = {
  Player: vi.fn(function (config) {
    const instance = new FakePlayer(config);
    playerInstances.push(instance);
    this.config = instance.config;
    this.listeners = instance.listeners;
    this.addListener = (name, cb) => instance.addListener(name, cb);
    this.connect = instance.connect;
    this.activateElement = instance.activateElement;
    this.disconnect = instance.disconnect;
    this.emit = (name, payload) => instance.emit(name, payload);
  }),
};

    const wrapper = createSpotifyPlayer({
      root,
      playerName: 'Kiosk Browser',
      getOAuthToken: vi.fn().mockResolvedValue('token-1'),
      onReady: readyHandler,
      onStateChange: stateHandler,
      onNotReady: notReadyHandler,
    });

    expect(root.Spotify.Player).toHaveBeenCalledTimes(1);
    expect(playerInstances[0].config.name).toBe('Kiosk Browser');

    const tokenCallback = vi.fn();
    await playerInstances[0].config.getOAuthToken(tokenCallback);
    expect(tokenCallback).toHaveBeenCalledWith('token-1');

    playerInstances[0].emit('ready', { device_id: 'browser-device-1' });
    playerInstances[0].emit('player_state_changed', {
      paused: false,
      position: 3000,
      track_window: {
        current_track: {
          uri: 'spotify:track:abc',
          id: 'abc',
          name: 'Live Song',
          duration_ms: 200000,
          artists: [{ name: 'Artist Live' }],
        },
      },
    });
    playerInstances[0].emit('not_ready', { device_id: 'browser-device-1' });

    expect(readyHandler).toHaveBeenCalledWith({
      device_id: 'browser-device-1',
      spotify_device_id: 'browser-device-1',
      player_name: 'Kiosk Browser',
      player_state: null,
    });
    expect(stateHandler).toHaveBeenCalledWith({
      paused: false,
      position_ms: 3000,
      duration_ms: 200000,
      track_ended: false,
      track_uri: 'spotify:track:abc',
      track_id: 'abc',
      track_name: 'Live Song',
      track_artists: ['Artist Live'],
    });
    expect(notReadyHandler).toHaveBeenCalledWith({
      device_id: 'browser-device-1',
      spotify_device_id: 'browser-device-1',
    });
    expect(wrapper.connect).toBeTypeOf('function');
    expect(wrapper.activateElement).toBeTypeOf('function');
    expect(wrapper.disconnect).toBeTypeOf('function');
  });

  it('tracks last device id from the ready event via getLastDeviceId', () => {
    class FakePlayer {
      constructor(config) {
        this.config = config;
        this.listeners = {};
      }
      addListener(name, callback) { this.listeners[name] = callback; }
      connect = vi.fn();
      activateElement = vi.fn();
      disconnect = vi.fn();
      emit(name, payload) { this.listeners[name]?.(payload); }
    }

    const root = createMockRoot();
    const playerInstances = [];
    root.Spotify = {
      Player: vi.fn(function (config) {
        const instance = new FakePlayer(config);
        playerInstances.push(instance);
        this.config = instance.config;
        this.listeners = instance.listeners;
        this.addListener = (name, cb) => instance.addListener(name, cb);
        this.connect = instance.connect;
        this.activateElement = instance.activateElement;
        this.disconnect = instance.disconnect;
        this.emit = (name, payload) => instance.emit(name, payload);
      }),
    };

    const wrapper = createSpotifyPlayer({
      root,
      playerName: 'Kiosk Browser',
      getOAuthToken: vi.fn().mockResolvedValue('token-1'),
      onReady: vi.fn(),
    });

    expect(wrapper.getLastDeviceId()).toBe(null);

    playerInstances[0].emit('ready', { device_id: 'device-abc' });

    expect(wrapper.getLastDeviceId()).toBe('device-abc');
  });

  it('fires error callbacks for sdk error events', () => {
    class FakePlayer {
      constructor(config) {
        this.config = config;
        this.listeners = {};
      }
      addListener(name, callback) { this.listeners[name] = callback; }
      connect = vi.fn();
      activateElement = vi.fn();
      disconnect = vi.fn();
      emit(name, payload) { this.listeners[name]?.(payload); }
    }

    const root = createMockRoot();
    const playerInstances = [];
    root.Spotify = {
      Player: vi.fn(function (config) {
        const instance = new FakePlayer(config);
        playerInstances.push(instance);
        this.config = instance.config;
        this.listeners = instance.listeners;
        this.addListener = (name, cb) => instance.addListener(name, cb);
        this.connect = instance.connect;
        this.activateElement = instance.activateElement;
        this.disconnect = instance.disconnect;
        this.emit = (name, payload) => instance.emit(name, payload);
      }),
    };

    const onError = vi.fn();
    const onAutoplayFailed = vi.fn();

    createSpotifyPlayer({
      root,
      playerName: 'Kiosk Browser',
      getOAuthToken: vi.fn().mockResolvedValue('token-1'),
      onError,
      onAutoplayFailed,
    });

    const fakeError = { message: 'init failed' };
    playerInstances[0].emit('initialization_error', fakeError);
    playerInstances[0].emit('authentication_error', fakeError);
    playerInstances[0].emit('account_error', fakeError);
    playerInstances[0].emit('autoplay_failed', { reason: 'blocked' });

    expect(onError).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalledWith(fakeError);
    expect(onAutoplayFailed).toHaveBeenCalledWith({ reason: 'blocked' });
  });
});
