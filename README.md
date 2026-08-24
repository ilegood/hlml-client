# 👥 할래말래

> 관심사가 비슷한 사람들과 함께할 모임을 만들고 참여할 수 있는 커뮤니티 웹 서비스

[![GitHub](https://img.shields.io/badge/GitHub-Client-black?logo=github)](https://github.com/ilegood/hlml-client)
[![Service](https://img.shields.io/badge/Service-Live-blue)](https://hlml-bice.vercel.app/)

---

## 📖 Description

**할래말래**는 관심사가 비슷한 사람들과 함께할 수 있는
모임을 만들고 참여할 수 있도록 지원하는 커뮤니티 웹 서비스입니다.

사용자는 원하는 모임을 탐색하고 직접 모임을 생성할 수 있으며,
모임 참여자들과 실시간 채팅을 통해 소통할 수 있습니다.

또한 사용자 프로필과 관심사를 관리하고,
게시글 및 댓글을 통해 다양한 사용자와 정보를 공유할 수 있도록 구현했습니다.

본 Repository는 **할래말래의 Frontend Client**입니다.

Backend Server와 분리하여 개발했으며,
REST API와 Socket.IO를 통해 Backend와 통신합니다.

- 🌐 **Service:** https://hlml-bice.vercel.app/
- 💻 **Frontend:** https://github.com/ilegood/hlml-client
- ⚙️ **Backend:** https://github.com/ilegood/hlml-server

---

## 📅 Project Info

| 항목 | 내용 |
|---|---|
| 개발 기간 | 2026.03.16 ~ 2026.04.20 |
| 개발 인원 | 3명 |
| 프로젝트 유형 | 팀 프로젝트 |
| 개발 방식 | Full-Stack |
| Frontend | React / Vite |
| Backend | Node.js / Express |
| Database | MySQL |
| Deployment | Vercel / Fly.io |

---

# 🎥 Demo

## 🌐 Live Service

### [할래말래 바로가기](https://hlml-bice.vercel.app/)

---

## 📸 Screenshots

> 주요 화면의 실제 서비스 이미지를 추가할 예정입니다.

<!--
<p align="center">
  <img src="./images/main.png" width="800" alt="할래말래 메인 화면">
</p>
-->

---

# ⭐ Main Features

## 👤 회원가입 / 로그인

사용자가 서비스에 가입하고 로그인할 수 있도록
회원 인증 화면을 구현했습니다.

- 회원가입
- 로그인
- 이메일 인증
- 로그인 상태 유지
- 사용자 정보 관리

Backend의 인증 API와 연동하여
사용자의 인증 상태에 따라 접근 가능한 페이지와 기능을 관리합니다.

---

## 🏠 모임 탐색

메인 페이지에서 다양한 모임을 확인하고
사용자가 원하는 모임을 탐색할 수 있도록 구현했습니다.

- 모임 목록 조회
- 카테고리별 탐색
- 지역 및 일정 기반 검색
- 모임 상세 정보 확인
- 모집 인원 확인

---

## 👥 모임 생성 / 수정

사용자가 직접 새로운 모임을 만들고
기존 모임 정보를 수정할 수 있도록 구현했습니다.

- 모임 작성
- 모임 수정
- 모임 삭제
- 모임 이미지
- 카테고리
- 태그
- 날짜 / 시간
- 장소
- 모집 인원

React Router를 활용하여 작성 및 수정 페이지를
별도의 Route로 관리합니다.

```text
/write
/edit/:id
