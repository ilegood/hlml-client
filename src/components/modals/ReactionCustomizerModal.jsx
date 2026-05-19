import { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import styles from "./ReactionCustomizerModal.module.css";

const ReactionCustomizerModal = ({ currentReactions, onSave, onClose }) => {
  const [reactions, setReactions] = useState([...currentReactions]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleEmojiSelect = (emoji) => {
    if (editingIndex !== null) {
      const newReactions = [...reactions];
      newReactions[editingIndex] = emoji.native;
      setReactions(newReactions);
      setEditingIndex(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>초기 반응 커스텀</h3>
        <p>변경하고 싶은 이모지를 클릭하세요.</p>
        
        <div className={styles.reactionList}>
          {reactions.map((emoji, idx) => (
            <button
              key={idx}
              className={`${styles.reactionBtn} ${editingIndex === idx ? styles.editing : ""}`}
              onClick={() => setEditingIndex(idx)}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className={styles.pickerContainer}>
          {editingIndex !== null ? (
            <div className={styles.pickerWrap}>
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                locale="ko"
              />
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
