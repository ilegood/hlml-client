import { Outlet } from "react-router";
import Header from "./sidebar_components/Header";
import FriendsList from "./sidebar_components/FriendsList";
import Sidebar from "./sidebar_components/Sidebar";

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
