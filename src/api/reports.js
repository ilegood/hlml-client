import instance from "./instance";

export const getMyReports = async () => {
  const { data } = await instance.get("/reports/my");
  return data;
};

export const createReport = async (payload) => {
  const { data } = await instance.post("/reports", payload);
  return data;
};
