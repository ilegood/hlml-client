import { useCallback, useEffect, useRef, useState } from "react";

const createPendingFileId = (file) =>
  `${file.name}-${file.size}-${file.lastModified}-${
    crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
  }`;

export const usePendingChatFiles = ({ inputRef, fileInputRef }) => {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [fileAccept, setFileAccept] = useState("");
  const pendingFilesRef = useRef([]);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    };
  }, []);

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [fileInputRef]);

  const addPendingFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);
      if (files.length === 0) return;

      setPendingFiles((prev) => [
        ...prev,
        ...files.map((file) => ({
          id: createPendingFileId(file),
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [fileInputRef, inputRef],
  );

  const openFilePicker = useCallback(
    (accept) => {
      setFileAccept(accept);
      setShowAttachMenu(false);
      window.setTimeout(() => fileInputRef.current?.click(), 0);
    },
    [fileInputRef],
  );

  const removePendingFile = useCallback((id) => {
    setPendingFiles((prev) => {
      const next = [];
      prev.forEach((item) => {
        if (item.id === id) URL.revokeObjectURL(item.previewUrl);
        else next.push(item);
      });
      return next;
    });
  }, []);

  return {
    pendingFiles,
    showAttachMenu,
    setShowAttachMenu,
    fileAccept,
    clearPendingFiles,
    addPendingFiles,
    openFilePicker,
    removePendingFile,
  };
};
