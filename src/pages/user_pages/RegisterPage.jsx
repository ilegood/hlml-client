import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import instance from "../../api/instance";

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, i) => currentYear - i,
);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const selectArrowStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
};

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
        const { data } = await instance.get("/users/register/check", {
          params: { nickname },
        });
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
        const { data } = await instance.get("/users/register/check", {
          params: { email },
        });
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
      await instance.post("/users/register", body);
      toast.success("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "서버와 통신 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-25px)] items-center justify-center">
      <form onSubmit={handleSubmit}>
        <div className="flex w-[480px] flex-col rounded-2xl bg-[var(--color-sidebar)] px-9 pt-10 pb-8 shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
          <label className="relative mb-[26px] flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            닉네임
            <input
              className="box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={12}
              placeholder="닉네임을 입력해주세요"
            />
            {nicknameError ? (
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]">
                {nicknameError}
              </span>
            ) : nicknameAvailabilityMessage ? (
              <span
                className={`absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] ${
                  availability.nickname.available
                    ? "text-[#16a34a]"
                    : availability.nickname.checking
                      ? "text-[#888]"
                      : "text-[#ff4d4f]"
                }`}
              >
                {nicknameAvailabilityMessage}
              </span>
            ) : null}
          </label>

          <label className="relative mb-[26px] flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            이메일 주소
            <input
              className="box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@email.com"
            />
            {emailError ? (
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]">
                {emailError}
              </span>
            ) : emailAvailabilityMessage ? (
              <span
                className={`absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] ${
                  availability.email.available
                    ? "text-[#16a34a]"
                    : availability.email.checking
                      ? "text-[#888]"
                      : "text-[#ff4d4f]"
                }`}
              >
                {emailAvailabilityMessage}
              </span>
            ) : null}
          </label>

          <label className="relative mb-[26px] flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            비밀번호
            <input
              className="box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
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
              <div className="absolute top-[22px] left-[calc(100%+14px)] z-20 flex w-[190px] flex-col gap-[6px] rounded-xl border border-[var(--color-border)] bg-[var(--color-sidebar)] p-3 text-[var(--color-text)] shadow-[0_12px_30px_rgba(0,0,0,0.18)] max-[760px]:top-[calc(100%+6px)] max-[760px]:right-0 max-[760px]:left-0 max-[760px]:w-auto">
                <strong>비밀번호 조건</strong>
                {passwordCriteria.map((item) => (
                  <span
                    key={item.label}
                    className={`text-[11px] font-bold ${item.met ? "text-[#16a34a]" : "text-[#888]"}`}
                  >
                    {item.met ? "✓" : "•"} {item.label}
                  </span>
                ))}
              </div>
            )}
            {passwordError && (
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]">
                {passwordError}
              </span>
            )}
          </label>

          <label className="relative mb-[26px] flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            비밀번호 확인
            <input
              className="box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
              type="password"
              name="pw_check"
              value={form.pw_check}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="비밀번호를 다시 입력해주세요"
            />
            {passwordCheckError ? (
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]">
                {passwordCheckError}
              </span>
            ) : form.pw_check ? (
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#16a34a]">
                비밀번호가 일치합니다.
              </span>
            ) : null}
          </label>

          <label className="relative mb-[26px] flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            휴대전화
            <input
              className="box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="'-' 없이 숫자만 입력해주세요"
            />
            {phoneError && (
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]">
                {phoneError}
              </span>
            )}
          </label>

          <label className="relative mb-[26px] flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            생년월일
            <div className="mt-[5px] flex gap-[10px]">
              <select
                className="box-border h-[45px] min-w-0 flex-1 cursor-pointer appearance-none rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] bg-[position:right_10px_center] bg-no-repeat bg-[size:14px] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
                style={selectArrowStyle}
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
                className="box-border h-[45px] min-w-0 flex-1 cursor-pointer appearance-none rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] bg-[position:right_10px_center] bg-no-repeat bg-[size:14px] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
                style={selectArrowStyle}
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
                className="box-border h-[45px] min-w-0 flex-1 cursor-pointer appearance-none rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] bg-[position:right_10px_center] bg-no-repeat bg-[size:14px] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
                style={selectArrowStyle}
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
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]">
                {birthdayError}
              </span>
            )}
          </label>

          <fieldset className="relative mb-[26px] border-0 p-0">
            <legend className="mb-2 p-0 text-[13px] font-semibold text-[var(--color-text)]">성별</legend>
            <div className="flex gap-[10px]">
              {[
                { label: "남성", value: "male" },
                { label: "여성", value: "female" },
              ].map((gender) => (
                <label
                  key={gender.value}
                  className={`flex h-[45px] flex-1 cursor-pointer flex-row items-center justify-center gap-[6px] rounded-lg border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] text-[13px] text-[var(--color-text)] transition-all duration-200 ${
                    form.gender === gender.value
                      ? "border-[var(--color-active)] bg-[var(--color-input-focus-bg)] font-semibold text-[var(--color-active)]"
                      : "font-normal"
                  }`}
                >
                  <input
                    className="hidden"
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
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]">
                {genderError}
              </span>
            )}
          </fieldset>

          <div className="mt-[10px] flex gap-[10px]">
            <button
              type="button"
              className="h-[45px] flex-1 cursor-pointer rounded-[50px] border-0 bg-[#f0f0f0] text-[15px] font-semibold text-[#888] transition-[opacity,transform] duration-200 hover:opacity-85 active:scale-[0.98]"
              onClick={() => navigate("/login")}
            >
              취소
            </button>
            <button
              type="submit"
              className="h-[45px] flex-1 cursor-pointer rounded-[50px] border-0 bg-[var(--color-active)] text-[15px] font-semibold text-white transition-[opacity,transform] duration-200 hover:opacity-85 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-[0.45] disabled:active:scale-100"
              disabled={!isFormValid}
            >
              회원가입
            </button>
          </div>

          <Link
            to="/"
            className="mt-4 block text-center text-[13px] text-[#aaa] no-underline transition-colors duration-200 hover:text-[var(--color-active)]"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
