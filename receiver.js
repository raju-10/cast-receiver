// // receiver.js - Custom Receiver Logic for Fastpix (Based on Mux official implementation)
// const context = cast.framework.CastReceiverContext.getInstance();

// /**
//  * DEBUGGING
//  */
// const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
// const LOG_TAG = 'FASTPIX';
// castDebugLogger.setEnabled(true);

// // Debug overlay on TV screen (disable in production)
// // You can also use https://casttool.appspot.com/cactool to see logs in browser
// castDebugLogger.showDebugLogs(true);

// castDebugLogger.loggerLevelByTags = {
//   [LOG_TAG]: cast.framework.LoggerLevel.DEBUG,
// };

// /**
//  * CRITICAL: This is the key handler that configures DRM
//  * Based on Mux's official implementation
//  */
// context.getPlayerManager().setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
//     castDebugLogger.info(LOG_TAG, 'Media playback info handler called');
//     castDebugLogger.info(LOG_TAG, 'Load request: ' + JSON.stringify(loadRequest.media));
    
//     const customData = loadRequest.media.customData || {};
//     castDebugLogger.info(LOG_TAG, 'Custom data received: ' + JSON.stringify(customData));

//     // Check if we have Fastpix DRM tokens
//     if (customData.fastpix && customData.fastpix.tokens && customData.fastpix.tokens.drm) {
//         const playbackId = customData.fastpix.playbackId;
//         const drmToken = customData.fastpix.tokens.drm;
        
//         castDebugLogger.info(LOG_TAG, 'Playback ID: ' + playbackId);
//         castDebugLogger.info(LOG_TAG, 'DRM Token: ' + (drmToken ? 'Present' : 'Missing'));

//         // Build license URL following Mux pattern
//         playbackConfig.licenseUrl = `https://api.fastpix.io/v1/on-demand/drm/license/widevine/${playbackId}?token=${drmToken}`;
//         playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
        
//         castDebugLogger.info(LOG_TAG, 'DRM License URL configured: ' + playbackConfig.licenseUrl);
//     } else {
//         castDebugLogger.warn(LOG_TAG, 'No DRM tokens found in customData');
//     }

//     return playbackConfig;
// });

// /**
//  * ERROR HANDLING
//  */
// context.getPlayerManager().addEventListener(
//     cast.framework.events.EventType.ERROR,
//     (event) => {
//         castDebugLogger.error(LOG_TAG, 'Player error: ' + JSON.stringify(event));
//     }
// );

// /**
//  * PLAYBACK STATE LOGGING
//  */
// context.getPlayerManager().addEventListener(
//     cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
//     () => {
//         castDebugLogger.info(LOG_TAG, 'Player load complete');
//     }
// );

// context.getPlayerManager().addEventListener(
//     cast.framework.events.EventType.PLAYING,
//     () => {
//         castDebugLogger.info(LOG_TAG, 'Playing started');
//     }
// );

// /**
//  * START THE RECEIVER
//  */
/**
 * receiver.js — Fastpix Chromecast Receiver (Widevine)
 * Based on Mux official Chromecast receiver implementation
 */
// ==================================================
// Fastpix Chromecast Receiver (Widevine)
// With FULL Network + DRM Debugging
// ==================================================

// receiver.js — Fastpix Chromecast Receiver (Widevine)

// --------------------------------------------------
// Receiver Context
// --------------------------------------------------
'use strict';

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = 'FASTPIX';
castDebugLogger.setEnabled(true);
castDebugLogger.showDebugLogs(true);
castDebugLogger.loggerLevelByTags = {
  [LOG_TAG]: cast.framework.LoggerLevel.DEBUG,
};

// ------------------------------------------------
// Store DRM info from load request for use later
// ------------------------------------------------
let currentPlaybackId = null;
let currentDrmToken = null;

// ------------------------------------------------
// LOAD interceptor — capture DRM info early
// ------------------------------------------------
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (loadRequestData) => {
    castDebugLogger.info(LOG_TAG, '=== LOAD INTERCEPTED ===');
    castDebugLogger.info(LOG_TAG, 'URL: ' + loadRequestData.media?.contentId);
    castDebugLogger.info(LOG_TAG, 'contentType: ' + loadRequestData.media?.contentType);
    castDebugLogger.info(LOG_TAG, 'customData: ' + JSON.stringify(loadRequestData.media?.customData));

    const fp = loadRequestData.media?.customData?.fastpix;
    if (fp && fp.playbackId && fp.tokens?.drm) {
      currentPlaybackId = fp.playbackId;
      currentDrmToken = fp.tokens.drm;
      castDebugLogger.info(LOG_TAG, 'Stored → playbackId: ' + currentPlaybackId);
      castDebugLogger.info(LOG_TAG, 'Stored → drmToken: PRESENT');
    } else {
      castDebugLogger.warn(LOG_TAG, 'No DRM data in customData');
    }

    return loadRequestData;
  }
);

// ------------------------------------------------
// DRM Setup via PlaybackInfoHandler
// This runs just before playback starts
// ------------------------------------------------
playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  castDebugLogger.info(LOG_TAG, '=== PLAYBACK INFO HANDLER ===');

  const fp = loadRequest.media?.customData?.fastpix;
  const playbackId = fp?.playbackId || currentPlaybackId;
  const drmToken   = fp?.tokens?.drm || currentDrmToken;

  if (playbackId && drmToken) {
    // Set Widevine license URL
    playbackConfig.licenseUrl =
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/${playbackId}?token=${drmToken}`;

    playbackConfig.protectionSystem =
      cast.framework.ContentProtection.WIDEVINE;

    castDebugLogger.info(LOG_TAG, 'licenseUrl: ' + playbackConfig.licenseUrl);

    // Normalize license request body: base64 string → ArrayBuffer
    playbackConfig.licenseRequestHandler = (requestInfo) => {
      castDebugLogger.info(LOG_TAG, 'License request fired, body type: ' + typeof requestInfo.body);

      requestInfo.headers['Content-Type'] = 'application/octet-stream';

      if (requestInfo.body && typeof requestInfo.body === 'string') {
        const binary = atob(requestInfo.body);
        const bytes  = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        requestInfo.body = bytes.buffer;
        castDebugLogger.info(LOG_TAG, 'Body converted base64 → ArrayBuffer');
      }

      return requestInfo;
    };

  } else {
    castDebugLogger.warn(LOG_TAG, 'No DRM info available — clear content');
  }

  return playbackConfig;
});

// ------------------------------------------------
// Error logging — most important for debugging
// ------------------------------------------------
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    castDebugLogger.error(LOG_TAG, '=== ERROR ===');
    castDebugLogger.error(LOG_TAG, 'detailedErrorCode: ' + event.detailedErrorCode);
    castDebugLogger.error(LOG_TAG, 'reason: ' + event.reason);
    castDebugLogger.error(LOG_TAG, 'full: ' + JSON.stringify(event));
  }
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
  () => castDebugLogger.info(LOG_TAG, 'PLAYER_LOAD_COMPLETE ✅')
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYING,
  () => castDebugLogger.info(LOG_TAG, 'PLAYING ✅')
);

// ------------------------------------------------
// Start Receiver
// ------------------------------------------------
const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600;
context.start(options);

castDebugLogger.info(LOG_TAG, 'Fastpix receiver started ✅');
```

---

## But here's the honest truth

Even with the perfect receiver code, **if the HLS manifest has no `#EXT-X-KEY` Widevine tag, CAF cannot decrypt the segments** — because it doesn't know *which segments are encrypted* or *what key format to use*. The `licenseUrl` alone is not enough; CAF needs the manifest to tell it DRM is present.

You have two options:

**Option A — Ask Fastpix** to enable Widevine signalling in their HLS manifest (add `#EXT-X-KEY` with `KEYFORMAT="urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"`). This is a server-side change on their end and is the correct long-term fix.

**Option B — Ask Fastpix** for the DASH `.mpd` URL. Even if they only give you `.m3u8` by default, most CDN providers also serve `.mpd` at the same path — just swap the extension. Try this in your browser right now:
```
https://stream.fastpix.io/9a210e43-9ac9-4fa8-9fc4-4a1e4ec0de8e.mpd?token=YOUR_TOKEN
