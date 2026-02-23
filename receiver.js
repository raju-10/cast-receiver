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
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/9a210e43-9ac9-4fa8-9fc4-4a1e4ec0de8e?token=eyJhbGciOiJSUzI1NiJ9.eyJraWQiOiI0Yzg0NTU3My1kNTNhLTQ2ODEtYjI5ZS0wN2ExZTFhMWQyZmIiLCJhdWQiOiJkcm06OWEyMTBlNDMtOWFjOS00ZmE4LTlmYzQtNGExZTRlYzBkZThlIiwiaXNzIjoiZmFzdHBpeC5pbyIsInN1YiI6IiIsImlhdCI6MTc3MTg0MjE2NCwiZXhwIjoxNzcxOTI4NTY0fQ.VnlLAbtuuYOJespKEU2FTLa2aXm0o_dMEAu4eHghc7qItx0WTykdP6r97hrf-a2-SmM-jZFE8NuSKL1NlavTmoCqbZqfpd1dHuE__-sgLnaQRk_IL-aN1m6d2JybpNz986ePc9rpPlWfAV4ZsvqDWfYZcSQOUnHD0gX29Zq75GiKfUqpDMnRoZ4ww6IwYUrBnJ6Fu72ADlhPsLpGcqozWx4-aRx4JglI7Te00Mfm_LrCfwZHpGf7fQM4l9UBZEuY89Y4MlzNty66c_3TGofN9fPIUrw5hiVIfwF9fhfWTiQN-OH7ZKlyL5eXGU4LncSpSbdHthTxIV5OFmTArEAakA`;
 
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
