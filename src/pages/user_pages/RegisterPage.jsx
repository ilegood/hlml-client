import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import instance from "../../api/instance";
import styles from "./RegisterPage.module.css";

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, i) => currentYear - i,
);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const INITIAL_FORM = {
  nickname: "",
  email: "",
  password: "",
  pw_check: "",
  phone_number: "",
  gender: "",
  birthday: { year: "", month: "", day: "" },
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBirthChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      birthday: { ...prev.birthday, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nickname) return toast.error("닉네임을 입력해주세요.");
    if (!form.email) return toast.error("이메일 주소를 입력해주세요.");
    if (!form.password) return toast.error("비밀번호를 입력해주세요.");
    if (!form.pw_check) return toast.error("비밀번호 확인을 입력해주세요.");
    if (form.password !== form.pw_check) {
      return toast.error("비밀번호가 일치하지 않습니다.");
    }
    if (!form.phone_number) return toast.error("휴대전화 번호를 입력해주세요.");
    if (!form.birthday.year || !form.birthday.month || !form.birthday.day) {
      return toast.error("생년월일을 모두 선택해주세요.");
    }
    if (!form.gender) return toast.error("성별을 선택해주세요.");

    const body = {
      nickname: form.nickname,
      email: form.email,
      password: form.password,
      phone_number: form.phone_number,
      gender: form.gender,
      birthday: `${form.birthday.year}-${form.birthday.month}-${form.birthday.day}`,
    };

    try {
      await instance.post("/users/register", body);
      toast.success("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "서버와 통신 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
          <label className={styles.label}>
            닉네임
            <input
              className={styles.input}
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력해주세요"
            />
          </label>

          <label className={styles.label}>
            이메일 주소
            <input
              className={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </label>

          <label className={styles.label}>
            비밀번호
            <input
              className={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
            />
          </label>

          <label className={styles.label}>
            비밀번호 확인
            <input
              className={styles.input}
              type="password"
              name="pw_check"
              value={form.pw_check}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </label>

          <label className={styles.label}>
            휴대전화
            <input
              className={styles.input}
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="'-' 없이 숫자만 입력해주세요"
            />
          </label>

          <label className={styles.label}>
            생년월일
            <div className={styles.birthWrap}>
              <select
                className={styles.select}
                name="year"
                value={form.birthday.year}
                onChange={handleBirthChange}
              >
                <option value="">년</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                name="month"
                value={form.birthday.month}
                onChange={handleBirthChange}
              >
                <option value="">월</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                name="day"
                value={form.birthday.day}
                onChange={handleBirthChange}
              >
                <option value="">일</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <fieldset className={styles.genderField}>
            <legend className={styles.genderLabel}>성별</legend>
            <div className={styles.genderWrap}>
              {[
                { label: "남성", value: "male" },
                { label: "여성", value: "female" },
              ].map((gender) => (
                <label key={gender.value} className={styles.genderOption}>
                  <input
                    type="radio"
                    name="gender"
                    value={gender.value}
                    checked={form.gender === gender.value}
                    onChange={handleChange}
                  />
                  {gender.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.buttonWrap}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => navigate("/login")}
            >
              취소
            </button>
            <button type="submit" className={styles.btnSubmit}>
              회원가입
            </button>
          </div>

          <Link to="/" className={styles.backLink}>
            메인으로 돌아가기
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
