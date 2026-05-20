import instance from "./instance";
import { normalizeStatus } from "./homeConstants";

const API_URL = "/posts";
const BASE_URL = "http://localhost:4000";

const MYSQL_DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

const formatDateValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const formatTimeValue = (value) => {
  if (!value) return "";
  return String(value).slice(0, 8);
};

const normalizeDateTimeValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string") return value;

  if (MYSQL_DATETIME_RE.test(value)) {
    return `${value.replace(" ", "T")}Z`;
  }

  return value;
};

const normalizeComment = (comment) => ({
  ...comment,
  createdAt: normalizeDateTimeValue(comment.createdAt ?? comment.created_at),
  replies: Array.isArray(comment.replies)
    ? comment.replies.map(normalizeComment)
    : [],
});

const parseCategories = (categories) => {
  if (!categories) return {};
  if (typeof categories !== "string") return categories;

  try {
    return JSON.parse(categories);
  } catch {
    return {};
  }
};

const normalizeImageUrl = (image) => {
  if (!image) return null;
  return image.startsWith("http") ? image : `${BASE_URL}${image}`;
};

const normalizePost = (post) => ({
  ...post,
  id: post.post_id,
  status: normalizeStatus(post.status),
  createdAt: normalizeDateTimeValue(post.created_at),
  image: normalizeImageUrl(post.image),
  latitude: post.latitude ? Number(post.latitude) : null,
  longitude: post.longitude ? Number(post.longitude) : null,
  categories: parseCategories(post.categories),
  likedBy: Array.isArray(post.likedBy) ? post.likedBy.map(String) : [],
  joinedBy: Array.isArray(post.joinedBy) ? post.joinedBy.map(String) : [],
  joinedUserIds: Array.isArray(post.joinedUserIds)
    ? post.joinedUserIds.map(String)
    : [],
  participantDetails: Array.isArray(post.participantDetails)
    ? post.participantDetails
    : [],
  authorDetails: post.authorDetails || null,
  comments: Array.isArray(post.comments)
    ? post.comments.map(normalizeComment)
    : [],
  likes: post.likes || 0,
  participants: post.participants || 1,
});

const toPostFormData = (data) => {
  if (data instanceof FormData) return data;

  const formData = new FormData();
  const fields = [
    "title",
    "content",
    "date",
    "time",
    "place",
    "latitude",
    "longitude",
    "capacity",
    "status",
    "user_id",
  ];

  fields.forEach((field) => {
    if (field === "date") {
      formData.append(field, formatDateValue(data?.[field]));
      return;
    }

    if (field === "time") {
      formData.append(field, formatTimeValue(data?.[field]));
      return;
    }

    formData.append(field, data?.[field] ?? "");
  });

  formData.append("categories", JSON.stringify(data?.categories ?? {}));

  const image = data?.image?.startsWith(BASE_URL)
    ? data.image.slice(BASE_URL.length)
    : data?.image;

  formData.append("existingImage", image ?? "");

  return formData;
};

export const getPosts = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.visibleOnly) params.set("visibleOnly", "1");

  const res = await instance.get(
    params.toString() ? `${API_URL}?${params.toString()}` : API_URL,
  );
  return res.data.map(normalizePost);
};

export const getPost = async (id) => {
  const res = await instance.get(`${API_URL}/${id}`);
  return normalizePost(res.data);
};

export const createPost = async (formData) => {
  const res = await instance.post(API_URL, formData);
  return res.data;
};

export const updatePost = async (id, data) => {
  const res = await instance.patch(`${API_URL}/${id}`, toPostFormData(data));
  return res.data;
};

export const deletePost = async (id) => {
  const res = await instance.delete(`${API_URL}/${id}`);
  return res.data;
};

export const updatePostJson = async (id, data) => {
  const res = await instance.patch(`/posts/${id}/json`, data);
  return res.data;
};

export const togglePostLike = async (id) => {
  const res = await instance.post(`${API_URL}/${id}/like`);
  return normalizePost(res.data);
};

export const togglePostJoin = async (id) => {
  const res = await instance.post(`${API_URL}/${id}/join`);
  return normalizePost(res.data);
};

export const leavePost = async (id) => {
  const res = await instance.post(`${API_URL}/${id}/leave`);
  return res.data;
};

export const getKickedPosts = async () => {
  const res = await instance.get(`${API_URL}/kicked`);
  return res.data.map(normalizePost);
};

export const deletePostBan = async (id) => {
  const res = await instance.delete(`${API_URL}/${id}/ban`);
  return res.data;
};

export const createComment = async (postId, data) => {
  const res = await instance.post(`${API_URL}/${postId}/comments`, data);
  return normalizePost(res.data);
};

export const updateComment = async (commentId, content) => {
  const res = await instance.patch(`${API_URL}/comments/${commentId}`, {
    content,
  });
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await instance.delete(`${API_URL}/comments/${commentId}`);
  return res.data;
};
