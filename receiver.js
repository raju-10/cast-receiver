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
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// --------------------------------------------------
// MEDIA PLAYBACK CONFIG (DRM HANDLING)
// --------------------------------------------------
playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  const media = loadRequest.media || {};
  const customData = media.customData || {};

  // Fastpix Widevine DRM
  if (
    customData.fastpix &&
    customData.fastpix.playbackId &&
    customData.fastpix.tokens?.drm
  ) {
    const playbackId = customData.fastpix.playbackId;
    const drmToken = customData.fastpix.tokens.drm;

    playbackConfig.licenseUrl =
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/${playbackId}?token=${drmToken}`;

    playbackConfig.protectionSystem =
      cast.framework.ContentProtection.WIDEVINE;
  }

  return playbackConfig;
});

// --------------------------------------------------
// ERROR HANDLING (CRITICAL FOR DRM DEBUGGING)
// --------------------------------------------------
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    console.error('CAST PLAYER ERROR', event);
  }
);

// --------------------------------------------------
// START RECEIVER
// --------------------------------------------------
const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600;

context.start(options);
