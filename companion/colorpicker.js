import * as cpConstants from "../common/colorpicker";
import * as png from "./lib/pnglib";
import tinycolor from "./lib/tinycolor";

export function isColorPickerSetting(key) {
  return key === cpConstants.TARGET_SETTINGS_KEY ||
    key === cpConstants.COLOR_VALUE_SETTINGS_KEY ||
    key === cpConstants.COLOR_IMAGE_SETTINGS_KEY ||
    key === cpConstants.SLIDER_SAT_SETTINGS_KEY ||
    key === cpConstants.SLIDER_LIT_SETTINGS_KEY ||
    key === cpConstants.SLIDER_HUE_SETTINGS_KEY ||
    key === cpConstants.SLIDER_HUE_MAX ||
    key === cpConstants.SLIDER_SAT_MAX ||
    key === cpConstants.SLIDER_LIT_MAX ||
    key === cpConstants.COLOR_VALUE_STATUS ||
    key === cpConstants.FORCE_UPDATE_SETTINGS_KEY;
}

export function onchange(key, settingsStorage) {
  if (key === cpConstants.COLOR_VALUE_SETTINGS_KEY) {
    // new color selected or text input
    let jsonColorValue = JSON.parse(settingsStorage.getItem(cpConstants.COLOR_VALUE_SETTINGS_KEY));
    // strip name tag, if color comes from text input
    if (jsonColorValue.name !== undefined) {
      jsonColorValue = jsonColorValue.name;
      settingsStorage.setItem(cpConstants.COLOR_VALUE_SETTINGS_KEY, JSON.stringify(jsonColorValue));
    }
    let targetColor = tinycolor(jsonColorValue);

    // set image data in settings storage
    updateImage(settingsStorage, targetColor);

    // set slider values in settings storage
    let hslColor = targetColor.toHsl();
    settingsStorage.setItem(cpConstants.SLIDER_HUE_SETTINGS_KEY, '' + ((hslColor.h / 360) * cpConstants.SLIDER_HUE_MAX));
    settingsStorage.setItem(cpConstants.SLIDER_SAT_SETTINGS_KEY, '' + (hslColor.s * cpConstants.SLIDER_SAT_MAX));
    settingsStorage.setItem(cpConstants.SLIDER_LIT_SETTINGS_KEY, '' + (hslColor.l * cpConstants.SLIDER_LIT_MAX));

    // set status
    settingsStorage.setItem(cpConstants.COLOR_VALUE_STATUS, targetColor.isValid() ? "" : "Invalid color input falling back to black.");

  } else if (key === cpConstants.SLIDER_HUE_SETTINGS_KEY
    || key === cpConstants.SLIDER_SAT_SETTINGS_KEY
    || key === cpConstants.SLIDER_LIT_SETTINGS_KEY) {
    // slider changed; change color according to new slider values
    let hue = JSON.parse(settingsStorage.getItem(cpConstants.SLIDER_HUE_SETTINGS_KEY)) * (360 / cpConstants.SLIDER_HUE_MAX);
    let sat = JSON.parse(settingsStorage.getItem(cpConstants.SLIDER_SAT_SETTINGS_KEY)) * (100 / cpConstants.SLIDER_SAT_MAX);
    let lit = JSON.parse(settingsStorage.getItem(cpConstants.SLIDER_LIT_SETTINGS_KEY)) * (100 / cpConstants.SLIDER_LIT_MAX);

    let hexColor = tinycolor.fromRatio({ h: hue, s: sat, l: lit }).toHexString();
    settingsStorage.setItem(cpConstants.COLOR_VALUE_SETTINGS_KEY, JSON.stringify(hexColor));
    settingsStorage.setItem(cpConstants.COLOR_VALUE_STATUS, "");

    // set image data in settings storage
    updateImage(settingsStorage, hexColor);
  } else if (key === cpConstants.FORCE_UPDATE_SETTINGS_KEY && settingsStorage.getItem(cpConstants.FORCE_UPDATE_SETTINGS_KEY) === "true") {
    // just set the settings key to false
    // dont know why but this forces an update of settings page
    settingsStorage.setItem(cpConstants.FORCE_UPDATE_SETTINGS_KEY, "false");
  }
}

function updateImage(settingsStorage, targetColor) {
  let image = png.createPngImage(10, 10, 1, targetColor);
  settingsStorage.setItem(cpConstants.COLOR_IMAGE_SETTINGS_KEY, png.getDataURL(image));
}
