import { useState, useRef } from "react";
import { toast } from "sonner";
import { updateProfile } from "../../api/users";
import { getImageUrl } from "../../api/instance";
import ProfileAvatar from "../ProfileAvatar";
import styles from "./ProfileEditModal.module.css";

const ProfileEditModal = ({ onClose, onSave }) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    nickname: localStorage.getItem("name") || "",
    bio: localStorage.getItem("bio") || "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [profileImg, setProfileImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    getImageUrl(localStorage.getItem("profile_img")) || "",
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!form.nickname) return toast.error("닉네임을 입력해주세요.");

    if (isChangingPassword) {
      if (!form.currentPassword)
        return toast.error("현재 비밀번호를 입력해주세요.");
      if (form.newPassword !== form.newPasswordConfirm)
        return toast.error("새 비밀번호가 일치하지 않습니다.");
      if (form.newPassword.length < 4)
        return toast.error("비밀번호는 4자 이상이어야 합니다.");
    }

    try {
      setIsSaving(true);
      const data = await updateProfile({
        nickname: form.nickname,
        bio: form.bio,
        currentPassword: isChangingPassword ? form.currentPassword : null,
        newPassword: isChangingPassword ? form.newPassword : null,
        profile_img: profileImg,
      });

      localStorage.setItem("name", data.nickname);
      localStorage.setItem("bio", data.bio);
      localStorage.setItem("profile_img", data.profile_img || "");

      onSave();
      toast.success("프로필이 수정되었습니다.");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "수정 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2>프로필 수정</h2>

        {/* ── 프로필 이미지 ── */}
        <div className={styles.profileImageEdit}>
          <div className={styles.preview}>
            <ProfileAvatar
              profileImg={previewUrl}
              nickname={form.nickname}
              size={60}
              className="!h-full !w-full"
            />
          </div>
          <input
            type="file"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
          />
          <button
            type="button"
            className={styles.imgChangeBtn}
            onClick={() => fileInputRef.current.click()}
          >
            이미지 변경
          </button>
        </div>

        {/* ── 닉네임 ── */}
        <div className={styles.formGroup}>
          <label>닉네임</label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="닉네임 입력"
          />
        </div>

        {/* ── 자기소개 ── */}
        <div className={styles.formGroup}>
          <label>자기소개</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="자기소개를 입력해주세요"
          />
        </div>

        {/* ── 비밀번호 변경 ── */}
        {!isChangingPassword ? (
          <button
            type="button"
            className={styles.pwToggleBtn}
            onClick={() => setIsChangingPassword(true)}
          >
            비밀번호 변경하기
          </button>
        ) : (
          <div className={styles.passwordSection}>
            <span className={styles.sectionTitle}>비밀번호 변경</span>
            <div className={styles.formGroup}>
              <label>현재 비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
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
              className={styles.pwCancelBtn}
              onClick={() => setIsChangingPassword(false)}
            >
              변경 취소
            </button>
          </div>
        )}

        {/* ── 저장 / 취소 ── */}
        <div className={styles.buttonWrap}>
          <button className={styles.cancel} onClick={onClose}>
            취소
          </button>
          <button
            className={`${styles.save} ${isSaving ? styles.savingBtn : ""}`}
            onClick={handleSave}
            disabled={isSaving}
            data-saving-label={profileImg ? "이미지 업로드 중..." : "저장 중..."}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
