import { useCallback, useRef } from "react";
import { uploadChatFile } from "../api/chat";
import { createPendingFileId } from "../utils/chatHelpers";

export const useFileUpload = ({ setPendingFiles, fileInputRef, inputRef }) => {
  const pendingFilesRef = useRef([]);

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [setPendingFiles, fileInputRef]);

  const addPendingFiles = useCallback((fileList) => {
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
  }, [setPendingFiles, fileInputRef, inputRef]);

  const removePendingFile = useCallback((id) => {
    setPendingFiles((prev) => {
      const next = [];
      prev.forEach((item) => {
        if (item.id === id) URL.revokeObjectURL(item.previewUrl);
        else next.push(item);
      });
      return next;
    });
  }, [setPendingFiles]);

  const buildMessageContent = useCallback(async (input, pendingFiles) => {
    const text = input.trim();
    if (pendingFiles.length === 0) return text;

    const uploads = await Promise.all(
      pendingFiles.map((item) => uploadChatFile(item.file)),
    );
    return JSON.stringify({
      kind: "chat_payload",
      text,
      attachments: uploads.map((uploaded) => ({
        url: uploaded.url,
        downloadUrl: uploaded.downloadUrl,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        name: uploaded.name,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
      })),
    });
  }, []);

  const handlePaste = (e, addFiles) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length > 0) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const handleDrop = (e, addFiles) => {
    e.preventDefault();
    addFiles(e.dataTransfer?.files);
  };

  return {
    pendingFilesRef,
    clearPendingFiles,
    addPendingFiles,
    removePendingFile,
    buildMessageContent,
    handlePaste,
    handleDrop,
  };
};
