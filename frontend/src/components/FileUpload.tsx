'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, CheckCircle2, File } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
  onError?: (message: string) => void;
}

export function FileUpload({ file, onFileChange, disabled, error, onError }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
        onError?.('');
        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
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

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            {...(getRootProps() as any)}
            className={`
              relative group cursor-pointer
              rounded-2xl border-2 border-dashed
              flex flex-col items-center justify-center
              p-8 text-center transition-all duration-300
              ${isDragActive
                ? 'border-primary-500 bg-primary-50/50 scale-[1.02] shadow-lg ring-4 ring-primary-100'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
              ${error ? 'border-red-300 bg-red-50/10' : ''}
            `}
          >
            <input {...getInputProps()} />

            <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isDragActive ? 'Drop your resume now' : 'Click or drag to upload'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              PDF format (max 10MB)
            </p>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 font-medium"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative overflow-hidden bg-white/50 border border-primary-200 rounded-2xl p-4 shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600">
                  <FileText className="w-6 h-6" />
                </div>
                {uploadProgress === 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </motion.div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <button
                onClick={removeFile}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
