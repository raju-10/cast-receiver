const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

let licenseUrl = null;

// ─────────────────────────────────────
// Create on-screen log box
// ─────────────────────────────────────
const logBox = document.createElement("div");
logBox.style.position = "absolute";
logBox.style.top = "0";
logBox.style.left = "0";
logBox.style.width = "100%";
logBox.style.maxHeight = "100%";
logBox.style.overflow = "auto";
logBox.style.background = "rgba(0,0,0,0.7)";
logBox.style.color = "lime";
logBox.style.fontSize = "22px";
logBox.style.fontFamily = "monospace";
logBox.style.padding = "10px";
logBox.style.zIndex = "9999";

document.body.appendChild(logBox);

function log(msg) {
  console.log(msg);
  const p = document.createElement("div");
  p.textContent = msg;
  logBox.appendChild(p);
}

// ─────────────────────────────────────
// Player event logs
// ─────────────────────────────────────
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  e => log("❌ ERROR: " + JSON.stringify(e))
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
  () => log("✅ PLAYER LOAD COMPLETE")
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYING,
  () => log("▶️ PLAYING")
);

playerManager.addEventListener(
  cast.framework.events.EventType.BUFFERING,
  () => log("⏳ BUFFERING")
);

// ─────────────────────────────────────
// LOAD interceptor
// ─────────────────────────────────────
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  loadRequest => {

    log("📦 LOAD REQUEST RECEIVED");

    if (
      loadRequest.media &&
      loadRequest.media.customData &&
      loadRequest.media.customData.licenseUrl
    ) {
      licenseUrl = loadRequest.media.customData.licenseUrl;
      log("🔑 License URL: " + licenseUrl);
    } else {
      log("⚠️ No license URL provided");
    }

    // Required for CMAF HLS
    loadRequest.media.contentType = "application/x-mpegurl";

    loadRequest.media.hlsSegmentFormat =
      cast.framework.messages.HlsSegmentFormat.FMP4;

    loadRequest.media.hlsVideoSegmentFormat =
      cast.framework.messages.HlsVideoSegmentFormat.FMP4;

    log("📺 HLS CMAF configuration applied");

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
    log("🔐 License request → " + licenseUrl);
  } else {
    log("❌ License URL missing");
  }

  request.headers = request.headers || {};
  request.headers["Content-Type"] = "application/octet-stream";

  return request;
};

// ─────────────────────────────────────
// Start receiver
// ─────────────────────────────────────
log("🚀 Starting Cast Receiver");

context.start({
  playbackConfig: playbackConfig
});
