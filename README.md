# Running

To build for both browsers (Chrome & Firefox), install the dependencies
```
npm install
```
Then run
```
npm run build
```
This command will create a dist folder containing 2 subfolders, chrome and firefox

# Download 
You can download latest version for both Chrome and Firefox [here](https://drive.google.com/file/d/1JNlrRQj_fzuvzL_FBCygg4p9gEyQ9-xo/view)

# Installation

## Chrome 
1. Open your Chrome browser and go to chrome://extensions/
2. Make sure “Developer mode” is turned on. Switch it on, if it is off. You should find the toggle on the top-right corner of the window
3. Finally import the extension by clicking on "Load unpacked" button, then selecting Chrome extension folder

## Firefox
1. Open Firefox then go to about:debugging#/runtime/this-firefox
2. Click on Load Temporary Add-on, and finally go to firefox extension folder then select manifest.json file to import it
> If you cannot see "Load Temporary Add-on" button, go to about:config and set devtools.aboutdebugging.new-enabled to true