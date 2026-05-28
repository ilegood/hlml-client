import instance from "./instance";

export const uploadChatFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await instance.post("/chat/upload", formData);
  return res.data;
};

export const getRoomBlockWarning = async (roomId) => {
  const res = await instance.get(`/chat/rooms/${roomId}/block-warning`);
  return res.data;
};

export const getUnreadSummary = async () => {
  const res = await instance.get("/chat/unread-summary");
  return res.data;
};

export const getChatNotifications = async () => {
  const res = await instance.get("/chat/notifications");
  return res.data;
};

export const searchMessages = async (roomKey, query) => {
  const res = await instance.get("/chat/search", {
    params: { roomKey, q: query },
  });
  return res.data;
};
