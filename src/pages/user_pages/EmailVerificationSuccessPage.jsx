import { Link } from "react-router-dom";
import styles from "./EmailVerificationPages.module.css";

const EmailVerificationSuccessPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>이메일 인증 완료!</h1>
      <p className={styles.message}>
        이메일 주소가 성공적으로 인증되었습니다. 이제 로그인을 할 수 있습니다.
      </p>
      <Link to="/login" className={styles.linkButton}>
        로그인 페이지로 이동
      </Link>
    </div>
  );
};

export default EmailVerificationSuccessPage;