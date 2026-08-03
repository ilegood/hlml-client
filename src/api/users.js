import instance from "./instance";

export const login = async (form) => {
  const { data } = await instance.post("/users/login", form);
  return data;
};

export const updateProfile = async (profileData) => {
  let dataToSend;
  let headers = {};

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
  const { data } = await instance.delete("/users");
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
