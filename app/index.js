import document from "document";
import { me } from "appbit";
import * as fs from "fs";
import { inbox } from "file-transfer";

/* Deactivate display auto off, to instantly see the color changes*/
import { display } from "display";
display.autoOff = false;
display.on = true;


/* settings file and type */
const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

/* Variable to store the current settings */
let settings;

initialize();

/* Initializes the settings object and callbacks */
function initialize() {
  settings = loadSettings();
  inbox.addEventListener("newfile", processReceivedFileMessages);
  // Register for the unload event
  me.addEventListener("unload", saveSettings);
  // Process files in queue, when app was down
  processReceivedFileMessages();
}

/* Received message (as file) containing settings data */
function processReceivedFileMessages() {
  let fileName;
  let newSettingsReceived = false;
  // read incomming files
  try {
    while (fileName = inbox.nextFile()) {
      let data = fs.readFileSync(fileName, "cbor");
      // store data in settings
      settings[data.key] = data.value;
      // delete read file
      fs.unlinkSync(fileName);
      // hide "select profile" text
      newSettingsReceived = true;
    }
    // handle settings changes
    if (newSettingsReceived) {
      onSettingsChange(settings);
    }
  } catch (ex) {
    console.log("ignoring error: " + ex);
  }
}

/* Load settings from filesystem */
function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    return {};
  }
}

/* Save settings to the filesystem on device shutdown */
function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}

function onSettingsChange(settings) {
  if (settings.backgroundColor1) {
    document.getElementById("background1").style.fill = settings.backgroundColor1;
  }
  if (settings.backgroundColor2) {
    document.getElementById("background2").style.fill = settings.backgroundColor2;
  }
  if (settings.backgroundColor3) {
    document.getElementById("background3").style.fill = settings.backgroundColor3;
  }
}
