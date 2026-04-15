import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import MainPage from "./pages/MainPage";
import WritePage from "./pages/WritePage";
import DetailPage from "./pages/DetailPage";

export default function App() {
  // page: "main" | "write" | "detail"
  const [page, setPage] = useState("main");
  const [detailId, setDetailId] = useState(null);

  const navigate = (target, id = null) => {
    setPage(target);
    if (id) setDetailId(id);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Header page={page} onNavigate={navigate} />
      {page === "main"   && <MainPage   onNavigate={navigate} />}
      {page === "write"  && <WritePage  onNavigate={navigate} />}
      {page === "detail" && <DetailPage postId={detailId} onNavigate={navigate} />}
    </>
  );
}
