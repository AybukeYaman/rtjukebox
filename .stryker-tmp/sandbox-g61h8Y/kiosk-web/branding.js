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
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    const api = factory();
    if (stryMutAct_9fa48("3") ? typeof module === 'object' || module.exports : stryMutAct_9fa48("2") ? false : stryMutAct_9fa48("1") ? true : (stryCov_9fa48("1", "2", "3"), (stryMutAct_9fa48("5") ? typeof module !== 'object' : stryMutAct_9fa48("4") ? true : (stryCov_9fa48("4", "5"), typeof module === (stryMutAct_9fa48("6") ? "" : (stryCov_9fa48("6"), 'object')))) && module.exports)) {
      if (stryMutAct_9fa48("7")) {
        {}
      } else {
        stryCov_9fa48("7");
        module.exports = api;
        module.exports.default = api;
      }
    }
    root.KioskBranding = api;
  }
})((stryMutAct_9fa48("10") ? typeof globalThis === 'undefined' : stryMutAct_9fa48("9") ? false : stryMutAct_9fa48("8") ? true : (stryCov_9fa48("8", "9", "10"), typeof globalThis !== (stryMutAct_9fa48("11") ? "" : (stryCov_9fa48("11"), 'undefined')))) ? globalThis : this, function () {
  if (stryMutAct_9fa48("12")) {
    {}
  } else {
    stryCov_9fa48("12");
    function setBrandLogoState(params, state) {
      if (stryMutAct_9fa48("13")) {
        {}
      } else {
        stryCov_9fa48("13");
        const logoContainer = stryMutAct_9fa48("14") ? params?.logoContainer && null : (stryCov_9fa48("14"), (stryMutAct_9fa48("15") ? params.logoContainer : (stryCov_9fa48("15"), params?.logoContainer)) ?? null);
        const logoImage = stryMutAct_9fa48("16") ? params?.logoImage && null : (stryCov_9fa48("16"), (stryMutAct_9fa48("17") ? params.logoImage : (stryCov_9fa48("17"), params?.logoImage)) ?? null);
        const logoText = stryMutAct_9fa48("18") ? params?.logoText && null : (stryCov_9fa48("18"), (stryMutAct_9fa48("19") ? params.logoText : (stryCov_9fa48("19"), params?.logoText)) ?? null);
        if (stryMutAct_9fa48("22") ? logoContainer.dataset : stryMutAct_9fa48("21") ? false : stryMutAct_9fa48("20") ? true : (stryCov_9fa48("20", "21", "22"), logoContainer?.dataset)) {
          if (stryMutAct_9fa48("23")) {
            {}
          } else {
            stryCov_9fa48("23");
            logoContainer.dataset.logoState = state;
          }
        }
        stryMutAct_9fa48("25") ? logoImage.classList?.toggle('is-hidden', state !== 'loaded') : stryMutAct_9fa48("24") ? logoImage?.classList.toggle('is-hidden', state !== 'loaded') : (stryCov_9fa48("24", "25"), logoImage?.classList?.toggle(stryMutAct_9fa48("26") ? "" : (stryCov_9fa48("26"), 'is-hidden'), stryMutAct_9fa48("29") ? state === 'loaded' : stryMutAct_9fa48("28") ? false : stryMutAct_9fa48("27") ? true : (stryCov_9fa48("27", "28", "29"), state !== (stryMutAct_9fa48("30") ? "" : (stryCov_9fa48("30"), 'loaded')))));
        stryMutAct_9fa48("32") ? logoText.classList?.toggle('is-hidden', state === 'loaded') : stryMutAct_9fa48("31") ? logoText?.classList.toggle('is-hidden', state === 'loaded') : (stryCov_9fa48("31", "32"), logoText?.classList?.toggle(stryMutAct_9fa48("33") ? "" : (stryCov_9fa48("33"), 'is-hidden'), stryMutAct_9fa48("36") ? state !== 'loaded' : stryMutAct_9fa48("35") ? false : stryMutAct_9fa48("34") ? true : (stryCov_9fa48("34", "35", "36"), state === (stryMutAct_9fa48("37") ? "" : (stryCov_9fa48("37"), 'loaded')))));
        return state;
      }
    }
    function initializeBrandLogoFallback(options = {}) {
      if (stryMutAct_9fa48("38")) {
        {}
      } else {
        stryCov_9fa48("38");
        const rootScope = stryMutAct_9fa48("39") ? options.root && (typeof document !== 'undefined' ? document : null) : (stryCov_9fa48("39"), options.root ?? ((stryMutAct_9fa48("42") ? typeof document === 'undefined' : stryMutAct_9fa48("41") ? false : stryMutAct_9fa48("40") ? true : (stryCov_9fa48("40", "41", "42"), typeof document !== (stryMutAct_9fa48("43") ? "" : (stryCov_9fa48("43"), 'undefined')))) ? document : null));
        const logoContainer = stryMutAct_9fa48("44") ? (options.logoContainer ?? rootScope?.getElementById?.('brandLogo')) && null : (stryCov_9fa48("44"), (stryMutAct_9fa48("45") ? options.logoContainer && rootScope?.getElementById?.('brandLogo') : (stryCov_9fa48("45"), options.logoContainer ?? (stryMutAct_9fa48("47") ? rootScope.getElementById?.('brandLogo') : stryMutAct_9fa48("46") ? rootScope?.getElementById('brandLogo') : (stryCov_9fa48("46", "47"), rootScope?.getElementById?.(stryMutAct_9fa48("48") ? "" : (stryCov_9fa48("48"), 'brandLogo')))))) ?? null);
        const logoImage = stryMutAct_9fa48("49") ? (options.logoImage ?? rootScope?.getElementById?.('brandLogoImage')) && null : (stryCov_9fa48("49"), (stryMutAct_9fa48("50") ? options.logoImage && rootScope?.getElementById?.('brandLogoImage') : (stryCov_9fa48("50"), options.logoImage ?? (stryMutAct_9fa48("52") ? rootScope.getElementById?.('brandLogoImage') : stryMutAct_9fa48("51") ? rootScope?.getElementById('brandLogoImage') : (stryCov_9fa48("51", "52"), rootScope?.getElementById?.(stryMutAct_9fa48("53") ? "" : (stryCov_9fa48("53"), 'brandLogoImage')))))) ?? null);
        const logoText = stryMutAct_9fa48("54") ? (options.logoText ?? rootScope?.getElementById?.('brandLogoText')) && null : (stryCov_9fa48("54"), (stryMutAct_9fa48("55") ? options.logoText && rootScope?.getElementById?.('brandLogoText') : (stryCov_9fa48("55"), options.logoText ?? (stryMutAct_9fa48("57") ? rootScope.getElementById?.('brandLogoText') : stryMutAct_9fa48("56") ? rootScope?.getElementById('brandLogoText') : (stryCov_9fa48("56", "57"), rootScope?.getElementById?.(stryMutAct_9fa48("58") ? "" : (stryCov_9fa48("58"), 'brandLogoText')))))) ?? null);
        const elements = stryMutAct_9fa48("59") ? {} : (stryCov_9fa48("59"), {
          logoContainer,
          logoImage,
          logoText
        });
        let currentState = setBrandLogoState(elements, stryMutAct_9fa48("60") ? "" : (stryCov_9fa48("60"), 'loaded'));
        const markLoaded = () => {
          if (stryMutAct_9fa48("61")) {
            {}
          } else {
            stryCov_9fa48("61");
            currentState = setBrandLogoState(elements, stryMutAct_9fa48("62") ? "" : (stryCov_9fa48("62"), 'loaded'));
          }
        };
        const markFallback = () => {
          if (stryMutAct_9fa48("63")) {
            {}
          } else {
            stryCov_9fa48("63");
            currentState = setBrandLogoState(elements, stryMutAct_9fa48("64") ? "" : (stryCov_9fa48("64"), 'fallback'));
          }
        };
        stryMutAct_9fa48("66") ? logoImage.addEventListener?.('load', markLoaded) : stryMutAct_9fa48("65") ? logoImage?.addEventListener('load', markLoaded) : (stryCov_9fa48("65", "66"), logoImage?.addEventListener?.(stryMutAct_9fa48("67") ? "" : (stryCov_9fa48("67"), 'load'), markLoaded));
        stryMutAct_9fa48("69") ? logoImage.addEventListener?.('error', markFallback) : stryMutAct_9fa48("68") ? logoImage?.addEventListener('error', markFallback) : (stryCov_9fa48("68", "69"), logoImage?.addEventListener?.(stryMutAct_9fa48("70") ? "" : (stryCov_9fa48("70"), 'error'), markFallback));
        if (stryMutAct_9fa48("73") ? logoImage.complete : stryMutAct_9fa48("72") ? false : stryMutAct_9fa48("71") ? true : (stryCov_9fa48("71", "72", "73"), logoImage?.complete)) {
          if (stryMutAct_9fa48("74")) {
            {}
          } else {
            stryCov_9fa48("74");
            if (stryMutAct_9fa48("78") ? logoImage.naturalWidth <= 0 : stryMutAct_9fa48("77") ? logoImage.naturalWidth >= 0 : stryMutAct_9fa48("76") ? false : stryMutAct_9fa48("75") ? true : (stryCov_9fa48("75", "76", "77", "78"), logoImage.naturalWidth > 0)) {
              if (stryMutAct_9fa48("79")) {
                {}
              } else {
                stryCov_9fa48("79");
                markLoaded();
              }
            } else {
              if (stryMutAct_9fa48("80")) {
                {}
              } else {
                stryCov_9fa48("80");
                markFallback();
              }
            }
          }
        }
        return stryMutAct_9fa48("81") ? {} : (stryCov_9fa48("81"), {
          getState: stryMutAct_9fa48("82") ? () => undefined : (stryCov_9fa48("82"), () => currentState),
          markLoaded,
          markFallback
        });
      }
    }
    return stryMutAct_9fa48("83") ? {} : (stryCov_9fa48("83"), {
      initializeBrandLogoFallback,
      setBrandLogoState
    });
  }
});