const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

let licenseUrl = null;


// ─────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  e => console.error("❌ ERROR", e)
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
  () => console.log("✅ PLAYER LOAD COMPLETE")
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYING,
  () => console.log("▶️ PLAYING")
);

playerManager.addEventListener(
  cast.framework.events.EventType.BUFFERING,
  e => console.log("⏳ BUFFERING", e)
);


// ─────────────────────────────────────────────
// LOAD interceptor
// ─────────────────────────────────────────────
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  loadRequest => {

    console.log("LOAD REQUEST", loadRequest);

    if (
      loadRequest.media &&
      loadRequest.media.customData &&
      loadRequest.media.customData.licenseUrl
    ) {
      licenseUrl = loadRequest.media.customData.licenseUrl;
      console.log("License URL received:", licenseUrl);
    }

    // Required for CMAF HLS
    loadRequest.media.contentType = "application/x-mpegurl";

    loadRequest.media.hlsSegmentFormat =
      cast.framework.messages.HlsSegmentFormat.FMP4;

    loadRequest.media.hlsVideoSegmentFormat =
      cast.framework.messages.HlsVideoSegmentFormat.FMP4;

    return loadRequest;
  }
);


// ─────────────────────────────────────────────
// DRM Playback Config
// ─────────────────────────────────────────────
const playbackConfig = new cast.framework.PlaybackConfig();

playbackConfig.protectionSystem =
  cast.framework.ContentProtection.WIDEVINE;

playbackConfig.licenseRequestHandler = request => {

  if (!licenseUrl) {
    console.error("❌ No license URL available");
    return request;
  }

  request.url = licenseUrl;

  request.headers = request.headers || {};
  request.headers["Content-Type"] = "application/octet-stream";

  console.log("License request →", request.url);

  return request;
};


// ─────────────────────────────────────────────
// Start receiver
// ─────────────────────────────────────────────
context.start({
  playbackConfig: playbackConfig
});
