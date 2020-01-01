# Argus Mobile

Upload images to be identified through object recognition through our service. After the image is identified: 
- A brief summary of the Wikipedia page as well as the link is provided
- All potential matches are shown with match percentages

All identifications are stored in the app's gallery so you can look at previous identifications.

The source of the API as well as the web UI is available at https://github.com/ExcelE/horus-scope.

## Preview

![](https://i.imgur.com/jXnmJOs.jpg)

## Development

To set up the development environment, Android Studio and the Android Studio mobile emulator must be running. 

1. Follow the steps at https://facebook.github.io/react-native/docs/getting-started.html, specific to your system's OS, all the way *until* "Creating a new application." 
2. Clone this repo and run `npm install`
3. Run the emulator by starting whatever project in Android Studio -> Tools -> AVD run one. Create one with Oreo API Level 26 x86_64 if it doesn't exist.
4. If you want logging (which you should for development), open terminal/command prompt with this repo as the active directory and run `react-native log-android` 
5. Open terminal/command prompt with this repo as the active directory, and run `react-native run-android`. 
6. The app should automatically open on the emulator

To edit the app, open App.js in the root directory. Comments were added to make things easier to understand.
