import instance from "./instance";

export const getFriends = async () => {
  const response = await instance.get("/friends");
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await instance.get("/friends/requests");
  return response.data;
};

export const addFriend = async (targetNickname) => {
  const response = await instance.post("/friends/add", { targetNickname });
  return response.data;
};

export const acceptFriend = async (targetId) => {
  const response = await instance.post("/friends/accept", { targetId });
  return response.data;
};

export const rejectFriend = async (targetId) => {
  const response = await instance.post("/friends/reject", { targetId });
  return response.data;
};

export const blockUser = async (targetId) => {
  const response = await instance.post("/friends/block", { targetId });
  return response.data;
};

export const unblockUser = async (targetId) => {
  const response = await instance.post("/friends/unblock", { targetId });
  return response.data;
};

export const getBlockedUsers = async () => {
  const response = await instance.get("/friends/blocked");
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await instance.get(`/users/search?q=${query}`);
  return response.data;
};
