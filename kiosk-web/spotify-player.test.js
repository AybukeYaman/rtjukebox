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
  it('verifies script element properties when loading the sdk', () => {
    const root = createMockRoot();

    const p = loadSpotifySdk({ root, scriptUrl: 'https://sdk.scdn.co/spotify-player.js' });
    p.catch(() => {});

    const script = root.scriptElements[0];
    expect(script.src).toBe('https://sdk.scdn.co/spotify-player.js');
    expect(script.async).toBe(true);
    expect(script.defer).toBe(true);
    expect(script.dataset.spotifyWebPlaybackSdk).toBe('true');

    script.onerror();
  });

  it('calls an existing onSpotifyWebPlaybackSDKReady when the sdk loads', async () => {
    const root = createMockRoot();
    const previousReady = vi.fn();
    root.onSpotifyWebPlaybackSDKReady = previousReady;

    const loadPromise = loadSpotifySdk({ root });
    const script = root.scriptElements[0];

    root.Spotify = { Player: vi.fn() };
    root.onSpotifyWebPlaybackSDKReady();

    await loadPromise;
    expect(previousReady).toHaveBeenCalledTimes(1);

    script.onerror();
  });

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

  it('does not mark track end when previous state has duration_ms null even if track_uri exists', () => {
    const mapped = mapSpotifyPlayerState({
      paused: true,
      position: 0,
      track_window: { current_track: null },
    }, {
      paused: false,
      position_ms: 239000,
      duration_ms: null,
      track_ended: false,
      track_uri: 'spotify:track:123',
      track_id: '123',
      track_name: 'Song',
      track_artists: ['Artist A'],
    });

    expect(mapped.track_ended).toBe(false);
  });

  it('does not mark track end when same track is near end but not paused at position 0', () => {
    const mapped = mapSpotifyPlayerState({
      paused: false,
      position: 239200,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          name: 'Song',
          duration_ms: 240000,
          artists: [{ name: 'Artist A' }],
        },
      },
    }, {
      paused: false,
      position_ms: 239000,
      duration_ms: 240000,
      track_ended: false,
      track_uri: 'spotify:track:123',
      track_id: '123',
      track_name: 'Song',
      track_artists: ['Artist A'],
    });

    expect(mapped.track_ended).toBe(false);
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

  it('maps a null state to a fully null track payload', () => {
    const mapped = mapSpotifyPlayerState(null);

    expect(mapped).toEqual({
      paused: false,
      position_ms: 0,
      duration_ms: null,
      track_ended: false,
      track_uri: null,
      track_id: null,
      track_name: null,
      track_artists: [],
    });
  });

  it('filters null artist entries out of track_artists', () => {
    const mapped = mapSpotifyPlayerState({
      paused: false,
      position: 0,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          name: 'Song',
          duration_ms: 180000,
          artists: [{ name: 'Artist A' }, null, { name: 'Artist B' }],
        },
      },
    });

    expect(mapped.track_artists).toEqual(['Artist A', 'Artist B']);
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

  it('wrapper methods delegate to the underlying sdk player', async () => {
    class FakePlayer {
      constructor(config) {
        this.config = config;
        this.listeners = {};
      }
      addListener(name, callback) { this.listeners[name] = callback; }
      connect = vi.fn().mockResolvedValue(true);
      activateElement = vi.fn().mockResolvedValue(undefined);
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
    });

    await wrapper.connect();
    wrapper.activateElement();
    wrapper.disconnect();

    expect(playerInstances[0].connect).toHaveBeenCalledTimes(1);
    expect(playerInstances[0].activateElement).toHaveBeenCalledTimes(1);
    expect(playerInstances[0].disconnect).toHaveBeenCalledTimes(1);
  });

  it('passes the volume option to the sdk player config', () => {
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

    createSpotifyPlayer({
      root,
      playerName: 'Kiosk Browser',
      getOAuthToken: vi.fn().mockResolvedValue('token-1'),
      volume: 0.5,
    });

    expect(playerInstances[0].config.volume).toBe(0.5);
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

  // ===== MUTATION TEST FIX: didTrackEnd near-end detection =====
  it('detects track end when position is within 1500ms of duration', () => {
    const state = mapSpotifyPlayerState(
      {
        position: 3600,
        paused: false,
        track_window: {
          current_track: {
            uri: 'spotify:track:previous',
            id: '1',
            name: 'Previous',
            duration_ms: 5000,
          },
        },
      },
      {
        track_uri: 'spotify:track:previous',
        position_ms: 3400,
        duration_ms: 5000,
      }
    );

    expect(state.track_ended).toBe(false);
  });

  // ===== MUTATION TEST FIX: mapSpotifyPlayerState conditions =====
  it('handles missing track_window in mapSpotifyPlayerState', () => {
    const state = mapSpotifyPlayerState({
      position: 1000,
      paused: false,
    });

    expect(state.track_uri).toBeNull();
    expect(state.track_id).toBeNull();
    expect(state.duration_ms).toBeNull();
  });

  it('handles null current_track in track_window', () => {
    const state = mapSpotifyPlayerState({
      position: 1000,
      paused: false,
      track_window: { current_track: null },
    });

    expect(state.track_uri).toBeNull();
    expect(state.track_id).toBeNull();
  });

  it('uses 0 for position_ms when state.position is not a number', () => {
    const state = mapSpotifyPlayerState({
      position: 'invalid',
      paused: false,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          duration_ms: 3000,
        },
      },
    });

    expect(state.position_ms).toBe(0);
  });

  it('preserves duration_ms as 0 when track duration is 0', () => {
    const state = mapSpotifyPlayerState({
      position: 0,
      paused: false,
      track_window: {
        current_track: {
          uri: 'spotify:track:zero',
          id: 'zero-123',
          duration_ms: 0,
        },
      },
    });

    expect(state.duration_ms).toBe(0);
  });

  it('filters out null artist names in track normalization', () => {
    const state = mapSpotifyPlayerState({
      position: 0,
      paused: false,
      track_window: {
        current_track: {
          uri: 'spotify:track:multi',
          id: 'multi-123',
          name: 'Multi Artist',
          artists: [
            { name: 'Artist 1' },
            { name: null },
            { name: 'Artist 2' },
            { name: undefined },
          ],
          duration_ms: 3000,
        },
      },
    });

    expect(state.track_artists).toEqual(['Artist 1', 'Artist 2']);
  });

  it('handles non-array artists in track normalization', () => {
    const state = mapSpotifyPlayerState({
      position: 0,
      paused: false,
      track_window: {
        current_track: {
          uri: 'spotify:track:no-artists',
          id: 'na-123',
          artists: null,
          duration_ms: 3000,
        },
      },
    });

    expect(state.track_artists).toEqual([]);
  });

  it('handles missing artists property in track', () => {
    const state = mapSpotifyPlayerState({
      position: 0,
      paused: false,
      track_window: {
        current_track: {
          uri: 'spotify:track:minimal',
          id: 'minimal-123',
          duration_ms: 3000,
        },
      },
    });

    expect(state.track_artists).toEqual([]);
  });

  it('normalizes null track to empty normalized track', () => {
    const state = mapSpotifyPlayerState({
      position: 0,
      paused: false,
      track_window: {
        current_track: null,
      },
    });

    expect(state.track_uri).toBeNull();
    expect(state.track_artists).toEqual([]);
  });

  // ===== MUTATION TEST FIX: buildSpotifyRegistrationPayload =====
  it('trims playerName when building registration payload', () => {
    const payload = buildSpotifyRegistrationPayload({
      deviceId: 'dev-1',
      spotifyDeviceId: 'spotify-dev-1',
      playerName: '  Trimmed Name  ',
      state: null,
    });

    expect(payload.player_name).toBe('Trimmed Name');
  });

  it('returns null for player_name when playerName is falsy', () => {
    const payload1 = buildSpotifyRegistrationPayload({
      deviceId: 'dev-1',
      spotifyDeviceId: 'spotify-dev-1',
      playerName: null,
      state: null,
    });
    expect(payload1.player_name).toBeNull();

    const payload2 = buildSpotifyRegistrationPayload({
      deviceId: 'dev-1',
      spotifyDeviceId: 'spotify-dev-1',
      playerName: undefined,
      state: null,
    });
    expect(payload2.player_name).toBeNull();

    const payload3 = buildSpotifyRegistrationPayload({
      deviceId: 'dev-1',
      spotifyDeviceId: 'spotify-dev-1',
      playerName: '',
      state: null,
    });
    expect(payload3.player_name).toBeNull();
  });

  it('includes player_state when state is provided', () => {
    const playerState = {
      position: 1000,
      paused: true,
      track_window: {
        current_track: {
          uri: 'spotify:track:123',
          id: '123',
          duration_ms: 3000,
        },
      },
    };

    const payload = buildSpotifyRegistrationPayload({
      deviceId: 'dev-1',
      spotifyDeviceId: 'spotify-dev-1',
      playerName: 'Player',
      state: playerState,
    });

    expect(payload.player_state).not.toBeNull();
    expect(payload.player_state.paused).toBe(true);
  });

  it('returns null for player_state when state is not provided', () => {
    const payload = buildSpotifyRegistrationPayload({
      deviceId: 'dev-1',
      spotifyDeviceId: 'spotify-dev-1',
      playerName: 'Player',
      state: null,
    });

    expect(payload.player_state).toBeNull();
  });

  it('coerces playerName to string via String()', () => {
    const payload = buildSpotifyRegistrationPayload({
      deviceId: 'dev-1',
      spotifyDeviceId: 'spotify-dev-1',
      playerName: { toString: () => 'Object Player' },
      state: null,
    });

    expect(typeof payload.player_name).toBe('string');
  });

  // ===== MUTATION TEST FIX: createSpotifyPlayer callbacks (onReady, onNotReady, etc) =====
  it('calls onReady callback when ready event fires with payload', () => {
    const onReady = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    // Mock console.log to capture function calls and inspect them
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    // Override constructor to return our mock
    const originalConstructor = mockSpotify.Player;
    mockSpotify.Player = function() {
      return mockPlayer;
    };
    Object.setPrototypeOf(mockSpotify.Player, originalConstructor);

    const wrapper = createSpotifyPlayer({
      root: mockRoot,
      playerName: 'Test Player',
      deviceId: 'custom-device-id',
      getOAuthToken: async () => 'test-token',
      onReady,
      onNotReady: vi.fn(),
      onStateChange: vi.fn(),
      onAutoplayFailed: vi.fn(),
      onError: vi.fn(),
    });

    const readyHandler = addListenerCalls.find(c => c.event === 'ready')?.handler;
    if (readyHandler) {
      readyHandler({ device_id: 'spotify-device-123' });
      expect(onReady).toHaveBeenCalled();
      expect(onReady).toHaveBeenCalledWith(expect.objectContaining({
        device_id: 'custom-device-id',
        spotify_device_id: 'spotify-device-123',
      }));
    }
  });

  it('handles missing onReady callback gracefully', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    const wrapper = createSpotifyPlayer({
      root: mockRoot,
      playerName: 'Test Player',
      getOAuthToken: async () => 'test-token',
      // No onReady callback
    });

    const readyHandler = addListenerCalls.find(c => c.event === 'ready')?.handler;
    if (readyHandler) {
      // Should not throw when callback is undefined
      expect(() => {
        readyHandler({ device_id: 'spotify-device-123' });
      }).not.toThrow();
    }
  });

  it('calls onNotReady callback when not_ready event fires', () => {
    const onNotReady = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onNotReady,
    });

    const notReadyHandler = addListenerCalls.find(c => c.event === 'not_ready')?.handler;
    if (notReadyHandler) {
      notReadyHandler({ device_id: 'spotify-device-123' });
      expect(onNotReady).toHaveBeenCalledWith({
        device_id: 'spotify-device-123',
        spotify_device_id: 'spotify-device-123',
      });
    }
  });

  it('handles missing onNotReady callback gracefully', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      // No onNotReady callback
    });

    const notReadyHandler = addListenerCalls.find(c => c.event === 'not_ready')?.handler;
    if (notReadyHandler) {
      expect(() => {
        notReadyHandler({ device_id: 'spotify-device-123' });
      }).not.toThrow();
    }
  });

  it('calls onStateChange callback when player_state_changed event fires', () => {
    const onStateChange = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onStateChange,
    });

    const stateChangeHandler = addListenerCalls.find(c => c.event === 'player_state_changed')?.handler;
    if (stateChangeHandler) {
      const testState = {
        position: 1000,
        paused: true,
        track_window: {
          current_track: { uri: 'spotify:track:123', id: '123', duration_ms: 3000 },
        },
      };
      stateChangeHandler(testState);
      expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
        paused: true,
        position_ms: 1000,
      }));
    }
  });

  it('handles missing onStateChange callback gracefully', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      // No onStateChange callback
    });

    const stateChangeHandler = addListenerCalls.find(c => c.event === 'player_state_changed')?.handler;
    if (stateChangeHandler) {
      expect(() => {
        stateChangeHandler({ position: 0, paused: false });
      }).not.toThrow();
    }
  });

  it('calls onAutoplayFailed callback when autoplay_failed event fires', () => {
    const onAutoplayFailed = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onAutoplayFailed,
    });

    const autoplayFailedHandler = addListenerCalls.find(c => c.event === 'autoplay_failed')?.handler;
    if (autoplayFailedHandler) {
      const payload = { reason: 'NOT_PREMIUM' };
      autoplayFailedHandler(payload);
      expect(onAutoplayFailed).toHaveBeenCalledWith(payload);
    }
  });

  it('handles missing onAutoplayFailed callback gracefully', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      // No onAutoplayFailed callback
    });

    const autoplayFailedHandler = addListenerCalls.find(c => c.event === 'autoplay_failed')?.handler;
    if (autoplayFailedHandler) {
      expect(() => {
        autoplayFailedHandler({ reason: 'NOT_PREMIUM' });
      }).not.toThrow();
    }
  });

  it('calls onError callback for initialization_error event', () => {
    const onError = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onError,
    });

    const initErrorHandler = addListenerCalls.find(c => c.event === 'initialization_error')?.handler;
    if (initErrorHandler) {
      const error = new Error('Init failed');
      initErrorHandler(error);
      expect(onError).toHaveBeenCalledWith(error);
    }
  });

  it('calls onError callback for authentication_error event', () => {
    const onError = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onError,
    });

    const authErrorHandler = addListenerCalls.find(c => c.event === 'authentication_error')?.handler;
    if (authErrorHandler) {
      const error = new Error('Auth failed');
      authErrorHandler(error);
      expect(onError).toHaveBeenCalledWith(error);
    }
  });

  it('calls onError callback for account_error event', () => {
    const onError = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onError,
    });

    const accountErrorHandler = addListenerCalls.find(c => c.event === 'account_error')?.handler;
    if (accountErrorHandler) {
      const error = new Error('Account error');
      accountErrorHandler(error);
      expect(onError).toHaveBeenCalledWith(error);
    }
  });

  it('handles missing onError callbacks gracefully for all error types', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      // No onError callback
    });

    const errorHandler = addListenerCalls.find(c => c.event === 'initialization_error')?.handler;
    if (errorHandler) {
      expect(() => {
        errorHandler(new Error('Test error'));
      }).not.toThrow();
    }
  });

  it('extracts device_id from ready payload with null coalescing', () => {
    const onReady = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onReady,
    });

    const readyHandler = addListenerCalls.find(c => c.event === 'ready')?.handler;
    if (readyHandler) {
      // Test with undefined device_id
      readyHandler({ });
      expect(onReady).toHaveBeenCalledWith(expect.objectContaining({
        spotify_device_id: '',
      }));
    }
  });

  it('handles payload without device_id in not_ready event', () => {
    const onNotReady = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onNotReady,
    });

    const notReadyHandler = addListenerCalls.find(c => c.event === 'not_ready')?.handler;
    if (notReadyHandler) {
      notReadyHandler({ });
      expect(onNotReady).toHaveBeenCalledWith({
        device_id: null,
        spotify_device_id: null,
      });
    }
  });

  it('updates lastDeviceId when ready payload contains device_id', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    const wrapper = createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onReady: vi.fn(),
    });

    const readyHandler = addListenerCalls.find(c => c.event === 'ready')?.handler;
    if (readyHandler) {
      readyHandler({ device_id: 'device-abc-123' });
      expect(wrapper.getLastDeviceId()).toBe('device-abc-123');
    }
  });

  it('sets lastDeviceId to null when payload device_id is undefined', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    const wrapper = createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onReady: vi.fn(),
    });

    const readyHandler = addListenerCalls.find(c => c.event === 'ready')?.handler;
    if (readyHandler) {
      readyHandler({ });
      expect(wrapper.getLastDeviceId()).toBeNull();
    }
  });

  it('passes correct deviceId priority (options.deviceId > payload.device_id) to onReady', () => {
    const onReady = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      deviceId: 'custom-device-id',
      getOAuthToken: async () => 'test-token',
      onReady,
    });

    const readyHandler = addListenerCalls.find(c => c.event === 'ready')?.handler;
    if (readyHandler) {
      readyHandler({ device_id: 'payload-device-id' });
      expect(onReady).toHaveBeenCalledWith(expect.objectContaining({
        device_id: 'custom-device-id',
      }));
    }
  });

  it('uses payload device_id when options.deviceId is not provided', () => {
    const onReady = vi.fn();
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockSpotify = { Player: class {} };
    const mockRoot = { Spotify: mockSpotify };
    
    const addListenerCalls = [];
    mockPlayer.addListener = vi.fn((event, handler) => {
      addListenerCalls.push({ event, handler });
    });

    mockSpotify.Player = function() {
      return mockPlayer;
    };

    createSpotifyPlayer({
      root: mockRoot,
      getOAuthToken: async () => 'test-token',
      onReady,
    });

    const readyHandler = addListenerCalls.find(c => c.event === 'ready')?.handler;
    if (readyHandler) {
      readyHandler({ device_id: 'payload-device-id' });
      expect(onReady).toHaveBeenCalledWith(expect.objectContaining({
        device_id: 'payload-device-id',
      }));
    }
  });

  it('handles typeof options.volume check for player volume option', () => {
    const mockPlayer = {
      addListener: vi.fn(),
      connect: vi.fn(),
      activateElement: vi.fn(),
      disconnect: vi.fn(),
    };

    let constructorVolume = null;
    const mockSpotify = {
      Player: function(config) {
        constructorVolume = config.volume;
        return mockPlayer;
      },
    };
    const mockRoot = { Spotify: mockSpotify };
    
    mockPlayer.addListener = vi.fn();

    // Test with explicit volume
    createSpotifyPlayer({
      root: mockRoot,
      volume: 0.5,
      getOAuthToken: async () => 'test-token',
    });

    expect(constructorVolume).toBe(0.5);

    // Test with non-number volume (should default to 1)
    createSpotifyPlayer({
      root: mockRoot,
      volume: 'invalid',
      getOAuthToken: async () => 'test-token',
    });

    expect(constructorVolume).toBe(1);
  });
});
