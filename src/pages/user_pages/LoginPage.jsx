import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login as loginAPI } from "../../api/users";
import { useAuth } from "../../context/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

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
      toast.error(error.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-25px)] items-center justify-center">
      <form onSubmit={handleSubmit}>
        <div className="flex w-[480px] flex-col rounded-2xl bg-[var(--color-sidebar)] px-9 pt-10 pb-8 shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
          <div className="mb-[30px] flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
              이메일
              <input
                className="box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
                type="text"
                name="email"
                placeholder="이메일을 입력해주세요"
                value={form.email}
                onChange={handleChange}
              />
            </label>
            <label className="flex flex-col gap-2 text-[13px] font-semibold text-[var(--color-text)]">
              비밀번호
              <input
                className="box-border h-[45px] w-full rounded-[50px] border-[1.5px] border-solid border-[var(--color-border)] bg-[var(--color-input-bg)] px-5 text-[14px] text-[var(--color-text)] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[12px] placeholder:text-[#888] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)]"
                type="password"
                name="password"
                placeholder="비밀번호를 입력해주세요"
                value={form.password}
                onChange={handleChange}
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-[5px] h-[50px] w-full cursor-pointer rounded-[10px] border-0 bg-[var(--color-active)] text-[20px] font-semibold text-white transition-[opacity,transform] duration-200 hover:opacity-[0.85] active:scale-[0.97]"
          >
            로그인
          </button>

          <Link
            to="/register"
            className="mt-1 pl-1 text-[12px] text-[#aaa] no-underline transition-colors duration-200 hover:text-[#888]"
          >
            계정이 없으신가요? <span className="font-semibold text-[var(--color-active)]">회원가입 하러가기</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
