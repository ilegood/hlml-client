import instance from "./instance";

export const uploadChatFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

<<<<<<< Updated upstream
  const res = await instance.post("/chat/upload", formData);
=======
  const res = await instance.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
>>>>>>> Stashed changes
  return res.data;
};

export const getRoomBlockWarning = async (roomId) => {
  const res = await instance.get(`/chat/rooms/${roomId}/block-warning`);
  return res.data;
};
<<<<<<< Updated upstream

export const getUnreadSummary = async () => {
  const res = await instance.get("/chat/unread-summary");
  return res.data;
};

export const getChatNotifications = async () => {
  const res = await instance.get("/chat/notifications");
  return res.data;
};
=======
>>>>>>> Stashed changes
