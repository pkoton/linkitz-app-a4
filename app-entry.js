chrome.app.runtime.onLaunched.addListener(function() {
    new commHandler();
});

var commHandler = function() {
    var connectedId = 0;
    var localID;
    var isLocal;
    chrome.app.window.create(
      'app-main.html', {
        bounds: {
          width: 1600,
          height: 900
        },
        minWidth: 1024,
        minHeight: 768,
        state: "normal",
        id: "linkitz-app-main",
        singleton: true
      },
      function(win) {
        win.contentWindow.setConnectedSocketId = function(id) {
          connectedSocketId = id;
        };
        win.contentWindow.getConnectedSocketId = function() {
          return connectedSocketId;
        };
        win.onClosed.addListener(function() {
          if (0 != connectedId) {
            chrome.hid.disconnect(connectedId, function () {
            });
          }
        });
      }
    );
}
