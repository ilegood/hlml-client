import instance from "./instance";

export const uploadChatFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await instance.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getRoomBlockWarning = async (roomId) => {
  const res = await instance.get(`/chat/rooms/${roomId}/block-warning`);
  return res.data;
};
