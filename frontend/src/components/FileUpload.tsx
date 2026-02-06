'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
  onError?: (message: string) => void;
}

export function FileUpload({ file, onFileChange, disabled, error, onError }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
        onError?.('');
      }
    },
    [onFileChange, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled,
    onDropRejected: (rejections) => {
      const first = rejections[0];
      if (!first) return;
      const reason = first.errors?.[0];
      if (reason) {
        if (reason.code === 'file-too-large') {
          onError?.('File is too large. Max size is 10MB.');
          return;
        }
        if (reason.code === 'file-invalid-type') {
          onError?.('Only PDF files are allowed.');
          return;
        }
        onError?.(reason.message || 'File was rejected.');
      }
    },
  });

  const removeFile = () => {
    onFileChange(null);
  };

  if (file) {
    return (
      <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary-600" />
          <div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={removeFile}
          disabled={disabled}
          className="p-1 hover:bg-primary-100 rounded-full transition-colors"
          aria-label="Remove file"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-primary-600 font-medium">Drop your resume here...</p>
      ) : (
        <>
          <p className="text-gray-700 font-medium mb-1">
            Drag & drop your resume here
          </p>
          <p className="text-gray-500 text-sm">or click to browse</p>
          <p className="text-gray-400 text-xs mt-2">PDF only, max 10MB</p>
        </>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
