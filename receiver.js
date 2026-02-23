const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

/**
 * --------------------------------------------------
 * ON-SCREEN DEBUG LOGGER (VISIBLE ON TV)
 * --------------------------------------------------
 */
const debugLogger = cast.debug.CastDebugLogger.getInstance();
debugLogger.setEnabled(true);
debugLogger.showDebugLogs(true);
debugLogger.setDefaultLevel(cast.framework.LoggerLevel.DEBUG);

const LOG_TAG = 'FASTPIX';
const log = (msg) => {
  debugLogger.logger(LOG_TAG).info(msg);
};

// --------------------------------------------------
// MEDIA PLAYBACK CONFIG (DRM HANDLING – FIXED)
// --------------------------------------------------
playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  log('LOAD REQUEST RECEIVED');

  const media = loadRequest.media || {};
  const customData = media.customData || {};

  log(`ContentId: ${media.contentId}`);
  log(`ContentType: ${media.contentType}`);
  log(`Has customData: ${!!media.customData}`);

  // --------------------------------------------------
  // Fastpix Widevine DRM (CORRECT WAY)
  // --------------------------------------------------
  if (
    customData.fastpix &&
    customData.fastpix.playbackId &&
    customData.fastpix.tokens?.drm
  ) {
    log('FASTPIX DRM DETECTED');

    const playbackId = customData.fastpix.playbackId;
    const drmToken = customData.fastpix.tokens.drm;

    const licenseUrl =
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/${playbackId}?token=${drmToken}`;

    log(`PlaybackId: ${playbackId}`);
    log('Applying Widevine license URL');

    playbackConfig.drm = {
      [cast.framework.ContentProtection.WIDEVINE]: {
        licenseUrl: licenseUrl
      }
    };
  } else {
    log('NO DRM DATA — playing clear content');
  }

  log('PlaybackConfig ready');
  return playbackConfig;
});

// --------------------------------------------------
// PLAYER STATE CHANGES (ON SCREEN)
// --------------------------------------------------
playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_STATE_CHANGED,
  (event) => {
    log(`PLAYER STATE: ${event.state}`);
  }
);

// --------------------------------------------------
// MEDIA STATUS (DRM FAILURES SHOW HERE)
// --------------------------------------------------
playerManager.addEventListener(
  cast.framework.events.EventType.MEDIA_STATUS,
  (event) => {
    const status = event.mediaStatus;
    if (!status) return;

    log(`STATUS: ${status.playerState}`);
    if (status.idleReason) {
      log(`IDLE REASON: ${status.idleReason}`);
    }
  }
);

// --------------------------------------------------
// ERROR HANDLING (ON SCREEN)
// --------------------------------------------------
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    log('❌ CAST PLAYER ERROR');
    log(JSON.stringify(event));
  }
);

// --------------------------------------------------
// START RECEIVER
// --------------------------------------------------
log('Fastpix Cast Receiver starting…');

const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600;

context.start(options);
