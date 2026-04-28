// Mock API using localStorage for now. 
// You can replace these with actual axios calls to your hlml-server later.

export const getPosts = async () => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  return posts;
};

export const getPost = async (id) => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  return posts.find((p) => String(p.id) === String(id));
};

export const createPost = async (postData) => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const newPost = {
    ...postData,
    id: Date.now().toString(),
    createdAt: Date.now(),
    likes: 0,
    likedBy: [],
    participants: 1,
    joinedBy: ["me"],
    comments: [],
    status: "모집중",
  };
  posts.push(newPost);
  localStorage.setItem("posts", JSON.stringify(posts));
  return newPost;
};

export const updatePost = async (id, updates) => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const idx = posts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...updates };
    localStorage.setItem("posts", JSON.stringify(posts));
    return posts[idx];
  }
  throw new Error("Post not found");
};

export const deletePost = async (id) => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const filtered = posts.filter((p) => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(filtered));
};
