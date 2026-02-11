'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileCheck, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
  onError?: (message: string) => void;
}

export function FileUpload({ file, onFileChange, disabled, error, onError }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        onFileChange(selectedFile);
        onError?.('');

        setIsUploading(true);
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              return 100;
            }
            return prev + 10;
          });
        }, 50);
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
    maxSize: 10 * 1024 * 1024,
    disabled: disabled || isUploading,
    onDropRejected: (rejections) => {
      const first = rejections[0];
      if (!first) return;
      const reason = first.errors?.[0];
      if (reason) {
        if (reason.code === 'file-too-large') {
          onError?.('File size exceeds 10MB limit.');
        } else if (reason.code === 'file-invalid-type') {
          onError?.('Please upload a PDF file.');
        } else {
          onError?.(reason.message || 'Upload failed.');
        }
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...(getRootProps() as any)}
            className={`
              relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center
              transition-all duration-200
              ${isDragActive
                ? 'border-primary bg-accent/50 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${error ? 'border-destructive/50' : ''}
            `}
          >
            <input {...getInputProps()} />

            <div className={`
              inline-flex p-4 rounded-xl mb-4 transition-all duration-200
              ${isDragActive
                ? 'bg-primary text-primary-foreground shadow-md scale-110'
                : 'bg-muted text-muted-foreground'
              }
            `}>
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to browse · PDF only, max 10MB
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-accent-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">{file.name}</h3>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="h-7 w-7 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {isUploading && (
                  <div className="mt-3">
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
