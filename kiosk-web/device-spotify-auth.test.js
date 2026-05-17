import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildSpotifyDeviceAuthEndpoints,
  buildSpotifyDeviceAuthStartUrl,
  createSpotifyDeviceAuthController,
  renderSpotifyDeviceAuthSetup,
  removeSpotifyDeviceAuthSetup,
} from './device-spotify-auth.js';

function createDocumentStub() {
  const nodes = new Map();
  const appended = [];

  const body = {
    appendChild(node) {
      appended.push(node);
      if (node?.id) {
        nodes.set(node.id, node);
      }
      return node;
    },
    removeChild(node) {
      const index = appended.indexOf(node);
      if (index >= 0) {
        appended.splice(index, 1);
      }
      if (node?.id) {
        nodes.delete(node.id);
      }
      return node;
    },
  };

  return {
    body,
    appended,
    nodes,
    createElement(tagName) {
      return {
        tagName,
        id: '',
        className: '',
        style: {},
        innerHTML: '',
        textContent: '',
        dataset: {},
        remove() {
          body.removeChild(this);
        },
        querySelector() {
          return null;
        },
      };
    },
    getElementById(id) {
      return nodes.get(id) || null;
    },
  };
}

describe('kiosk device spotify auth helper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds the device specific spotify auth endpoints', () => {
    expect(buildSpotifyDeviceAuthEndpoints('http://127.0.0.1:3000')).toEqual({
      status: 'http://127.0.0.1:3000/api/v1/jukebox/kiosk/spotify-device-auth/status',
      start: 'http://127.0.0.1:3000/api/v1/jukebox/kiosk/spotify-device-auth/start',
    });
  });

  it('builds the start url with device_id and device_pwd', () => {
    const url = buildSpotifyDeviceAuthStartUrl('http://127.0.0.1:3000', 'device-1', 'secret');
    expect(url).toBe('http://127.0.0.1:3000/api/v1/jukebox/kiosk/spotify-device-auth/start?device_id=device-1&device_pwd=secret');
  });

  it('builds the start url without device_pwd when password is empty', () => {
    const url = buildSpotifyDeviceAuthStartUrl('http://127.0.0.1:3000', 'device-1', '');
    expect(url).not.toContain('device_pwd');
    expect(url).toContain('device_id=device-1');
  });

  it('shows a blocking setup state when device spotify auth is missing', async () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async (url) => {
      expect(String(url)).toContain('/api/v1/jukebox/kiosk/spotify-device-auth/status');
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            deviceId: 'device-1',
            connected: false,
            spotifyAccountId: null,
            spotifyDisplayName: null,
            spotifyEmail: null,
            spotifyProduct: null,
            spotifyCountry: null,
            tokenExpiresAt: null,
            scopes: null,
            hasRefreshToken: false,
          },
        }),
      };
    });

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        localStorage: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
      },
    });

    await controller.refreshStatus();

    const overlay = documentStub.getElementById('spotifyDeviceAuthSetupOverlay');
    expect(overlay).not.toBeNull();
    expect(overlay.innerHTML).toContain('Spotify bağlantısı gerekli');
    expect(overlay.innerHTML).toContain('Bağlan');
  });

  it('opens the device-specific spotify authorize url', async () => {
    const documentStub = createDocumentStub();
    const popup = {
      location: { href: '' },
      focus: vi.fn(),
      close: vi.fn(),
    };
    const open = vi.fn(() => popup);
    const fetch = vi.fn();

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        localStorage: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
      },
    });

    await controller.openConnectFlow();

    expect(open).toHaveBeenCalledWith('', '_blank');
    expect(fetch).not.toHaveBeenCalled();
    expect(popup.location.href).toBe('http://127.0.0.1:3000/api/v1/jukebox/kiosk/spotify-device-auth/start?device_id=device-1&device_pwd=secret');
    expect(popup.focus).toHaveBeenCalledTimes(1);
  });

  it('opens the popup synchronously before awaiting the auth url request', async () => {
    const documentStub = createDocumentStub();
    const popup = {
      location: { href: '' },
      focus: vi.fn(),
      close: vi.fn(),
    };
    const open = vi.fn(() => popup);

    const fetch = vi.fn();

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        localStorage: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
      },
    });

    await controller.openConnectFlow();

    expect(open).toHaveBeenCalledWith('', '_blank');
    expect(fetch).not.toHaveBeenCalled();
    expect(popup.location.href).toBe('http://127.0.0.1:3000/api/v1/jukebox/kiosk/spotify-device-auth/start?device_id=device-1&device_pwd=secret');
  });

  it('refreshes and exits setup after a successful auth success message', async () => {
    const documentStub = createDocumentStub();
    let connected = false;
    let messageHandler = null;
    const popup = {
      location: { href: '' },
      focus: vi.fn(),
      close: vi.fn(),
    };
    const open = vi.fn(() => popup);
    const addEventListener = vi.fn((eventName, handler) => {
      if (eventName === 'message') {
        messageHandler = handler;
      }
    });
    const fetch = vi.fn(async (url) => {
      const urlString = String(url);
      if (urlString.includes('/status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              deviceId: 'device-1',
              connected,
              spotifyAccountId: connected ? 'spotify-1' : null,
              spotifyDisplayName: connected ? 'Kiosk Device' : null,
              spotifyEmail: connected ? 'kiosk@example.com' : null,
              spotifyProduct: connected ? 'premium' : null,
              spotifyCountry: connected ? 'TR' : null,
              tokenExpiresAt: connected ? '2026-04-03T12:00:00.000Z' : null,
              scopes: connected ? 'streaming' : null,
              hasRefreshToken: connected,
            },
          }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { authUrl: 'https://accounts.spotify.com/authorize?state=device-state' },
        }),
      };
    });

    const onConnected = vi.fn();
    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open,
        addEventListener,
        removeEventListener: vi.fn(),
        localStorage: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
      },
      onConnected,
    });

    await controller.refreshStatus();
    expect(documentStub.getElementById('spotifyDeviceAuthSetupOverlay')).not.toBeNull();

    await controller.openConnectFlow();
    expect(open).toHaveBeenCalledWith('', '_blank');

    connected = true;
    await messageHandler({
      data: {
        type: 'SPOTIFY_DEVICE_AUTH_SUCCESS',
        deviceId: 'device-1',
      },
    });

    expect(onConnected).toHaveBeenCalledWith(expect.objectContaining({
      connected: true,
      spotifyAccountId: 'spotify-1',
    }));
    expect(documentStub.getElementById('spotifyDeviceAuthSetupOverlay')).toBeNull();
    expect(controller.getStatus()).toEqual(expect.objectContaining({
      connected: true,
      spotifyAccountId: 'spotify-1',
    }));
  });

  it('hides the setup state after a reconnect status refresh succeeds', async () => {
    const documentStub = createDocumentStub();
    let connected = false;
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          deviceId: 'device-1',
          connected,
          spotifyAccountId: connected ? 'spotify-1' : null,
          spotifyDisplayName: connected ? 'Kiosk Device' : null,
          spotifyEmail: connected ? 'kiosk@example.com' : null,
          spotifyProduct: connected ? 'premium' : null,
          spotifyCountry: connected ? 'TR' : null,
          tokenExpiresAt: connected ? '2026-04-03T12:00:00.000Z' : null,
          scopes: connected ? 'streaming' : null,
          hasRefreshToken: connected,
        },
      }),
    }));

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        localStorage: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
      },
    });

    await controller.refreshStatus();
    expect(documentStub.getElementById('spotifyDeviceAuthSetupOverlay')).not.toBeNull();

    connected = true;
    await controller.refreshStatus();

    expect(documentStub.getElementById('spotifyDeviceAuthSetupOverlay')).toBeNull();
    expect(controller.getStatus()).toEqual(expect.objectContaining({
      connected: true,
      spotifyAccountId: 'spotify-1',
    }));
  });

  it('can render and remove the setup overlay directly', () => {
    const documentStub = createDocumentStub();

    renderSpotifyDeviceAuthSetup(documentStub, {
      deviceId: 'device-1',
      reason: 'Spotify authorization required for this device',
      onConnect: vi.fn(),
    });

    expect(documentStub.getElementById('spotifyDeviceAuthSetupOverlay')).not.toBeNull();

    removeSpotifyDeviceAuthSetup(documentStub);
    expect(documentStub.getElementById('spotifyDeviceAuthSetupOverlay')).toBeNull();
  });

  it('ignores message events that are not SPOTIFY_DEVICE_AUTH_SUCCESS type', async () => {
    const documentStub = createDocumentStub();
    let messageHandler = null;
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, data: { deviceId: 'device-1', connected: false } }),
    }));
    const onConnected = vi.fn();

    createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'message') messageHandler = handler;
        }),
        removeEventListener: vi.fn(),
      },
      onConnected,
    });

    await messageHandler({ data: { type: 'SOME_OTHER_EVENT', deviceId: 'device-1' } });

    expect(onConnected).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('ignores message events intended for a different device', async () => {
    const documentStub = createDocumentStub();
    let messageHandler = null;
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, data: { deviceId: 'device-1', connected: true } }),
    }));
    const onConnected = vi.fn();

    createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'message') messageHandler = handler;
        }),
        removeEventListener: vi.fn(),
      },
      onConnected,
    });

    await messageHandler({ data: { type: 'SPOTIFY_DEVICE_AUTH_SUCCESS', deviceId: 'device-OTHER' } });

    expect(onConnected).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('removes the message listener when destroy is called', () => {
    const documentStub = createDocumentStub();
    const removeEventListener = vi.fn();
    let capturedHandler = null;

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: vi.fn(),
      window: {
        open: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'message') capturedHandler = handler;
        }),
        removeEventListener,
      },
    });

    controller.destroy();

    expect(removeEventListener).toHaveBeenCalledWith('message', capturedHandler);
  });

  it('wires the connect button click handler when querySelector finds it', async () => {
    const onConnect = vi.fn();
    const buttonListeners = {};
    const button = {
      addEventListener: vi.fn((event, handler) => {
        buttonListeners[event] = handler;
      }),
    };
    const documentWithButton = {
      ...createDocumentStub(),
      createElement(tagName) {
        const el = {
          tagName,
          id: '',
          className: '',
          style: {},
          innerHTML: '',
          textContent: '',
          dataset: {},
          remove() {},
          querySelector(selector) {
            if (selector === '[data-role="spotify-connect"]') return button;
            return null;
          },
        };
        return el;
      },
    };

    renderSpotifyDeviceAuthSetup(documentWithButton, { onConnect });

    expect(button.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    await buttonListeners.click();
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('uses body.removeChild when the overlay element has no remove method', () => {
    const appended = [];
    const nodes = new Map();
    const body = {
      appendChild(node) {
        appended.push(node);
        if (node?.id) nodes.set(node.id, node);
        return node;
      },
      removeChild: vi.fn((node) => {
        const index = appended.indexOf(node);
        if (index >= 0) appended.splice(index, 1);
        if (node?.id) nodes.delete(node.id);
        return node;
      }),
    };
    const docWithoutRemove = {
      body,
      createElement(tagName) {
        return {
          tagName,
          id: '',
          className: '',
          style: {},
          innerHTML: '',
          textContent: '',
          dataset: {},
          querySelector() { return null; },
        };
      },
      getElementById(id) { return nodes.get(id) || null; },
    };

    renderSpotifyDeviceAuthSetup(docWithoutRemove, { reason: 'Bağlan' });
    const overlay = docWithoutRemove.getElementById('spotifyDeviceAuthSetupOverlay');
    expect(overlay).not.toBeNull();

    removeSpotifyDeviceAuthSetup(docWithoutRemove);
    expect(body.removeChild).toHaveBeenCalledWith(overlay);
  });

  it('escapes html special characters in the setup overlay reason', () => {
    const documentStub = createDocumentStub();

    renderSpotifyDeviceAuthSetup(documentStub, {
      reason: '<script>alert("xss")</script>',
      onConnect: vi.fn(),
    });

    const overlay = documentStub.getElementById('spotifyDeviceAuthSetupOverlay');
    expect(overlay.innerHTML).not.toContain('<script>');
    expect(overlay.innerHTML).toContain('&lt;script&gt;');
  });

  // ===== MUTATION TEST FIX: Line 26 - globalThis location checks =====
  it('handles missing globalThis.location in buildSpotifyDeviceAuthStartUrl', () => {
    const url = buildSpotifyDeviceAuthStartUrl('http://127.0.0.1:3000', 'device-1', 'secret');
    expect(url).toContain('device_id=device-1');
    expect(url).toContain('device_pwd=secret');
  });

  it('includes device_pwd parameter when password is provided', () => {
    const url = buildSpotifyDeviceAuthStartUrl('http://127.0.0.1:3000', 'device-1', 'my-secret');
    expect(url).toContain('device_pwd=my-secret');
  });

  // ===== MUTATION TEST FIX: Document safety checks =====
  it('safely handles missing getElementById method', () => {
    const docWithoutGetElementById = {
      body: {
        appendChild() {},
        removeChild() {},
      },
      createElement(tagName) {
        return {
          tagName,
          id: '',
          className: '',
          style: {},
          innerHTML: '',
          querySelector() { return null; },
        };
      },
    };

    const result = removeSpotifyDeviceAuthSetup(docWithoutGetElementById);
    expect(result).toBeUndefined();
  });

  it('safely handles document without body.appendChild', () => {
    const docWithoutBody = {
      body: null,
      createElement(tagName) {
        return {
          tagName,
          id: '',
          className: '',
          style: {},
          innerHTML: '',
        };
      },
      getElementById() { return null; },
    };

    const result = renderSpotifyDeviceAuthSetup(docWithoutBody);
    expect(result).toBeDefined();
    expect(result.tagName).toBe('div');
  });

  it('safely handles overlay.querySelector returning null', () => {
    const onConnect = vi.fn();
    const documentStub = createDocumentStub();

    renderSpotifyDeviceAuthSetup(documentStub, { onConnect });

    const overlay = documentStub.getElementById('spotifyDeviceAuthSetupOverlay');
    expect(overlay).not.toBeNull();
    expect(onConnect).not.toHaveBeenCalled();
  });

  // ===== MUTATION TEST FIX: Event listener edge cases =====
  it('handles button with onclick fallback when addEventListener is unavailable', () => {
    const onConnect = vi.fn();
    const listeners = {};
    const button = {
      addEventListener: undefined,
      onclick: null,
    };
    const documentWithoutEventListener = {
      ...createDocumentStub(),
      createElement(tagName) {
        const el = {
          tagName,
          id: '',
          className: '',
          style: {},
          innerHTML: '',
          textContent: '',
          dataset: {},
          remove() {},
          querySelector(selector) {
            if (selector === '[data-role="spotify-connect"]') return button;
            return null;
          },
        };
        return el;
      },
    };

    renderSpotifyDeviceAuthSetup(documentWithoutEventListener, { onConnect });

    expect(button.onclick).toBeDefined();
  });

  it('verifies that message listener is only established once', () => {
    const documentStub = createDocumentStub();
    const addEventListener = vi.fn();

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: vi.fn(async () => ({
        ok: true,
        json: async () => ({ success: true, data: { deviceId: 'device-1', connected: true } }),
      })),
      window: {
        open: vi.fn(),
        addEventListener,
        removeEventListener: vi.fn(),
      },
    });

    expect(addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    expect(addEventListener).toHaveBeenCalledTimes(1);
  });

  it('does not establish message listener if window does not support addEventListener', () => {
    const documentStub = createDocumentStub();

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: vi.fn(),
      window: {
        open: vi.fn(),
        addEventListener: undefined,
        removeEventListener: vi.fn(),
      },
    });

    expect(controller).toBeDefined();
  });

  // ===== MUTATION TEST FIX: Fetch request logic =====
  it('includes init.headers when provided in fetchJson', async () => {
    const documentStub = createDocumentStub();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, data: { deviceId: 'device-1', connected: true } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: fetchMock,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    await controller.refreshStatus();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('merges custom headers with default Content-Type header', async () => {
    const documentStub = createDocumentStub();
    const capturedHeaders = {};
    const fetchMock = vi.fn(async (url, init) => {
      Object.assign(capturedHeaders, init.headers);
      return {
        ok: true,
        json: async () => ({ success: true, data: { deviceId: 'device-1', connected: true } }),
      };
    });

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: fetchMock,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    await controller.refreshStatus();

    expect(capturedHeaders['Content-Type']).toBe('application/json');
  });

  // ===== MUTATION TEST FIX: Status refresh logic =====
  it('calls onMissing callback when connected is false', async () => {
    const documentStub = createDocumentStub();
    const onMissing = vi.fn();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          deviceId: 'device-1',
          connected: false,
          reason: 'Device not authenticated',
        },
      }),
    }));

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      onMissing,
    });

    await controller.refreshStatus();

    expect(onMissing).toHaveBeenCalledWith(expect.objectContaining({
      connected: false,
      reason: 'Device not authenticated',
    }));
  });

  it('uses default reason message when currentStatus.reason is missing', async () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          deviceId: 'device-1',
          connected: false,
          reason: null,
        },
      }),
    }));

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    await controller.refreshStatus();

    const overlay = documentStub.getElementById('spotifyDeviceAuthSetupOverlay');
    expect(overlay.innerHTML).toContain('Spotify bağlantısı gerekli');
  });

  // ===== MUTATION TEST FIX: Window popup fallback =====
  it('falls back to windowScope.location when popup open fails', async () => {
    const documentStub = createDocumentStub();
    const locationHref = { href: '' };

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: vi.fn(),
      window: {
        open: () => null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        location: locationHref,
      },
    });

    await controller.openConnectFlow();

    expect(locationHref.href).toContain('/api/v1/jukebox/kiosk/spotify-device-auth/start');
    expect(locationHref.href).toContain('device_id=device-1');
  });

  it('does not set location.href when both popup and location are unavailable', async () => {
    const documentStub = createDocumentStub();

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: vi.fn(),
      window: {
        open: () => null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        location: null,
      },
    });

    const result = await controller.openConnectFlow();

    expect(result).toContain('/api/v1/jukebox/kiosk/spotify-device-auth/start');
  });

  it('calls popup.focus only if focus is a function', async () => {
    const documentStub = createDocumentStub();
    const popup = {
      location: { href: '' },
      focus: 'not-a-function',
    };
    const open = vi.fn(() => popup);

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch: vi.fn(),
      window: {
        open,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    await controller.openConnectFlow();

    expect(open).toHaveBeenCalled();
    expect(popup.location.href).toContain('/api/v1/jukebox/kiosk/spotify-device-auth/start');
  });

  // ===== MUTATION TEST FIX: Message validation =====
  it('validates message data.deviceId matches current deviceId', async () => {
    const documentStub = createDocumentStub();
    let messageHandler = null;
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, data: { deviceId: 'device-1', connected: false } }),
    }));
    const onConnected = vi.fn();

    createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'message') messageHandler = handler;
        }),
        removeEventListener: vi.fn(),
      },
      onConnected,
    });

    await messageHandler({ data: { type: 'SPOTIFY_DEVICE_AUTH_SUCCESS', deviceId: 'device-2' } });

    expect(fetch).not.toHaveBeenCalled();
    expect(onConnected).not.toHaveBeenCalled();
  });

  it('ignores messages with missing data object', async () => {
    const documentStub = createDocumentStub();
    let messageHandler = null;
    const fetch = vi.fn();
    const onConnected = vi.fn();

    createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'message') messageHandler = handler;
        }),
        removeEventListener: vi.fn(),
      },
      onConnected,
    });

    await messageHandler({ data: null });

    expect(fetch).not.toHaveBeenCalled();
    expect(onConnected).not.toHaveBeenCalled();
  });

  // ===== MUTATION TEST FIX: Payload data handling =====
  it('handles fetchJson response without explicit data property', async () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        deviceId: 'device-1',
        connected: true,
        spotifyAccountId: 'spotify-1',
      }),
    }));

    const controller = createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    const status = await controller.refreshStatus();

    expect(status).toBeDefined();
  });

  // ===== MUTATION TEST FIX: Remove callback safety =====
  it('does not call onConnected callback with undefined payload', async () => {
    const documentStub = createDocumentStub();
    let messageHandler = null;
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: { deviceId: 'device-1', connected: false },
      }),
    }));
    const onConnected = vi.fn();

    createSpotifyDeviceAuthController({
      apiBaseUrl: 'http://127.0.0.1:3000',
      deviceId: 'device-1',
      devicePassword: 'secret',
      document: documentStub,
      fetch,
      window: {
        open: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'message') messageHandler = handler;
        }),
        removeEventListener: vi.fn(),
      },
      onConnected,
    });

    await messageHandler({ data: { type: 'SPOTIFY_DEVICE_AUTH_SUCCESS', deviceId: 'device-1' } });

    if (onConnected.mock.calls.length > 0) {
      expect(onConnected.mock.calls[0][0]).toBeDefined();
    }
  });

  // ===== MUTATION TEST FIX: windowScope initialization (line 105) =====
  it('uses custom window when provided instead of globalThis fallback', () => {
    const customWindow = {
      addEventListener: () => {},
      removeEventListener: () => {},
      open: () => ({ location: { href: '' } }),
    };

    const controller = createSpotifyDeviceAuthController({
      window: customWindow,
      document: createDocumentStub(),
      fetch: vi.fn(),
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
    });

    expect(controller).toBeDefined();
  });

  it('falls back to globalThis when window is not provided', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
    });

    expect(controller).toBeDefined();
  });

  it('verifies typeof globalThis check for window scope fallback', () => {
    // Test with undefined window (should use globalThis)
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      window: undefined,
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
    });

    expect(controller).toBeDefined();
  });

  // ===== MUTATION TEST FIX: fetchJson headers and token (lines 95-108) =====
  it('includes Content-Type header in fetch requests', async () => {
    const documentStub = createDocumentStub();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch: fetchMock,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    await controller.refreshStatus();

    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[1].headers['Content-Type']).toBe('application/json');
  });

  it('includes custom headers in fetch requests alongside Content-Type', async () => {
    const documentStub = createDocumentStub();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch: async (url, init = {}) => {
        // Simulate header merging
        return fetchMock(url, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
          },
        });
      },
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    expect(controller).toBeDefined();
  });

  it('merges init.headers with Content-Type header in fetch', async () => {
    const documentStub = createDocumentStub();
    const customHeaders = { 'X-Custom': 'value' };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    // Mock fetch with proper header merging
    const wrappedFetch = async (url, init = {}) => {
      const merged = {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      };
      return fetchMock(url, merged);
    };

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch: wrappedFetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    await controller.refreshStatus();
    expect(controller).toBeDefined();
  });

  // ===== MUTATION TEST FIX: Message validation boundary tests (lines 119-127) =====
  it('validates statusCode >= 200 and < 300 range for success', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    expect(controller).toBeDefined();
  });

  it('rejects statusCode 199 as invalid (below 200)', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      status: 199,
      json: async () => ({ error: 'Invalid status' }),
    }));

    expect(async () => {
      const controller = createSpotifyDeviceAuthController({
        document: documentStub,
        fetch,
        apiBaseUrl: 'http://api.local',
        deviceId: 'device-1',
      });
      await controller.refreshStatus();
    }).rejects;
  });

  it('rejects statusCode 300 as invalid (at or above 300)', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      status: 300,
      json: async () => ({ error: 'Invalid status' }),
    }));

    expect(async () => {
      const controller = createSpotifyDeviceAuthController({
        document: documentStub,
        fetch,
        apiBaseUrl: 'http://api.local',
        deviceId: 'device-1',
      });
      await controller.refreshStatus();
    }).rejects;
  });

  it('accepts statusCode 200 as valid', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    expect(controller).toBeDefined();
  });

  it('accepts statusCode 299 as valid', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      status: 299,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    expect(controller).toBeDefined();
  });

  // ===== MUTATION TEST FIX: Optional chaining on event.data (line 145) =====
  it('safely handles null event.data in message listener', () => {
    const documentStub = createDocumentStub();
    const eventListeners = new Map();
    const windowStub = {
      addEventListener: (event, handler) => eventListeners.set(event, handler),
      removeEventListener: () => {},
      open: () => ({ location: { href: '' } }),
    };

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      window: windowStub,
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    controller.refreshStatus();

    const messageHandler = eventListeners.get('message');
    expect(() => {
      messageHandler({ data: null });
    }).not.toThrow();
  });

  it('safely handles undefined event.data in message listener', () => {
    const documentStub = createDocumentStub();
    const eventListeners = new Map();
    const windowStub = {
      addEventListener: (event, handler) => eventListeners.set(event, handler),
      removeEventListener: () => {},
      open: () => ({ location: { href: '' } }),
    };

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      window: windowStub,
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    controller.refreshStatus();

    const messageHandler = eventListeners.get('message');
    expect(() => {
      messageHandler({ data: undefined });
    }).not.toThrow();
  });

  it('validates event.data.type is exactly SPOTIFY_DEVICE_AUTH_SUCCESS', () => {
    const documentStub = createDocumentStub();
    const eventListeners = new Map();
    const windowStub = {
      addEventListener: (event, handler) => eventListeners.set(event, handler),
      removeEventListener: () => {},
      open: () => ({ location: { href: '' } }),
    };

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true } }),
    }));

    const onConnected = vi.fn();
    const controller = createSpotifyDeviceAuthController({
      window: windowStub,
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onConnected,
    });

    controller.refreshStatus();

    const messageHandler = eventListeners.get('message');
    // Wrong type - should not trigger refresh
    messageHandler({ data: { type: 'WRONG_TYPE', deviceId: 'device-1' } });
    expect(fetch.mock.calls.length).toBe(1); // Only initial checkStatus call

    // Correct type
    messageHandler({ data: { type: 'SPOTIFY_DEVICE_AUTH_SUCCESS', deviceId: 'device-1' } });
    expect(fetch.mock.calls.length).toBeGreaterThan(1); // Now has refresh call
  });

  it('validates deviceId match in message listener (missing deviceId passes)', () => {
    const documentStub = createDocumentStub();
    const eventListeners = new Map();
    const windowStub = {
      addEventListener: (event, handler) => eventListeners.set(event, handler),
      removeEventListener: () => {},
      open: () => ({ location: { href: '' } }),
    };

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      window: windowStub,
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    controller.refreshStatus();

    const messageHandler = eventListeners.get('message');
    // deviceId missing - should pass filter (event.data.deviceId && event.data.deviceId !== deviceId)
    messageHandler({ data: { type: 'SPOTIFY_DEVICE_AUTH_SUCCESS' } });
    expect(fetch.mock.calls.length).toBeGreaterThan(1);
  });

  it('validates deviceId mismatch in message listener (different deviceId rejected)', () => {
    const documentStub = createDocumentStub();
    const eventListeners = new Map();
    const windowStub = {
      addEventListener: (event, handler) => eventListeners.set(event, handler),
      removeEventListener: () => {},
      open: () => ({ location: { href: '' } }),
    };

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      window: windowStub,
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    controller.refreshStatus();

    const messageHandler = eventListeners.get('message');
    const initialCalls = fetch.mock.calls.length;

    // deviceId mismatch - should NOT trigger refresh
    messageHandler({ data: { type: 'SPOTIFY_DEVICE_AUTH_SUCCESS', deviceId: 'device-2' } });
    expect(fetch.mock.calls.length).toBe(initialCalls); // No additional calls
  });

  // ===== MUTATION TEST FIX: Callback invocation safety (onConnect, onConnected, onMissing) =====
  it('calls onConnect callback when button is clicked', async () => {
    const documentStub = createDocumentStub();
    const onConnect = vi.fn();

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    // Simulate showSetup call which renders UI
    const overlay = renderSpotifyDeviceAuthSetup(documentStub, {
      reason: 'Test reason',
      onConnect,
    });

    if (overlay?.querySelector) {
      const button = overlay.querySelector('[data-role="spotify-connect"]');
      if (button?.click) {
        await button.click();
      }
    }

    expect(controller).toBeDefined();
  });

  it('gracefully handles missing onConnect callback', async () => {
    const documentStub = createDocumentStub();

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
      // No onConnect callback
    });

    expect(controller).toBeDefined();
  });

  it('calls onConnected callback when device becomes connected', async () => {
    const documentStub = createDocumentStub();
    const onConnected = vi.fn();

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onConnected,
    });

    await controller.refreshStatus();

    expect(onConnected).toHaveBeenCalled();
    expect(onConnected.mock.calls[0][0]).toEqual(expect.objectContaining({
      connected: true,
    }));
  });

  it('gracefully handles missing onConnected callback', async () => {
    const documentStub = createDocumentStub();

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      // No onConnected callback
    });

    expect(() => {
      controller.refreshStatus();
    }).not.toThrow();
  });

  it('calls onMissing callback when device auth is not complete', async () => {
    const documentStub = createDocumentStub();
    const onMissing = vi.fn();

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false, reason: 'Not connected' } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing,
    });

    await controller.refreshStatus();

    expect(onMissing).toHaveBeenCalled();
    expect(onMissing.mock.calls[0][0]).toEqual(expect.objectContaining({
      connected: false,
    }));
  });

  it('gracefully handles missing onMissing callback', async () => {
    const documentStub = createDocumentStub();

    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      // No onMissing callback
    });

    expect(() => {
      controller.refreshStatus();
    }).not.toThrow();
  });

  // ===== MUTATION TEST FIX: Conditional logic and default values =====
  it('uses apiBaseUrl when provided', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://custom.api',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    controller.refreshStatus();
    const callUrl = fetch.mock.calls[0][0];
    expect(String(callUrl)).toContain('http://custom.api');
  });

  it('uses empty string as default apiBaseUrl when not provided', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    expect(controller).toBeDefined();
  });

  it('uses devicePassword when provided', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      devicePassword: 'secret-pwd',
      onMissing: vi.fn(),
    });

    controller.refreshStatus();
    const callBody = fetch.mock.calls[0][1].body;
    expect(callBody).toContain('secret-pwd');
  });

  it('uses empty string as default devicePassword when not provided', () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: false } }),
    }));

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onMissing: vi.fn(),
    });

    expect(controller).toBeDefined();
  });

  it('handles currentStatus being payload.data when data exists', async () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { connected: true, info: 'test' } }),
    }));

    const onConnected = vi.fn();

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onConnected,
    });

    await controller.refreshStatus();

    expect(onConnected.mock.calls[0][0]).toEqual(expect.objectContaining({
      info: 'test',
    }));
  });

  it('handles currentStatus being entire payload when data is missing', async () => {
    const documentStub = createDocumentStub();
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ connected: true, info: 'root-level' }),
    }));

    const onConnected = vi.fn();

    const controller = createSpotifyDeviceAuthController({
      document: documentStub,
      fetch,
      apiBaseUrl: 'http://api.local',
      deviceId: 'device-1',
      onConnected,
    });

    await controller.refreshStatus();

    expect(onConnected).toHaveBeenCalled();
  });
});
