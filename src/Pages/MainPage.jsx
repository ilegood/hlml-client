import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MainPage = () => {
  {
    /* JSX : JavaScript 안에서 HTML 처럼 작성하는 문법
    useState : 화면에 보여줄 값을 저장하는 공간
    => const [현재 상태의 변수, 변수값 상태를 바꾸는 함수] = useState(초기값)
    useEffect : 바뀌는 시점을 찾을 때 사용
    => []이 비어있는 경우 처음에만 실행
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
      <h1>우와웅</h1>
      <Link to="/register">회원가입</Link>
      <Link to="/login">로그인</Link>
      <Link to="/user">마이페이지</Link>
    </>
  );
};

export default MainPage;
