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
