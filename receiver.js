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
