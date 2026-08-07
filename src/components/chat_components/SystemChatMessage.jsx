import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/instance";

export default function SystemChatMessage({ msg, idx, showDateDivider, formatDate }) {
  const navigate = useNavigate();
  let systemText = msg.content;
  let parsed = null;

  try {
    parsed = JSON.parse(msg.content);
    if (parsed?.kind === "share_post") {
      systemText = `${parsed.sharerNickname || "알 수 없음"}님이 "${parsed.postTitle || "게시글"}" 게시글을 공유했습니다.`;
    }
  } catch {
    // 일반 시스템 메시지
  }

  return (
    <div key={msg.id || idx}>
      {showDateDivider && <div className="[display:flex] [align-items:center] [padding:12px_8px]"><span className="[font-size:11px] [font-weight:600] [color:#888]">{formatDate(msg.time)}</span></div>}
      {parsed?.kind === "share_post" && <div className="[text-align:center] [font-size:13px] [color:#888] [padding:4px_8px]">{systemText}</div>}
      {parsed?.kind === "share_post" ? (
        <button type="button" onClick={() => navigate(`/detail/${parsed.postId}`)} disabled={!parsed.postId} className="[flex-direction:column] [width:min(500px,_100%)] [overflow:hidden] [padding:0] [cursor:pointer] [text-align:left]">
          {parsed.postImage && <div className="[width:100%] [aspect-ratio:16_/_9] [overflow:hidden] [background-color:var(--color-border)]"><img src={getImageUrl(parsed.postImage)} alt="" className="[width:100%] [height:100%] [object-fit:cover]" /></div>}
          <div className="[display:flex] [flex-direction:column] [gap:4px] [padding:12px_14px_13px]"><strong>{parsed.postTitle || "게시글"}</strong><span>{parsed.sharerNickname || "알 수 없음"}님이 공유했습니다.</span></div>
        </button>
      ) : (
        <div className={msg.isDeletionWarning ? "[text-align:center] [font-size:13px] [font-weight:700] [color:#666] [background:#f0f0f0] [padding:8px_16px] [border-radius:8px] [margin:12px_auto]" : "[text-align:center] [font-size:13px] [color:#888] [padding:4px_8px]"}>{systemText}</div>
      )}
    </div>
  );
}
