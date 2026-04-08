import { useState, useEffect } from "react";

const App = () => {
  {
    /* 
      JSX : JavaScript 안에서 HTML 처럼 작성하는 문법 
      useState : 화면에 보여줄 값을 저장하는 공간
      => const [현재 상태의 변수, 변수 값의 상태를 바꾸는 함수] = useState(초기값)
      useEffect : 바뀌는 시점을 찾을 때 사용
      => useEffect(() => {}, []) / []이 비어있는 경우 처음에만 실행
    */
  }
  const [count, setCount] = useState(0);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getRecipes();
  }, []);

  const getRecipes = async () => {
    const response = await fetch("http://localhost:4000/recipes");
    const data = await response.json();
    setRecipes(data); // 받아온 데이터를 state에 저장
  };

  return (
    <>
      <h3>현재 숫자 : {count}</h3>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>reset</button>
      {recipes.map((recipe) => (
        // key : 리액트가 각 항목을 구분할 때 사용하는 고유값 (목록 출력 시)
        <div key={recipe.id}>
          <h3>{recipe.name}</h3>
          <p>{recipe.description}</p>
        </div>
      ))}
    </>
  );
};

import { useState } from "react";
import CategoryFilter from "./components/CategoryFilter";
import PostList from "./components/PostList";
import Write from "./components/Write";

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [page, setPage] = useState("main");

  return (
    <div style={{ maxWidth: 600, margin: "30px auto" }}>
      <h1>알림센터</h1>

      {page === "main" && (
        <>
          <button onClick={() => setPage("write")}>글쓰기</button>

          <CategoryFilter
            selected={selectedCategories}
            setSelected={setSelectedCategories}
          />

          <PostList posts={posts} filter={selectedCategories} />
        </>
      )}

      {page === "write" && (
        <Write
          onAdd={(post) => {
            setPosts([post, ...posts]);
            setPage("main");
          }}
        />
      )}
    </div>
  );
}

export default App;
