// browser-polyfill.js - Comprehensive Unified API Wrapper for Cross-Browser Extensions (MV3 Compatible)

/* global chrome */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.browser = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // No-op if browser is already defined (e.g., Firefox)
  if (typeof browser !== 'undefined') {
    console.log('Browser API already defined. Polyfill acting as no-op.');
    return browser;
  }

  // Check for Chrome runtime
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    throw new Error('Chrome runtime not detected. Polyfill requires Chrome-like environment.');
  }

  const browser = { promise: true }; // Flag for Promise support

  // Namespaces including MV3 additions
  const apiNamespaces = [
    'action', 'alarms', 'bookmarks', 'browserAction', 'commands', 'contextMenus',
    'cookies', 'downloads', 'extension', 'history', 'i18n', 'idle',
    'notifications', 'pageAction', 'runtime', 'storage', 'tabs',
    'webNavigation', 'webRequest', 'windows', 'scripting', 'declarativeNetRequest'
  ];

  // Clone namespaces
  apiNamespaces.forEach(ns => {
    if (chrome[ns]) {
      browser[ns] = Object.assign({}, chrome[ns]);
    }
  });

  // Promise wrapper function
  function promisify(originalFn) {
    return function (...args) {
      if (typeof args[args.length - 1] === 'function') {
        return originalFn.apply(this, args);
      }
      return new Promise((resolve, reject) => {
        const callback = (...results) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(results.length <= 1 ? results[0] : results);
          }
        };
        originalFn.apply(this, [...args, callback]);
      });
    };
  }

  // Apply promisify to async methods
  apiNamespaces.forEach(ns => {
    if (browser[ns]) {
      Object.keys(browser[ns]).forEach(key => {
        const val = browser[ns][key];
        if (typeof val === 'function' && !/^(on|add|remove|has|dispatch)/.test(key)) { // Skip events
          browser[ns][key] = promisify(val);
        }
      });
    }
  });

  // MV3 aliases and specials
  if (!browser.action && browser.browserAction) {
    browser.action = browser.browserAction;
  }
  if (browser.runtime.sendMessage) {
    browser.runtime.sendMessage = promisify(chrome.runtime.sendMessage);
  }

  // Event handling (consistent across browsers)
  browser.runtime.onMessage.addListener = chrome.runtime.onMessage.addListener.bind(chrome.runtime.onMessage);

  return browser;
}));