import { Link, useSearchParams } from "react-router-dom";
import styles from "./EmailVerificationPages.module.css";

const EmailVerificationFailPage = () => {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get("message") || "이메일 인증에 실패했습니다.";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>이메일 인증 실패</h1>
      <p className={styles.message}>{errorMessage}</p>
      <Link to="/login" className={styles.linkButton}>
        로그인 페이지로 이동
      </Link>
    </div>
  );
};

export default EmailVerificationFailPage;