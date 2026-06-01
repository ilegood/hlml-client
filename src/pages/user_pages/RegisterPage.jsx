import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkRegistrationAvailability, register } from "../../api/users";
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NICKNAME_PATTERN = /^[0-9A-Za-z가-힣]{2,12}$/;
const PHONE_NUMBER_PATTERN = /^\d{3}-\d{4}-\d{4}$/;
const BANNED_NICKNAME_WORDS = [
  "시발",
  "씨발",
  "씨팔",
  "ㅅㅂ",
  "병신",
  "븅신",
  "ㅂㅅ",
  "개새",
  "새끼",
  "지랄",
  "좆",
  "존나",
  "엿먹",
  "꺼져",
  "미친놈",
  "미친년",
  "fuck",
  "shit",
  "bitch",
  "asshole",
];

const normalizeNicknameForFilter = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]/g, "");

const getNicknameValidationMessage = (nickname) => {
  const value = String(nickname || "").trim();
  if (!value) return "닉네임을 입력해주세요.";
  if (!NICKNAME_PATTERN.test(value)) {
    return "닉네임은 2~12자의 한글, 영문, 숫자만 사용할 수 있습니다.";
  }
  if (
    BANNED_NICKNAME_WORDS.some((word) =>
      normalizeNicknameForFilter(value).includes(word),
    )
  ) {
    return "사용할 수 없는 닉네임입니다.";
  }
  return "";
};

const getPasswordCriteria = (password, { nickname = "", email = "" } = {}) => {
  const value = String(password || "");
  const lowered = value.toLowerCase();
  const emailName = String(email || "").split("@")[0]?.toLowerCase() || "";
  const nicknameValue = String(nickname || "").toLowerCase();

  return [
    { label: "8자 이상", met: value.length >= 8 },
    { label: "영문 포함", met: /[A-Za-z]/.test(value) },
    { label: "숫자 포함", met: /[0-9]/.test(value) },
    {
      label: "특수문자 포함",
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value),
    },
    { label: "공백 제외", met: value.length > 0 && !/\s/.test(value) },
    {
      label: "이메일과 다르게 설정",
      met: !emailName || !lowered.includes(emailName),
    },
    {
      label: "닉네임과 다르게 설정",
      met: !nicknameValue || !lowered.includes(nicknameValue),
    },
  ];
};

const getPasswordValidationMessage = (password, context) => {
  if (!password) return "비밀번호를 입력해주세요.";
  const unmet = getPasswordCriteria(password, context).filter((item) => !item.met);
  return unmet.length ? `미충족: ${unmet[0].label}` : "";
};

const getPhoneNumberValidationMessage = (phoneNumber) => {
  const value = String(phoneNumber || "").trim();
  if (!value) return "휴대전화 번호를 입력해주세요.";
  if (!PHONE_NUMBER_PATTERN.test(value)) {
    return "'000-0000-0000' 형식으로 입력해주세요.";
  }
  return "";
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [availability, setAvailability] = useState({
    nickname: { checking: false, available: null, message: "" },
    email: { checking: false, available: null, message: "" },
  });
  const [passwordFocused, setPasswordFocused] = useState(false);

  const nickname = form.nickname.trim();
  const email = form.email.trim().toLowerCase();
  const nicknameError =
    (touched.nickname || nickname) && getNicknameValidationMessage(nickname);
  const emailError =
    (touched.email || email) &&
    (!email
      ? "이메일 주소를 입력해주세요."
      : !EMAIL_PATTERN.test(email)
        ? "올바른 이메일 주소를 입력해주세요."
        : "");
  const passwordCriteria = getPasswordCriteria(form.password, {
    nickname,
    email,
  });
  const passwordError =
    (touched.password || form.password) &&
    getPasswordValidationMessage(form.password, { nickname, email });
  const passwordCheckError =
    (touched.pw_check || form.pw_check) &&
    (!form.pw_check
      ? "비밀번호 확인을 입력해주세요."
      : form.password !== form.pw_check
        ? "비밀번호가 일치하지 않습니다."
        : "");
  const phoneError =
    (touched.phone_number || form.phone_number) &&
    getPhoneNumberValidationMessage(form.phone_number);
  const birthdayError =
    (touched.birthday ||
      form.birthday.year ||
      form.birthday.month ||
      form.birthday.day) &&
    (!form.birthday.year || !form.birthday.month || !form.birthday.day)
      ? "생년월일을 모두 선택해주세요."
      : "";
  const genderError =
    touched.gender && !form.gender ? "성별을 선택해주세요." : "";
  const nicknameAvailabilityMessage =
    !nicknameError && nickname
      ? availability.nickname.checking
        ? "닉네임 중복 확인 중..."
        : availability.nickname.message
      : "";
  const emailAvailabilityMessage =
    !emailError && email
      ? availability.email.checking
        ? "이메일 중복 확인 중..."
        : availability.email.message
      : "";
  const isFormValid =
    nickname &&
    email &&
    form.password &&
    form.pw_check &&
    form.phone_number &&
    form.birthday.year &&
    form.birthday.month &&
    form.birthday.day &&
    form.gender &&
    !nicknameError &&
    !emailError &&
    !passwordError &&
    !passwordCheckError &&
    !phoneError &&
    !birthdayError &&
    !genderError &&
    availability.nickname.available === true &&
    availability.email.available === true &&
    !availability.nickname.checking &&
    !availability.email.checking;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone_number") {
      // 숫자만 추출
      const digitsOnly = value.replace(/\D/g, "");
      // 하이픈 추가 (000-0000-0000 형식)
      let formattedNumber = "";
      if (digitsOnly.length > 10) {
        formattedNumber = `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(
          3,
          7,
        )}-${digitsOnly.substring(7, 11)}`;
      } else if (digitsOnly.length > 6) {
        formattedNumber = `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(
          3,
          7,
        )}-${digitsOnly.substring(7)}`;
      } else if (digitsOnly.length > 2) {
        formattedNumber = `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(
          3,
        )}`;
      } else {
        formattedNumber = digitsOnly;
      }
      setForm((prev) => ({ ...prev, [name]: formattedNumber }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBirthChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      birthday: { ...prev.birthday, [name]: value },
    }));
    setTouched((prev) => ({ ...prev, birthday: true }));
  };

  useEffect(() => {
    if (nicknameError || !nickname) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setAvailability((prev) => ({
        ...prev,
        nickname: { checking: true, available: null, message: "" },
      }));

      try {
        const data = await checkRegistrationAvailability({ nickname });
        if (cancelled) return;
        setAvailability((prev) => ({
          ...prev,
          nickname: {
            checking: false,
            available: data.nickname?.available ?? null,
            message: data.nickname?.message || "",
          },
        }));
      } catch {
        if (cancelled) return;
        setAvailability((prev) => ({
          ...prev,
          nickname: {
            checking: false,
            available: false,
            message: "닉네임 중복 확인에 실패했습니다.",
          },
        }));
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nickname, nicknameError]);

  useEffect(() => {
    if (emailError || !email) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setAvailability((prev) => ({
        ...prev,
        email: { checking: true, available: null, message: "" },
      }));

      try {
        const data = await checkRegistrationAvailability({ email });
        if (cancelled) return;
        setAvailability((prev) => ({
          ...prev,
          email: {
            checking: false,
            available: data.email?.available ?? null,
            message: data.email?.message || "",
          },
        }));
      } catch {
        if (cancelled) return;
        setAvailability((prev) => ({
          ...prev,
          email: {
            checking: false,
            available: false,
            message: "이메일 중복 확인에 실패했습니다.",
          },
        }));
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email, emailError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nickname = form.nickname.trim();
    const email = form.email.trim().toLowerCase();

    const nicknameValidationMessage = getNicknameValidationMessage(nickname);
    if (nicknameValidationMessage) {
      return toast.error(nicknameValidationMessage);
    }
    if (!email) return toast.error("이메일 주소를 입력해주세요.");
    if (!EMAIL_PATTERN.test(email)) {
      return toast.error("올바른 이메일 주소를 입력해주세요.");
    }
    if (!form.password) return toast.error("비밀번호를 입력해주세요.");
    const passwordValidationMessage = getPasswordValidationMessage(
      form.password,
      { nickname, email },
    );
    if (passwordValidationMessage) {
      return toast.error(passwordValidationMessage);
    }
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
      nickname,
      email,
      password: form.password,
      phone_number: form.phone_number,
      gender: form.gender,
      birthday: `${form.birthday.year}-${form.birthday.month}-${form.birthday.day}`,
    };

    try {
      await register(body);
      toast.success("회원가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.");
      navigate("/login"); // User will need to verify email before logging in
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
              onBlur={handleBlur}
              maxLength={12}
              placeholder="닉네임을 입력해주세요"
            />
            {nicknameError ? (
              <span className={`${styles.fieldMessage} ${styles.fieldError}`}>
                {nicknameError}
              </span>
            ) : nicknameAvailabilityMessage ? (
              <span
                className={`${styles.fieldMessage} ${
                  availability.nickname.available
                    ? styles.fieldValid
                    : availability.nickname.checking
                      ? styles.fieldMuted
                      : styles.fieldError
                }`}
              >
                {nicknameAvailabilityMessage}
              </span>
            ) : null}
          </label>

          <label className={styles.label}>
            이메일 주소
            <input
              className={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@email.com"
            />
            {emailError ? (
              <span className={`${styles.fieldMessage} ${styles.fieldError}`}>
                {emailError}
              </span>
            ) : emailAvailabilityMessage ? (
              <span
                className={`${styles.fieldMessage} ${
                  availability.email.available
                    ? styles.fieldValid
                    : availability.email.checking
                      ? styles.fieldMuted
                      : styles.fieldError
                }`}
              >
                {emailAvailabilityMessage}
              </span>
            ) : null}
          </label>

          <label className={styles.label}>
            비밀번호
            <input
              className={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={(event) => {
                handleBlur(event);
                setPasswordFocused(false);
              }}
              placeholder="비밀번호를 입력해주세요"
            />
            {passwordFocused && (
              <div className={styles.passwordPopover}>
                <strong>비밀번호 조건</strong>
                {passwordCriteria.map((item) => (
                  <span
                    key={item.label}
                    className={item.met ? styles.criteriaMet : styles.criteriaUnmet}
                  >
                    {item.met ? "✓" : "•"} {item.label}
                  </span>
                ))}
              </div>
            )}
            {passwordError && (
              <span className={`${styles.fieldMessage} ${styles.fieldError}`}>
                {passwordError}
              </span>
            )}
          </label>

          <label className={styles.label}>
            비밀번호 확인
            <input
              className={styles.input}
              type="password"
              name="pw_check"
              value={form.pw_check}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="비밀번호를 다시 입력해주세요"
            />
            {passwordCheckError ? (
              <span className={`${styles.fieldMessage} ${styles.fieldError}`}>
                {passwordCheckError}
              </span>
            ) : form.pw_check ? (
              <span className={`${styles.fieldMessage} ${styles.fieldValid}`}>
                비밀번호가 일치합니다.
              </span>
            ) : null}
          </label>

          <label className={styles.label}>
            휴대전화
            <input
              className={styles.input}
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="'-' 없이 숫자만 입력해주세요"
            />
            {phoneError && (
              <span className={`${styles.fieldMessage} ${styles.fieldError}`}>
                {phoneError}
              </span>
            )}
          </label>

          <label className={styles.label}>
            생년월일
            <div className={styles.birthWrap}>
              <select
                className={styles.select}
                name="year"
                value={form.birthday.year}
                onChange={handleBirthChange}
                onBlur={() => setTouched((prev) => ({ ...prev, birthday: true }))}
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
                onBlur={() => setTouched((prev) => ({ ...prev, birthday: true }))}
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
                onBlur={() => setTouched((prev) => ({ ...prev, birthday: true }))}
              >
                <option value="">일</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            {birthdayError && (
              <span className={`${styles.fieldMessage} ${styles.fieldError}`}>
                {birthdayError}
              </span>
            )}
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
                    onChange={(event) => {
                      handleChange(event);
                      setTouched((prev) => ({ ...prev, gender: true }));
                    }}
                  />
                  {gender.label}
                </label>
              ))}
            </div>
            {genderError && (
              <span className={`${styles.fieldMessage} ${styles.fieldError}`}>
                {genderError}
              </span>
            )}
          </fieldset>

          <div className={styles.buttonWrap}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => navigate("/login")}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={!isFormValid}
            >
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
