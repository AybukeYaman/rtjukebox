// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
(function (root, factory) {
  if (stryMutAct_9fa48("84")) {
    {}
  } else {
    stryCov_9fa48("84");
    const api = factory();
    if (stryMutAct_9fa48("87") ? typeof module === 'object' || module.exports : stryMutAct_9fa48("86") ? false : stryMutAct_9fa48("85") ? true : (stryCov_9fa48("85", "86", "87"), (stryMutAct_9fa48("89") ? typeof module !== 'object' : stryMutAct_9fa48("88") ? true : (stryCov_9fa48("88", "89"), typeof module === (stryMutAct_9fa48("90") ? "" : (stryCov_9fa48("90"), 'object')))) && module.exports)) {
      if (stryMutAct_9fa48("91")) {
        {}
      } else {
        stryCov_9fa48("91");
        module.exports = api;
        module.exports.default = api;
      }
    }
    root.KioskDeviceSpotifyAuth = api;
  }
})((stryMutAct_9fa48("94") ? typeof globalThis === 'undefined' : stryMutAct_9fa48("93") ? false : stryMutAct_9fa48("92") ? true : (stryCov_9fa48("92", "93", "94"), typeof globalThis !== (stryMutAct_9fa48("95") ? "" : (stryCov_9fa48("95"), 'undefined')))) ? globalThis : this, function () {
  if (stryMutAct_9fa48("96")) {
    {}
  } else {
    stryCov_9fa48("96");
    const SETUP_OVERLAY_ID = stryMutAct_9fa48("97") ? "" : (stryCov_9fa48("97"), 'spotifyDeviceAuthSetupOverlay');
    const SETUP_BUTTON_SELECTOR = stryMutAct_9fa48("98") ? "" : (stryCov_9fa48("98"), '[data-role="spotify-connect"]');
    function buildSpotifyDeviceAuthEndpoints(baseUrl) {
      if (stryMutAct_9fa48("99")) {
        {}
      } else {
        stryCov_9fa48("99");
        return stryMutAct_9fa48("100") ? {} : (stryCov_9fa48("100"), {
          status: stryMutAct_9fa48("101") ? `` : (stryCov_9fa48("101"), `${baseUrl}/api/v1/jukebox/kiosk/spotify-device-auth/status`),
          start: stryMutAct_9fa48("102") ? `` : (stryCov_9fa48("102"), `${baseUrl}/api/v1/jukebox/kiosk/spotify-device-auth/start`)
        });
      }
    }
    function buildSpotifyDeviceAuthStartUrl(baseUrl, deviceId, devicePassword) {
      if (stryMutAct_9fa48("103")) {
        {}
      } else {
        stryCov_9fa48("103");
        const url = new URL(stryMutAct_9fa48("104") ? `` : (stryCov_9fa48("104"), `${baseUrl}/api/v1/jukebox/kiosk/spotify-device-auth/start`), (stryMutAct_9fa48("107") ? typeof globalThis?.location?.href !== 'string' : stryMutAct_9fa48("106") ? false : stryMutAct_9fa48("105") ? true : (stryCov_9fa48("105", "106", "107"), typeof (stryMutAct_9fa48("109") ? globalThis.location?.href : stryMutAct_9fa48("108") ? globalThis?.location.href : (stryCov_9fa48("108", "109"), globalThis?.location?.href)) === (stryMutAct_9fa48("110") ? "" : (stryCov_9fa48("110"), 'string')))) ? globalThis.location.href : undefined);
        url.searchParams.set(stryMutAct_9fa48("111") ? "" : (stryCov_9fa48("111"), 'device_id'), deviceId);
        if (stryMutAct_9fa48("113") ? false : stryMutAct_9fa48("112") ? true : (stryCov_9fa48("112", "113"), devicePassword)) {
          if (stryMutAct_9fa48("114")) {
            {}
          } else {
            stryCov_9fa48("114");
            url.searchParams.set(stryMutAct_9fa48("115") ? "" : (stryCov_9fa48("115"), 'device_pwd'), devicePassword);
          }
        }
        return url.toString();
      }
    }
    function removeSpotifyDeviceAuthSetup(documentScope) {
      if (stryMutAct_9fa48("116")) {
        {}
      } else {
        stryCov_9fa48("116");
        const existing = stryMutAct_9fa48("118") ? documentScope.getElementById?.(SETUP_OVERLAY_ID) : stryMutAct_9fa48("117") ? documentScope?.getElementById(SETUP_OVERLAY_ID) : (stryCov_9fa48("117", "118"), documentScope?.getElementById?.(SETUP_OVERLAY_ID));
        if (stryMutAct_9fa48("121") ? false : stryMutAct_9fa48("120") ? true : stryMutAct_9fa48("119") ? existing : (stryCov_9fa48("119", "120", "121"), !existing)) {
          if (stryMutAct_9fa48("122")) {
            {}
          } else {
            stryCov_9fa48("122");
            return;
          }
        }
        if (stryMutAct_9fa48("125") ? typeof existing.remove !== 'function' : stryMutAct_9fa48("124") ? false : stryMutAct_9fa48("123") ? true : (stryCov_9fa48("123", "124", "125"), typeof existing.remove === (stryMutAct_9fa48("126") ? "" : (stryCov_9fa48("126"), 'function')))) {
          if (stryMutAct_9fa48("127")) {
            {}
          } else {
            stryCov_9fa48("127");
            existing.remove();
            return;
          }
        }
        if (stryMutAct_9fa48("131") ? documentScope.body?.removeChild : stryMutAct_9fa48("130") ? documentScope?.body.removeChild : stryMutAct_9fa48("129") ? false : stryMutAct_9fa48("128") ? true : (stryCov_9fa48("128", "129", "130", "131"), documentScope?.body?.removeChild)) {
          if (stryMutAct_9fa48("132")) {
            {}
          } else {
            stryCov_9fa48("132");
            documentScope.body.removeChild(existing);
          }
        }
      }
    }
    function renderSpotifyDeviceAuthSetup(documentScope, options = {}) {
      if (stryMutAct_9fa48("133")) {
        {}
      } else {
        stryCov_9fa48("133");
        if (stryMutAct_9fa48("136") ? false : stryMutAct_9fa48("135") ? true : stryMutAct_9fa48("134") ? documentScope?.createElement : (stryCov_9fa48("134", "135", "136"), !(stryMutAct_9fa48("137") ? documentScope.createElement : (stryCov_9fa48("137"), documentScope?.createElement)))) {
          if (stryMutAct_9fa48("138")) {
            {}
          } else {
            stryCov_9fa48("138");
            return null;
          }
        }
        removeSpotifyDeviceAuthSetup(documentScope);
        const overlay = documentScope.createElement(stryMutAct_9fa48("139") ? "" : (stryCov_9fa48("139"), 'div'));
        overlay.id = SETUP_OVERLAY_ID;
        overlay.className = stryMutAct_9fa48("140") ? "" : (stryCov_9fa48("140"), 'spotify-device-auth-setup-overlay');
        overlay.innerHTML = stryMutAct_9fa48("141") ? `` : (stryCov_9fa48("141"), `
            <div class="spotify-device-auth-setup-card">
                <div class="spotify-device-auth-setup-icon">♪</div>
                <div class="spotify-device-auth-setup-copy">
                    <div class="spotify-device-auth-setup-eyebrow">Spotify connect required</div>
                    <h2 class="spotify-device-auth-setup-title">Spotify bağlantısı gerekli</h2>
                    <p class="spotify-device-auth-setup-message">${escapeHtml(stryMutAct_9fa48("144") ? options.reason && 'Bu cihazın Spotify bağlantısını tamamlayın.' : stryMutAct_9fa48("143") ? false : stryMutAct_9fa48("142") ? true : (stryCov_9fa48("142", "143", "144"), options.reason || (stryMutAct_9fa48("145") ? "" : (stryCov_9fa48("145"), 'Bu cihazın Spotify bağlantısını tamamlayın.'))))}</p>
                </div>
                <button type="button" class="spotify-device-auth-setup-button" data-role="spotify-connect">Bağlan</button>
                <p class="spotify-device-auth-setup-footnote">Bağlantı tamamlanınca kiosk otomatik devam eder.</p>
            </div>
        `);
        if (stryMutAct_9fa48("148") ? typeof overlay.querySelector !== 'function' : stryMutAct_9fa48("147") ? false : stryMutAct_9fa48("146") ? true : (stryCov_9fa48("146", "147", "148"), typeof overlay.querySelector === (stryMutAct_9fa48("149") ? "" : (stryCov_9fa48("149"), 'function')))) {
          if (stryMutAct_9fa48("150")) {
            {}
          } else {
            stryCov_9fa48("150");
            const button = overlay.querySelector(SETUP_BUTTON_SELECTOR);
            if (stryMutAct_9fa48("153") ? button || typeof button.addEventListener === 'function' : stryMutAct_9fa48("152") ? false : stryMutAct_9fa48("151") ? true : (stryCov_9fa48("151", "152", "153"), button && (stryMutAct_9fa48("155") ? typeof button.addEventListener !== 'function' : stryMutAct_9fa48("154") ? true : (stryCov_9fa48("154", "155"), typeof button.addEventListener === (stryMutAct_9fa48("156") ? "" : (stryCov_9fa48("156"), 'function')))))) {
              if (stryMutAct_9fa48("157")) {
                {}
              } else {
                stryCov_9fa48("157");
                button.addEventListener(stryMutAct_9fa48("158") ? "" : (stryCov_9fa48("158"), 'click'), async () => {
                  if (stryMutAct_9fa48("159")) {
                    {}
                  } else {
                    stryCov_9fa48("159");
                    await (stryMutAct_9fa48("160") ? options.onConnect() : (stryCov_9fa48("160"), options.onConnect?.()));
                  }
                });
              }
            } else if (stryMutAct_9fa48("162") ? false : stryMutAct_9fa48("161") ? true : (stryCov_9fa48("161", "162"), button)) {
              if (stryMutAct_9fa48("163")) {
                {}
              } else {
                stryCov_9fa48("163");
                button.onclick = async () => {
                  if (stryMutAct_9fa48("164")) {
                    {}
                  } else {
                    stryCov_9fa48("164");
                    await (stryMutAct_9fa48("165") ? options.onConnect() : (stryCov_9fa48("165"), options.onConnect?.()));
                  }
                };
              }
            }
          }
        }
        if (stryMutAct_9fa48("169") ? documentScope.body?.appendChild : stryMutAct_9fa48("168") ? documentScope?.body.appendChild : stryMutAct_9fa48("167") ? false : stryMutAct_9fa48("166") ? true : (stryCov_9fa48("166", "167", "168", "169"), documentScope?.body?.appendChild)) {
          if (stryMutAct_9fa48("170")) {
            {}
          } else {
            stryCov_9fa48("170");
            documentScope.body.appendChild(overlay);
          }
        }
        return overlay;
      }
    }
    function escapeHtml(value) {
      if (stryMutAct_9fa48("171")) {
        {}
      } else {
        stryCov_9fa48("171");
        return String(stryMutAct_9fa48("172") ? value && '' : (stryCov_9fa48("172"), value ?? (stryMutAct_9fa48("173") ? "Stryker was here!" : (stryCov_9fa48("173"), '')))).replace(/&/g, stryMutAct_9fa48("174") ? "" : (stryCov_9fa48("174"), '&amp;')).replace(/</g, stryMutAct_9fa48("175") ? "" : (stryCov_9fa48("175"), '&lt;')).replace(/>/g, stryMutAct_9fa48("176") ? "" : (stryCov_9fa48("176"), '&gt;')).replace(/"/g, stryMutAct_9fa48("177") ? "" : (stryCov_9fa48("177"), '&quot;')).replace(/'/g, stryMutAct_9fa48("178") ? "" : (stryCov_9fa48("178"), '&#39;'));
      }
    }
    function createSpotifyDeviceAuthController(options = {}) {
      if (stryMutAct_9fa48("179")) {
        {}
      } else {
        stryCov_9fa48("179");
        const documentScope = options.document;
        const windowScope = stryMutAct_9fa48("182") ? options.window && (typeof globalThis !== 'undefined' ? globalThis : this) : stryMutAct_9fa48("181") ? false : stryMutAct_9fa48("180") ? true : (stryCov_9fa48("180", "181", "182"), options.window || ((stryMutAct_9fa48("185") ? typeof globalThis === 'undefined' : stryMutAct_9fa48("184") ? false : stryMutAct_9fa48("183") ? true : (stryCov_9fa48("183", "184", "185"), typeof globalThis !== (stryMutAct_9fa48("186") ? "" : (stryCov_9fa48("186"), 'undefined')))) ? globalThis : this));
        const apiBaseUrl = stryMutAct_9fa48("189") ? options.apiBaseUrl && '' : stryMutAct_9fa48("188") ? false : stryMutAct_9fa48("187") ? true : (stryCov_9fa48("187", "188", "189"), options.apiBaseUrl || (stryMutAct_9fa48("190") ? "Stryker was here!" : (stryCov_9fa48("190"), '')));
        const deviceId = options.deviceId;
        const devicePassword = stryMutAct_9fa48("193") ? options.devicePassword && '' : stryMutAct_9fa48("192") ? false : stryMutAct_9fa48("191") ? true : (stryCov_9fa48("191", "192", "193"), options.devicePassword || (stryMutAct_9fa48("194") ? "Stryker was here!" : (stryCov_9fa48("194"), '')));
        const endpoints = buildSpotifyDeviceAuthEndpoints(apiBaseUrl);
        let currentStatus = null;
        let messageListener = null;
        async function fetchJson(url, init = {}) {
          if (stryMutAct_9fa48("195")) {
            {}
          } else {
            stryCov_9fa48("195");
            const response = await options.fetch(url, stryMutAct_9fa48("196") ? {} : (stryCov_9fa48("196"), {
              ...init,
              headers: stryMutAct_9fa48("197") ? {} : (stryCov_9fa48("197"), {
                'Content-Type': stryMutAct_9fa48("198") ? "" : (stryCov_9fa48("198"), 'application/json'),
                ...(stryMutAct_9fa48("201") ? init.headers && {} : stryMutAct_9fa48("200") ? false : stryMutAct_9fa48("199") ? true : (stryCov_9fa48("199", "200", "201"), init.headers || {}))
              })
            }));
            if (stryMutAct_9fa48("204") ? false : stryMutAct_9fa48("203") ? true : stryMutAct_9fa48("202") ? response.ok : (stryCov_9fa48("202", "203", "204"), !response.ok)) {
              if (stryMutAct_9fa48("205")) {
                {}
              } else {
                stryCov_9fa48("205");
                let errorMessage = stryMutAct_9fa48("206") ? `` : (stryCov_9fa48("206"), `Spotify device auth request failed (${response.status})`);
                try {
                  if (stryMutAct_9fa48("207")) {
                    {}
                  } else {
                    stryCov_9fa48("207");
                    const errorData = await response.json();
                    if (stryMutAct_9fa48("210") ? errorData.error : stryMutAct_9fa48("209") ? false : stryMutAct_9fa48("208") ? true : (stryCov_9fa48("208", "209", "210"), errorData?.error)) {
                      if (stryMutAct_9fa48("211")) {
                        {}
                      } else {
                        stryCov_9fa48("211");
                        errorMessage = errorData.error;
                      }
                    }
                  }
                } catch (error) {
                  // Ignore secondary parse errors.
                }
                throw new Error(errorMessage);
              }
            }
            return response.json();
          }
        }
        function ensureMessageListener() {
          if (stryMutAct_9fa48("212")) {
            {}
          } else {
            stryCov_9fa48("212");
            if (stryMutAct_9fa48("215") ? !windowScope?.addEventListener && messageListener : stryMutAct_9fa48("214") ? false : stryMutAct_9fa48("213") ? true : (stryCov_9fa48("213", "214", "215"), (stryMutAct_9fa48("216") ? windowScope?.addEventListener : (stryCov_9fa48("216"), !(stryMutAct_9fa48("217") ? windowScope.addEventListener : (stryCov_9fa48("217"), windowScope?.addEventListener)))) || messageListener)) {
              if (stryMutAct_9fa48("218")) {
                {}
              } else {
                stryCov_9fa48("218");
                return;
              }
            }
            messageListener = async event => {
              if (stryMutAct_9fa48("219")) {
                {}
              } else {
                stryCov_9fa48("219");
                if (stryMutAct_9fa48("222") ? !event?.data && event.data.type !== 'SPOTIFY_DEVICE_AUTH_SUCCESS' : stryMutAct_9fa48("221") ? false : stryMutAct_9fa48("220") ? true : (stryCov_9fa48("220", "221", "222"), (stryMutAct_9fa48("223") ? event?.data : (stryCov_9fa48("223"), !(stryMutAct_9fa48("224") ? event.data : (stryCov_9fa48("224"), event?.data)))) || (stryMutAct_9fa48("226") ? event.data.type === 'SPOTIFY_DEVICE_AUTH_SUCCESS' : stryMutAct_9fa48("225") ? false : (stryCov_9fa48("225", "226"), event.data.type !== (stryMutAct_9fa48("227") ? "" : (stryCov_9fa48("227"), 'SPOTIFY_DEVICE_AUTH_SUCCESS')))))) {
                  if (stryMutAct_9fa48("228")) {
                    {}
                  } else {
                    stryCov_9fa48("228");
                    return;
                  }
                }
                if (stryMutAct_9fa48("231") ? event.data.deviceId || event.data.deviceId !== deviceId : stryMutAct_9fa48("230") ? false : stryMutAct_9fa48("229") ? true : (stryCov_9fa48("229", "230", "231"), event.data.deviceId && (stryMutAct_9fa48("233") ? event.data.deviceId === deviceId : stryMutAct_9fa48("232") ? true : (stryCov_9fa48("232", "233"), event.data.deviceId !== deviceId)))) {
                  if (stryMutAct_9fa48("234")) {
                    {}
                  } else {
                    stryCov_9fa48("234");
                    return;
                  }
                }
                await refreshStatus();
              }
            };
            windowScope.addEventListener(stryMutAct_9fa48("235") ? "" : (stryCov_9fa48("235"), 'message'), messageListener);
          }
        }
        function destroy() {
          if (stryMutAct_9fa48("236")) {
            {}
          } else {
            stryCov_9fa48("236");
            if (stryMutAct_9fa48("239") ? messageListener || windowScope?.removeEventListener : stryMutAct_9fa48("238") ? false : stryMutAct_9fa48("237") ? true : (stryCov_9fa48("237", "238", "239"), messageListener && (stryMutAct_9fa48("240") ? windowScope.removeEventListener : (stryCov_9fa48("240"), windowScope?.removeEventListener)))) {
              if (stryMutAct_9fa48("241")) {
                {}
              } else {
                stryCov_9fa48("241");
                windowScope.removeEventListener(stryMutAct_9fa48("242") ? "" : (stryCov_9fa48("242"), 'message'), messageListener);
              }
            }
            messageListener = null;
          }
        }
        function hideSetup() {
          if (stryMutAct_9fa48("243")) {
            {}
          } else {
            stryCov_9fa48("243");
            removeSpotifyDeviceAuthSetup(documentScope);
          }
        }
        function showSetup(reason) {
          if (stryMutAct_9fa48("244")) {
            {}
          } else {
            stryCov_9fa48("244");
            return renderSpotifyDeviceAuthSetup(documentScope, stryMutAct_9fa48("245") ? {} : (stryCov_9fa48("245"), {
              reason,
              onConnect: openConnectFlow
            }));
          }
        }
        async function refreshStatus() {
          if (stryMutAct_9fa48("246")) {
            {}
          } else {
            stryCov_9fa48("246");
            const payload = await fetchJson(endpoints.status, stryMutAct_9fa48("247") ? {} : (stryCov_9fa48("247"), {
              method: stryMutAct_9fa48("248") ? "" : (stryCov_9fa48("248"), 'POST'),
              body: JSON.stringify(stryMutAct_9fa48("249") ? {} : (stryCov_9fa48("249"), {
                device_id: deviceId,
                device_pwd: devicePassword
              }))
            }));
            currentStatus = stryMutAct_9fa48("252") ? (payload?.data || payload) && null : stryMutAct_9fa48("251") ? false : stryMutAct_9fa48("250") ? true : (stryCov_9fa48("250", "251", "252"), (stryMutAct_9fa48("254") ? payload?.data && payload : stryMutAct_9fa48("253") ? false : (stryCov_9fa48("253", "254"), (stryMutAct_9fa48("255") ? payload.data : (stryCov_9fa48("255"), payload?.data)) || payload)) || null);
            if (stryMutAct_9fa48("258") ? currentStatus.connected : stryMutAct_9fa48("257") ? false : stryMutAct_9fa48("256") ? true : (stryCov_9fa48("256", "257", "258"), currentStatus?.connected)) {
              if (stryMutAct_9fa48("259")) {
                {}
              } else {
                stryCov_9fa48("259");
                hideSetup();
                stryMutAct_9fa48("260") ? options.onConnected(currentStatus) : (stryCov_9fa48("260"), options.onConnected?.(currentStatus));
              }
            } else {
              if (stryMutAct_9fa48("261")) {
                {}
              } else {
                stryCov_9fa48("261");
                showSetup(stryMutAct_9fa48("264") ? currentStatus?.reason && 'Spotify bağlantısı gerekli' : stryMutAct_9fa48("263") ? false : stryMutAct_9fa48("262") ? true : (stryCov_9fa48("262", "263", "264"), (stryMutAct_9fa48("265") ? currentStatus.reason : (stryCov_9fa48("265"), currentStatus?.reason)) || (stryMutAct_9fa48("266") ? "" : (stryCov_9fa48("266"), 'Spotify bağlantısı gerekli'))));
                stryMutAct_9fa48("267") ? options.onMissing(currentStatus) : (stryCov_9fa48("267"), options.onMissing?.(currentStatus));
              }
            }
            return currentStatus;
          }
        }
        async function openConnectFlow() {
          if (stryMutAct_9fa48("268")) {
            {}
          } else {
            stryCov_9fa48("268");
            const authUrl = buildSpotifyDeviceAuthStartUrl(apiBaseUrl, deviceId, devicePassword);
            const popup = stryMutAct_9fa48("270") ? windowScope.open?.('', '_blank') : stryMutAct_9fa48("269") ? windowScope?.open('', '_blank') : (stryCov_9fa48("269", "270"), windowScope?.open?.(stryMutAct_9fa48("271") ? "Stryker was here!" : (stryCov_9fa48("271"), ''), stryMutAct_9fa48("272") ? "" : (stryCov_9fa48("272"), '_blank')));
            if (stryMutAct_9fa48("274") ? false : stryMutAct_9fa48("273") ? true : (stryCov_9fa48("273", "274"), popup)) {
              if (stryMutAct_9fa48("275")) {
                {}
              } else {
                stryCov_9fa48("275");
                popup.location.href = authUrl;
                if (stryMutAct_9fa48("278") ? typeof popup.focus !== 'function' : stryMutAct_9fa48("277") ? false : stryMutAct_9fa48("276") ? true : (stryCov_9fa48("276", "277", "278"), typeof popup.focus === (stryMutAct_9fa48("279") ? "" : (stryCov_9fa48("279"), 'function')))) {
                  if (stryMutAct_9fa48("280")) {
                    {}
                  } else {
                    stryCov_9fa48("280");
                    popup.focus();
                  }
                }
              }
            } else if (stryMutAct_9fa48("283") ? windowScope.location : stryMutAct_9fa48("282") ? false : stryMutAct_9fa48("281") ? true : (stryCov_9fa48("281", "282", "283"), windowScope?.location)) {
              if (stryMutAct_9fa48("284")) {
                {}
              } else {
                stryCov_9fa48("284");
                windowScope.location.href = authUrl;
              }
            }
            return authUrl;
          }
        }
        ensureMessageListener();
        return stryMutAct_9fa48("285") ? {} : (stryCov_9fa48("285"), {
          refreshStatus,
          openConnectFlow,
          showSetup,
          hideSetup,
          destroy,
          getStatus: stryMutAct_9fa48("286") ? () => undefined : (stryCov_9fa48("286"), () => currentStatus),
          isSetupVisible: stryMutAct_9fa48("287") ? () => undefined : (stryCov_9fa48("287"), () => Boolean(stryMutAct_9fa48("289") ? documentScope.getElementById?.(SETUP_OVERLAY_ID) : stryMutAct_9fa48("288") ? documentScope?.getElementById(SETUP_OVERLAY_ID) : (stryCov_9fa48("288", "289"), documentScope?.getElementById?.(SETUP_OVERLAY_ID)))),
          endpoints
        });
      }
    }
    return stryMutAct_9fa48("290") ? {} : (stryCov_9fa48("290"), {
      SETUP_OVERLAY_ID,
      buildSpotifyDeviceAuthEndpoints,
      buildSpotifyDeviceAuthStartUrl,
      createSpotifyDeviceAuthController,
      renderSpotifyDeviceAuthSetup,
      removeSpotifyDeviceAuthSetup
    });
  }
});