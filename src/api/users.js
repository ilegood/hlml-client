import instance from "./instance";

export const register = async (form) => {
  await instance.post("/users/register", form);
};

export const login = async (form) => {
  const { data } = await instance.post("/users/login", form);
  return data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const { data } = await instance.patch("/users/profile", profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
