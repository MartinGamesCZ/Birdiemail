import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
//import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { APP_URL } from "./config";

//const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "logo_appicon.png"),
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
    titleBarStyle: "hidden",
  });

  win.setMenu(null);
  win.setTitle("Birdiemail");
  win.maximize();

  ipcMain.on("dev.devtools.open", () => {
    win?.webContents.openDevTools({ mode: "detach" });
  });

  ipcMain.on("win.close", () => {
    win?.close();
  });

  ipcMain.on("win.minimize", () => {
    win?.minimize();
  });

  ipcMain.on("win.maximize", () => {
    win?.maximize();
  });

  ipcMain.on("win.restore", () => {
    win?.restore();
  });

  globalShortcut.register("CommandOrControl+Shift+I", () => {
    win?.loadURL(`${APP_URL}/dev`);
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.loadURL(APP_URL);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
