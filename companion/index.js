import { settingsStorage } from "settings";
import { outbox } from "file-transfer";
import { encode } from "cbor";
import * as cp from "./colorpicker";

// A user changes settings
settingsStorage.onchange = evt => {
  if (cp.isColorPickerSetting(evt.key)) {
    cp.onchange(evt.key, settingsStorage);
    return;
  }
  sendValue(evt.key, evt.newValue);
};

// Send data to device using Messaging API
function sendValue(key, val) {
  let obj = JSON.parse(val);
  if (obj && obj.selected) {
    obj = obj.values[0].value;
  }
  sendSettingData(key, obj);
}

/* Sends the value to device using the file api, which is more reliable as messaging */
function sendSettingData(key, value) {
  try {
    let data = encode({ key: key, value: value });
    outbox.enqueue(key, data);
  } catch (error) {
    console.log("Failed to queue '" + key + "'. Discarding message. Error: " + error);
  }
}