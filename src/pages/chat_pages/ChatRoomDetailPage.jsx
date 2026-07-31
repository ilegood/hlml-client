import ChatRoomMessageList from "../../components/chat_components/ChatRoomMessageList";
import ChatRoomAccessState from "../../components/chat_components/ChatRoomAccessState";
import ChatRoomHeader from "../../components/chat_components/ChatRoomHeader";
import ChatRoomOverlays from "../../components/chat_components/ChatRoomOverlays";
import ChatScrollButton from "../../components/chat_components/ChatScrollButton";
import useChatRoomDetail from "../../hooks/useChatRoomDetail";
import ChatInputArea from "../../components/chat_components/ChatInputArea";
import { formatChatPreview } from "../../utils/chatPreview";
import {
  formatAppointmentDateTime,
  displayName,
} from "../../utils/chatHelpers";
// Main Component
export default function ChatRoomDetailPage() {
  const {
    roomId, name, userId, profileImg, navigate, messages, input, setInput,
    roomTitle, setRoomTitle, roomImage, setRoomImage, roomAuthor,
    roomLocation, setRoomLocation, roomAppointment, setRoomAppointment,
    showSettings, setShowSettings, showMembers, setShowMembers, roomMembers,
    setRoomMembers, replyTo, editId, hoveredMsgId, setHoveredMsgId, showEmojiPicker,
    setShowEmojiPicker, showMainEmojiPicker, setShowMainEmojiPicker,
    showScrollBtn, showFileGallery, setShowFileGallery, notificationsMuted,
    sending, blockWarning, setBlockWarning, selectedProfileId,
    setSelectedProfileId, postData, isParticipant, joining, loadingPost,
    typingNickname, socketRef, bottomRef, messagesRef, inputRef, fileInputRef,
    typingEmitRef, pendingFiles, showAttachMenu, setShowAttachMenu,
    fileAccept, addPendingFiles, openFilePicker, removePendingFile,
    resizeInput, appointmentReminder, handleEmojiSelect, handleScroll,
    scrollToBottom, handleSend, startEdit, startReply, handleDelete,
    toggleReaction, scrollToMessage, toggleMembers, cancelContext,
    handleLeave, handleJoinChat, handlePaste, handleDrop,
    toggleNotifications, openRoomMap, isFull,
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
        onBack={() => navigate(-1)}
      />
    );
  }


  return (
    <div
      className="flex h-[calc(100vh-25px)] flex-col overflow-x-hidden bg-[var(--color-bg)] px-[200px] font-[inherit]"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {blockWarning && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/45">
          <div className="w-[min(420px,calc(100vw-32px))] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-[var(--color-text)] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <h3 className="mb-2.5 text-[18px]">차단한 사용자가 이 채팅방에 있습니다.</h3>
            <p className="mb-[18px] leading-[1.5] text-[#888]">
              {blockWarning.users
                .map((user) => displayName(user.nickname))
                .join(", ")}
              님이 현재 이 그룹 채팅방에 참여 중입니다.
            </p>
            <button
              type="button"
              className="h-[38px] w-full rounded-md border-0 bg-[var(--color-active)] font-bold text-white"
              onClick={() => {
                localStorage.setItem(blockWarning.key, "1");
                setBlockWarning(null);
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
      {/* ── Header ── */}
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

      <section className="mt-3 grid shrink-0 grid-cols-[minmax(0,1.2fr)_minmax(280px,1fr)_auto] items-center gap-[14px] rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar)] px-4 py-[14px] text-[var(--color-text)] max-[900px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="text-[11px] font-black text-[var(--color-deactive)]">약속 정보</div>
          <strong className="truncate text-[16px]">{roomTitle || `채팅방 ${roomId}`}</strong>
          <span className="truncate text-[13px]">
            {formatAppointmentDateTime(
              roomAppointment.date,
              roomAppointment.time,
            ) || "날짜와 시간이 정해지지 않았습니다."}
          </span>
        </div>
        <div className="grid min-w-0 grid-cols-[1.5fr_0.8fr_0.8fr] gap-3 max-[900px]:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] font-black text-[var(--color-deactive)]">장소</span>
            <strong className="truncate text-[13px]">{roomAppointment.place || "미정"}</strong>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] font-black text-[var(--color-deactive)]">참석</span>
            <strong className="truncate text-[13px]">
              {roomAppointment.participants || 0}
              {roomAppointment.capacity ? ` / ${roomAppointment.capacity}` : ""}
              명
            </strong>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] font-black text-[var(--color-deactive)]">상태</span>
            <strong className="truncate text-[13px]">{roomAppointment.status || "확인 중"}</strong>
          </div>
        </div>
        <button
          type="button"
              className="h-9 whitespace-nowrap rounded-md border-0 bg-[var(--color-active)] px-[14px] text-[13px] font-extrabold text-white transition-opacity hover:opacity-90 max-[900px]:w-full"
          onClick={openRoomMap}
        >
          위치 보기
        </button>
      </section>

      {appointmentReminder && (
        <div className="mt-3 flex shrink-0 items-center gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-active)_45%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-active)_12%,var(--color-bg))] px-[14px] py-3 text-[var(--color-text)]">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-active)] text-[14px] font-black text-white">⏰</div>
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <strong className="truncate text-[14px]">{appointmentReminder.title || roomTitle || "약속"}</strong>
            <span className="truncate text-[13px] text-[var(--color-deactive)]">
              약속이 30분 이내에 시작됩니다.
              {formatAppointmentDateTime(
                appointmentReminder.date,
                appointmentReminder.time,
              ) &&
                ` ${formatAppointmentDateTime(appointmentReminder.date, appointmentReminder.time)}`}
              {appointmentReminder.place && ` · ${appointmentReminder.place}`}
            </span>
          </div>
        </div>
      )}

      {/* ── Message list ── */}
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

      {showScrollBtn && (
        <ChatScrollButton
          onClick={scrollToBottom}
          title="?? ??? ??"
          ariaLabel="? ??? ????"
          label="? ???"
        />
      )}

      {typingNickname && (
        <div style={{
          padding: "4px 16px",
          fontSize: 12,
          color: "var(--color-text-secondary, #888)",
          fontStyle: "italic",
        }}>
          {typingNickname}님이 입력중입니다...
        </div>
      )}

      {/* ── Input area ── */}
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
        onInputChange={(event) => {
          const nextValue = event.target.value;
          setInput(nextValue);
          if (!nextValue.trim()) {
            socketRef.current?.emit("stop_typing", { roomId });
          } else {
            const now = Date.now();
            if (now - typingEmitRef.current > 2000) {
              typingEmitRef.current = now;
              socketRef.current?.emit("typing", { roomId, nickname: name });
            }
          }
        }}
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
        socketRef={socketRef}
        selectedProfileId={selectedProfileId}
        setSelectedProfileId={setSelectedProfileId}
      />

    </div>
  );
}
