import { peerSocket } from "messaging";

export const createMessage = (key: string, newValue: string) => ({
  key,
  newValue,
});

export const sendMessage = (key: string, value?: string) => {
  if (peerSocket.readyState === peerSocket.OPEN) {
    peerSocket.send(createMessage(key, value));
  }
};
