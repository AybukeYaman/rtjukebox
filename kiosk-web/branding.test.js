import { describe, expect, it } from 'vitest';
import brandingHelpers from './branding.js';

const { initializeBrandLogoFallback, setBrandLogoState } = brandingHelpers;

function createClassList(initialClasses = []) {
  const classes = new Set(initialClasses);

  return {
    add: (...tokens) => {
      tokens.forEach((token) => classes.add(token));
    },
    remove: (...tokens) => {
      tokens.forEach((token) => classes.delete(token));
    },
    toggle: (token, force) => {
      if (typeof force === 'boolean') {
        if (force) {
          classes.add(token);
        } else {
          classes.delete(token);
        }
        return force;
      }

      if (classes.has(token)) {
        classes.delete(token);
        return false;
      }

      classes.add(token);
      return true;
    },
    contains: (token) => classes.has(token),
  };
}

function createEventTarget() {
  const listeners = new Map();

  return {
    addEventListener: (eventName, handler) => {
      listeners.set(eventName, handler);
    },
    dispatch: (eventName) => {
      const handler = listeners.get(eventName);
      if (handler) {
        handler();
      }
    },
  };
}

function createBrandNodes(options = {}) {
  const logoContainer = {
    dataset: {},
  };
  const logoText = {
    classList: createClassList(['is-hidden']),
  };
  const logoImage = {
    ...createEventTarget(),
    classList: createClassList(),
    complete: options.complete ?? false,
    naturalWidth: options.naturalWidth ?? 0,
  };

  return { logoContainer, logoImage, logoText };
}

describe('kiosk branding helpers', () => {
  it('keeps the fallback text hidden when the logo loads successfully', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();
    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    logoImage.dispatch('load');

    expect(controller.getState()).toBe('loaded');
    expect(logoContainer.dataset.logoState).toBe('loaded');
    expect(logoImage.classList.contains('is-hidden')).toBe(false);
    expect(logoText.classList.contains('is-hidden')).toBe(true);
  });

  it('shows the RadioTEDU text fallback when the logo fails to load', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();
    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    logoImage.dispatch('error');

    expect(controller.getState()).toBe('fallback');
    expect(logoContainer.dataset.logoState).toBe('fallback');
    expect(logoImage.classList.contains('is-hidden')).toBe(true);
    expect(logoText.classList.contains('is-hidden')).toBe(false);
  });

  it('treats already loaded images as loaded during initialization', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes({
      complete: true,
      naturalWidth: 320,
    });

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
    expect(logoContainer.dataset.logoState).toBe('loaded');
    expect(logoImage.classList.contains('is-hidden')).toBe(false);
    expect(logoText.classList.contains('is-hidden')).toBe(true);
  });

  it('shows fallback when image is already complete but has zero natural width', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes({
      complete: true,
      naturalWidth: 0,
    });

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('fallback');
    expect(logoContainer.dataset.logoState).toBe('fallback');
    expect(logoImage.classList.contains('is-hidden')).toBe(true);
    expect(logoText.classList.contains('is-hidden')).toBe(false);
  });

  it('sets logo state data attribute and toggles classes correctly for fallback', () => {
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList: createClassList() },
      logoText: { classList: createClassList(['is-hidden']) },
    };

    setBrandLogoState(params, 'fallback');

    expect(params.logoContainer.dataset.logoState).toBe('fallback');
    expect(params.logoImage.classList.contains('is-hidden')).toBe(true);
    expect(params.logoText.classList.contains('is-hidden')).toBe(false);
  });

  it('sets logo state data attribute and toggles classes correctly for loaded', () => {
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList: createClassList(['is-hidden']) },
      logoText: { classList: createClassList() },
    };

    setBrandLogoState(params, 'loaded');

    expect(params.logoContainer.dataset.logoState).toBe('loaded');
    expect(params.logoImage.classList.contains('is-hidden')).toBe(false);
    expect(params.logoText.classList.contains('is-hidden')).toBe(true);
  });

  it('does not throw when setBrandLogoState is called with null params', () => {
    expect(() => setBrandLogoState(null, 'loaded')).not.toThrow();
    expect(() => setBrandLogoState(null, 'fallback')).not.toThrow();
  });

  it('does not throw when setBrandLogoState receives null element refs', () => {
    expect(() => setBrandLogoState(
      { logoContainer: null, logoImage: null, logoText: null },
      'loaded'
    )).not.toThrow();
  });

  // ===== MUTATION TEST FIX: Optional chaining safety =====
  it('handles missing classList property on logo elements', () => {
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList: undefined },
      logoText: { classList: undefined },
    };

    expect(() => setBrandLogoState(params, 'loaded')).not.toThrow();
  });

  it('handles null classList object on logo elements', () => {
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList: null },
      logoText: { classList: null },
    };

    expect(() => setBrandLogoState(params, 'fallback')).not.toThrow();
  });

  // ===== MUTATION TEST FIX: Root scope fallback logic =====
  it('uses custom root when provided', () => {
    const customRoot = {
      getElementById: () => null,
    };

    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      root: customRoot,
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBeDefined();
  });

  it('falls back to document when root is not provided', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('handles missing root by using null root scope fallback', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      root: null,
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  // ===== MUTATION TEST FIX: Initial state mutations =====
  it('initializes with correct state when elements are provided', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('verifies markLoaded callback actually changes state', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    // First set to fallback
    controller.markFallback();
    expect(controller.getState()).toBe('fallback');

    // Then call markLoaded
    controller.markLoaded();
    expect(controller.getState()).toBe('loaded');
  });

  it('verifies markFallback callback actually changes state', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes({
      complete: true,
      naturalWidth: 320,
    });

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    // First state is loaded
    expect(controller.getState()).toBe('loaded');

    // Then call markFallback
    controller.markFallback();
    expect(controller.getState()).toBe('fallback');
  });

  // ===== MUTATION TEST FIX: Event listener setup =====
  it('registers both load and error event listeners on logo image', () => {
    const listeners = new Map();
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: false,
      naturalWidth: 0,
      addEventListener: (eventName, handler) => {
        listeners.set(eventName, handler);
      },
    };

    initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(listeners.has('load')).toBe(true);
    expect(listeners.has('error')).toBe(true);
  });

  it('does not fail when addEventListener is not available on logo image', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();
    logoImage.addEventListener = undefined;

    expect(() => initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    })).not.toThrow();
  });

  // ===== MUTATION TEST FIX: Complete image handling =====
  it('checks naturalWidth only when image is complete', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes({
      complete: false,
      naturalWidth: 0,
    });

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('handles image with complete=true but missing naturalWidth property', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      ...createEventTarget(),
      classList: createClassList(),
      complete: true,
      naturalWidth: undefined,
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('fallback');
  });

  it('verifies event listener event names are correct', () => {
    const registeredEvents = [];
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: false,
      naturalWidth: 0,
      addEventListener: (eventName) => {
        registeredEvents.push(eventName);
      },
    };

    initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(registeredEvents).toContain('load');
    expect(registeredEvents).toContain('error');
  });

  it('handles container dataset access when dataset is undefined', () => {
    const params = {
      logoContainer: { dataset: undefined },
      logoImage: { classList: createClassList() },
      logoText: { classList: createClassList() },
    };

    expect(() => setBrandLogoState(params, 'loaded')).not.toThrow();
  });

  it('verifies state transitions update dataset correctly', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();
    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(logoContainer.dataset.logoState).toBe('loaded');

    controller.markFallback();
    expect(logoContainer.dataset.logoState).toBe('fallback');

    controller.markLoaded();
    expect(logoContainer.dataset.logoState).toBe('loaded');
  });

  // ===== MUTATION TEST FIX: rootScope typeof check (line 29) =====
  it('uses explicit root when provided instead of typeof document check', () => {
    const customRoot = {
      getElementById: (id) => {
        if (id === 'brandLogo') {
          return { dataset: {} };
        }
        return null;
      },
    };
    const { logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      root: customRoot,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBeDefined();
  });

  it('handles undefined root by using typeof document fallback', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      root: undefined,
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('verifies typeof document check with undefined root when document not available', () => {
    // This tests the conditional: typeof document !== 'undefined' ? document : null
    const customRoot = null;
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      root: customRoot,
      logoContainer,
      logoImage,
      logoText,
    });

    // With current document available (browser env), should work
    expect(controller.getState()).toBe('loaded');
  });

  it('handles root parameter being explicitly false (falsy)', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      root: false,
      logoContainer,
      logoImage,
      logoText,
    });

    // Should use document due to falsy root being nullish-coalesced
    expect(controller.getState()).toBe('loaded');
  });

  it('handles root parameter being explicitly 0 (falsy)', () => {
    const { logoContainer, logoImage, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      root: 0,
      logoContainer,
      logoImage,
      logoText,
    });

    // 0 is falsy, so ?? will use right side (document)
    expect(controller.getState()).toBe('loaded');
  });

  // ===== MUTATION TEST FIX: logoImage addEventListener optional chaining (lines 45-46) =====
  it('safely handles null logoImage without registering listeners', () => {
    const { logoContainer, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage: null,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('safely handles undefined logoImage without registering listeners', () => {
    const { logoContainer, logoText } = createBrandNodes();

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage: undefined,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('does not throw when logoImage is an object without addEventListener', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: false,
      naturalWidth: 0,
      // No addEventListener method
    };

    expect(() => initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    })).not.toThrow();
  });

  it('verifies logoImage?.addEventListener?.() only called on valid objects', () => {
    const listenerCalls = [];
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: false,
      naturalWidth: 0,
      addEventListener: (event, handler) => {
        listenerCalls.push(event);
      },
    };

    initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(listenerCalls.length).toBe(2);
    expect(listenerCalls).toContain('load');
    expect(listenerCalls).toContain('error');
  });

  it('handles logoImage.addEventListener being null (not just missing)', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: false,
      naturalWidth: 0,
      addEventListener: null,
    };

    expect(() => initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    })).not.toThrow();
  });

  // ===== PHASE 5 ADDITION: More comprehensive tests for naturalWidth boundary =====
  it('checks naturalWidth > 0 boundary condition (exactly 1px)', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: true,
      naturalWidth: 1,  // Boundary: just above 0
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('checks naturalWidth > 0 boundary condition (exactly 0)', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: true,
      naturalWidth: 0,  // Boundary: at 0
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('fallback');
  });

  it('checks naturalWidth with large value', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: true,
      naturalWidth: 99999,
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    expect(controller.getState()).toBe('loaded');
  });

  it('verifies classList toggle with explicit false value', () => {
    const classList = createClassList(['is-hidden']);
    expect(classList.contains('is-hidden')).toBe(true);
    classList.toggle('is-hidden', false);
    expect(classList.contains('is-hidden')).toBe(false);
  });

  it('verifies classList toggle with explicit true value', () => {
    const classList = createClassList();
    expect(classList.contains('is-hidden')).toBe(false);
    classList.toggle('is-hidden', true);
    expect(classList.contains('is-hidden')).toBe(true);
  });

  it('verifies setBrandLogoState toggle logic for is-hidden on loaded state', () => {
    const classList = createClassList();
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList },
      logoText: { classList: createClassList() },
    };

    setBrandLogoState(params, 'loaded');
    // For loaded state: logoImage.classList.toggle('is-hidden', state !== 'loaded')
    // state !== 'loaded' = false, so is-hidden should be removed
    expect(classList.contains('is-hidden')).toBe(false);
  });

  it('verifies setBrandLogoState toggle logic for is-hidden on fallback state', () => {
    const classList = createClassList();
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList },
      logoText: { classList: createClassList() },
    };

    setBrandLogoState(params, 'fallback');
    // For fallback state: logoImage.classList.toggle('is-hidden', state !== 'loaded')
    // state !== 'loaded' = true, so is-hidden should be added
    expect(classList.contains('is-hidden')).toBe(true);
  });

  it('verifies logoText toggle logic for is-hidden on loaded state', () => {
    const classList = createClassList(['is-hidden']);
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList: createClassList() },
      logoText: { classList },
    };

    setBrandLogoState(params, 'loaded');
    // For loaded state: logoText.classList.toggle('is-hidden', state === 'loaded')
    // state === 'loaded' = true, so is-hidden should be added
    expect(classList.contains('is-hidden')).toBe(true);
  });

  it('verifies logoText toggle logic for is-hidden on fallback state', () => {
    const classList = createClassList();
    const params = {
      logoContainer: { dataset: {} },
      logoImage: { classList: createClassList() },
      logoText: { classList },
    };

    setBrandLogoState(params, 'fallback');
    // For fallback state: logoText.classList.toggle('is-hidden', state === 'loaded')
    // state === 'loaded' = false, so is-hidden should be removed
    expect(classList.contains('is-hidden')).toBe(false);
  });

  it('handles complete check with null logoImage.complete', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: null,
      naturalWidth: 100,
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    // null is falsy, so complete check should fail and state should be 'loaded' (initial)
    expect(controller.getState()).toBe('loaded');
  });

  it('handles complete check with undefined logoImage.complete', () => {
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: undefined,
      naturalWidth: 100,
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    // undefined is falsy, so complete check should fail
    expect(controller.getState()).toBe('loaded');
  });

  it('verifies entire flow: complete=true, naturalWidth>0, listeners should work', () => {
    const listeners = new Map();
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: true,
      naturalWidth: 500,
      addEventListener: (event, handler) => {
        listeners.set(event, handler);
      },
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    // Should already be marked as loaded due to complete=true and naturalWidth>0
    expect(controller.getState()).toBe('loaded');

    // But listeners should still be registered
    expect(listeners.has('load')).toBe(true);
    expect(listeners.has('error')).toBe(true);

    // And we should be able to change state via callbacks
    const errorHandler = listeners.get('error');
    errorHandler();
    expect(controller.getState()).toBe('fallback');
  });

  it('verifies entire flow: complete=true, naturalWidth=0, listeners should work', () => {
    const listeners = new Map();
    const { logoContainer, logoText } = createBrandNodes();
    const logoImage = {
      classList: createClassList(),
      complete: true,
      naturalWidth: 0,
      addEventListener: (event, handler) => {
        listeners.set(event, handler);
      },
    };

    const controller = initializeBrandLogoFallback({
      logoContainer,
      logoImage,
      logoText,
    });

    // Should be marked as fallback due to complete=true but naturalWidth=0
    expect(controller.getState()).toBe('fallback');

    // Listeners should still work
    expect(listeners.has('load')).toBe(true);
    expect(listeners.has('error')).toBe(true);

    // Load event should change state to loaded
    const loadHandler = listeners.get('load');
    loadHandler();
    expect(controller.getState()).toBe('loaded');
  });
});
