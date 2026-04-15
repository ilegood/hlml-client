const BASE_URL = "http://localhost:4000/api";

export const fetchChatHistory = async (roomId) => {
  try {
    const response = await fetch(`${BASE_URL}/chatting/${roomId}`);
    if (!response.ok) throw new Error("Failed to fetch chat history");
    return await response.ok ? response.json() : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const sendMessageApi = async (messageData) => {
  try {
    const response = await fetch(`${BASE_URL}/chatting/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });
    return await response.json();
  } catch (error) {
    console.error("API Send Error:", error);
    throw error;
  }
};
