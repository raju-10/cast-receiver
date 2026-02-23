const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

/**
 * ==================================================
 * MANUAL ON-SCREEN LOG OVERLAY (ALWAYS WORKS)
 * ==================================================
 */
const logDiv = document.createElement('div');
logDiv.style.position = 'fixed';
logDiv.style.top = '0';
logDiv.style.left = '0';
logDiv.style.width = '100%';
logDiv.style.maxHeight = '50%';
logDiv.style.overflowY = 'auto';
logDiv.style.background = 'rgba(0,0,0,0.75)';
logDiv.style.color = '#00ff00';
logDiv.style.fontSize = '18px';
logDiv.style.fontFamily = 'monospace';
logDiv.style.zIndex = '9999';
logDiv.style.padding = '10px';
logDiv.style.boxSizing = 'border-box';
document.body.appendChild(logDiv);

function screenLog(msg) {
  const line = document.createElement('div');
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logDiv.appendChild(line);
  logDiv.scrollTop = logDiv.scrollHeight;
}

// --------------------------------------------------
screenLog('FASTPIX Cast Receiver loaded');
// --------------------------------------------------

/**
 * ==================================================
 * MEDIA PLAYBACK CONFIG (CORRECT DRM HANDLING)
 * ==================================================
 */
playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  screenLog('LOAD REQUEST RECEIVED');

  const media = loadRequest.media || {};
  const customData = media.customData || {};

  screenLog(`ContentId: ${media.contentId}`);
  screenLog(`ContentType: ${media.contentType}`);
  screenLog(`Has customData: ${!!media.customData}`);

  // --------------------------------------------------
  // FASTPIX WIDEVINE DRM (DASH – CORRECT)
  // --------------------------------------------------
  if (
    customData.fastpix &&
    customData.fastpix.playbackId &&
    customData.fastpix.tokens?.drm
  ) {
    const playbackId = customData.fastpix.playbackId;
    const drmToken = customData.fastpix.tokens.drm;

    const licenseUrl =
      `https://api.fastpix.io/v1/on-demand/drm/license/widevine/bc8e3f7e-5671-4aac-a4d7-f656f3e740fe?token=eyJhbGciOiJSUzI1NiJ9.eyJraWQiOiI0Yzg0NTU3My1kNTNhLTQ2ODEtYjI5ZS0wN2ExZTFhMWQyZmIiLCJhdWQiOiJkcm06YmM4ZTNmN2UtNTY3MS00YWFjLWE0ZDctZjY1NmYzZTc0MGZlIiwiaXNzIjoiZmFzdHBpeC5pbyIsInN1YiI6IiIsImlhdCI6MTc3MTgzODI5MSwiZXhwIjoxNzcxOTI0NjkxfQ.os1G2kFi5hBo_sW1dLveuJGh1U6XWSxT_3ufx3E5AShQmkuoCls0tit8XMmQfJoUdoXg9AMeEvS4Yuaw4aD-XjlpOCmdLjkpfo-ugjHHBUPUhWKtmCSZGD27dU9DmNS1vUPRoTVTnS6IrhoY8mt-YJYgdyaLXxawNRCq2yCXNCVOiUNsLLYlZ7G6VxLNQ6_F1nK68ZP0YSt4lDPiuzeOcyatQfcQ4h8OKRNf_JaZ-aBH2jRKb8F-qE_5CTxDm8cuiB9sAsSAyXsDUbqM2jQk36Fn2hwpj3S19WhdgGqIFb82QHjO9ozdQk4Z6kQ0P3gXltEavdJ11iSlzZ-vZf3yXg`;

    screenLog('FASTPIX DRM DETECTED');
    screenLog(`PlaybackId: ${playbackId}`);
    screenLog('Applying Widevine license URL');

    playbackConfig.drm = {
      [cast.framework.ContentProtection.WIDEVINE]: {
        licenseUrl: licenseUrl
      }
    };
  } else {
    screenLog('NO DRM DATA – CLEAR CONTENT');
  }

  screenLog('PlaybackConfig READY');
  return playbackConfig;
});

/**
 * ==================================================
 * PLAYER STATE LOGS (ON SCREEN)
 * ==================================================
 */
playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_STATE_CHANGED,
  (event) => {
    screenLog(`PLAYER STATE: ${event.state}`);
  }
);

/**
 * ==================================================
 * MEDIA STATUS (DRM FAILURES SHOW HERE)
 * ==================================================
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
 * ==================================================
 * ERROR HANDLING (ON SCREEN)
 * ==================================================
 */
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    screenLog('❌ CAST PLAYER ERROR');
    screenLog(JSON.stringify(event));
  }
);

/**
 * ==================================================
 * START RECEIVER
 * ==================================================
 */
screenLog('Starting Cast Receiver…');

const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600;

context.start(options);
