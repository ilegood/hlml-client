import { useState } from "react";
import styled from "styled-components";
import friendsData from "../api/friendsData";

const SidebarWrapper = styled.div`
  position: fixed;
  right: 0;
  top: 40px;
  height: calc(100vh - 40px);
  display: flex;
  align-items: flex-start;
  z-index: 1000;
`;

const ToggleBtn = styled.button`
  position: absolute;
  left: -40px;
  top: 20px;
  padding: 10px 15px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1001;
`;

const FriendSidebar = styled.div`
  width: 335px;
  height: 100%;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  display: ${({ $isHidden }) => ($isHidden ? "none" : "flex")};
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  transition: transform 0.3s ease;
`;

const SearchSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  outline: none;
  &:focus {
    border-color: #1abc9c;
  }
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px;
  /* Scroll mask effect */
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 2%,
    black 98%,
    transparent
  );

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #1abc9c;
    border-radius: 4px;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h3`
  font-size: 14px;
  color: #333;
  margin: 20px 0 10px 0;
  font-weight: bold;
`;

const FriendTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
`;

const FriendRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s ease;

  td {
    border: 1px solid #e0e0e0;
    border-style: solid none;
    padding: 12px 10px;
    background-color: #fff;
  }

  td:first-child {
    border-left-style: solid;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  td:last-child {
    border-right-style: solid;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:hover td {
    border-color: #1abc9c;
  }

  &.active td {
    border-color: #1abc9c;
    box-shadow: 0 0 5px rgba(26, 188, 156, 0.2);
  }
`;

const AvatarCell = styled.td`
  width: 50px;
  text-align: center;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  background-color: #555;
  border-radius: 50%;
  display: inline-block;
`;

const NameCell = styled.td`
  font-size: 14px;
  color: #555;
`;

const StatusCell = styled.td`
  width: 50px;
  text-align: center;
`;

const StatusSquare = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: inline-block;
  background-color: ${({ $isFriend }) => ($isFriend ? "#b2e0df" : "#fbd2a4")};
`;

const FriendDetailCard = styled.div`
  position: absolute;
  top: 50%;
  left: -260px;
  transform: translateY(-50%);
  width: 250px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1010;
  border: 1px solid #e0e0e0;
  display: ${({ $isHidden }) => ($isHidden ? "none" : "block")};
`;

const DetailHeader = styled.div`
  height: 80px;
  background-color: #1abc9c;
  position: relative;
`;

const DetailAvatarLarge = styled.div`
  width: 60px;
  height: 60px;
  background-color: #777;
  border-radius: 50%;
  border: 4px solid #fff;
  position: absolute;
  bottom: -30px;
  left: 20px;
`;

const DetailBody = styled.div`
  padding: 40px 20px 20px;

  h4 {
    margin: 0 0 5px 0;
    font-size: 16px;
  }
  p {
    font-size: 12px;
    color: #777;
    margin-bottom: 20px;
  }
`;

const DetailIcons = styled.div`
  font-size: 11px;
  color: #999;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const DetailActionBtn = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const MemoDisplay = styled.div`
  background-color: #f9f9f9;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #333;
  border-radius: 0 4px 4px 0;
  word-break: break-all;
  p {
    margin: 0 !important;
    color: #333 !important;
  }
`;

const MemoInputContainer = styled.div`
  margin-top: 10px;
`;

const MemoTextarea = styled.textarea`
  width: 100%;
  height: 60px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: none;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 12px;
  &:focus {
    outline: none;
    border-color: #1abc9c;
  }
`;

const MemoActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const SaveBtn = styled.button`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  background-color: #1abc9c;
  color: white;
  &:hover {
    background-color: #16a085;
  }
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  background-color: #eee;
  color: #555;
  &:hover {
    background-color: #ddd;
  }
`;

const FriendsList = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [memos, setMemos] = useState({});
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [tempMemo, setTempMemo] = useState("");

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onlineFriends = filteredFriends.filter((f) => f.status === "online");
  const offlineFriends = filteredFriends.filter((f) => f.status === "offline");

  const handleFriendClick = (friend) => {
    if (selectedFriend && selectedFriend.id === friend.id) {
      setSelectedFriend(null);
      setIsEditingMemo(false);
    } else {
      setSelectedFriend(friend);
      setIsEditingMemo(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectedFriend(null);
    }
  };

  const handleMemoEdit = () => {
    setTempMemo(memos[selectedFriend.id] || "");
    setIsEditingMemo(true);
  };

  const handleSaveMemo = () => {
    setMemos({
      ...memos,
      [selectedFriend.id]: tempMemo,
    });
    setIsEditingMemo(false);
  };

  const handleCancelMemo = () => {
    setIsEditingMemo(false);
  };
  //dd//
  return (
    <SidebarWrapper>
      <ToggleBtn onClick={handleToggleSidebar}>
        {isOpen ? "〉" : "〈"}
      </ToggleBtn>

      <FriendSidebar $isHidden={!isOpen}>
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="친구 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchSection>

        <ScrollContainer>
          <CategorySection>
            <CategoryTitle>온라인 ▾</CategoryTitle>
            <FriendTable>
              <tbody>
                {onlineFriends.map((friend) => (
                  <FriendRow
                    key={friend.id}
                    className={selectedFriend?.id === friend.id ? "active" : ""}
                    onClick={() => handleFriendClick(friend)}
                  >
                    <AvatarCell>
                      <Avatar />
                    </AvatarCell>
                    <NameCell>{friend.name}</NameCell>
                    <StatusCell>
                      <StatusSquare $isFriend={true} />
                    </StatusCell>
                  </FriendRow>
                ))}
              </tbody>
            </FriendTable>
          </CategorySection>

          <CategorySection>
            <CategoryTitle>오프라인 ▾</CategoryTitle>
            <FriendTable>
              <tbody>
                {offlineFriends.map((friend) => (
                  <FriendRow
                    key={friend.id}
                    className={selectedFriend?.id === friend.id ? "active" : ""}
                    onClick={() => handleFriendClick(friend)}
                  >
                    <AvatarCell>
                      <Avatar />
                    </AvatarCell>
                    <NameCell>{friend.name}</NameCell>
                    <StatusCell>
                      <StatusSquare $isFriend={false} />
                    </StatusCell>
                  </FriendRow>
                ))}
              </tbody>
            </FriendTable>
          </CategorySection>
        </ScrollContainer>

        <FriendDetailCard $isHidden={!selectedFriend}>
          <DetailHeader>
            <DetailAvatarLarge />
          </DetailHeader>
          <DetailBody>
            <h4>{selectedFriend?.name}</h4>
            <p>{selectedFriend?.statusMessage || "상태 메시지가 없습니다."}</p>
            <DetailIcons>
              <span>안녕하세요.</span>
              <br />
            </DetailIcons>

            {memos[selectedFriend?.id] && !isEditingMemo && (
              <MemoDisplay>
                <p>{memos[selectedFriend.id]}</p>
              </MemoDisplay>
            )}

            {!isEditingMemo ? (
              <DetailActionBtn onClick={handleMemoEdit}>
                {memos[selectedFriend?.id] ? "메모 수정" : "메모 추가"}
              </DetailActionBtn>
            ) : (
              <MemoInputContainer>
                <MemoTextarea
                  value={tempMemo}
                  onChange={(e) => setTempMemo(e.target.value)}
                  placeholder="이 친구에 대한 메모를 남겨보세요..."
                />
                <MemoActions>
                  <SaveBtn onClick={handleSaveMemo}>저장</SaveBtn>
                  <CancelBtn onClick={handleCancelMemo}>취소</CancelBtn>
                </MemoActions>
              </MemoInputContainer>
            )}
          </DetailBody>
        </FriendDetailCard>
      </FriendSidebar>
    </SidebarWrapper>
  );
};

export default FriendsList;
