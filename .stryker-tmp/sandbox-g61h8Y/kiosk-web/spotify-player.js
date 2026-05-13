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
  if (stryMutAct_9fa48("378")) {
    {}
  } else {
    stryCov_9fa48("378");
    const api = factory();
    if (stryMutAct_9fa48("381") ? typeof module === 'object' || module.exports : stryMutAct_9fa48("380") ? false : stryMutAct_9fa48("379") ? true : (stryCov_9fa48("379", "380", "381"), (stryMutAct_9fa48("383") ? typeof module !== 'object' : stryMutAct_9fa48("382") ? true : (stryCov_9fa48("382", "383"), typeof module === (stryMutAct_9fa48("384") ? "" : (stryCov_9fa48("384"), 'object')))) && module.exports)) {
      if (stryMutAct_9fa48("385")) {
        {}
      } else {
        stryCov_9fa48("385");
        module.exports = api;
        module.exports.default = api;
      }
    }
    root.KioskSpotifyPlayer = api;
  }
})((stryMutAct_9fa48("388") ? typeof globalThis === 'undefined' : stryMutAct_9fa48("387") ? false : stryMutAct_9fa48("386") ? true : (stryCov_9fa48("386", "387", "388"), typeof globalThis !== (stryMutAct_9fa48("389") ? "" : (stryCov_9fa48("389"), 'undefined')))) ? globalThis : this, function () {
  if (stryMutAct_9fa48("390")) {
    {}
  } else {
    stryCov_9fa48("390");
    const SDK_URL = stryMutAct_9fa48("391") ? "" : (stryCov_9fa48("391"), 'https://sdk.scdn.co/spotify-player.js');
    let sdkLoadPromise = null;
    function normalizeTrack(track) {
      if (stryMutAct_9fa48("392")) {
        {}
      } else {
        stryCov_9fa48("392");
        if (stryMutAct_9fa48("395") ? false : stryMutAct_9fa48("394") ? true : stryMutAct_9fa48("393") ? track : (stryCov_9fa48("393", "394", "395"), !track)) {
          if (stryMutAct_9fa48("396")) {
            {}
          } else {
            stryCov_9fa48("396");
            return stryMutAct_9fa48("397") ? {} : (stryCov_9fa48("397"), {
              track_uri: null,
              track_id: null,
              track_name: null,
              track_artists: stryMutAct_9fa48("398") ? ["Stryker was here"] : (stryCov_9fa48("398"), []),
              duration_ms: null
            });
          }
        }
        return stryMutAct_9fa48("399") ? {} : (stryCov_9fa48("399"), {
          track_uri: stryMutAct_9fa48("400") ? track.uri && null : (stryCov_9fa48("400"), track.uri ?? null),
          track_id: stryMutAct_9fa48("401") ? track.id && null : (stryCov_9fa48("401"), track.id ?? null),
          track_name: stryMutAct_9fa48("402") ? track.name && null : (stryCov_9fa48("402"), track.name ?? null),
          track_artists: Array.isArray(track.artists) ? stryMutAct_9fa48("403") ? track.artists.map(artist => artist?.name) : (stryCov_9fa48("403"), track.artists.map(stryMutAct_9fa48("404") ? () => undefined : (stryCov_9fa48("404"), artist => stryMutAct_9fa48("405") ? artist.name : (stryCov_9fa48("405"), artist?.name))).filter(Boolean)) : stryMutAct_9fa48("406") ? ["Stryker was here"] : (stryCov_9fa48("406"), []),
          duration_ms: stryMutAct_9fa48("407") ? track.duration_ms && null : (stryCov_9fa48("407"), track.duration_ms ?? null)
        });
      }
    }
    function didTrackEnd(previousState, currentState) {
      if (stryMutAct_9fa48("408")) {
        {}
      } else {
        stryCov_9fa48("408");
        if (stryMutAct_9fa48("411") ? !previousState?.track_uri && !previousState?.duration_ms : stryMutAct_9fa48("410") ? false : stryMutAct_9fa48("409") ? true : (stryCov_9fa48("409", "410", "411"), (stryMutAct_9fa48("412") ? previousState?.track_uri : (stryCov_9fa48("412"), !(stryMutAct_9fa48("413") ? previousState.track_uri : (stryCov_9fa48("413"), previousState?.track_uri)))) || (stryMutAct_9fa48("414") ? previousState?.duration_ms : (stryCov_9fa48("414"), !(stryMutAct_9fa48("415") ? previousState.duration_ms : (stryCov_9fa48("415"), previousState?.duration_ms)))))) {
          if (stryMutAct_9fa48("416")) {
            {}
          } else {
            stryCov_9fa48("416");
            return stryMutAct_9fa48("417") ? true : (stryCov_9fa48("417"), false);
          }
        }
        const previousNearEnd = stryMutAct_9fa48("421") ? previousState.position_ms < Math.max(0, previousState.duration_ms - 1500) : stryMutAct_9fa48("420") ? previousState.position_ms > Math.max(0, previousState.duration_ms - 1500) : stryMutAct_9fa48("419") ? false : stryMutAct_9fa48("418") ? true : (stryCov_9fa48("418", "419", "420", "421"), previousState.position_ms >= (stryMutAct_9fa48("422") ? Math.min(0, previousState.duration_ms - 1500) : (stryCov_9fa48("422"), Math.max(0, stryMutAct_9fa48("423") ? previousState.duration_ms + 1500 : (stryCov_9fa48("423"), previousState.duration_ms - 1500)))));
        if (stryMutAct_9fa48("426") ? false : stryMutAct_9fa48("425") ? true : stryMutAct_9fa48("424") ? previousNearEnd : (stryCov_9fa48("424", "425", "426"), !previousNearEnd)) {
          if (stryMutAct_9fa48("427")) {
            {}
          } else {
            stryCov_9fa48("427");
            return stryMutAct_9fa48("428") ? true : (stryCov_9fa48("428"), false);
          }
        }
        if (stryMutAct_9fa48("431") ? false : stryMutAct_9fa48("430") ? true : stryMutAct_9fa48("429") ? currentState.track_uri : (stryCov_9fa48("429", "430", "431"), !currentState.track_uri)) {
          if (stryMutAct_9fa48("432")) {
            {}
          } else {
            stryCov_9fa48("432");
            return stryMutAct_9fa48("433") ? false : (stryCov_9fa48("433"), true);
          }
        }
        return stryMutAct_9fa48("436") ? currentState.track_uri === previousState.track_uri && currentState.paused || currentState.position_ms === 0 : stryMutAct_9fa48("435") ? false : stryMutAct_9fa48("434") ? true : (stryCov_9fa48("434", "435", "436"), (stryMutAct_9fa48("438") ? currentState.track_uri === previousState.track_uri || currentState.paused : stryMutAct_9fa48("437") ? true : (stryCov_9fa48("437", "438"), (stryMutAct_9fa48("440") ? currentState.track_uri !== previousState.track_uri : stryMutAct_9fa48("439") ? true : (stryCov_9fa48("439", "440"), currentState.track_uri === previousState.track_uri)) && currentState.paused)) && (stryMutAct_9fa48("442") ? currentState.position_ms !== 0 : stryMutAct_9fa48("441") ? true : (stryCov_9fa48("441", "442"), currentState.position_ms === 0)));
      }
    }
    function mapSpotifyPlayerState(state, previousState = null) {
      if (stryMutAct_9fa48("443")) {
        {}
      } else {
        stryCov_9fa48("443");
        const currentTrack = stryMutAct_9fa48("444") ? state?.track_window?.current_track && null : (stryCov_9fa48("444"), (stryMutAct_9fa48("446") ? state.track_window?.current_track : stryMutAct_9fa48("445") ? state?.track_window.current_track : (stryCov_9fa48("445", "446"), state?.track_window?.current_track)) ?? null);
        const durationMs = stryMutAct_9fa48("447") ? currentTrack?.duration_ms && null : (stryCov_9fa48("447"), (stryMutAct_9fa48("448") ? currentTrack.duration_ms : (stryCov_9fa48("448"), currentTrack?.duration_ms)) ?? null);
        const positionMs = (stryMutAct_9fa48("451") ? typeof state?.position !== 'number' : stryMutAct_9fa48("450") ? false : stryMutAct_9fa48("449") ? true : (stryCov_9fa48("449", "450", "451"), typeof (stryMutAct_9fa48("452") ? state.position : (stryCov_9fa48("452"), state?.position)) === (stryMutAct_9fa48("453") ? "" : (stryCov_9fa48("453"), 'number')))) ? state.position : 0;
        const mappedState = stryMutAct_9fa48("454") ? {} : (stryCov_9fa48("454"), {
          paused: Boolean(stryMutAct_9fa48("455") ? state.paused : (stryCov_9fa48("455"), state?.paused)),
          position_ms: positionMs,
          duration_ms: durationMs,
          ...normalizeTrack(currentTrack)
        });
        return stryMutAct_9fa48("456") ? {} : (stryCov_9fa48("456"), {
          ...mappedState,
          track_ended: didTrackEnd(previousState, mappedState)
        });
      }
    }
    function buildSpotifyRegistrationPayload(params) {
      if (stryMutAct_9fa48("457")) {
        {}
      } else {
        stryCov_9fa48("457");
        return stryMutAct_9fa48("458") ? {} : (stryCov_9fa48("458"), {
          device_id: params.deviceId,
          spotify_device_id: params.spotifyDeviceId,
          player_name: params.playerName ? stryMutAct_9fa48("459") ? String(params.playerName) : (stryCov_9fa48("459"), String(params.playerName).trim()) : null,
          player_state: params.state ? mapSpotifyPlayerState(params.state) : null
        });
      }
    }
    function loadSpotifySdk(options = {}) {
      if (stryMutAct_9fa48("460")) {
        {}
      } else {
        stryCov_9fa48("460");
        const rootScope = stryMutAct_9fa48("461") ? options.root && (typeof globalThis !== 'undefined' ? globalThis : this) : (stryCov_9fa48("461"), options.root ?? ((stryMutAct_9fa48("464") ? typeof globalThis === 'undefined' : stryMutAct_9fa48("463") ? false : stryMutAct_9fa48("462") ? true : (stryCov_9fa48("462", "463", "464"), typeof globalThis !== (stryMutAct_9fa48("465") ? "" : (stryCov_9fa48("465"), 'undefined')))) ? globalThis : this));
        if (stryMutAct_9fa48("468") ? rootScope.Spotify.Player : stryMutAct_9fa48("467") ? false : stryMutAct_9fa48("466") ? true : (stryCov_9fa48("466", "467", "468"), rootScope.Spotify?.Player)) {
          if (stryMutAct_9fa48("469")) {
            {}
          } else {
            stryCov_9fa48("469");
            return Promise.resolve(rootScope.Spotify);
          }
        }
        if (stryMutAct_9fa48("471") ? false : stryMutAct_9fa48("470") ? true : (stryCov_9fa48("470", "471"), sdkLoadPromise)) {
          if (stryMutAct_9fa48("472")) {
            {}
          } else {
            stryCov_9fa48("472");
            return sdkLoadPromise;
          }
        }
        const documentScope = rootScope.document;
        if (stryMutAct_9fa48("475") ? false : stryMutAct_9fa48("474") ? true : stryMutAct_9fa48("473") ? documentScope : (stryCov_9fa48("473", "474", "475"), !documentScope)) {
          if (stryMutAct_9fa48("476")) {
            {}
          } else {
            stryCov_9fa48("476");
            return Promise.reject(new Error(stryMutAct_9fa48("477") ? "" : (stryCov_9fa48("477"), 'Spotify SDK requires a document')));
          }
        }
        sdkLoadPromise = new Promise((resolve, reject) => {
          if (stryMutAct_9fa48("478")) {
            {}
          } else {
            stryCov_9fa48("478");
            const script = documentScope.createElement(stryMutAct_9fa48("479") ? "" : (stryCov_9fa48("479"), 'script'));
            script.src = stryMutAct_9fa48("482") ? options.scriptUrl && SDK_URL : stryMutAct_9fa48("481") ? false : stryMutAct_9fa48("480") ? true : (stryCov_9fa48("480", "481", "482"), options.scriptUrl || SDK_URL);
            script.async = stryMutAct_9fa48("483") ? false : (stryCov_9fa48("483"), true);
            script.defer = stryMutAct_9fa48("484") ? false : (stryCov_9fa48("484"), true);
            script.dataset.spotifyWebPlaybackSdk = stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), 'true');
            script.onerror = () => {
              if (stryMutAct_9fa48("486")) {
                {}
              } else {
                stryCov_9fa48("486");
                sdkLoadPromise = null;
                reject(new Error(stryMutAct_9fa48("487") ? "" : (stryCov_9fa48("487"), 'Failed to load Spotify Web Playback SDK')));
              }
            };
            const previousReady = rootScope.onSpotifyWebPlaybackSDKReady;
            rootScope.onSpotifyWebPlaybackSDKReady = () => {
              if (stryMutAct_9fa48("488")) {
                {}
              } else {
                stryCov_9fa48("488");
                if (stryMutAct_9fa48("491") ? typeof previousReady !== 'function' : stryMutAct_9fa48("490") ? false : stryMutAct_9fa48("489") ? true : (stryCov_9fa48("489", "490", "491"), typeof previousReady === (stryMutAct_9fa48("492") ? "" : (stryCov_9fa48("492"), 'function')))) {
                  if (stryMutAct_9fa48("493")) {
                    {}
                  } else {
                    stryCov_9fa48("493");
                    previousReady();
                  }
                }
                resolve(rootScope.Spotify);
              }
            };
            const target = stryMutAct_9fa48("496") ? (documentScope.head || documentScope.body) && documentScope.documentElement : stryMutAct_9fa48("495") ? false : stryMutAct_9fa48("494") ? true : (stryCov_9fa48("494", "495", "496"), (stryMutAct_9fa48("498") ? documentScope.head && documentScope.body : stryMutAct_9fa48("497") ? false : (stryCov_9fa48("497", "498"), documentScope.head || documentScope.body)) || documentScope.documentElement);
            target.appendChild(script);
          }
        });
        return sdkLoadPromise;
      }
    }
    function createSpotifyPlayer(options = {}) {
      if (stryMutAct_9fa48("499")) {
        {}
      } else {
        stryCov_9fa48("499");
        const rootScope = stryMutAct_9fa48("500") ? options.root && (typeof globalThis !== 'undefined' ? globalThis : this) : (stryCov_9fa48("500"), options.root ?? ((stryMutAct_9fa48("503") ? typeof globalThis === 'undefined' : stryMutAct_9fa48("502") ? false : stryMutAct_9fa48("501") ? true : (stryCov_9fa48("501", "502", "503"), typeof globalThis !== (stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), 'undefined')))) ? globalThis : this));
        const SpotifyPlayer = stryMutAct_9fa48("505") ? rootScope.Spotify.Player : (stryCov_9fa48("505"), rootScope.Spotify?.Player);
        if (stryMutAct_9fa48("508") ? false : stryMutAct_9fa48("507") ? true : stryMutAct_9fa48("506") ? SpotifyPlayer : (stryCov_9fa48("506", "507", "508"), !SpotifyPlayer)) {
          if (stryMutAct_9fa48("509")) {
            {}
          } else {
            stryCov_9fa48("509");
            throw new Error(stryMutAct_9fa48("510") ? "" : (stryCov_9fa48("510"), 'Spotify SDK has not been loaded'));
          }
        }
        let lastDeviceId = null;
        let lastMappedState = null;
        const player = new SpotifyPlayer(stryMutAct_9fa48("511") ? {} : (stryCov_9fa48("511"), {
          name: stryMutAct_9fa48("514") ? options.playerName && 'RadioTEDU Kiosk' : stryMutAct_9fa48("513") ? false : stryMutAct_9fa48("512") ? true : (stryCov_9fa48("512", "513", "514"), options.playerName || (stryMutAct_9fa48("515") ? "" : (stryCov_9fa48("515"), 'RadioTEDU Kiosk'))),
          getOAuthToken: async callback => {
            if (stryMutAct_9fa48("516")) {
              {}
            } else {
              stryCov_9fa48("516");
              const token = await options.getOAuthToken();
              callback(token);
            }
          },
          volume: (stryMutAct_9fa48("519") ? typeof options.volume !== 'number' : stryMutAct_9fa48("518") ? false : stryMutAct_9fa48("517") ? true : (stryCov_9fa48("517", "518", "519"), typeof options.volume === (stryMutAct_9fa48("520") ? "" : (stryCov_9fa48("520"), 'number')))) ? options.volume : 1
        }));
        player.addListener(stryMutAct_9fa48("521") ? "" : (stryCov_9fa48("521"), 'ready'), payload => {
          if (stryMutAct_9fa48("522")) {
            {}
          } else {
            stryCov_9fa48("522");
            lastDeviceId = stryMutAct_9fa48("523") ? payload?.device_id && null : (stryCov_9fa48("523"), (stryMutAct_9fa48("524") ? payload.device_id : (stryCov_9fa48("524"), payload?.device_id)) ?? null);
            stryMutAct_9fa48("525") ? options.onReady(buildSpotifyRegistrationPayload({
              deviceId: options.deviceId || payload?.device_id || '',
              spotifyDeviceId: payload?.device_id || '',
              playerName: options.playerName || null,
              state: null
            })) : (stryCov_9fa48("525"), options.onReady?.(buildSpotifyRegistrationPayload(stryMutAct_9fa48("526") ? {} : (stryCov_9fa48("526"), {
              deviceId: stryMutAct_9fa48("529") ? (options.deviceId || payload?.device_id) && '' : stryMutAct_9fa48("528") ? false : stryMutAct_9fa48("527") ? true : (stryCov_9fa48("527", "528", "529"), (stryMutAct_9fa48("531") ? options.deviceId && payload?.device_id : stryMutAct_9fa48("530") ? false : (stryCov_9fa48("530", "531"), options.deviceId || (stryMutAct_9fa48("532") ? payload.device_id : (stryCov_9fa48("532"), payload?.device_id)))) || (stryMutAct_9fa48("533") ? "Stryker was here!" : (stryCov_9fa48("533"), ''))),
              spotifyDeviceId: stryMutAct_9fa48("536") ? payload?.device_id && '' : stryMutAct_9fa48("535") ? false : stryMutAct_9fa48("534") ? true : (stryCov_9fa48("534", "535", "536"), (stryMutAct_9fa48("537") ? payload.device_id : (stryCov_9fa48("537"), payload?.device_id)) || (stryMutAct_9fa48("538") ? "Stryker was here!" : (stryCov_9fa48("538"), ''))),
              playerName: stryMutAct_9fa48("541") ? options.playerName && null : stryMutAct_9fa48("540") ? false : stryMutAct_9fa48("539") ? true : (stryCov_9fa48("539", "540", "541"), options.playerName || null),
              state: null
            }))));
          }
        });
        player.addListener(stryMutAct_9fa48("542") ? "" : (stryCov_9fa48("542"), 'not_ready'), payload => {
          if (stryMutAct_9fa48("543")) {
            {}
          } else {
            stryCov_9fa48("543");
            stryMutAct_9fa48("544") ? options.onNotReady({
              device_id: payload?.device_id ?? null,
              spotify_device_id: payload?.device_id ?? null
            }) : (stryCov_9fa48("544"), options.onNotReady?.(stryMutAct_9fa48("545") ? {} : (stryCov_9fa48("545"), {
              device_id: stryMutAct_9fa48("546") ? payload?.device_id && null : (stryCov_9fa48("546"), (stryMutAct_9fa48("547") ? payload.device_id : (stryCov_9fa48("547"), payload?.device_id)) ?? null),
              spotify_device_id: stryMutAct_9fa48("548") ? payload?.device_id && null : (stryCov_9fa48("548"), (stryMutAct_9fa48("549") ? payload.device_id : (stryCov_9fa48("549"), payload?.device_id)) ?? null)
            })));
          }
        });
        player.addListener(stryMutAct_9fa48("550") ? "" : (stryCov_9fa48("550"), 'player_state_changed'), state => {
          if (stryMutAct_9fa48("551")) {
            {}
          } else {
            stryCov_9fa48("551");
            const mappedState = mapSpotifyPlayerState(state, lastMappedState);
            lastMappedState = mappedState;
            stryMutAct_9fa48("552") ? options.onStateChange(mappedState) : (stryCov_9fa48("552"), options.onStateChange?.(mappedState));
          }
        });
        player.addListener(stryMutAct_9fa48("553") ? "" : (stryCov_9fa48("553"), 'autoplay_failed'), payload => {
          if (stryMutAct_9fa48("554")) {
            {}
          } else {
            stryCov_9fa48("554");
            stryMutAct_9fa48("555") ? options.onAutoplayFailed(payload) : (stryCov_9fa48("555"), options.onAutoplayFailed?.(payload));
          }
        });
        player.addListener(stryMutAct_9fa48("556") ? "" : (stryCov_9fa48("556"), 'initialization_error'), error => {
          if (stryMutAct_9fa48("557")) {
            {}
          } else {
            stryCov_9fa48("557");
            stryMutAct_9fa48("558") ? options.onError(error) : (stryCov_9fa48("558"), options.onError?.(error));
          }
        });
        player.addListener(stryMutAct_9fa48("559") ? "" : (stryCov_9fa48("559"), 'authentication_error'), error => {
          if (stryMutAct_9fa48("560")) {
            {}
          } else {
            stryCov_9fa48("560");
            stryMutAct_9fa48("561") ? options.onError(error) : (stryCov_9fa48("561"), options.onError?.(error));
          }
        });
        player.addListener(stryMutAct_9fa48("562") ? "" : (stryCov_9fa48("562"), 'account_error'), error => {
          if (stryMutAct_9fa48("563")) {
            {}
          } else {
            stryCov_9fa48("563");
            stryMutAct_9fa48("564") ? options.onError(error) : (stryCov_9fa48("564"), options.onError?.(error));
          }
        });
        return stryMutAct_9fa48("565") ? {} : (stryCov_9fa48("565"), {
          player,
          connect: stryMutAct_9fa48("566") ? () => undefined : (stryCov_9fa48("566"), () => player.connect()),
          activateElement: stryMutAct_9fa48("567") ? () => undefined : (stryCov_9fa48("567"), () => player.activateElement()),
          disconnect: stryMutAct_9fa48("568") ? () => undefined : (stryCov_9fa48("568"), () => player.disconnect()),
          getLastDeviceId: stryMutAct_9fa48("569") ? () => undefined : (stryCov_9fa48("569"), () => lastDeviceId)
        });
      }
    }
    return stryMutAct_9fa48("570") ? {} : (stryCov_9fa48("570"), {
      loadSpotifySdk,
      createSpotifyPlayer,
      buildSpotifyRegistrationPayload,
      mapSpotifyPlayerState
    });
  }
});