import { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import styles from "./ReactionCustomizerModal.module.css";

const MAX_REACTIONS = 5;

const ReactionCustomizerModal = ({ currentReactions, onSave, onClose }) => {
  const [reactions, setReactions] = useState([...currentReactions]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const handleEmojiSelect = (emoji) => {
    if (editingIndex !== null) {
      const newReactions = [...reactions];
      newReactions[editingIndex] = emoji.native;
      setReactions(newReactions);
      setEditingIndex(null);
    } else if (addingNew) {
      if (reactions.length < MAX_REACTIONS) {
        setReactions([...reactions, emoji.native]);
      }
      setAddingNew(false);
    }
  };

  const removeReaction = (idx) => {
    if (reactions.length <= 1) return;
    setReactions(reactions.filter((_, i) => i !== idx));
    if (editingIndex === idx) setEditingIndex(null);
  };

  const handlePickerClose = () => {
    setEditingIndex(null);
    setAddingNew(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>초기 반응 커스텀</h3>
        <p>변경하고 싶은 이모지를 클릭하세요.</p>

        <div className={styles.reactionList}>
          {reactions.map((emoji, idx) => (
            <div key={idx} className={styles.reactionItem}>
              <button
                className={`${styles.reactionBtn} ${editingIndex === idx ? styles.editing : ""}`}
                onClick={() => { setAddingNew(false); setEditingIndex(idx); }}
              >
                {emoji}
              </button>
              <button
                className={styles.removeBtn}
                onClick={() => removeReaction(idx)}
                title="삭제"
              >
                ✕
              </button>
            </div>
          ))}
          {reactions.length < MAX_REACTIONS && (
            <div className={styles.reactionItem}>
              <button
                className={`${styles.reactionBtn} ${styles.addBtn} ${addingNew ? styles.editing : ""}`}
                onClick={() => { setEditingIndex(null); setAddingNew(true); }}
                title="반응 추가"
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className={styles.reactionCount}>
          {reactions.length} / {MAX_REACTIONS}
        </div>

        <div className={styles.pickerContainer}>
          {(editingIndex !== null || addingNew) ? (
            <div className={styles.pickerWrap}>
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                locale="ko"
              />
              <button className={styles.closePickerBtn} onClick={handlePickerClose}>취소</button>
            </div>
          ) : (
            <div className={styles.pickerPlaceholder}>
              위의 이모지를 선택하면 변경할 수 있습니다.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button className={styles.saveBtn} onClick={() => onSave(reactions)}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default ReactionCustomizerModal;
