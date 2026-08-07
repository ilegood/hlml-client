import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import instance from "../api/instance";

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

export const useRegisterForm = () => {

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

  const handleBirthdayBlur = () => {
    setTouched((prev) => ({ ...prev, birthday: true }));
  };

  const handleGenderChange = (event) => {
    handleChange(event);
    setTouched((prev) => ({ ...prev, gender: true }));
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = (event) => {
    handleBlur(event);
    setPasswordFocused(false);
  };

  const goToLogin = () => {
    navigate("/login");
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

  return {
    availability,
    birthdayError,
    days,
    emailAvailabilityMessage,
    emailError,
    form,
    genderError,
    handleBirthChange,
    handleBirthdayBlur,
    handleBlur,
    handleChange,
    handleGenderChange,
    handlePasswordBlur,
    handlePasswordFocus,
    handleSubmit,
    isFormValid,
    months,
    goToLogin,
    nicknameAvailabilityMessage,
    nicknameError,
    passwordCheckError,
    passwordCriteria,
    passwordError,
    passwordFocused,
    phoneError,
    selectArrowStyle,
    years,
  };
};
