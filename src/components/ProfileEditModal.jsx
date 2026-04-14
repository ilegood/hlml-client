import { useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { updateProfile } from "../api/users";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContainer = styled.div`
  background: var(--color-sidebar);
  width: 450px;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  color: var(--color-text);

  h2 {
    margin-bottom: 20px;
    font-size: 20px;
    color: var(--color-active);
  }

  .form-group {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input, textarea {
      background: var(--color-input-bg);
      border: 1.5px solid var(--color-border);
      padding: 10px 15px;
      border-radius: 8px;
      color: var(--color-text);
      outline: none;
      font-size: 14px;

      &:focus {
        border-color: var(--color-active);
        background: var(--color-input-focus-bg);
      }
    }

    textarea {
      resize: none;
      height: 80px;
    }
  }

  .password-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 10px;

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-deactive);
    }
  }

  .profile-image-edit {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;

    .preview {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--color-active);
    }

    button {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background: var(--color-input-bg);
      color: var(--color-text);
      cursor: pointer;
    }
  }

  .button-wrap {
    display: flex;
    gap: 10px;
    margin-top: 25px;

    button {
      flex: 1;
      height: 40px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }

    .save {
      background: var(--color-active);
      color: white;
    }

    .cancel {
      background: var(--color-border);
      color: var(--color-text);
    }
  }
`;

const ProfileEditModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    nickname: localStorage.getItem("name") || "",
    bio: localStorage.getItem("bio") || "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.nickname) return toast.error("닉네임을 입력해주세요.");
    
    if (isChangingPassword) {
      if (!form.currentPassword) return toast.error("현재 비밀번호를 입력해주세요.");
      if (form.newPassword !== form.newPasswordConfirm) return toast.error("새 비밀번호가 일치하지 않습니다.");
      if (form.newPassword.length < 4) return toast.error("비밀번호는 4자 이상이어야 합니다.");
    }

    try {
      const data = await updateProfile({
        nickname: form.nickname,
        bio: form.bio,
        currentPassword: isChangingPassword ? form.currentPassword : null,
        newPassword: isChangingPassword ? form.newPassword : null,
      });

      localStorage.setItem("name", data.nickname);
      localStorage.setItem("bio", data.bio);
      
      onSave();
      toast.success("프로필이 수정되었습니다.");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <h2>프로필 수정</h2>
        
        <div className="profile-image-edit">
          <div className="preview"></div>
          <button type="button">이미지 변경</button>
        </div>

        <div className="form-group">
          <label>닉네임</label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="닉네임 입력"
          />
        </div>

        <div className="form-group">
          <label>자기소개</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="자기소개를 입력해주세요"
          />
        </div>

        {!isChangingPassword ? (
          <button 
            type="button" 
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--color-deactive)", 
              fontSize: "12px", 
              cursor: "pointer",
              padding: 0,
              marginTop: "10px"
            }}
            onClick={() => setIsChangingPassword(true)}
          >
            비밀번호 변경하기
          </button>
        ) : (
          <div className="password-section">
            <span className="section-title">비밀번호 변경</span>
            <div className="form-group">
              <label>현재 비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                name="newPasswordConfirm"
                value={form.newPasswordConfirm}
                onChange={handleChange}
              />
            </div>
            <button 
              type="button" 
              style={{ background: "none", border: "none", color: "#888", fontSize: "11px", cursor: "pointer" }}
              onClick={() => setIsChangingPassword(false)}
            >
              변경 취소
            </button>
          </div>
        )}

        <div className="button-wrap">
          <button className="cancel" onClick={onClose}>취소</button>
          <button className="save" onClick={handleSave}>저장하기</button>
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ProfileEditModal;