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
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/bc8e3f7e-5671-4aac-a4d7-f656f3e740fe?token=eyJhbGciOiJSUzI1NiJ9.eyJraWQiOiI0Yzg0NTU3My1kNTNhLTQ2ODEtYjI5ZS0wN2ExZTFhMWQyZmIiLCJhdWQiOiJkcm06YmM4ZTNmN2UtNTY3MS00YWFjLWE0ZDctZjY1NmYzZTc0MGZlIiwiaXNzIjoiZmFzdHBpeC5pbyIsInN1YiI6IiIsImlhdCI6MTc3MTgzODI5MSwiZXhwIjoxNzcxOTI0NjkxfQ.os1G2kFi5hBo_sW1dLveuJGh1U6XWSxT_3ufx3E5AShQmkuoCls0tit8XMmQfJoUdoXg9AMeEvS4Yuaw4aD-XjlpOCmdLjkpfo-ugjHHBUPUhWKtmCSZGD27dU9DmNS1vUPRoTVTnS6IrhoY8mt-YJYgdyaLXxawNRCq2yCXNCVOiUNsLLYlZ7G6VxLNQ6_F1nK68ZP0YSt4lDPiuzeOcyatQfcQ4h8OKRNf_JaZ-aBH2jRKb8F-qE_5CTxDm8cuiB9sAsSAyXsDUbqM2jQk36Fn2hwpj3S19WhdgGqIFb82QHjO9ozdQk4Z6kQ0P3gXltEavdJ11iSlzZ-vZf3yXg`;
 
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
