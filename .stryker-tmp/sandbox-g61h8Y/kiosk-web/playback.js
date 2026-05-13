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
  if (stryMutAct_9fa48("291")) {
    {}
  } else {
    stryCov_9fa48("291");
    const api = factory();
    if (stryMutAct_9fa48("294") ? typeof module === 'object' || module.exports : stryMutAct_9fa48("293") ? false : stryMutAct_9fa48("292") ? true : (stryCov_9fa48("292", "293", "294"), (stryMutAct_9fa48("296") ? typeof module !== 'object' : stryMutAct_9fa48("295") ? true : (stryCov_9fa48("295", "296"), typeof module === (stryMutAct_9fa48("297") ? "" : (stryCov_9fa48("297"), 'object')))) && module.exports)) {
      if (stryMutAct_9fa48("298")) {
        {}
      } else {
        stryCov_9fa48("298");
        module.exports = api;
        module.exports.default = api;
      }
    }
    root.KioskPlayback = api;
  }
})((stryMutAct_9fa48("301") ? typeof globalThis === 'undefined' : stryMutAct_9fa48("300") ? false : stryMutAct_9fa48("299") ? true : (stryCov_9fa48("299", "300", "301"), typeof globalThis !== (stryMutAct_9fa48("302") ? "" : (stryCov_9fa48("302"), 'undefined')))) ? globalThis : this, function () {
  if (stryMutAct_9fa48("303")) {
    {}
  } else {
    stryCov_9fa48("303");
    function extractSongId(song) {
      if (stryMutAct_9fa48("304")) {
        {}
      } else {
        stryCov_9fa48("304");
        if (stryMutAct_9fa48("307") ? song.song_id : stryMutAct_9fa48("306") ? false : stryMutAct_9fa48("305") ? true : (stryCov_9fa48("305", "306", "307"), song?.song_id)) {
          if (stryMutAct_9fa48("308")) {
            {}
          } else {
            stryCov_9fa48("308");
            return song.song_id;
          }
        }
        if (stryMutAct_9fa48("311") ? typeof song?.id === 'string' || song.id.startsWith('current-') : stryMutAct_9fa48("310") ? false : stryMutAct_9fa48("309") ? true : (stryCov_9fa48("309", "310", "311"), (stryMutAct_9fa48("313") ? typeof song?.id !== 'string' : stryMutAct_9fa48("312") ? true : (stryCov_9fa48("312", "313"), typeof (stryMutAct_9fa48("314") ? song.id : (stryCov_9fa48("314"), song?.id)) === (stryMutAct_9fa48("315") ? "" : (stryCov_9fa48("315"), 'string')))) && (stryMutAct_9fa48("316") ? song.id.endsWith('current-') : (stryCov_9fa48("316"), song.id.startsWith(stryMutAct_9fa48("317") ? "" : (stryCov_9fa48("317"), 'current-')))))) {
          if (stryMutAct_9fa48("318")) {
            {}
          } else {
            stryCov_9fa48("318");
            return stryMutAct_9fa48("319") ? song.id : (stryCov_9fa48("319"), song.id.slice((stryMutAct_9fa48("320") ? "" : (stryCov_9fa48("320"), 'current-')).length));
          }
        }
        return stryMutAct_9fa48("321") ? song?.id && null : (stryCov_9fa48("321"), (stryMutAct_9fa48("322") ? song.id : (stryCov_9fa48("322"), song?.id)) ?? null);
      }
    }
    function getSongPlaybackPlan(song, apiBaseUrl) {
      if (stryMutAct_9fa48("323")) {
        {}
      } else {
        stryCov_9fa48("323");
        const sourceType = stryMutAct_9fa48("326") ? (song?.playback_type || song?.source_type) && 'local' : stryMutAct_9fa48("325") ? false : stryMutAct_9fa48("324") ? true : (stryCov_9fa48("324", "325", "326"), (stryMutAct_9fa48("328") ? song?.playback_type && song?.source_type : stryMutAct_9fa48("327") ? false : (stryCov_9fa48("327", "328"), (stryMutAct_9fa48("329") ? song.playback_type : (stryCov_9fa48("329"), song?.playback_type)) || (stryMutAct_9fa48("330") ? song.source_type : (stryCov_9fa48("330"), song?.source_type)))) || (stryMutAct_9fa48("331") ? "" : (stryCov_9fa48("331"), 'local')));
        const songId = extractSongId(song);
        if (stryMutAct_9fa48("334") ? sourceType === 'spotify' || song?.spotify_uri : stryMutAct_9fa48("333") ? false : stryMutAct_9fa48("332") ? true : (stryCov_9fa48("332", "333", "334"), (stryMutAct_9fa48("336") ? sourceType !== 'spotify' : stryMutAct_9fa48("335") ? true : (stryCov_9fa48("335", "336"), sourceType === (stryMutAct_9fa48("337") ? "" : (stryCov_9fa48("337"), 'spotify')))) && (stryMutAct_9fa48("338") ? song.spotify_uri : (stryCov_9fa48("338"), song?.spotify_uri)))) {
          if (stryMutAct_9fa48("339")) {
            {}
          } else {
            stryCov_9fa48("339");
            return stryMutAct_9fa48("340") ? {} : (stryCov_9fa48("340"), {
              kind: stryMutAct_9fa48("341") ? "" : (stryCov_9fa48("341"), 'spotify'),
              audioUrl: null,
              spotifyUri: song.spotify_uri,
              songId
            });
          }
        }
        if (stryMutAct_9fa48("344") ? typeof song?.file_url === 'string' || song.file_url.length > 0 : stryMutAct_9fa48("343") ? false : stryMutAct_9fa48("342") ? true : (stryCov_9fa48("342", "343", "344"), (stryMutAct_9fa48("346") ? typeof song?.file_url !== 'string' : stryMutAct_9fa48("345") ? true : (stryCov_9fa48("345", "346"), typeof (stryMutAct_9fa48("347") ? song.file_url : (stryCov_9fa48("347"), song?.file_url)) === (stryMutAct_9fa48("348") ? "" : (stryCov_9fa48("348"), 'string')))) && (stryMutAct_9fa48("351") ? song.file_url.length <= 0 : stryMutAct_9fa48("350") ? song.file_url.length >= 0 : stryMutAct_9fa48("349") ? true : (stryCov_9fa48("349", "350", "351"), song.file_url.length > 0)))) {
          if (stryMutAct_9fa48("352")) {
            {}
          } else {
            stryCov_9fa48("352");
            return stryMutAct_9fa48("353") ? {} : (stryCov_9fa48("353"), {
              kind: stryMutAct_9fa48("354") ? "" : (stryCov_9fa48("354"), 'local'),
              audioUrl: (stryMutAct_9fa48("355") ? song.file_url.endsWith('/') : (stryCov_9fa48("355"), song.file_url.startsWith(stryMutAct_9fa48("356") ? "" : (stryCov_9fa48("356"), '/')))) ? stryMutAct_9fa48("357") ? apiBaseUrl - song.file_url : (stryCov_9fa48("357"), apiBaseUrl + song.file_url) : song.file_url,
              spotifyUri: null,
              songId
            });
          }
        }
        return stryMutAct_9fa48("358") ? {} : (stryCov_9fa48("358"), {
          kind: stryMutAct_9fa48("359") ? "" : (stryCov_9fa48("359"), 'unsupported'),
          audioUrl: null,
          spotifyUri: stryMutAct_9fa48("360") ? song?.spotify_uri && null : (stryCov_9fa48("360"), (stryMutAct_9fa48("361") ? song.spotify_uri : (stryCov_9fa48("361"), song?.spotify_uri)) ?? null),
          songId
        });
      }
    }
    function shouldSyncNowPlayingView(params) {
      if (stryMutAct_9fa48("362")) {
        {}
      } else {
        stryCov_9fa48("362");
        if (stryMutAct_9fa48("365") ? params.startupBlocked : stryMutAct_9fa48("364") ? false : stryMutAct_9fa48("363") ? true : (stryCov_9fa48("363", "364", "365"), params?.startupBlocked)) {
          if (stryMutAct_9fa48("366")) {
            {}
          } else {
            stryCov_9fa48("366");
            return stryMutAct_9fa48("367") ? true : (stryCov_9fa48("367"), false);
          }
        }
        if (stryMutAct_9fa48("370") ? false : stryMutAct_9fa48("369") ? true : stryMutAct_9fa48("368") ? params?.nowPlaying : (stryCov_9fa48("368", "369", "370"), !(stryMutAct_9fa48("371") ? params.nowPlaying : (stryCov_9fa48("371"), params?.nowPlaying)))) {
          if (stryMutAct_9fa48("372")) {
            {}
          } else {
            stryCov_9fa48("372");
            return stryMutAct_9fa48("373") ? true : (stryCov_9fa48("373"), false);
          }
        }
        return Boolean(stryMutAct_9fa48("376") ? params.isPlaying && params.spotifyTrackUri : stryMutAct_9fa48("375") ? false : stryMutAct_9fa48("374") ? true : (stryCov_9fa48("374", "375", "376"), params.isPlaying || params.spotifyTrackUri));
      }
    }
    return stryMutAct_9fa48("377") ? {} : (stryCov_9fa48("377"), {
      getSongPlaybackPlan,
      shouldSyncNowPlayingView
    });
  }
});