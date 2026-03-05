const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// ── Logging ───────────────────────────────────────────────────────────────
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => console.error('❌ ERROR', JSON.stringify(event))
);
playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
  () => console.log('✅ PLAYER LOAD COMPLETE')
);
playerManager.addEventListener(
  cast.framework.events.EventType.PLAYING,
  () => console.log('▶️ PLAYING')
);
playerManager.addEventListener(
  cast.framework.events.EventType.BUFFERING,
  (e) => console.log('⏳ BUFFERING', JSON.stringify(e))
);

// ── Start — no DRM, no playbackConfig needed ──────────────────────────────
const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600;
context.start(options);
