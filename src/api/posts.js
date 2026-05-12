import instance from "./instance";

const API_URL = "/posts";
const BASE_URL = "http://localhost:4000";

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

const parseCategories = (categories) => {
  if (!categories) return {};
  if (typeof categories !== "string") return categories;

  try {
    return JSON.parse(categories);
  } catch {
    return {};
  }
};

const normalizeStatus = (status) => {
  const text = String(status || "").trim();
  return text === "모집완료" ? "모집완료" : "모집중";
};

const normalizePost = (post) => ({
  ...post,
  id: post.post_id,
  status: normalizeStatus(post.status),
  createdAt: post.created_at,
  image: post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${BASE_URL}${post.image}`
    : null,
  categories: parseCategories(post.categories),
  likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
  joinedBy: Array.isArray(post.joinedBy) ? post.joinedBy : [],
  joinedUserIds: Array.isArray(post.joinedUserIds) ? post.joinedUserIds : [],
  participantDetails: Array.isArray(post.participantDetails) ? post.participantDetails : [],
  authorDetails: post.authorDetails || null,
  comments: Array.isArray(post.comments) ? post.comments : [],
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
    "capacity",
    "status",
    "author",
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

  formData.append(
    "categories",
    JSON.stringify(data?.categories ?? {}),
  );

  const image = data?.image?.startsWith(BASE_URL)
    ? data.image.slice(BASE_URL.length)
    : data?.image;

  formData.append("existingImage", image ?? "");

  return formData;
};

// 리스트
export const getPosts = async () => {
  const res = await instance.get(API_URL);
  return res.data.map(normalizePost);
};

// 단일
export const getPost = async (id) => {
  const res = await instance.get(`${API_URL}/${id}`);
  return normalizePost(res.data);
};

// 생성
export const createPost = async (formData) => {
  const res = await instance.post(API_URL, formData);
  return res.data;
};

// 수정
export const updatePost = async (id, data) => {
  const res = await instance.patch(`${API_URL}/${id}`, toPostFormData(data));
  return res.data;
};

// 삭제
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
