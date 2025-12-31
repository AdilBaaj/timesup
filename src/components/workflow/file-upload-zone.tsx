"use client";

import { useCallback } from "react";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { expectedFiles } from "@/data/mock-data";
import type { UploadedFile } from "@/hooks/use-workflow";

interface FileUploadZoneProps {
  uploadedFiles: UploadedFile[];
  onFileAdd: (file: File) => void;
  onFileRemove: (fileName: string) => void;
  disabled?: boolean;
}

export function FileUploadZone({
  uploadedFiles,
  onFileAdd,
  onFileRemove,
  disabled,
}: FileUploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".pptx") ||
          file.name.endsWith(".ppt")
        ) {
          onFileAdd(file);
        }
      });
    },
    [onFileAdd, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const files = Array.from(e.target.files || []);
      files.forEach((file) => onFileAdd(file));
    },
    [onFileAdd, disabled]
  );

  const isFileUploaded = (fileName: string) =>
    uploadedFiles.some((f) => f.name === fileName);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
      <h3 className="text-sm font-semibold text-white mb-4">Input Files</h3>

      {/* Expected files checklist */}
      <div className="space-y-2 mb-4">
        {expectedFiles.map((file) => {
          const uploaded = isFileUploaded(file.name);
          return (
            <div
              key={file.name}
              className={cn(
                "flex items-center gap-2 text-sm p-2 rounded-lg",
                uploaded ? "bg-emerald-900/20" : "bg-zinc-800/50"
              )}
            >
              {uploaded ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-zinc-600" />
              )}
              <span
                className={cn(
                  uploaded ? "text-emerald-400" : "text-zinc-400"
                )}
              >
                {file.name}
              </span>
              <span className="text-xs text-zinc-600">{file.type}</span>
            </div>
          );
        })}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          disabled
            ? "border-zinc-700 bg-zinc-800/30 cursor-not-allowed"
            : "border-zinc-600 hover:border-zinc-500 cursor-pointer"
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".xlsx,.xls,.pptx,.ppt"
          multiple
          onChange={handleFileInput}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "flex flex-col items-center gap-2",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          <Upload
            className={cn(
              "w-8 h-8",
              disabled ? "text-zinc-600" : "text-zinc-400"
            )}
          />
          <span
            className={cn(
              "text-sm",
              disabled ? "text-zinc-600" : "text-zinc-400"
            )}
          >
            {disabled ? "Workflow running..." : "Drop files or click to upload"}
          </span>
          <span className="text-xs text-zinc-600">
            Excel (.xlsx) or PowerPoint (.pptx)
          </span>
        </label>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-medium text-zinc-500 uppercase">
            Uploaded
          </h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">{file.name}</span>
                <span className="text-xs text-zinc-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
              {!disabled && (
                <button
                  onClick={() => onFileRemove(file.name)}
                  className="p-1 hover:bg-zinc-700 rounded"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
