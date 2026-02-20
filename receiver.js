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
// const options = new cast.framework.CastReceiverOptions();
// options.disableIdleTimeout = false;
// options.maxInactivity = 3600; // 1 hour

// context.start(options);

// castDebugLogger.info(LOG_TAG, 'Fastpix Cast Receiver started successfully');
// receiver.js — Fastpix Chromecast Receiver (Widevine)

// --------------------------------------------------
// Receiver Context
// --------------------------------------------------
// const context = cast.framework.CastReceiverContext.getInstance();
// const playerManager = context.getPlayerManager();

// // --------------------------------------------------
// // Debugging (ENABLE during testing)
// // --------------------------------------------------
// const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
// const LOG_TAG = 'FASTPIX';

// castDebugLogger.setEnabled(true);
// castDebugLogger.showDebugLogs(true);

// castDebugLogger.loggerLevelByTags = {
//   [LOG_TAG]: cast.framework.LoggerLevel.DEBUG,
// };

// // --------------------------------------------------
// // MEDIA PLAYBACK INFO HANDLER (DRM SETUP)
// // --------------------------------------------------
// playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
//   castDebugLogger.info(LOG_TAG, 'MediaPlaybackInfoHandler called');

//   const media = loadRequest.media || {};
//   const customData = media.customData || {};

//   castDebugLogger.info(LOG_TAG, 'CustomData: ' + JSON.stringify(customData));

//   // --------------------------------------------------
//   // Fastpix DRM handling
//   // --------------------------------------------------
//   if (
//     customData.fastpix &&
//     customData.fastpix.playbackId &&
//     customData.fastpix.tokens &&
//     customData.fastpix.tokens.drm
//   ) {
//     const playbackId = customData.fastpix.playbackId;
//     const drmToken = customData.fastpix.tokens.drm;

//     castDebugLogger.info(LOG_TAG, 'Playback ID: ' + playbackId);
//     castDebugLogger.info(LOG_TAG, 'DRM Token: Present');

//     // ✅ Correct Fastpix Widevine License URL
//     playbackConfig.licenseUrl =
//       `https://api.fastpix.io/v1/on-demand/drm/license/widevine/${playbackId}?token=${drmToken}`;

//     playbackConfig.protectionSystem =
//       cast.framework.ContentProtection.WIDEVINE;

//     // --------------------------------------------------
//     // 🔥 CRITICAL FIX — normalize Widevine license request
//     // --------------------------------------------------
//     playbackConfig.licenseRequestHandler = (type, request) => {
//       if (
//         type ===
//         cast.framework.ContentProtectionRequest.RequestType.LICENSE
//       ) {
//         // Fastpix expects raw Widevine bytes
//         request.headers['Content-Type'] =
//           'application/octet-stream';

//         // CAF may send base64 string → convert to ArrayBuffer
//         if (request.body && typeof request.body === 'string') {
//           const binary = atob(request.body);
//           const bytes = new Uint8Array(binary.length);

//           for (let i = 0; i < binary.length; i++) {
//             bytes[i] = binary.charCodeAt(i);
//           }

//           request.body = bytes.buffer;
//         }

//         castDebugLogger.info(
//           LOG_TAG,
//           'License request normalized → body=' +
//             Object.prototype.toString.call(request.body)
//         );
//       }

//       return request;
//     };

//     castDebugLogger.info(
//       LOG_TAG,
//       'Widevine license URL set: ' + playbackConfig.licenseUrl
//     );
//   } else {
//     castDebugLogger.warn(
//       LOG_TAG,
//       'Fastpix DRM data missing in customData'
//     );
//   }

//   return playbackConfig;
// });

// // --------------------------------------------------
// // ERROR LOGGING
// // --------------------------------------------------
// playerManager.addEventListener(
//   cast.framework.events.EventType.ERROR,
//   (event) => {
//     castDebugLogger.error(
//       LOG_TAG,
//       'Player ERROR: ' + JSON.stringify(event)
//     );
//   }
// );

// // --------------------------------------------------
// // PLAYBACK STATE LOGS
// // --------------------------------------------------
// playerManager.addEventListener(
//   cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
//   () => castDebugLogger.info(LOG_TAG, 'Player load complete')
// );

// playerManager.addEventListener(
//   cast.framework.events.EventType.PLAYING,
//   () => castDebugLogger.info(LOG_TAG, 'Playback started')
// );

// // --------------------------------------------------
// // START RECEIVER
// // --------------------------------------------------
// const options = new cast.framework.CastReceiverOptions();
// options.disableIdleTimeout = false;
// options.maxInactivity = 3600; // 1 hour

// context.start(options);

// castDebugLogger.info(LOG_TAG, 'Fastpix Chromecast Receiver started');


// ==================================================
// Fastpix Chromecast Receiver (Widevine)
// With FULL Network + DRM Debugging
// ==================================================

// --------------------------------------------------
// Receiver Context
// --------------------------------------------------
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// --------------------------------------------------
// Debug Logger (ENABLE FOR TESTING)
// --------------------------------------------------
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = 'FASTPIX';

castDebugLogger.setEnabled(true);
castDebugLogger.showDebugLogs(true);

castDebugLogger.loggerLevelByTags = {
  [LOG_TAG]: cast.framework.LoggerLevel.DEBUG,
};

// --------------------------------------------------
// MEDIA PLAYBACK INFO HANDLER
// --------------------------------------------------
playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  castDebugLogger.info(LOG_TAG, '=================================');
  castDebugLogger.info(LOG_TAG, 'MediaPlaybackInfoHandler called');

  const media = loadRequest.media || {};
  const customData = media.customData || {};

  castDebugLogger.info(
    LOG_TAG,
    'Media contentId=' + media.contentId
  );
  castDebugLogger.info(
    LOG_TAG,
    'CustomData=' + JSON.stringify(customData)
  );

  // --------------------------------------------------
  // NETWORK VISIBILITY (MANIFEST / SEGMENTS)
  // --------------------------------------------------
  playbackConfig.manifestRequestHandler = (request) => {
    castDebugLogger.info(
      LOG_TAG,
      'MANIFEST REQUEST → ' + request.url
    );
    return request;
  };

  playbackConfig.segmentRequestHandler = (request) => {
    castDebugLogger.info(
      LOG_TAG,
      'SEGMENT REQUEST → ' + request.url
    );

    // Detect signed / expiring URLs
    if (
      request.url.includes('Expires=') ||
      request.url.includes('Signature=') ||
      request.url.includes('Policy=')
    ) {
      castDebugLogger.warn(
        LOG_TAG,
        '⚠️ SIGNED SEGMENT URL (may expire!)'
      );
    }

    return request;
  };

  // --------------------------------------------------
  // FASTPIX DRM HANDLING (WIDEVINE)
  // --------------------------------------------------
  if (
    customData.fastpix &&
    customData.fastpix.playbackId &&
    customData.fastpix.tokens &&
    customData.fastpix.tokens.drm
  ) {
    const playbackId = customData.fastpix.playbackId;
    const drmToken = customData.fastpix.tokens.drm;

    castDebugLogger.info(
      LOG_TAG,
      'Fastpix playbackId=' + playbackId
    );
    castDebugLogger.info(
      LOG_TAG,
      'Fastpix DRM token present'
    );

    playbackConfig.licenseUrl =
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/${playbackId}?token=${drmToken}`;

    playbackConfig.protectionSystem =
      cast.framework.ContentProtection.WIDEVINE;

    // --------------------------------------------------
    // WIDEVINE LICENSE NORMALIZATION (CRITICAL)
    // --------------------------------------------------
    playbackConfig.licenseRequestHandler = (type, request) => {
      if (
        type ===
        cast.framework.ContentProtectionRequest.RequestType.LICENSE
      ) {
        castDebugLogger.info(
          LOG_TAG,
          'LICENSE REQUEST → ' + request.url
        );

        request.headers['Content-Type'] =
          'application/octet-stream';

        // CAF sometimes sends base64 → convert to ArrayBuffer
        if (request.body && typeof request.body === 'string') {
          castDebugLogger.warn(
            LOG_TAG,
            'License body is base64 string → converting'
          );

          const binary = atob(request.body);
          const bytes = new Uint8Array(binary.length);

          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          request.body = bytes.buffer;
        }

        castDebugLogger.info(
          LOG_TAG,
          'License request body=' +
            Object.prototype.toString.call(request.body)
        );
      }

      return request;
    };

    castDebugLogger.info(
      LOG_TAG,
      'Widevine license URL set'
    );
  } else {
    castDebugLogger.warn(
      LOG_TAG,
      '❌ Fastpix DRM data missing in customData'
    );
  }

  return playbackConfig;
});

// --------------------------------------------------
// ERROR LOGGING (THIS IS GOLD)
// --------------------------------------------------
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    castDebugLogger.error(LOG_TAG, '🚨 PLAYER ERROR');

    if (event.detailedErrorCode) {
      castDebugLogger.error(
        LOG_TAG,
        'DetailedErrorCode=' + event.detailedErrorCode
      );
    }

    if (event.reason) {
      castDebugLogger.error(
        LOG_TAG,
        'Reason=' + event.reason
      );
    }

    castDebugLogger.error(
      LOG_TAG,
      'FullEvent=' + JSON.stringify(event)
    );
  }
);

// --------------------------------------------------
// PLAYBACK STATE LOGS
// --------------------------------------------------
playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
  () => {
    castDebugLogger.info(
      LOG_TAG,
      '✅ PLAYER_LOAD_COMPLETE'
    );
  }
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYING,
  () => {
    castDebugLogger.info(
      LOG_TAG,
      '▶️ PLAYBACK STARTED'
    );
  }
);

// --------------------------------------------------
// RECEIVER START
// --------------------------------------------------
const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600; // 1 hour

context.start(options);

castDebugLogger.info(
  LOG_TAG,
  '🔥 Fastpix Chromecast Receiver started'
);

