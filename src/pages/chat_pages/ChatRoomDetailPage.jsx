import ChatBlockWarningModal from "../../components/chat_components/ChatBlockWarningModal";
import ChatInputArea from "../../components/chat_components/ChatInputArea";
import ChatRoomAccessState from "../../components/chat_components/ChatRoomAccessState";
import ChatRoomHeader from "../../components/chat_components/ChatRoomHeader";
import ChatRoomMessageList from "../../components/chat_components/ChatRoomMessageList";
import ChatRoomOverlays from "../../components/chat_components/ChatRoomOverlays";
import ChatScrollButton from "../../components/chat_components/ChatScrollButton";
import useChatRoomDetail from "../../hooks/useChatRoomDetail";
import { formatChatPreview } from "../../utils/chatPreview";
import { formatAppointmentDateTime } from "../../utils/chatHelpers";

export default function ChatRoomDetailPage() {
  const {
    roomId,
    name,
    userId,
    navigate,
    messages,
    input,
    setInput,
    roomTitle,
    setRoomTitle,
    roomImage,
    setRoomImage,
    roomAuthor,
    roomLocation,
    setRoomLocation,
    roomAppointment,
    setRoomAppointment,
    showSettings,
    setShowSettings,
    showMembers,
    setShowMembers,
    roomMembers,
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
    blockWarning,
    selectedProfileId,
    setSelectedProfileId,
    postData,
    isParticipant,
    joining,
    loadingPost,
    typingNickname,
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
    appointmentReminder,
    handleEmojiSelect,
    handleScroll,
    scrollToBottom,
    handleSend,
    startEdit,
    startReply,
    handleDelete,
    toggleReaction,
    scrollToMessage,
    toggleMembers,
    cancelContext,
    handleLeave,
    handleJoinChat,
    handlePaste,
    handleDrop,
    handleDragOver,
    handleBack,
    handleInputChange,
    handleBlockWarningConfirm,
    handleKickMember,
    toggleNotifications,
    openRoomMap,
    isFull,
  } = useChatRoomDetail();

  if (loadingPost || !postData || !isParticipant) {
    return (
      <ChatRoomAccessState
        loadingPost={loadingPost}
        postData={postData}
        isParticipant={isParticipant}
        joining={joining}
        isFull={isFull}
        onJoin={handleJoinChat}
        onBack={handleBack}
      />
    );
  }

  return (
    <div
      className="mx-auto flex h-[calc(100vh-25px)] w-full max-w-[1040px] flex-col overflow-x-hidden bg-[var(--color-bg)] px-4 font-[inherit] md:px-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ChatRoomHeader
        roomImage={roomImage}
        postData={postData}
        roomTitle={roomTitle}
        roomId={roomId}
        roomAuthor={roomAuthor}
        name={name}
        roomLocation={roomLocation}
        setShowSettings={setShowSettings}
        notificationsMuted={notificationsMuted}
        toggleNotifications={toggleNotifications}
        setShowFileGallery={setShowFileGallery}
        openRoomMap={openRoomMap}
        toggleMembers={toggleMembers}
        handleLeave={handleLeave}
      />

      {appointmentReminder && (
        <div className="mx-4 mt-3 rounded-lg border border-[rgba(253,147,25,0.35)] bg-[rgba(253,147,25,0.08)] px-3 py-2 text-center text-[13px] font-bold text-[var(--color-text)]">
          약속 시간까지 {appointmentReminder.minutesLeft}분 남았습니다.
        </div>
      )}

      {roomAppointment && (roomAppointment.date || roomAppointment.time) && (
        <div className="mx-4 mt-3 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar)] px-3 py-2 text-[13px] font-bold text-[var(--color-text)]">
          약속{" "}
          {formatAppointmentDateTime(
            roomAppointment.date,
            roomAppointment.time,
          )}
        </div>
      )}

      <ChatRoomMessageList
        messages={messages}
        userId={userId}
        messagesRef={messagesRef}
        bottomRef={bottomRef}
        handleScroll={handleScroll}
        roomAuthor={roomAuthor}
        navigate={navigate}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        toggleReaction={toggleReaction}
        startReply={startReply}
        startEdit={startEdit}
        handleDelete={handleDelete}
        scrollToMessage={scrollToMessage}
        setSelectedProfileId={setSelectedProfileId}
        hoveredMsgId={hoveredMsgId}
        setHoveredMsgId={setHoveredMsgId}
      />

      {typingNickname && (
        <div className="px-4 py-1 text-[12px] italic text-[var(--color-deactive)]">
          {typingNickname}님이 입력중입니다...
        </div>
      )}

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
        roomTitle={roomTitle}
        roomId={roomId}
        formatChatPreview={formatChatPreview}
        messages={messages}
        onInputChange={handleInputChange}
        onInput={resizeInput}
        onCompositionEnd={resizeInput}
      />

      <ChatRoomOverlays
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        roomId={roomId}
        roomTitle={roomTitle}
        setRoomTitle={setRoomTitle}
        setRoomImage={setRoomImage}
        setRoomLocation={setRoomLocation}
        setRoomAppointment={setRoomAppointment}
        showFileGallery={showFileGallery}
        setShowFileGallery={setShowFileGallery}
        messages={messages}
        showMembers={showMembers}
        setShowMembers={setShowMembers}
        roomMembers={roomMembers}
        roomAuthor={roomAuthor}
        userId={userId}
        onKickMember={handleKickMember}
        selectedProfileId={selectedProfileId}
        setSelectedProfileId={setSelectedProfileId}
      />

      <ChatBlockWarningModal
        warning={blockWarning}
        onConfirm={handleBlockWarningConfirm}
      />
    </div>
  );
}
