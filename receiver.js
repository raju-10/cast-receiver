const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

let licenseUrl = null;


// ─────────────────────────────────────
// LOAD interceptor
// ─────────────────────────────────────
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  loadRequest => {

    if (
      loadRequest.media &&
      loadRequest.media.customData &&
      loadRequest.media.customData.licenseUrl
    ) {
      licenseUrl = loadRequest.media.customData.licenseUrl;
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


// ─────────────────────────────────────
// DRM configuration
// ─────────────────────────────────────
const playbackConfig = new cast.framework.PlaybackConfig();

playbackConfig.protectionSystem =
  cast.framework.ContentProtection.WIDEVINE;

playbackConfig.licenseRequestHandler = request => {

  if (licenseUrl) {
    request.url = licenseUrl;
  }

  request.headers = request.headers || {};
  request.headers["Content-Type"] = "application/octet-stream";

  return request;
};


// ─────────────────────────────────────
// Start receiver
// ─────────────────────────────────────
context.start({
  playbackConfig: playbackConfig
});
