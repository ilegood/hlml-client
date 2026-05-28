import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { resetPassword as resetPasswordAPI } from "../../api/users";
import styles from "./ResetPasswordPage.module.css";

const getPasswordCriteria = (password) => {
  const value = String(password || "");

  return [
    { label: "8자 이상", met: value.length >= 8 },
    { label: "영문 포함", met: /[A-Za-z]/.test(value) },
    { label: "숫자 포함", met: /[0-9]/.test(value) },
    {
      label: "특수문자 포함",
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value),
    },
    { label: "공백 제외", met: value.length > 0 && !/\s/.test(value) },
  ];
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const criteria = useMemo(
    () => getPasswordCriteria(form.password),
    [form.password],
  );
  const isPasswordValid = criteria.every((item) => item.met);
  const isConfirmValid =
    form.confirmPassword && form.password === form.confirmPassword;
  const canSubmit = token && isPasswordValid && isConfirmValid && !submitting;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("재설정 링크가 올바르지 않습니다.");
      return;
    }
    if (!isPasswordValid) {
      toast.error("비밀번호 조건을 확인해주세요.");
      return;
    }
    if (!isConfirmValid) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await resetPasswordAPI({ token, password: form.password });
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <h1 className={styles.title}>비밀번호 재설정</h1>
        <label className={styles.label}>
          새 비밀번호
          <input
            className={styles.input}
            type="password"
            name="password"
            value={form.password}
            placeholder="새 비밀번호를 입력해주세요"
            onChange={handleChange}
          />
        </label>

        <div className={styles.criteriaList}>
          {criteria.map((item) => (
            <span
              key={item.label}
              className={item.met ? styles.criteriaMet : styles.criteriaUnmet}
            >
              {item.label}
            </span>
          ))}
        </div>

        <label className={styles.label}>
          새 비밀번호 확인
          <input
            className={styles.input}
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder="새 비밀번호를 다시 입력해주세요"
            onChange={handleChange}
          />
        </label>

        {form.confirmPassword && (
          <p className={isConfirmValid ? styles.validText : styles.errorText}>
            {isConfirmValid
              ? "비밀번호가 일치합니다."
              : "비밀번호가 일치하지 않습니다."}
          </p>
        )}

        <button className={styles.submitBtn} type="submit" disabled={!canSubmit}>
          {submitting ? "변경 중..." : "비밀번호 변경"}
        </button>

        <Link to="/login" className={styles.backLink}>
          로그인으로 돌아가기
        </Link>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
