import { AsyncStorage } from 'react-native'
let websocket

export default {
    loggedIn: false,
    email: '',
    serverStatus: 0,
    setWebsocket: ws => {
        websocket = ws
    },
    getWebsocket: () => websocket
}