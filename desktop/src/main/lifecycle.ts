import { app, type BrowserWindow } from "electron";
import type { StartedServer } from "@paperclipai/server";

export function setupLifecycle(
  mainWindow: BrowserWindow,
  startedServer: StartedServer,
): void {
  let isQuitting = false;

  // Hide to tray instead of closing (unless app is quitting)
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  app.on("before-quit", () => {
    isQuitting = true;
  });

  // Graceful shutdown: close the server (including Vite file watchers)
  // before Electron tears down the Node environment.
  app.on("will-quit", (event) => {
    event.preventDefault();

    // Hard deadline so the app always exits even if shutdown hangs
    const forceExitTimer = setTimeout(() => {
      app.exit(0);
    }, 8000);

    startedServer.server.closeAllConnections();

    void startedServer
      .shutdown()
      .catch(() => {})
      .finally(() => {
        clearTimeout(forceExitTimer);
        app.exit(0);
      });
  });

  // macOS: re-show window when dock icon clicked
  app.on("activate", () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Ensure app quits on all platforms when all windows are destroyed
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
