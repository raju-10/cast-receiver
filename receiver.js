// Initialize Cast Receiver
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
 
let licenseUrl = null;
 
 
// ─────────────────────────────
// LOAD Interceptor
// ─────────────────────────────
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (loadRequest) => {
 
    if (!loadRequest.media) {
      return loadRequest;
    }
 
    console.log("LOAD REQUEST:", loadRequest);
 
    // Get DRM license URL from sender
    if (loadRequest.media.customData && loadRequest.media.customData.licenseUrl) {
      licenseUrl = loadRequest.media.customData.licenseUrl;
      console.log("License URL:", licenseUrl);
    }
 
    // Ensure HLS content type
    loadRequest.media.contentType = "application/x-mpegurl";
 
    // Required for CMAF HLS
    loadRequest.media.hlsSegmentFormat =
      cast.framework.messages.HlsSegmentFormat.FMP4;
 
    loadRequest.media.hlsVideoSegmentFormat =
      cast.framework.messages.HlsVideoSegmentFormat.FMP4;
 
    return loadRequest;
  }
);
 
 
// ─────────────────────────────
// Playback / DRM Configuration
// ─────────────────────────────
const playbackConfig = new cast.framework.PlaybackConfig();
 
playbackConfig.protectionSystem =
  cast.framework.ContentProtection.WIDEVINE;
 
 
// Modify DRM license request
playbackConfig.licenseRequestHandler = (requestInfo) => {
 
  if (licenseUrl) {
    requestInfo.url = licenseUrl;
  }
 
  requestInfo.headers = requestInfo.headers || {};
 
  requestInfo.headers["Content-Type"] =
    "application/octet-stream";
 
  console.log("License Request:", requestInfo);
 
  return requestInfo;
};
 
 
// Optional: log errors
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    console.error("Player Error:", event);
  }
);
 
 
// ─────────────────────────────
// Start Receiver
// ─────────────────────────────
context.start({
  playbackConfig: playbackConfig
});
 
console.log("Chromecast Receiver Started");
