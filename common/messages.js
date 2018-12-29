import { peerSocket } from "messaging";

export const createMessage = (key, newValue) => ({
    key,
    newValue,
})

export const sendMessage = (key, value) => {
    if (peerSocket.readyState === peerSocket.OPEN) {
        peerSocket.send(createMessage(key, value));
    }
};