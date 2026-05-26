const { app, BrowserWindow } = require("electron");
const { spawn, execSync } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");
const fs = require("fs");

let mainWindow;
let nextProcess;

function getAppRoot() {
    // Development: __dirname = electron/
    // Production: app.getAppPath() = resources/app.asar, tapi file ada di resources/
    if (app.isPackaged) {
        return path.join(process.resourcesPath, "app.asar");
    }
    return path.join(__dirname, "..");
}

function cleanupOldData() {
    console.log("Running cleanup...");
    try {
        execSync(`node ${path.join(__dirname, "cleanup.cjs")}`, {
            cwd: getAppRoot(),
            stdio: "inherit",
        });
    } catch (err) {
        console.error("Cleanup failed:", err.message);
    }
}

function setupDatabase() {
    const dbPath = app.isPackaged
        ? path.join(process.resourcesPath, "prisma", "dev.db")
        : path.join(__dirname, "../prisma/dev.db");

    console.log("DB Path:", dbPath);
    console.log("DB exists:", fs.existsSync(dbPath));
    console.log("DB size:", fs.existsSync(dbPath) ? fs.statSync(dbPath).size : "N/A");

    const isFirstRun = !fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0;
    console.log("Is first run:", isFirstRun);

    if (isFirstRun) {
        console.log("Running migrate deploy...");
        try {
            execSync("node node_modules/prisma/build/index.js migrate deploy", {
                cwd: getAppRoot(),
                env: {
                    ...process.env,
                    DATABASE_URL: `file:${dbPath}`,
                },
                stdio: "inherit",
            });
            console.log("Migrate done, running seed...");
            execSync("node node_modules/prisma/build/index.js db seed", {
                cwd: getAppRoot(),
                env: {
                    ...process.env,
                    DATABASE_URL: `file:${dbPath}`,
                },
                stdio: "inherit",
            });
            console.log("Seed done!");
        } catch (err) {
            console.error("Setup failed:", err.message);
        }
    }
}

function createWindow() {
    setupDatabase();
    cleanupOldData();

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadURL("http://localhost:3000");

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", async () => {
    const serverPath = app.isPackaged
        ? path.join(process.resourcesPath, "app.asar", ".next", "standalone", "server.js")
        : path.join(__dirname, "../.next/standalone/server.js");

    const appRoot = getAppRoot();

    nextProcess = spawn("node", [serverPath], {
        env: {
            ...process.env,
            PORT: "3000",
            HOSTNAME: "127.0.0.1",
            NODE_ENV: "production",
        },
        cwd: appRoot,
    });

    nextProcess.stdout.on("data", data => {
        console.log(`Next.js stdout: ${data}`);
    });

    nextProcess.stderr.on("data", data => {
        console.error(`Next.js stderr: ${data}`);
    });

    nextProcess.on("error", err => {
        console.error("Failed to start Next.js:", err);
    });

    nextProcess.on("close", code => {
        console.log(`Next.js exited with code: ${code}`);
    });

    console.log("Waiting for Next.js...");

    try {
        await waitOn({
            resources: ["http://127.0.0.1:3000"],
            timeout: 30000,
            interval: 500,
        });
        console.log("Next.js ready!");
        createWindow();
    } catch (err) {
        console.error("waitOn failed:", err);
    }
});

app.on("window-all-closed", () => {
    if (nextProcess) nextProcess.kill();
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (mainWindow === null) createWindow();
});
