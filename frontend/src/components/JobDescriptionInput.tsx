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
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with experience in:
- React, TypeScript, and Node.js
- Building scalable web applications
- RESTful APIs and microservices
- Cloud platforms (AWS/GCP/Azure)
- Strong problem-solving skills"
        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   disabled:bg-gray-100 disabled:cursor-not-allowed
                   placeholder:text-gray-400"
      />
      <p className="mt-2 text-sm text-gray-500">
        {value.length} characters
        {value.length > 0 && value.length < 50 && (
          <span className="text-amber-600"> (minimum 50 characters)</span>
        )}
      </p>
    </div>
  );
}
