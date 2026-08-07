import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import styled from "styled-components";
import instance, { getImageUrl } from "../../api/instance";
import { AuthContext } from "../../context/AuthContext.jsx";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: var(--color-sidebar);
  width: 380px;
  border-radius: 20px;
  padding: 24px;
  color: var(--color-text);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: 800;
    margin: 0;
  }

  .closeBtn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-deactive);
    font-size: 20px;
    padding: 4px;
    line-height: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  margin-bottom: 12px;
  background: var(--color-input-bg);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: var(--color-active);
  }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-active);
    border-radius: 10px;
  }
`;

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${({ $selected }) =>
    $selected ? "var(--color-input-focus-bg)" : "transparent"};

  &:hover {
    background: var(--color-input-focus-bg);
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    background-size: cover;
    background-position: center;
    background-color: #555;
  }

  .name {
    flex: 1;
    font-weight: 600;
    font-size: 14px;
  }

  input[type="radio"] {
    accent-color: var(--color-active);
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const ShareBtn = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  background: ${({ $disabled }) =>
    $disabled ? "var(--color-deactive)" : "var(--color-active)"};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 40px 0;
  color: var(--color-deactive);
  font-size: 14px;
`;

const PostPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 12px;
  background: var(--color-input-bg);
  border: 1.5px solid var(--color-border);
  margin-bottom: 12px;
`;

const PostPreviewTitle = styled.span`
  font-weight: 800;
  font-size: 16px; /* Slightly larger font for prominence */
  color: var(--color-text);
  margin-bottom: 5px;
`;

const SharedByText = styled.span`
  font-size: 13px;
  color: var(--color-deactive);
`;

export default function SharePostModal({ postId, postTitle, postImage, onClose }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { name: currentUserName } = useContext(AuthContext);

  useEffect(() => {
    instance
      .get("/friends")
      .then((res) => setFriends(res.data))
      .catch(() => {});
  }, []);

  const filtered = friends.filter((friend) =>
    (friend.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleShare = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const { data } = await instance.post("/chat/share", {
        targetId: selectedId,
        postId,
        postTitle,
        postImage,
      });
      toast.success("친구에게 게시글을 공유했습니다.");
      onClose();
      if (data?.roomId) {
        navigate(`/dms/${data.roomId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "공유에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onMouseDown={onClose}>
      <Modal onMouseDown={(e) => e.stopPropagation()}>
        <Header>
          <h2>게시글 공유</h2>
          <button className="closeBtn" type="button" onClick={onClose}>
            &times;
          </button>
        </Header>

        <PostPreviewContainer>
          <PostPreviewTitle>{postTitle}</PostPreviewTitle>
          {currentUserName && (
            <SharedByText>{currentUserName}님이 공유했습니다.</SharedByText>
          )}
        </PostPreviewContainer>

        <SearchInput
          placeholder="친구 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <List>
          {filtered.length === 0 ? (
            <EmptyMsg>
              {search ? "검색 결과가 없습니다." : "친구가 없습니다."}
            </EmptyMsg>
          ) : (
            filtered.map((friend) => (
              <FriendItem
                key={friend.id}
                $selected={selectedId === friend.id}
                onClick={() => setSelectedId(friend.id)}
              >
                <div
                  className="avatar"
                  style={{
                    backgroundImage: friend.profile_img
                      ? `url(${getImageUrl(friend.profile_img)})`
                      : "none",
                  }}
                />
                <span className="name">{friend.name}</span>
                <input
                  type="radio"
                  name="shareFriend"
                  checked={selectedId === friend.id}
                  onChange={() => setSelectedId(friend.id)}
                />
              </FriendItem>
            ))
          )}
        </List>

        <ShareBtn
          type="button"
          $disabled={!selectedId || loading}
          disabled={!selectedId || loading}
          onClick={handleShare}
        >
          {loading ? "공유 중..." : "공유하기"}
        </ShareBtn>
      </Modal>
    </Overlay>
  );
}
