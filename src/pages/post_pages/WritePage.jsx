import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  STATUS_OPEN,
  currentTimeString,
  nextYearTodayString,
  todayString,
} from "../../api/homeConstants";
import { useAuth } from "../../context/AuthContext.jsx";
import { createPost, getPost, updatePost } from "../../api/posts";
import CategorySelector from "../../components/Post_Components/CategorySelector";
import ImageDropZone from "../../components/post_components/ImageDropZone";
import MapPreview from "../../components/post_components/MapPreview";
import PlaceSearchModal from "../../components/modals/PlaceSearchModal";

const WRITE_CATEGORY_EXCLUDES = ["인원"];

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const formatTimeLabel = (value) => {
  const [hourText, minute] = String(value).split(":");
  const hour = Number(hourText);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 || 12;
  return `${period} ${displayHour}:${minute}`;
};

const formatDateLabel = (value) => {
  if (!value) return "날짜 선택";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDateFromKey = (value) => {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDefaultTime = () => currentTimeString();

function DatePickerModal({
  calendarMonth,
  maxDate,
  minDate,
  selectedDate,
  setCalendarMonth,
  onClose,
  onSelect,
}) {
  const viewYear = calendarMonth.getFullYear();
  const viewMonth = calendarMonth.getMonth();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const monthLabel = calendarMonth.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
  const canMovePrev =
    toDateKey(new Date(viewYear, viewMonth - 1, 1)) >=
    minDate.slice(0, 8) + "01";
  const canMoveNext =
    toDateKey(new Date(viewYear, viewMonth + 1, 1)) <=
    maxDate.slice(0, 8) + "01";

  return (
    <div className="[position:fixed] [inset:0] [z-index:12000] [display:flex] [align-items:center] [justify-content:center] [padding:18px] [background:rgba(0,_0,_0,_0.62)] [backdrop-filter:blur(5px)]" onMouseDown={onClose}>
      <div className="[width:min(520px,_100%)] [max-height:min(760px,_88vh)] [overflow-y:auto] [padding:22px] [border:1px_solid_var(--color-border)] [border-radius:24px] [background:radial-gradient(circle_at_top_left,_rgba(148,_163,_184,_0.12),_transparent_34%),_var(--color-sidebar)] [color:var(--color-text)] [box-shadow:0_24px_70px_rgba(0,_0,_0,_0.42)]" onMouseDown={(e) => e.stopPropagation()}>
        <div className="[display:flex] [justify-content:space-between] [gap:16px] [align-items:flex-start] [margin-bottom:18px] [&_span]:[color:var(--color-deactive)] [&_span]:[font-size:12px] [&_span]:[font-weight:900] [&_h3]:[margin-top:4px] [&_h3]:[color:var(--color-text)] [&_h3]:[font-size:21px] [&_h3]:[font-weight:900]">
          <div>
            <span>약속 날짜</span>
            <h3>{formatDateLabel(selectedDate)}</h3>
          </div>
          <button type="button" className="[width:34px] [height:34px] [border:1px_solid_var(--color-border)] [border-radius:999px] [background:var(--color-input-bg)] [color:var(--color-text)] [cursor:pointer] [font-size:22px] [line-height:1]" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="[display:grid] [grid-template-columns:72px_1fr_72px] [gap:10px] [align-items:center] [margin-bottom:14px] [&_strong]:[text-align:center] [&_strong]:[font-size:16px] [&_strong]:[font-weight:900] [&_button]:[min-height:34px] [&_button]:[border:1px_solid_var(--color-border)] [&_button]:[border-radius:999px] [&_button]:[background:var(--color-input-bg)] [&_button]:[color:var(--color-text)] [&_button]:[cursor:pointer] [&_button]:[font-weight:800] [&_button:disabled]:[opacity:0.3] [&_button:disabled]:[cursor:not-allowed]">
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(viewYear, viewMonth - 1, 1))}
            disabled={!canMovePrev}
          >
            이전
          </button>
          <strong>{monthLabel}</strong>
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(viewYear, viewMonth + 1, 1))}
            disabled={!canMoveNext}
          >
            다음
          </button>
        </div>

        <div className="[display:grid] [grid-template-columns:repeat(7,_1fr)] [grid-template-rows:auto_repeat(6,_1fr)] [gap:8px] [min-height:356px]">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div className="[padding:6px_0] [color:var(--color-deactive)] [text-align:center] [font-size:12px] [font-weight:900]" key={day}>
              {day}
            </div>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) {
              return (
                <div
                  className="[aspect-ratio:1] [border:1px_solid_transparent] [border-radius:14px] [background:color-mix(in_srgb,_var(--color-input-bg)_42%,_transparent)] [opacity:0.35]"
                  key={`blank-${index}`}
                />
              );
            }

              const dateKey = toDateKey(new Date(viewYear, viewMonth, day));
              const disabled = dateKey < minDate || dateKey > maxDate;
              return (
                <button
                  type="button"
                  key={dateKey}
                  className={`aspect-square rounded-[14px] border border-[var(--color-border)] bg-[var(--color-input-bg)] font-black text-[var(--color-text)] transition-[transform,border-color,background] duration-150 hover:-translate-y-px hover:border-[var(--color-deactive)] disabled:cursor-not-allowed disabled:opacity-25 ${
                    dateKey === selectedDate
                      ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                      : ""
                  }`}
                  disabled={disabled}
                  onClick={() => {
                    onSelect(dateKey);
                    onClose();
                  }}
                >
                  {day}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function TimePickerModal({
  isPastTimeSlot,
  onClose,
  onSelect,
  selectedTime,
}) {
  const [selectedHour, setSelectedHour] = useState(
    String(selectedTime || getDefaultTime()).slice(0, 2),
  );
  const [selectedMinute, setSelectedMinute] = useState(
    String(selectedTime || getDefaultTime()).slice(3, 5),
  );
  const nextTime = `${selectedHour}:${selectedMinute}`;
  const confirmDisabled = isPastTimeSlot(nextTime);
  const isHourDisabled = (hour) =>
    MINUTES.every((minute) => isPastTimeSlot(`${hour}:${minute}`));
  const isMinuteDisabled = (minute) =>
    isPastTimeSlot(`${selectedHour}:${minute}`);

  return (
    <div className="[position:fixed] [inset:0] [z-index:12000] [display:flex] [align-items:center] [justify-content:center] [padding:18px] [background:rgba(0,_0,_0,_0.62)] [backdrop-filter:blur(5px)]" onMouseDown={onClose}>
      <div className="[width:min(520px,_100%)] [max-height:min(760px,_88vh)] [overflow-y:auto] [padding:22px] [border:1px_solid_var(--color-border)] [border-radius:24px] [background:radial-gradient(circle_at_top_left,_rgba(148,_163,_184,_0.12),_transparent_34%),_var(--color-sidebar)] [color:var(--color-text)] [box-shadow:0_24px_70px_rgba(0,_0,_0,_0.42)]" onMouseDown={(e) => e.stopPropagation()}>
        <div className="[display:flex] [justify-content:space-between] [gap:16px] [align-items:flex-start] [margin-bottom:18px] [&_span]:[color:var(--color-deactive)] [&_span]:[font-size:12px] [&_span]:[font-weight:900] [&_h3]:[margin-top:4px] [&_h3]:[color:var(--color-text)] [&_h3]:[font-size:21px] [&_h3]:[font-weight:900]">
          <div>
            <span>약속 시간</span>
            <h3>{formatTimeLabel(nextTime)}</h3>
          </div>
          <button type="button" className="[width:34px] [height:34px] [border:1px_solid_var(--color-border)] [border-radius:999px] [background:var(--color-input-bg)] [color:var(--color-text)] [cursor:pointer] [font-size:22px] [line-height:1]" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="[display:grid] [grid-template-columns:minmax(0,_1fr)_auto_minmax(0,_1fr)] [gap:14px] [align-items:center]">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-center text-[12px] font-bold text-[var(--color-deactive)]">시</span>
            <div className="grid max-h-[260px] gap-2 overflow-y-auto pr-1">
              {HOURS.map((hour) => (
                <button
                  type="button"
                  key={hour}
                  className={`h-10 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-input-bg)] font-bold text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedHour === hour
                      ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                      : ""
                  }`}
                  disabled={isHourDisabled(hour)}
                  onClick={() => setSelectedHour(hour)}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          <div className="self-center text-[22px] font-black text-[var(--color-deactive)]">:</div>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-center text-[12px] font-bold text-[var(--color-deactive)]">분</span>
            <div className="grid max-h-[260px] gap-2 overflow-y-auto pr-1">
              {MINUTES.map((minute) => (
                <button
                  type="button"
                  key={minute}
                  className={`h-10 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-input-bg)] font-bold text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedMinute === minute
                      ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                      : ""
                  }`}
                  disabled={isMinuteDisabled(minute)}
                  onClick={() => setSelectedMinute(minute)}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="[width:100%] [min-height:42px] [margin-top:16px] [border:0] [border-radius:12px] [background:var(--color-active)] [color:white] [font-size:14px] [font-weight:900] [cursor:pointer] disabled:[opacity:0.35] disabled:[cursor:not-allowed]"
          disabled={confirmDisabled}
          onClick={() => {
            onSelect(nextTime);
            onClose();
          }}
        >
          선택 완료
        </button>
      </div>
    </div>
  );
}

export default function WritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState(() => getDefaultTime());
  const [place, setPlace] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState(STATUS_OPEN);
  const [categories, setCategories] = useState({});
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    createDateFromKey(todayString()),
  );
  const today = todayString();
  const maxDate = nextYearTodayString();
  const currentTime = currentTimeString();
  const isPastTimeSlot = (slot) => !isEdit && date === today && slot < currentTime;

  const handleDateChange = (nextDate) => {
    setDate(nextDate);
    setCalendarMonth(createDateFromKey(nextDate));
    if (!isEdit && nextDate === today && time < currentTime) {
      setTime(getDefaultTime());
    }
  };

  useEffect(() => {
    if (!isEdit) return;

    const fetchPostData = async () => {
      try {
        const post = await getPost(id);
        setTitle(post.title || "");
        setContent(post.content || "");
        setDate(post.date ? String(post.date).slice(0, 10) : todayString());
        setTime(post.time ? String(post.time).slice(0, 5) : "");
        setPlace(post.place || "");
        setLatitude(post.latitude || null);
        setLongitude(post.longitude || null);
        setCapacity(post.capacity || 2);
        setStatus(post.status || STATUS_OPEN);
        setCategories(post.categories || {});

        if (post.image) {
          setExistingImage(post.image);
          setImage({ preview: post.image });
        } else {
          setExistingImage("");
          setImage(null);
        }
      } catch (err) {
        console.error("Failed to load post:", err);
        toast.error("게시글을 불러오지 못했습니다.");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [id, isEdit, navigate]);

  const handlePlaceSelect = (item) => {
    setPlace(item.place_name);
    setLatitude(Number(item.y));
    setLongitude(Number(item.x));
    setIsSearchOpen(false);
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    if (date < today) {
      toast.error("오늘 이전 날짜는 선택할 수 없습니다.");
      setDate(today);
      return;
    }

    if (date > maxDate) {
      toast.error("약속 날짜는 최대 내년 오늘까지 선택할 수 있습니다.");
      setDate(maxDate);
      return;
    }

    if (date === today && time < currentTime) {
      toast.error("현재 시간 이전은 선택할 수 없습니다.");
      setTime(currentTime);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("date", date);
    formData.append("time", time);
    formData.append("place", place.trim());
    formData.append("latitude", latitude || "");
    formData.append("longitude", longitude || "");
    formData.append("capacity", capacity);
    formData.append("status", status);
    formData.append("user_id", userId);
    formData.append("categories", JSON.stringify(categories));

    if (image?.file) {
      formData.append("image", image.file);
    } else if (existingImage) {
      formData.append("existingImage", existingImage);
    } else {
      formData.append("existingImage", "");
    }

    try {
      setIsSaving(true);
      if (isEdit) {
        await updatePost(id, formData);
        toast.success("게시글을 수정했습니다.");
        navigate(`/detail/${id}`);
      } else {
        const result = await createPost(formData);
        toast.success("게시글을 등록했습니다.");
        navigate(result?.id ? `/chat-rooms/${result.id}` : "/");
      }
    } catch (err) {
      console.error("Failed to save post:", err);
      toast.error(err.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="[max-width:900px] [margin:0_auto] [padding:16px] [padding-top:24px]">
        <h2 className="[font-size:18px] [font-weight:800] [color:var(--color-text)]">불러오는 중...</h2>
      </main>
    );
  }

  return (
    <main className="[max-width:900px] [margin:0_auto] [padding:16px] [padding-top:24px]">
      <div className="[display:flex] [align-items:center] [margin-bottom:20px]">
        <button className="[background:none] [border:none] [width:36px] [height:36px] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [cursor:pointer] [color:var(--color-text)] [margin-right:10px] [transition:background_0.15s] hover:[background:var(--color-border)]" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="[font-size:18px] [font-weight:800] [color:var(--color-text)]">
          {isEdit ? "게시글 수정" : "게시글 작성"}
        </h2>
      </div>

      <div className="[display:flex] [flex-direction:column] [gap:20px] [background:var(--color-sidebar)] [padding:24px] [border-radius:18px] [border:1.5px_solid_var(--color-border)]">
        <div className="[display:flex] [flex-direction:column] [gap:8px]">
          <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">제목</label>
          <input
            className="[width:100%] [padding:12px_16px] [border:1.5px_solid_var(--color-border)] [border-radius:12px] [font-size:14px] [font-family:inherit] [background:var(--color-input-bg)] [color:var(--color-text)] [outline:none] [transition:all_0.2s] [box-sizing:border-box] [border-color:var(--color-active)] [background:var(--color-input-focus-bg)] disabled:[opacity:0.5] disabled:[cursor:not-allowed] disabled:[background:var(--color-bg)]"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="[display:flex] [flex-direction:column] [gap:8px]">
          <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">내용</label>
          <textarea
            className="[width:100%] [padding:14px_16px] [border:1.5px_solid_var(--color-border)] [border-radius:12px] [font-size:14px] [font-family:inherit] [background:var(--color-input-bg)] [color:var(--color-text)] [resize:none] [min-height:150px] [outline:none] [line-height:1.6] [box-sizing:border-box] focus:[border-color:var(--color-active)] focus:[background:var(--color-input-focus-bg)]"
            placeholder="어떤 활동을 함께 하고 싶나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:15px] [grid-template-columns:1fr]">
          <div className="[display:flex] [flex-direction:column] [gap:8px]">
            <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">
              약속 날짜 {isEdit && "(수정 불가)"}
            </label>
            <button
              type="button"
              className="[width:100%] [display:flex] [flex-direction:column] [align-items:flex-start] [gap:6px] [min-height:72px] [padding:14px_16px] [border:1.5px_solid_var(--color-border)] [border-radius:18px] [background:linear-gradient(135deg,_rgba(148,_163,_184,_0.16),_rgba(7,_177,_188,_0.07)),_var(--color-input-bg)] [color:var(--color-text)] [cursor:pointer] [text-align:left] [transition:transform_0.16s_ease,_border-color_0.16s_ease,_background_0.16s_ease] [transform:translateY(-1px)] [border-color:var(--color-deactive)] [background:linear-gradient(135deg,_rgba(148,_163,_184,_0.22),_rgba(7,_177,_188,_0.1)),_var(--color-input-bg)] disabled:[opacity:0.45] disabled:[cursor:not-allowed] [&_span]:[color:var(--color-deactive)] [&_span]:[font-size:11px] [&_span]:[font-weight:900] [&_strong]:[color:var(--color-text)] [&_strong]:[font-size:17px] [&_strong]:[font-weight:900] [&_strong]:[letter-spacing:-0.02em]"
              onClick={() => !isEdit && setIsDatePickerOpen(true)}
              disabled={isEdit}
            >
              <span>선택한 날짜</span>
              <strong>{formatDateLabel(date)}</strong>
            </button>
          </div>
          <div className="[display:flex] [flex-direction:column] [gap:8px]">
            <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">
              약속 시간 {isEdit && "(수정 불가)"}
            </label>
            <button
              type="button"
              className="[width:100%] [display:flex] [flex-direction:column] [align-items:flex-start] [gap:6px] [min-height:72px] [padding:14px_16px] [border:1.5px_solid_var(--color-border)] [border-radius:18px] [background:linear-gradient(135deg,_rgba(148,_163,_184,_0.16),_rgba(7,_177,_188,_0.07)),_var(--color-input-bg)] [color:var(--color-text)] [cursor:pointer] [text-align:left] [transition:transform_0.16s_ease,_border-color_0.16s_ease,_background_0.16s_ease] [transform:translateY(-1px)] [border-color:var(--color-deactive)] [background:linear-gradient(135deg,_rgba(148,_163,_184,_0.22),_rgba(7,_177,_188,_0.1)),_var(--color-input-bg)] disabled:[opacity:0.45] disabled:[cursor:not-allowed] [&_span]:[color:var(--color-deactive)] [&_span]:[font-size:11px] [&_span]:[font-weight:900] [&_strong]:[color:var(--color-text)] [&_strong]:[font-size:17px] [&_strong]:[font-weight:900] [&_strong]:[letter-spacing:-0.02em]"
              onClick={() => !isEdit && setIsTimePickerOpen(true)}
              disabled={isEdit}
            >
              <span>선택한 시간</span>
              <strong>{time ? formatTimeLabel(time) : "시간 선택"}</strong>
            </button>
          </div>
        </div>

        <div className="[display:flex] [flex-direction:column] [gap:8px]">
          <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">약속 장소</label>
          <div className="[display:flex] [gap:8px]">
            <input
              className="[width:100%] [padding:12px_16px] [border:1.5px_solid_var(--color-border)] [border-radius:12px] [font-size:14px] [font-family:inherit] [background:var(--color-input-bg)] [color:var(--color-text)] [outline:none] [transition:all_0.2s] [box-sizing:border-box] [border-color:var(--color-active)] [background:var(--color-input-focus-bg)] disabled:[opacity:0.5] disabled:[cursor:not-allowed] disabled:[background:var(--color-bg)]"
              placeholder="장소 이름 또는 주소"
              value={place}
              readOnly
            />
            <button className="[flex-shrink:0] [padding:0_16px] [background:var(--color-active)] [color:white] [border:none] [border-radius:12px] [font-size:13px] [font-weight:700] [cursor:pointer] [transition:opacity_0.2s] hover:[opacity:0.9]" onClick={() => setIsSearchOpen(true)}>
              지도에서 찾기
            </button>
          </div>

          {latitude && longitude && (
            <div className="[text-align:center] [margin-top:10px]">
              <MapPreview latitude={latitude} longitude={longitude} />
              <p className="[font-size:12px] [color:#888] [margin-top:4px]">선택한 장소의 위치입니다.</p>
            </div>
          )}
        </div>

        <div className="[display:flex] [flex-direction:column] [gap:8px]">
          <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">
            모집 인원 (2~10명) {isEdit && "(수정 불가)"}
          </label>
          <div className="[display:flex] [align-items:center] [gap:14px]">
            <button
              type="button"
              className="[width:40px] [height:40px] [border-radius:8px] [border:1.5px_solid_var(--color-border)] [background:var(--color-input-bg)] [font-size:20px] [font-weight:500] [cursor:pointer] [display:flex] [align-items:center] [justify-content:center] [color:var(--color-text)] [transition:all_0.2s_ease] [border-color:var(--color-active)] [background:var(--color-input-focus-bg)] [color:var(--color-active)] disabled:[opacity:0.2] disabled:[cursor:not-allowed]"
              onClick={() => setCapacity((value) => Math.max(2, value - 1))}
              disabled={isEdit || capacity <= 2}
            >
              -
            </button>
            <span className="[font-size:18px] [font-weight:800] [min-width:50px] [text-align:center] [color:var(--color-text)]">{capacity}명</span>
            <button
              type="button"
              className="[width:40px] [height:40px] [border-radius:8px] [border:1.5px_solid_var(--color-border)] [background:var(--color-input-bg)] [font-size:20px] [font-weight:500] [cursor:pointer] [display:flex] [align-items:center] [justify-content:center] [color:var(--color-text)] [transition:all_0.2s_ease] [border-color:var(--color-active)] [background:var(--color-input-focus-bg)] [color:var(--color-active)] disabled:[opacity:0.2] disabled:[cursor:not-allowed]"
              onClick={() => setCapacity((value) => Math.min(10, value + 1))}
              disabled={isEdit || capacity >= 10}
            >
              +
            </button>
          </div>
        </div>

        <div className="[display:flex] [flex-direction:column] [gap:8px]">
          <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">카테고리</label>
          <CategorySelector
            selected={categories}
            onChange={setCategories}
            exclude={WRITE_CATEGORY_EXCLUDES}
          />
        </div>

        <div className="[display:flex] [flex-direction:column] [gap:8px]">
          <label className="[font-size:12px] [font-weight:700] [color:var(--color-text)] [opacity:0.8]">이미지 (선택)</label>
          <ImageDropZone
            value={image}
            onChange={(val) => {
              if (!val) {
                setImage(null);
                setExistingImage("");
              } else {
                setImage(val);
              }
            }}
          />
        </div>

        <button
          className={`[width:100%] [padding:16px] [background:var(--color-active)] [color:white] [border:none] [border-radius:12px] [font-size:16px] [font-weight:800] [cursor:pointer] [transition:all_0.2s] [box-shadow:0_4px_12px_rgba(253,_147,_25,_0.2)] hover:[opacity:0.9] hover:[transform:translateY(-1px)] active:[transform:scale(0.98)] disabled:[opacity:0.75] disabled:[cursor:not-allowed] disabled:[transform:none] ${isSaving ? "[font-size:0] after:[content:attr(data-saving-label)] after:[font-size:16px]" : ""}`}
          onClick={handleSubmit}
          disabled={isSaving}
          data-saving-label={image?.file ? "이미지 업로드 중..." : "저장 중..."}
        >
          {isEdit ? "수정 완료" : "등록하기"}
        </button>
      </div>

      {isSearchOpen && (
        <PlaceSearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelect={handlePlaceSelect}
        />
      )}

      {isDatePickerOpen && (
        <DatePickerModal
          calendarMonth={calendarMonth}
          minDate={today}
          maxDate={maxDate}
          selectedDate={date}
          setCalendarMonth={setCalendarMonth}
          onSelect={handleDateChange}
          onClose={() => setIsDatePickerOpen(false)}
        />
      )}

      {isTimePickerOpen && (
        <TimePickerModal
          isPastTimeSlot={isPastTimeSlot}
          selectedTime={time}
          onSelect={setTime}
          onClose={() => setIsTimePickerOpen(false)}
        />
      )}
    </main>
  );
}
