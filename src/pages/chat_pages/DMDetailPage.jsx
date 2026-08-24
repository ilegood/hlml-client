import ChatFileGallery from "../../components/chat_components/ChatFileGallery";
import ChatMessageList from "../../components/chat_components/ChatMessageList";
import ChatScrollButton from "../../components/chat_components/ChatScrollButton";
import DMHeader from "../../components/chat_components/DMHeader";
import ChatInputArea from "../../components/chat_components/ChatInputArea";
import useDMChat from "../../hooks/useDMChat";
import UserProfileModal from "../../components/modals/UserProfileModal";
import { formatChatPreview } from "../../utils/chatPreview";

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DMDetailPage() {
  const {
    roomId, name, userId, messages, input, setInput,
    targetUserId, targetNickname, targetProfileImg, targetOnline,
    replyTo, editId, hoveredMsgId, setHoveredMsgId, showEmojiPicker, setShowEmojiPicker,
    showMainEmojiPicker, setShowMainEmojiPicker, showScrollBtn,
    showFileGallery, setShowFileGallery, notificationsMuted, sending,
    selectedProfileId, setSelectedProfileId, socketRef,
    bottomRef, messagesRef, inputRef, fileInputRef, typingEmitRef,
    pendingFiles, showAttachMenu, setShowAttachMenu, fileAccept,
    addPendingFiles, openFilePicker, removePendingFile, resizeInput,
    handleEmojiSelect, handleScroll, scrollToBottom, toggleNotifications,
    handleLeaveDM, handleSend, startEdit, startReply, handleDelete,
    toggleReaction, scrollToMessage, cancelContext, handlePaste,
    handleDrop, socketRoomId,
  } = useDMChat();


  return (
    <div
      className="flex h-[calc(100vh-25px)] flex-col overflow-x-hidden bg-[var(--color-bg)] px-[200px] font-[inherit]"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* ── Header ── */}
      <DMHeader
        targetUserId={targetUserId}
        targetProfileImg={targetProfileImg}
        targetNickname={targetNickname}
        targetOnline={targetOnline}
        setSelectedProfileId={setSelectedProfileId}
        notificationsMuted={notificationsMuted}
        toggleNotifications={toggleNotifications}
        setShowFileGallery={setShowFileGallery}
        handleLeaveDM={handleLeaveDM}
      />

      <ChatMessageList
        messages={messages}
        userId={userId}
        messagesRef={messagesRef}
        bottomRef={bottomRef}
        onScroll={handleScroll}
        hoveredMsgId={hoveredMsgId}
        setHoveredMsgId={setHoveredMsgId}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        toggleReaction={toggleReaction}
        startReply={startReply}
        startEdit={startEdit}
        handleDelete={handleDelete}
        scrollToMessage={scrollToMessage}
        setSelectedProfileId={setSelectedProfileId}
      />


      {showScrollBtn && (
        <ChatScrollButton
          onClick={scrollToBottom}
          title="?? ??? ??"
          ariaLabel="? ??? ????"
          label="최근 채팅 확인하기"
        />
      )}

      <ChatInputArea
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        sending={sending}
        editId={editId}
        replyTo={replyTo}
        cancelContext={cancelContext}
        pendingFiles={pendingFiles}
        removePendingFile={removePendingFile}
        addPendingFiles={addPendingFiles}
        openFilePicker={openFilePicker}
        handlePaste={handlePaste}
        handleEmojiSelect={handleEmojiSelect}
        inputRef={inputRef}
        fileInputRef={fileInputRef}
        fileAccept={fileAccept}
        showAttachMenu={showAttachMenu}
        setShowAttachMenu={setShowAttachMenu}
        showMainEmojiPicker={showMainEmojiPicker}
        setShowMainEmojiPicker={setShowMainEmojiPicker}
        roomTitle={targetNickname}
        roomId={roomId}
        formatChatPreview={formatChatPreview}
        messages={messages}
        onInputChange={(event) => {
          const nextValue = event.target.value;
          setInput(nextValue);
          if (!nextValue.trim()) {
            socketRef.current?.emit("stop_typing", { roomId: socketRoomId });
          } else {
            const now = Date.now();
            if (now - typingEmitRef.current > 2000) {
              typingEmitRef.current = now;
              socketRef.current?.emit("typing", {
                roomId: socketRoomId,
                nickname: name,
              });
            }
          }
        }}
        onInput={resizeInput}
        onCompositionEnd={resizeInput}
      />

      {selectedProfileId && (
        <UserProfileModal
          userId={selectedProfileId}
          currentUserId={userId}
          onClose={() => setSelectedProfileId(null)}
        />
      )}

      {showFileGallery && (
        <ChatFileGallery
          messages={messages}
          onClose={() => setShowFileGallery(false)}
        />
      )}
    </div>
  );
}
