import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

export default function MessageActionToolbar({ msg, reactions, toggleReaction, showEmojiPicker, setShowEmojiPicker, startReply, startEdit, handleDelete, setShowCustomizer, isMine }) {
  return (
    <div className="[position:absolute] [top:-16px] [right:8px] [display:flex] [align-items:center] [background:var(--color-bg)] [border:1px_solid_var(--color-border)] [border-radius:4px] [z-index:200]" onClick={(event) => event.stopPropagation()}>
      <div className="[display:flex]">
        {reactions.map((emoji) => <button key={emoji} type="button" title={emoji} onClick={() => toggleReaction(msg.id, emoji)}>{emoji}</button>)}
        {setShowCustomizer && <button type="button" title="반응 커스터마이즈" onClick={() => setShowCustomizer(true)}>⚙</button>}
      </div>
      <button type="button" title="반응 추가" onClick={() => setShowEmojiPicker(msg.id)}>반응
        {showEmojiPicker === msg.id && <div onClick={(event) => event.stopPropagation()}><Picker data={data} onEmojiSelect={(emoji) => toggleReaction(msg.id, emoji.native)} theme="dark" locale="ko" /></div>}
      </button>
      <button type="button" title="답장" onClick={() => startReply(msg)}>↩</button>
      {isMine && <>
        <button type="button" title="수정" onClick={() => startEdit(msg)}>✎</button>
        <button type="button" title="삭제" onClick={() => handleDelete(msg.id)}>🗑</button>
      </>}
    </div>
  );
}
