import DMChatOverlays from "../../components/chat_components/DMChatOverlays";
import ChatInputArea from "../../components/chat_components/ChatInputArea";
import ChatMessageList from "../../components/chat_components/ChatMessageList";
import ChatScrollButton from "../../components/chat_components/ChatScrollButton";
import DMHeader from "../../components/chat_components/DMHeader";
import useDMChat from "../../hooks/useDMChat";
import { formatChatPreview } from "../../utils/chatPreview";

export default function DMDetailPage() {
  const {
    roomId,
    userId,
    messages,
    input,
    setInput,
    targetUserId,
    targetNickname,
    targetProfileImg,
    targetOnline,
    replyTo,
    editId,
    hoveredMsgId,
    setHoveredMsgId,
    showEmojiPicker,
    setShowEmojiPicker,
    showMainEmojiPicker,
    setShowMainEmojiPicker,
    showScrollBtn,
    showFileGallery,
    setShowFileGallery,
    notificationsMuted,
    sending,
    selectedProfileId,
    setSelectedProfileId,
    bottomRef,
    messagesRef,
    inputRef,
    fileInputRef,
    pendingFiles,
    showAttachMenu,
    setShowAttachMenu,
    fileAccept,
    addPendingFiles,
    openFilePicker,
    removePendingFile,
    resizeInput,
    handleEmojiSelect,
    handleScroll,
    scrollToBottom,
    toggleNotifications,
    handleLeaveDM,
    handleSend,
    startEdit,
    startReply,
    handleDelete,
    toggleReaction,
    scrollToMessage,
    cancelContext,
    handlePaste,
    handleDrop,
    handleDragOver,
    handleInputChange,
  } = useDMChat();

  return (
    <div
      className="mx-auto flex h-[calc(100vh-25px)] w-full max-w-[1040px] flex-col overflow-x-hidden bg-[var(--color-bg)] px-4 font-[inherit] md:px-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
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
          title="맨 아래로"
          ariaLabel="맨 아래로 이동"
          label="아래"
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
        onInputChange={handleInputChange}
        onInput={resizeInput}
        onCompositionEnd={resizeInput}
      />

      <DMChatOverlays
        currentUserId={userId}
        messages={messages}
        selectedProfileId={selectedProfileId}
        setSelectedProfileId={setSelectedProfileId}
        setShowFileGallery={setShowFileGallery}
        showFileGallery={showFileGallery}
      />
    </div>
  );
}
