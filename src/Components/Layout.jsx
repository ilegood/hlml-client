import { Outlet } from "react-router";
import Header from "./Sidebar_Components/Header";
import FriendsList from "./Sidebar_Components/FriendsList";
import Sidebar from "./Sidebar_Components/Sidebar";

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
