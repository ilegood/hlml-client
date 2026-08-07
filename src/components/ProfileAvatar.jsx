import { displayName } from "../utils/chatHelpers";
import { getImageUrl } from "../api/instance";
import borderImg from "../assets/border.png";

/**
 * Shared profile presentation.
 * When no image is configured, the first two nickname characters are shown,
 * matching the avatar used in chat rooms.
 */
export default function ProfileAvatar({
  profileImg,
  nickname,
  size = 40,
  className = "",
  onClick,
  showHostBorder = false,
  rounded = true,
}) {
  const label = displayName(nickname);
  const imageUrl = getImageUrl(profileImg);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-visible ${rounded ? "rounded-full" : "rounded-[18px]"} bg-[var(--color-avatar-placeholder,#555)] font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.3 }}
      onClick={onClick}
    >
      {showHostBorder && (
        <img
          src={borderImg}
          className="pointer-events-none absolute -top-1/4 z-[5] aspect-square h-[150%] w-[150%] scale-[1.35] object-contain"
          alt=""
          draggable="false"
        />
      )}
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="block h-full w-full object-cover"
            style={{ backgroundColor: "white" }}
          />
        ) : (
          label.slice(0, 2)
        )}
      </div>
    </div>
  );
}
