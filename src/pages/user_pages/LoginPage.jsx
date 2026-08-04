<<<<<<< Updated upstream
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  login as loginAPI,
  requestPasswordReset as requestPasswordResetAPI,
  resendVerificationEmail as resendVerificationEmailAPI,
} from "../../api/users";
import { useAuth } from "../../context/auth";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginAPI(form);
      login(data);
      navigate("/");
    } catch (error) {
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        toast.error(error.response.data.message);
        setShowResendVerification(true);
      } else {
        toast.error(error.response?.data?.message || "로그인에 실패했습니다.");
      }
    }
  };

  const handlePasswordResetRequest = async () => {
    const email = resetEmail.trim() || form.email.trim();
    if (!email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    try {
      setIsResetSubmitting(true);
      const data = await requestPasswordResetAPI(email);
      toast.success(data.message);
      setResetEmail(email);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "비밀번호 재설정 요청에 실패했습니다.",
      );
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    const emailToResend = form.email.trim();
    if (!emailToResend) {
      toast.error("이메일 주소를 입력해주세요.");
      return;
    }
    try {
      await resendVerificationEmailAPI(emailToResend);
      toast.success("인증 이메일을 다시 보냈습니다. 받은 편지함을 확인해주세요.");
      setShowResendVerification(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "인증 이메일 재전송에 실패했습니다.",
      );
    }
  };
=======
import { Link } from "react-router-dom";
import { useLoginForm } from "../../hooks/useLoginForm";

const LoginPage = () => {
  const { form, handleChange, handleSubmit } = useLoginForm();
>>>>>>> Stashed changes

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.inputWrap}>
            <label className={styles.label}>
              이메일
              <input
                className={styles.input}
                type="text"
                name="email"
                placeholder="이메일을 입력해주세요"
                value={form.email}
                onChange={handleChange}
              />
            </label>
            <label className={styles.label}>
              비밀번호
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="비밀번호를 입력해주세요"
                value={form.password}
                onChange={handleChange}
              />
            </label>
          </div>

          <button type="submit" className={styles.loginBtn}>
            로그인
          </button>

          {showResendVerification && (
            <div className={styles.resendPanel}>
              <p>이메일이 인증되지 않았습니다. 인증 이메일을 다시 보내시겠습니까?</p>
              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResendVerificationEmail}
              >
                인증 이메일 다시 보내기
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles.forgotButton}
            onClick={() => {
              setResetEmail(form.email);
              setShowResetForm((prev) => !prev);
            }}
          >
            비밀번호를 잊으셨나요?
          </button>

          {showResetForm && (
            <div className={styles.forgotPanel}>
              <div>
                <label className={styles.label}>
                  재설정 이메일
                  <input
                    className={styles.input}
                    type="email"
                    value={resetEmail}
                    placeholder="가입한 이메일을 입력해주세요"
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handlePasswordResetRequest();
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className={styles.resetBtn}
                  disabled={isResetSubmitting}
                  onClick={handlePasswordResetRequest}
                >
                  {isResetSubmitting ? "발송 중..." : "재설정 메일 보내기"}
                </button>
              </div>
            </div>
          )}

          <Link to="/register" className={styles.signupLink}>
            계정이 없으신가요? <span>회원가입 하러가기</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
