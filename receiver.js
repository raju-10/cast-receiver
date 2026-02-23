const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const LICENSE_URL = "https://api.fastpix.io/v1/on-demand/drm/license/widevine/cd5f87a1-5fd3-49bb-b103-cc1095193f7f?token=eyJhbGciOiJSUzI1NiJ9.eyJraWQiOiI4NzRmYjY3MS00ZmJmLTRhZGYtYTdmMy01ZTNjZTQ2OGFjMjQiLCJhdWQiOiJkcm06Y2Q1Zjg3YTEtNWZkMy00OWJiLWIxMDMtY2MxMDk1MTkzZjdmIiwiaXNzIjoiZmFzdHBpeC5pbyIsInN1YiI6IiIsImlhdCI6MTc3MTg0ODkzNSwiZXhwIjoxNzcxOTM1MzM1fQ.GjZP5NLssBiYQG43O1h-1o2zT3DiEfpbeA4gs-Qd11g1pDzrxai-ZvSlkZBxZI0W0eEEPFEhQaw53rzrnndsDYm_imNZHjraXjRAeHftyuNk_1mGi_so-2jbwqLZis1j-LMYuV4-_OEHgm9eRdPT-PmWHdPIRuAEuahtp5pq5diraeOYlY3JidTaDr7kEbFK3JBUwzoVWoetdN5hziD7qBwea0BlmiWeWF07aaQryHk7i2lMFGOVCXyu6MoU-vqZwlepnJqK63aRw3hon3Q3gViCw8nZ67G6Fi-NyjNkBx7oqA31oDrumPTECoGd_7r_j7JDYVmkgdqLLnBZMq8Qtg";

playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
  console.log('LOAD REQUEST', JSON.stringify(loadRequest.media));

  // ✅ Correct per Google CAF PlaybackConfig API
  playbackConfig.licenseUrl = LICENSE_URL;
  playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
  playbackConfig.licenseRequestHandler = (requestInfo) => {
    requestInfo.headers['Content-Type'] = 'application/octet-stream';
  };

  return playbackConfig;
});

playerManager.addEventListener(
  cast.framework.events.EventType.ERROR,
  (event) => {
    console.error('❌ CAST ERROR', JSON.stringify(event));
  }
);

const options = new cast.framework.CastReceiverOptions();
options.disableIdleTimeout = false;
options.maxInactivity = 3600;
context.start(options);
