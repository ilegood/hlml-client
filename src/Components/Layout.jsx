import { Outlet } from "react-router";
import Header from "./Header";
import FriendsList from "./FriendsList";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="page-shell">
      <main className="page-content">
        <Header />
        {/* Outlet 자리에 현재 경로에 element 페이지 컴포넌트가 들어감 */}
        <div className="page-wrap">
          <Sidebar />
          <Outlet />
          <FriendsList />
        </div>
      </main>
    </div>
  );
};

export default Layout;
