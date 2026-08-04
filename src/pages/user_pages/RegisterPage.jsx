import { Link } from "react-router-dom";
import { useRegisterForm } from "../../hooks/useRegisterForm";

const inputClass =
  "box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]";
const labelClass =
  "relative mb-[26px] flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]";
const errorClass =
  "absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#ff4d4f]";

const RegisterPage = () => {
  const {
    availability,
    birthdayError,
    days,
    emailAvailabilityMessage,
    emailError,
    form,
    genderError,
    goToLogin,
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
    nicknameAvailabilityMessage,
    nicknameError,
    passwordCheckError,
    passwordCriteria,
    passwordError,
    passwordFocused,
    phoneError,
    selectArrowStyle,
    years,
  } = useRegisterForm();

  return (
    <div className="flex h-[calc(100vh-25px)] items-center justify-center">
      <form onSubmit={handleSubmit}>
        <div className="flex w-[480px] flex-col rounded-2xl bg-[var(--color-sidebar)] px-9 pb-8 pt-10 shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
          <label className={labelClass}>
            닉네임
            <input
              className={inputClass}
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={12}
              placeholder="닉네임을 입력해주세요"
            />
            {nicknameError ? (
              <span className={errorClass}>{nicknameError}</span>
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

          <label className={labelClass}>
            이메일 주소
            <input
              className={inputClass}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@email.com"
            />
            {emailError ? (
              <span className={errorClass}>{emailError}</span>
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

          <label className={labelClass}>
            비밀번호
            <input
              className={inputClass}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              placeholder="비밀번호를 입력해주세요"
            />
            {passwordFocused && (
              <div className="absolute left-[calc(100%+14px)] top-[22px] z-20 flex w-[190px] flex-col gap-[6px] rounded-xl border border-[var(--color-border)] bg-[var(--color-sidebar)] p-3 text-[var(--color-text)] shadow-[0_12px_30px_rgba(0,0,0,0.18)] max-[760px]:left-0 max-[760px]:right-0 max-[760px]:top-[calc(100%+6px)] max-[760px]:w-auto">
                <strong>비밀번호 조건</strong>
                {passwordCriteria.map((item) => (
                  <span
                    key={item.label}
                    className={`text-[11px] font-bold ${item.met ? "text-[#16a34a]" : "text-[#888]"}`}
                  >
                    {item.met ? "✓" : "·"} {item.label}
                  </span>
                ))}
              </div>
            )}
            {passwordError && <span className={errorClass}>{passwordError}</span>}
          </label>

          <label className={labelClass}>
            비밀번호 확인
            <input
              className={inputClass}
              type="password"
              name="pw_check"
              value={form.pw_check}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="비밀번호를 다시 입력해주세요"
            />
            {passwordCheckError ? (
              <span className={errorClass}>{passwordCheckError}</span>
            ) : form.pw_check ? (
              <span className="absolute bottom-[-18px] left-[18px] whitespace-nowrap text-[11px] font-bold leading-[1.4] text-[#16a34a]">
                비밀번호가 일치합니다.
              </span>
            ) : null}
          </label>

          <label className={labelClass}>
            휴대전화
            <input
              className={inputClass}
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="'-' 없이 숫자만 입력해주세요"
            />
            {phoneError && <span className={errorClass}>{phoneError}</span>}
          </label>

          <label className={labelClass}>
            생년월일
            <div className="mt-[5px] flex gap-[10px]">
              {[
                ["year", "년", years],
                ["month", "월", months],
                ["day", "일", days],
              ].map(([name, label, options]) => (
                <select
                  key={name}
                  className="box-border h-[45px] min-w-0 flex-1 cursor-pointer appearance-none rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] bg-[position:right_10px_center] bg-no-repeat bg-[size:14px] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
                  style={selectArrowStyle}
                  name={name}
                  value={form.birthday[name]}
                  onChange={handleBirthChange}
                  onBlur={handleBirthdayBlur}
                >
                  <option value="">{label}</option>
                  {options.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            {birthdayError && <span className={errorClass}>{birthdayError}</span>}
          </label>

          <fieldset className="relative mb-[26px] border-0 p-0">
            <legend className="mb-2 p-0 text-[13px] font-semibold text-[var(--color-text)]">
              성별
            </legend>
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
                    onChange={handleGenderChange}
                  />
                  {gender.label}
                </label>
              ))}
            </div>
            {genderError && <span className={errorClass}>{genderError}</span>}
          </fieldset>

          <div className="mt-[10px] flex gap-[10px]">
            <button
              type="button"
              className="h-[45px] flex-1 cursor-pointer rounded-[50px] border-0 bg-[#f0f0f0] text-[15px] font-semibold text-[#888] transition-[opacity,transform] duration-200 hover:opacity-85 active:scale-[0.98]"
              onClick={goToLogin}
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
