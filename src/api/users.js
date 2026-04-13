import instance from "./instance";

export const register = async (form) => {
  await instance.post("/users/register", form);
};
