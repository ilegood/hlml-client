import { getImageUrl } from "../../api/instance";
import { displayName } from "../../utils/chatHelpers";
import borderImg from "../../assets/border.png";

export default function ChatMessageAvatar({ profileImg, nickname, isHost, size = 40, onClick }) {
  const url = getImageUrl(profileImg);
  const label = displayName(nickname);

  return (
    <div className="[position:relative] [width:40px] [height:40px] [flex-shrink:0]" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      {isHost && <img src={borderImg} className="[position:absolute] [top:-25%] [left:-25%] [width:150%] [height:150%] [object-fit:contain] [z-index:5] [pointer-events:none]" alt="host-border" />}
      <div className="[width:100%] [height:100%] [border-radius:50%] [background:gray] [display:flex] [align-items:center] [justify-content:center] [font-size:12px] [font-weight:700] [color:white] [overflow:hidden] [cursor:pointer]" style={{ width: size, height: size, fontSize: size * 0.3 }}>
        {url ? <img src={url} alt={label} style={{ backgroundColor: "white" }} /> : label.slice(0, 2)}
      </div>
    </div>
  );
}
