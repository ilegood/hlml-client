import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import {
  getFriends,
  getFriendRequests,
  acceptFriend,
  rejectFriend,
  blockUser,
  updateFriendMemo,
} from "../api/friends";
import instance from "../api/instance";
import { toast } from "sonner";

export const useFriendManagement = () => {
  const navigate = useNavigate();
  const { token, userId } = useAuth(); // Assuming userId is also available from useAuth
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [memos, setMemos] = useState({});
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [tempMemo, setTempMemo] = useState("");
  const [cardTop, setCardTop] = useState(0);

  const menuRef = useRef(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;

    try {
      const fData = await getFriends();
      setFriends(fData);

      const initialMemos = {};
      fData.forEach((friend) => {
        if (friend.memo) initialMemos[friend.id] = friend.memo;
      });
      setMemos(initialMemos);
    } catch (err) {
      console.error("친구 목록 로드 실패", err);
    }

    try {
      const rData = await getFriendRequests();
      setRequests(rData);
    } catch (err) {
      console.error("친구 요청 로드 실패", err);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptFriend(id);
      fetchAll();
    } catch {
      toast.error("친구 요청 수락 실패");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectFriend(id);
      fetchAll();
    } catch {
      toast.error("친구 요청 거절 실패");
    }
  };

  const handleDeleteFriend = async (id) => {
    if (window.confirm("정말 친구를 삭제하시겠습니까?")) {
      try {
        await rejectFriend(id); // Assuming rejectFriend also handles deletion for accepted friends
        fetchAll();
        setActiveMenuId(null);
        if (selectedFriend?.id === id) setSelectedFriend(null);
      } catch {
        toast.error("친구 삭제 실패");
      }
    }
  };

  const handleBlockUser = async (id) => {
    if (window.confirm("정말 이 사용자를 차단하시겠습니까?")) {
      try {
        await blockUser(id);
        fetchAll();
        setActiveMenuId(null);
        if (selectedFriend?.id === id) setSelectedFriend(null);
        toast.success("사용자가 차단되었습니다.");
      } catch {
        toast.error("사용자 차단 실패");
      }
    }
  };

  const [reportedFriend, setReportedFriend] = useState(null);

  const handleReport = (friend) => {
    setReportedFriend(friend);
    setIsReportModalOpen(true);
    setActiveMenuId(null);
  };

  const filteredFriends = friends.filter((friend) =>
    (friend.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFriendClick = (e, friend, sidebarRect) => {
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null);
      setIsEditingMemo(false);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      let top = rect.top - sidebarRect.top;
      const cardHeight = 350;

      if (top + cardHeight > sidebarRect.height) {
        top = sidebarRect.height - cardHeight - 20;
      }
      if (top < 20) top = 20;

      setCardTop(top);
      setSelectedFriend(friend);
      setIsEditingMemo(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setSelectedFriend(null);
  };

  const handleMemoEdit = () => {
    setTempMemo(memos[selectedFriend.id] || "");
    setIsEditingMemo(true);
  };

  const handleSaveMemo = async () => {
    try {
      await updateFriendMemo(selectedFriend.id, tempMemo);
      setMemos({ ...memos, [selectedFriend.id]: tempMemo });
      setIsEditingMemo(false);
      toast.success("메모가 저장되었습니다.");
    } catch {
      toast.error("메모 저장 실패");
    }
  };

  const handleCancelMemo = () => setIsEditingMemo(false);

  const handleStartDM = async () => {
    try {
      const res = await instance.post("/chat/dm", {
        targetId: selectedFriend.id,
      });
      navigate(`/dms/${res.data.roomId}`);
      setIsOpen(false);
      setSelectedFriend(null);
    } catch (err) {
      console.error("DM 시작 실패:", err.response?.data || err.message);
      toast.error("메시지 방을 열 수 없습니다. 다시 시도해주세요.");
    }
  };

  return {
    isOpen,
    setIsOpen,
    friends,
    setFriends,
    requests,
    setRequests,
    selectedFriend,
    setSelectedFriend,
    reportedFriend,
    setReportedFriend,
    searchQuery,
    setSearchQuery,
    isAddModalOpen,
    setIsAddModalOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    activeMenuId,
    setActiveMenuId,
    memos,
    setMemos,
    isEditingMemo,
    setIsEditingMemo,
    tempMemo,
    setTempMemo,
    cardTop,
    setCardTop,
    menuRef,
    fetchAll,
    handleAccept,
    handleReject,
    handleDeleteFriend,
    handleBlockUser,
    handleReport,
    filteredFriends,
    handleFriendClick,
    handleToggleSidebar,
    handleMemoEdit,
    handleSaveMemo,
    handleCancelMemo,
    handleStartDM,
    userId, // Export userId for use in child components if needed
  };
};
