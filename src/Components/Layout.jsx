import { Outlet } from "react-router";
import Header from "./Header";
import FriendsList from "./FriendsList";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="page">
      <Header />
      <div className="page-wrap">
        <Sidebar />
        <main>
          <Outlet />
        </main>
        <FriendsList />
      </div>
    </div>
  );
};

export default Layout;
