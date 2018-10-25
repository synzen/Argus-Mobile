App temporarily named "argus"

To set up the development environment, Android Studio and the Android Studio mobile emulator must be running. 

1. Follow the steps at https://facebook.github.io/react-native/docs/getting-started.html, specific to your system's OS, all the way *until* "Creating a new application." 
2. Clone this repo and run `npm install`
3. Run `react-native link react-native-camera`
4. Run the emulator by starting whatever project in Android Studio -> Tools -> AVD run one. Create one if it doesn't exist.
5. If you want logging (which you should for development), open terminal/command prompt with this repo as the active directory and run `react-native log-android` 
6. Open terminal/command prompt with this repo as the active directory, and run `react-native run-android`. 
7. The app should automatically open on the emulator

To edit the app, open App.js in the root directory. Comments were added to make things easier to understand.