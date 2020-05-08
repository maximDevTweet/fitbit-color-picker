# fitbit-color-picker
Color Picker for Fitbit OS

This is a color picker component wrapped in a watch face for Fitbit devices. You can pick a custom color in the watch face settings.

![alt text](screenshot.png "see screenshot.png")

Custom color picker component, which follows this idea:
1. Uses slider elemtets to HSL color values
2. Computes a base 64 encoded image based on the chosen HSL color
3. Sets the base 64 image as TextImageRow icon

You can copy and run the whole project as a watch face in the Fitbit simulator.

To integrate the color picker in your watch face settings do this:
1. Copy this files or folders in your project:
- settings/colorpicker.jsx
- companion/lib/*
- companion/colorpicker.js
- common/colorpicker.js
2. Add code from companion/index.js to your project:
```  
  import * as cp from "./colorpicker";
  
  settingsStorage.onchange = evt => {
    if (cp.isColorPickerSetting(evt.key)) {
      cp.onchange(evt.key, settingsStorage);
      return;
    }
  }
```
3. Add code from settings/index.jsx to your project:
```
import * as cp from "./colorpicker";
import * as cpConstants from "../common/colorpicker";
```
copy/alter getColorPickerSection function