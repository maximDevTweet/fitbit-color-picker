import * as cpConstants from "../common/colorpicker";

/* Initializes color picker values to show it afterwards with the right setting keys */
export function initColorPicker(props, targetSettingsKey) {
  // save target settings key for later use
  props.settingsStorage.setItem(cpConstants.TARGET_SETTINGS_KEY, JSON.stringify(targetSettingsKey));
  // set choosen color and status in color picker
  props.settingsStorage.setItem(cpConstants.COLOR_VALUE_SETTINGS_KEY, props.settingsStorage.getItem(targetSettingsKey));
  props.settingsStorage.setItem(cpConstants.COLOR_VALUE_STATUS, "");
  // tell settings page to update
  props.settingsStorage.setItem(cpConstants.FORCE_UPDATE_SETTINGS_KEY, "true");
}

export function getColorPicker(props, targetSettingsKey) {
  // return picker element
  return (
    <Section>
      <Toggle
        settingsKey="colorPickerManualToggleOptions"
        label={<Text>Toggle to show/hide manual</Text>}
      />
      {JSON.parse(props.settings.colorPickerManualToggleOptions || 'false') &&
        <Text>Use the sliders below to choose a color or click on 'Color' and enter a color value. Possible color values are:</Text>
      }{JSON.parse(props.settings.colorPickerManualToggleOptions || 'false') &&
        <Text>- HTML name (red, blue, ...)</Text>
      }{JSON.parse(props.settings.colorPickerManualToggleOptions || 'false') &&
        <Text>- HEX (#FF0000, #0000FF, ...)</Text>
      }{JSON.parse(props.settings.colorPickerManualToggleOptions || 'false') &&
        <Text>- RGB (rgb(0,0,255), rgb(255,0,0), ...)</Text>
      }{JSON.parse(props.settings.colorPickerManualToggleOptions || 'false') &&
        <Text>- HSL (hsl(0,100,50), hsl(240,100,50), ...)</Text>
      }

      <TextImageRow
        icon={getColorImage(props)}
      />
      <TextInput
        title="Enter a color"
        label="Color"
        settingsKey={cpConstants.COLOR_VALUE_SETTINGS_KEY}
      />

      <Text align="center">{props.settingsStorage.getItem(cpConstants.COLOR_VALUE_STATUS)}</Text>
      <Slider
        label={`Hue ${Math.floor(props.settingsStorage.getItem(cpConstants.SLIDER_HUE_SETTINGS_KEY)) * (360 / cpConstants.SLIDER_HUE_MAX)}`}
        settingsKey={cpConstants.SLIDER_HUE_SETTINGS_KEY}
        min="0"
        max={cpConstants.SLIDER_HUE_MAX}
        step="1"
      />
      <Slider
        label={`Saturation ${Math.floor(props.settingsStorage.getItem(cpConstants.SLIDER_SAT_SETTINGS_KEY)) * (100 / cpConstants.SLIDER_SAT_MAX)}%`}
        settingsKey={cpConstants.SLIDER_SAT_SETTINGS_KEY}
        min="0"
        max={cpConstants.SLIDER_SAT_MAX}
        step="1"
      />
      <Slider
        label={`Lightness ${Math.floor(props.settingsStorage.getItem(cpConstants.SLIDER_LIT_SETTINGS_KEY)) * (100 / cpConstants.SLIDER_LIT_MAX)}%`}
        settingsKey={cpConstants.SLIDER_LIT_SETTINGS_KEY}
        min="0"
        max={cpConstants.SLIDER_LIT_MAX}
        step="1"
      />
      <Button
        label="Done"
        onClick={() => done(props)}
      />
      <Button
        label="Cancel"
        onClick={() => cancel(props)}
      />
    </Section>);
}

function getColorImage(props) {
  return props.settingsStorage.getItem(cpConstants.COLOR_IMAGE_SETTINGS_KEY);
}

function done(props) {
  let targetSettignsKey = JSON.parse(props.settingsStorage.getItem(cpConstants.TARGET_SETTINGS_KEY));
  let colorPickerValue = props.settingsStorage.getItem(cpConstants.COLOR_VALUE_SETTINGS_KEY);
  props.settingsStorage.setItem(targetSettignsKey, colorPickerValue);
  props.settingsStorage.removeItem(cpConstants.TARGET_SETTINGS_KEY);
  // tell settings page to update
  props.settingsStorage.setItem(cpConstants.FORCE_UPDATE_SETTINGS_KEY, "true");
}

function cancel(props) {
  // save target settings key for later use
  props.settingsStorage.removeItem(cpConstants.TARGET_SETTINGS_KEY);
  // tell settings page to update
  props.settingsStorage.setItem(cpConstants.FORCE_UPDATE_SETTINGS_KEY, "true");
}
