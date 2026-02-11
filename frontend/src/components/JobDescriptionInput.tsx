'use client';

import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobDescriptionInput({
  value,
  onChange,
  disabled,
}: JobDescriptionInputProps) {
  const isValid = value.length >= 50;

  return (
    <div className="w-full flex flex-col gap-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[280px]"
        placeholder={`Paste the job description here...

Example:
We are seeking a Senior Software Engineer with:
• 5+ years building scalable web applications
• Strong experience with React, TypeScript, Node.js
• Cloud platform expertise (AWS/GCP/Azure)
• Excellent problem-solving and communication skills`}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${isValid ? 'bg-primary' : 'bg-muted-foreground/30'
            }`} />
          <span className="text-xs text-muted-foreground">
            {value.length} characters
          </span>
        </div>

        {value.length > 0 && !isValid && (
          <Badge variant="warning" className="text-xs">
            Min 50 characters
          </Badge>
        )}
      </div>
    </div>
  );
}
