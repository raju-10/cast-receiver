const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// --------------------------------------------------
// MEDIA PLAYBACK CONFIG (DRM HANDLING)
// --------------------------------------------------// ==================================================
// FASTPIX – Chromecast Receiver with ON-SCREEN LOGS
// ==================================================

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

/**
 * --------------------------------------------------
 * ON-SCREEN DEBUG LOGGER (TV OVERLAY)
 * --------------------------------------------------
 */
const debugLogger = cast.debug.CastDebugLogger.getInstance();

// Enable debug overlay ON THE TV
debugLogger.setEnabled(true);
debugLogger.showDebugLogs(true);   // 👈 THIS IS THE KEY
debugLogger.setDefaultLevel(cast.framework.LoggerLevel.DEBUG);

// Tag for our logs
const LOG_TAG = 'FASTPIX';

// Helper function to log on screen
function screenLog(message) {
  debugLogger.logger(LOG_TAG).info(message);
}

/**
 * --------------------------------------------------
 * MEDIA PLAYBACK CONFIG (DRM)
 * --------------------------------------------------
 */
playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  screenLog('LOAD REQUEST RECEIVED');

  const media = loadRequest.media || {};
  const customData = media.customData || {};

  screenLog(`ContentId: ${media.contentId}`);
  screenLog(`ContentType: ${media.contentType}`);

  if (
    customData.fastpix &&
    customData.fastpix.playbackId &&
    customData.fastpix.tokens?.drm
  ) {
    const playbackId = customData.fastpix.playbackId;
    const drmToken = customData.fastpix.tokens.drm;

    const licenseUrl =
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/${playbackId}?token=${drmToken}`;

    screenLog('Widevine DRM DETECTED');
    screenLog(`PlaybackId: ${playbackId}`);
    screenLog('Applying license URL');

    playbackConfig.drm = {
      [cast.framework.ContentProtection.WIDEVINE]: {
        licenseUrl: licenseUrl
      }
    };
  } else {
    screenLog('NO DRM – Playing clear content');
  }

  return playbackConfig;
});

/**
 * --------------------------------------------------
 * PLAYER STATE CHANGES
 * --------------------------------------------------
 */
playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_STATE_CHANGED,
  (event) => {
    screenLog(`PLAYER STATE: ${event.state}`);
  }
);

/**
 * --------------------------------------------------
 * MEDIA STATUS (DRM FAILURES SHOW HERE)
 * --------------------------------------------------
 */
playerManager.addEventListener(
  cast.framework.events.EventType.MEDIA_STATUS,
  (event) => {
    const status = event.mediaStatus;
    if (!status) return;

    screenLog(`STATUS: ${status.playerState}`);
    if (status.idleReason) {
      screenLog(`IDLE REASON: ${status.idleReason}`);
    }
  }
);

/**
 * --------------------------------------------------
 * ERROR HANDLING (ON SCREEN)
 * --------------------------------------------------
 */
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    screenLog('CAST ERROR OCCURRED');
    screenLog(JSON.stringify(event));
  }
);

/**
 * --------------------------------------------------
 * START RECEIVER
 * --------------------------------------------------
 */
screenLog('Fastpix Cast Receiver STARTING…');

const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600;

context.start(options);
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
