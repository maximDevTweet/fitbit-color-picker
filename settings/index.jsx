import * as cp from "./colorpicker";
import * as cpConstants from "../common/colorpicker";

var colorSet = [
  { color: "tomato" },
  { color: "sandybrown" },
  { color: "#FFD700" },
  { color: "#ADFF2F" },
  { color: "deepskyblue" },
  { color: "plum" }
];

function mainSettings(props) {
  return (
    <Page>

      <Section title={<Text bold align="center">Color Picker PoC 1</Text>}>

        <Toggle
          settingsKey="section1ToggleOptions"
          label={<Text>Toggle to show/hide options 1</Text>}
        />
        {getColorPickerSection(props, "section1ToggleOptions", "backgroundColor1", "Top color")}
        {getColorPickerSection(props, "section1ToggleOptions", "backgroundColor2", "Middle color")}

        <Toggle
          settingsKey="section3ToggleOptions"
          label={<Text>Toggle to show/hide options 1</Text>}
        />
        {getColorPickerSection(props, "section3ToggleOptions", "backgroundColor3", "Bottom color")}

      </Section>

    </Page>
  );
}

function getColorPickerSection(props, toggleOptionSettingsKey, targetSettingsKey, colorTitle) {
  return (
    JSON.parse(props.settings[toggleOptionSettingsKey] || 'false') &&
    <Section>
      <Text bold>{colorTitle}</Text>
      {JSON.parse(props.settings[cpConstants.TARGET_SETTINGS_KEY] !== JSON.stringify(targetSettingsKey) || 'false') ? (
        <Section>
          <ColorSelect
            settingsKey={targetSettingsKey}
            colors={colorSet}
          />
          <Button
            label="Custom color"
            onClick={() => cp.initColorPicker(props, targetSettingsKey)}
          />
        </Section>
      ) : (cp.getColorPicker(props, targetSettingsKey))}
    </Section>
  );
}

registerSettingsPage(mainSettings);
