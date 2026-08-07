import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import instance, { getImageUrl } from "../../api/instance";
import { AuthContext } from "../../context/AuthContext.jsx";
import ProfileAvatar from "../ProfileAvatar";

const Overlay = ({ children, ...props }) => <div {...props} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm" >{children}</div>;
const Modal = ({ children, ...props }) => <div {...props} className="flex max-h-[80vh] w-[380px] flex-col rounded-[20px] bg-[var(--color-sidebar)] p-6 text-[var(--color-text)]">{children}</div>;
const Header = ({ children, ...props }) => <div {...props} className="mb-4 flex items-center justify-between">{children}</div>;
const SearchInput = (props) => <input {...props} className="mb-3 box-border w-full rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-active)]" />;
const List = ({ children, ...props }) => <div {...props} className="flex-1 overflow-y-auto">{children}</div>;
const FriendItem = ({ children, $selected, ...props }) => <div {...props} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--color-input-focus-bg)] ${$selected ? "bg-[var(--color-input-focus-bg)]" : ""}`}>{children}</div>;
const ShareBtn = ({ children, $disabled, ...props }) => <button {...props} className={`mt-4 w-full rounded-xl border-0 p-3.5 text-[15px] font-extrabold text-white transition-opacity hover:enabled:opacity-90 disabled:cursor-not-allowed ${$disabled ? "bg-[var(--color-deactive)]" : "bg-[var(--color-active)]"}`}>{children}</button>;
const EmptyMsg = ({ children, ...props }) => <div {...props} className="py-10 text-center text-sm text-[var(--color-deactive)]">{children}</div>;
const PostPreviewContainer = ({ children, ...props }) => <div {...props} className="mb-3 flex flex-col rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] p-2.5">{children}</div>;
const PostPreviewTitle = ({ children, ...props }) => <span {...props} className="mb-1.5 text-base font-extrabold text-[var(--color-text)]">{children}</span>;
const SharedByText = ({ children, ...props }) => <span {...props} className="text-[13px] text-[var(--color-deactive)]">{children}</span>;

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
          <button className="cursor-pointer border-0 bg-transparent p-1 text-xl leading-none text-[var(--color-deactive)]" type="button" onClick={onClose}>
            &times;
          </button>
        </Header>

        <PostPreviewContainer>
          {postImage && (
            <img
              src={getImageUrl(postImage)}
              alt=""
              className="mb-2 h-32 w-full rounded-lg object-cover"
            />
          )}
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
                <ProfileAvatar
                  profileImg={friend.profile_img}
                  nickname={friend.name}
                  size={40}
                />
                <span className="flex-1 text-sm font-semibold">{friend.name}</span>
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
