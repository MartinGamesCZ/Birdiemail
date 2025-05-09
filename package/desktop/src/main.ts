import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  shell,
} from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { APP_URL } from "./config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set environment variables for Electron
process.env.APP_ROOT = path.join(__dirname, "..");
process.env.APP_VERSION = app.getVersion(); // Set the app version to get in the preload

// Set constants for the app
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

// Set the public directory for the app
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Store the app window between events
let win: BrowserWindow | null;

// Create the main window of the app after ready
function createWindow() {
  // Remove the default menu bar from all windows (including opened links)
  Menu.setApplicationMenu(null);

  // Create the browser window
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      devTools: true, // Allow devtools
      preload: path.join(__dirname, "preload.mjs"),
    },
    titleBarStyle: "hidden",
  });

  // Set window properties
  win.setMenu(null);
  win.setTitle("Birdiemail");
  win.maximize();

  // Bind function to open devtools
  ipcMain.on("dev.devtools.open", () => {
    if (!win) return;

    win.webContents.openDevTools({ mode: "detach" });
  });

  // Bind function to close the window
  ipcMain.on("win.close", () => {
    if (!win) return;

    win.close();
  });

  // Bind function to minimize the window
  ipcMain.on("win.minimize", () => {
    if (!win) return;

    win.minimize();
  });

  // Bind function to maximize the window
  ipcMain.on("win.maximize", () => {
    if (!win) return;

    win.maximize();
  });

  // Bind function to restore the window
  ipcMain.on("win.restore", () => {
    if (!win) return;

    win.restore();
  });

  // Bind function to open link in the default browser
  ipcMain.on("open-link", (_, url) => {
    if (!win) return;

    shell.openExternal(url);
  });

  // Bind Ctrl+Shift+I shortcut to open devtools page (/dev)
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    if (!win) return;

    win.loadURL(`${APP_URL}/dev`);
  });

  // Open the app URL in the window
  win.loadURL(APP_URL).catch((err) => {
    console.error("Failed to load URL:", err);
  });
}

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  // Check if not macOS (darwin) platform
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

// Recreate the window when the app is activated (macOS)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Create the window when the app is ready
app.whenReady().then(createWindow);
