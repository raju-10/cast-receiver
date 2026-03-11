const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// LOAD Interceptor
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (loadRequest) => {
    if (!loadRequest.media) return loadRequest;

    console.log("LOAD REQUEST:", JSON.stringify(loadRequest));

    loadRequest.media.contentType = "application/x-mpegurl";
    loadRequest.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.FMP4;
    loadRequest.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.FMP4;

    return loadRequest;
  }
);

// DRM via setMediaPlaybackInfoHandler — correct way to set licenseUrl per-request
playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  const licenseUrl = loadRequest.media?.customData?.licenseUrl;

  if (licenseUrl) {
    console.log("🔐 DRM licenseUrl:", licenseUrl);
    playbackConfig.licenseUrl = licenseUrl;           // ← correct property
    playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
  } else {
    console.log("🔓 No DRM (trailer)");
  }

  return playbackConfig;
});

playerManager.addEventListener(cast.framework.events.EventType.ERROR, (event) => {
  console.error("❌ Player Error:", JSON.stringify(event));
});

playerManager.addEventListener(cast.framework.events.EventType.PLAYER_LOAD_COMPLETE, () => {
  console.log("✅ PLAYER_LOAD_COMPLETE");
});

context.start();   // no global playbackConfig here — it's set per-load above
console.log("Receiver Started");
