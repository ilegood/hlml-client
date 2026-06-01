import { Link } from "react-router-dom";
import styles from "./EmailVerificationPages.module.css";

const EmailVerificationPendingPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>이메일 인증 필요</h1>
      <p className={styles.message}>
        회원가입이 완료되었습니다. 등록하신 이메일 주소로 인증 링크를 보냈습니다.
        이메일함을 확인하여 계정을 활성화해주세요.
      </p>
      <p className={styles.message}>
        이메일을 받지 못하셨다면, 스팸함을 확인하거나 로그인 페이지에서
        인증 이메일을 다시 요청할 수 있습니다.
      </p>
      <Link to="/login" className={styles.linkButton}>
        로그인 페이지로 이동
      </Link>
    </div>
  );
};

export default EmailVerificationPendingPage;