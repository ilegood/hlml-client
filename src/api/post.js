import axios from "axios";

const API_URL = "http://localhost:4000/api";

export const getPosts = async () => {
  const res = await axios.get(`${API_URL}/posts`);
  return res.data;
};

export const getPost = async (id) => {
  const res = await axios.get(`${API_URL}/posts/${id}`);
  return res.data;
};

export const createPost = async (postData) => {
  const res = await axios.post(`${API_URL}/posts`, postData);
  return res.data;
};

export const updatePost = async (id, postData) => {
  const res = await axios.put(`${API_URL}/posts/${id}`, postData);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await axios.delete(`${API_URL}/posts/${id}`);
  return res.data;
};
