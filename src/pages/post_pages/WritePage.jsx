import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  STATUS_OPEN,
  currentTimeString,
  nextYearTodayString,
  todayString,
} from "../../api/homeConstants";
import { createPost, getPost, updatePost } from "../../api/posts";
import { useAuth } from "../../context/AuthContext.jsx";
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

const fieldClass =
  "write-light-control w-full rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-[border-color,background-color] focus:border-[var(--color-active)] focus:bg-[var(--color-input-focus-bg)] disabled:cursor-not-allowed disabled:opacity-50";
const labelClass = "text-xs font-bold text-[var(--color-text)] opacity-80";
const pickerButtonClass =
  "write-light-control flex min-h-[72px] w-full flex-col items-start gap-1.5 rounded-[18px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] px-4 py-3.5 text-left text-[var(--color-text)] transition-[border-color,transform,background-color] hover:-translate-y-px hover:border-[var(--color-deactive)] disabled:cursor-not-allowed disabled:opacity-45";

const formatTimeLabel = (value) => {
  const [hourText, minute = "00"] = String(value || "").split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return "시간 선택";
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
    <div
      className="fixed inset-0 z-[12000] flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-[18px] backdrop-blur-[5px]"
      onMouseDown={onClose}
    >
      <div
        className="write-light-surface max-h-[min(760px,88vh)] w-[min(520px,100%)] overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-sidebar)] p-[22px] text-[var(--color-text)] shadow-[0_24px_70px_rgba(0,0,0,0.42)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-[18px] flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[var(--color-deactive)]">
              약속 날짜
            </span>
            <h3 className="mt-1 text-[21px] font-black">
              {formatDateLabel(selectedDate)}
            </h3>
          </div>
          <button
            type="button"
            className="write-light-control h-[34px] w-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[22px] leading-none text-[var(--color-text)]"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="mb-3.5 grid grid-cols-[72px_1fr_72px] items-center gap-2.5">
          <button
            type="button"
            className="write-light-control min-h-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] font-extrabold disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => setCalendarMonth(new Date(viewYear, viewMonth - 1, 1))}
            disabled={!canMovePrev}
          >
            이전
          </button>
          <strong className="text-center text-base font-black">{monthLabel}</strong>
          <button
            type="button"
            className="write-light-control min-h-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] font-extrabold disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => setCalendarMonth(new Date(viewYear, viewMonth + 1, 1))}
            disabled={!canMoveNext}
          >
            다음
          </button>
        </div>

        <div className="grid min-h-[356px] grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div
              className="py-1.5 text-center text-xs font-black text-[var(--color-deactive)]"
              key={day}
            >
              {day}
            </div>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) {
              return (
                <div
                  className="aspect-square rounded-[14px] border border-transparent bg-[color-mix(in_srgb,var(--color-input-bg)_42%,transparent)] opacity-35"
                  key={`blank-${index}`}
                />
              );
            }

            const dateKey = toDateKey(new Date(viewYear, viewMonth, day));
            const disabled = dateKey < minDate || dateKey > maxDate;
            const selected = dateKey === selectedDate;
            return (
              <button
                type="button"
                key={dateKey}
                className={`write-light-control aspect-square rounded-[14px] border font-black transition-[transform,border-color,background-color] disabled:cursor-not-allowed disabled:opacity-25 ${
                  selected
                    ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] hover:-translate-y-px hover:border-[var(--color-deactive)]"
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

function TimePickerModal({ isPastTimeSlot, onClose, onSelect, selectedTime }) {
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
    <div
      className="fixed inset-0 z-[12000] flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-[18px] backdrop-blur-[5px]"
      onMouseDown={onClose}
    >
      <div
        className="write-light-surface max-h-[min(760px,88vh)] w-[min(520px,100%)] overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-sidebar)] p-[22px] text-[var(--color-text)] shadow-[0_24px_70px_rgba(0,0,0,0.42)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-[18px] flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[var(--color-deactive)]">
              약속 시간
            </span>
            <h3 className="mt-1 text-[21px] font-black">
              {formatTimeLabel(nextTime)}
            </h3>
          </div>
          <button
            type="button"
            className="write-light-control h-[34px] w-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[22px] leading-none text-[var(--color-text)]"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3.5">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-center text-xs font-bold text-[var(--color-deactive)]">
              시
            </span>
            <div className="grid max-h-[260px] gap-2 overflow-y-auto pr-1">
              {HOURS.map((hour) => (
                <button
                  type="button"
                  key={hour}
                  className={`write-light-control h-10 rounded-xl border font-bold disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedHour === hour
                      ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)]"
                  }`}
                  disabled={isHourDisabled(hour)}
                  onClick={() => setSelectedHour(hour)}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          <div className="self-center text-[22px] font-black text-[var(--color-deactive)]">
            :
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-center text-xs font-bold text-[var(--color-deactive)]">
              분
            </span>
            <div className="grid max-h-[260px] gap-2 overflow-y-auto pr-1">
              {MINUTES.map((minute) => (
                <button
                  type="button"
                  key={minute}
                  className={`write-light-control h-10 rounded-xl border font-bold disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedMinute === minute
                      ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)]"
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
          className="mt-4 min-h-[42px] w-full rounded-xl border-0 bg-[var(--color-active)] text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-35"
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
  const isPastTimeSlot = (slot) =>
    !isEdit && date === today && slot < currentTime;

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
        toast.success("게시글이 수정되었습니다.");
        navigate(`/detail/${id}`);
      } else {
        const result = await createPost(formData);
        toast.success("게시글이 등록되었습니다.");
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
      <main className="mx-auto max-w-[900px] px-4 pt-6">
        <h2 className="text-lg font-extrabold text-[var(--color-text)]">
          불러오는 중...
        </h2>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[900px] px-4 pt-6">
      <div className="mb-5 flex items-center">
        <button
          type="button"
          className="mr-2.5 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-[var(--color-text)] transition-colors hover:bg-[var(--color-border)]"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-lg font-extrabold text-[var(--color-text)]">
          {isEdit ? "게시글 수정" : "게시글 작성"}
        </h2>
      </div>

      <div className="write-light-surface flex flex-col gap-5 rounded-[18px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-sidebar)] p-6">
        <div className="flex flex-col gap-2">
          <label className={labelClass}>제목</label>
          <input
            className={fieldClass}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>내용</label>
          <textarea
            className={`${fieldClass} min-h-[150px] resize-none leading-relaxed`}
            placeholder="어떤 활동을 함께 하고 싶나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              약속 날짜 {isEdit && "(수정 불가)"}
            </label>
            <button
              type="button"
              className={pickerButtonClass}
              onClick={() => !isEdit && setIsDatePickerOpen(true)}
              disabled={isEdit}
            >
              <span className="text-[11px] font-black text-[var(--color-deactive)]">
                선택한 날짜
              </span>
              <strong className="text-[17px] font-black">
                {formatDateLabel(date)}
              </strong>
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              약속 시간 {isEdit && "(수정 불가)"}
            </label>
            <button
              type="button"
              className={pickerButtonClass}
              onClick={() => !isEdit && setIsTimePickerOpen(true)}
              disabled={isEdit}
            >
              <span className="text-[11px] font-black text-[var(--color-deactive)]">
                선택한 시간
              </span>
              <strong className="text-[17px] font-black">
                {time ? formatTimeLabel(time) : "시간 선택"}
              </strong>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>약속 장소</label>
          <div className="flex gap-2">
            <input
              className={fieldClass}
              placeholder="장소 이름 또는 주소"
              value={place}
              readOnly
            />
            <button
              type="button"
              className="shrink-0 rounded-xl border-0 bg-[var(--color-active)] px-4 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
              onClick={() => setIsSearchOpen(true)}
            >
              지도에서 찾기
            </button>
          </div>

          {latitude && longitude && (
            <div className="mt-2.5 text-center">
              <MapPreview latitude={latitude} longitude={longitude} />
              <p className="mt-1 text-xs text-[#888]">
                선택한 장소의 위치입니다.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            모집 인원 (2~10명) {isEdit && "(수정 불가)"}
          </label>
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              className="write-light-control flex h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] text-xl font-medium text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-20"
              onClick={() => setCapacity((value) => Math.max(2, value - 1))}
              disabled={isEdit || capacity <= 2}
            >
              -
            </button>
            <span className="min-w-[50px] text-center text-lg font-extrabold text-[var(--color-text)]">
              {capacity}명
            </span>
            <button
              type="button"
              className="write-light-control flex h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] text-xl font-medium text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-20"
              onClick={() => setCapacity((value) => Math.min(10, value + 1))}
              disabled={isEdit || capacity >= 10}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>카테고리</label>
          <CategorySelector
            selected={categories}
            onChange={setCategories}
            exclude={WRITE_CATEGORY_EXCLUDES}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>이미지 (선택)</label>
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
          type="button"
          className={`w-full rounded-xl border-0 bg-[var(--color-active)] p-4 text-base font-extrabold text-white shadow-[0_4px_12px_rgba(253,147,25,0.2)] transition-all hover:-translate-y-px hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 disabled:transform-none ${
            isSaving
              ? "text-[0px] after:text-base after:content-[attr(data-saving-label)]"
              : ""
          }`}
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
