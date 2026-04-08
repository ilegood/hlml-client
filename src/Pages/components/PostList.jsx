export default function PostList({ posts, filter }) {
  const filtered = posts.filter((p) =>
    Object.entries(filter).every(([k, v]) => !v || p.categories?.[k] === v),
  );

  return (
    <div>
      {filtered.length === 0 && <p>게시글 없음</p>}

      {filtered.map((p) => (
        <div
          key={p.id}
          style={{
            background: "white",
            padding: 10,
            marginTop: 10,
            borderRadius: 8,
          }}
        >
          <b>{p.title}</b>
          <div>{p.content}</div>

          <div style={{ marginTop: 5 }}>
            {Object.entries(p.categories || {}).map(([k, v]) => (
              <span
                key={k}
                style={{
                  background: "#eee",
                  padding: "2px 6px",
                  marginRight: 5,
                  fontSize: 11,
                }}
              >
                {k}:{v}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
