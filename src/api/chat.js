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

export const getDmRooms = async () => {
  const { data } = await instance.get("/chat/dm");
  return data;
};

export const createDmRoom = async (targetId) => {
  const { data } = await instance.post("/chat/dm", { targetId });
  return data;
};

export const getDmRoom = async (roomId) => {
  const { data } = await instance.get(`/chat/dm/${roomId}`);
  return data;
};

export const deleteDmRoom = async (roomId) => {
  const { data } = await instance.delete(`/chat/dm/${roomId}`);
  return data;
};

export const sharePostToChat = async ({ targetId, postId, postTitle, postImage }) => {
  const { data } = await instance.post("/chat/share", {
    targetId,
    postId,
    postTitle,
    postImage,
  });
  return data;
};
