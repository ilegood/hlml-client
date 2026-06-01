import instance from "./instance";

export const login = async (form) => {
  const { data } = await instance.post("/users/login", form);
  return data;
};

export const register = async (body) => {
  const { data } = await instance.post("/users/register", body);
  return data;
};

export const checkRegistrationAvailability = async (params) => {
  const { data } = await instance.get("/users/register/check", { params });
  return data;
};

export const getMyStats = async () => {
  const { data } = await instance.get("/users/me/stats");
  return data;
};

export const searchUsers = async (query) => {
  const { data } = await instance.get(
    `/users/search?q=${encodeURIComponent(query)}`,
  );
  return data;
};

export const requestPasswordReset = async (email) => {
  const { data } = await instance.post("/users/password/forgot", { email });
  return data;
};

export const resetPassword = async ({ token, password }) => {
  const { data } = await instance.post("/users/password/reset", {
    token,
    password,
  });
  return data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  
  let dataToSend;
  let headers = { Authorization: `Bearer ${token}` };

  if (profileData.profile_img instanceof File) {
    dataToSend = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        dataToSend.append(key, profileData[key]);
      }
    });
    headers['Content-Type'] = 'multipart/form-data';
  } else {
    dataToSend = profileData;
  }

  const { data } = await instance.patch("/users/profile", dataToSend, {
    headers
  });
  return data;
};

export const deleteUser = async () => {
  const token = localStorage.getItem("token");
  const { data } = await instance.delete("/users", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const getUserPublicProfile = async (id) => {
  const { data } = await instance.get(`/users/${id}`);
  return data;
};

export const getUserActivity = async (id) => {
  const { data } = await instance.get(`/users/${id}/activity`);
  return data;
};

export const verifyEmail = async (token) => {
  const { data } = await instance.post("/users/verify-email", { token });
  return data;
};

export const resendVerificationEmail = async (email) => {
  const { data } = await instance.post("/users/resend-verification-email", { email });
  return data;
};
