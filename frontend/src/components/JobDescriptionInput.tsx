'use client';

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
    <div className="w-full flex flex-col h-full">
      <div className="relative flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste the job description here...

Example:
We are seeking a Senior Software Engineer with:
• 5+ years building scalable web applications
• Strong experience with React, TypeScript, Node.js
• Cloud platform expertise (AWS/GCP/Azure)
• Excellent problem-solving and communication skills"
          className="w-full h-full min-h-[280px] p-4 bg-background border border-border rounded-lg resize-none
                     focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                     disabled:cursor-not-allowed disabled:opacity-50
                     placeholder:text-muted-foreground
                     text-foreground text-sm leading-relaxed
                     transition-all duration-200"
        />
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full transition-colors ${isValid ? 'bg-primary-500' : 'bg-muted-foreground/30'
            }`} />
          <span className="text-xs text-muted-foreground">
            {value.length} characters
          </span>
        </div>

        {value.length > 0 && !isValid && (
          <span className="text-xs text-amber-600 dark:text-amber-500">
            Minimum 50 characters required
          </span>
        )}
      </div>
    </div>
  );
}
