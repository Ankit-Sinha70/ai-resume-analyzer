import { Skills } from './Skills';

export class Resume {
  id?: string;
  fileName: string;
  extractedText: string;
  skills: Skills;
  uploadedAt: Date;

  constructor(data: {
    id?: string;
    fileName: string;
    extractedText: string;
    skills?: Skills;
    uploadedAt?: Date;
  }) {
    this.id = data.id;
    this.fileName = data.fileName;
    this.extractedText = data.extractedText;
    this.skills = data.skills || new Skills();
    this.uploadedAt = data.uploadedAt || new Date();
  }

  hasText(): boolean {
    return this.extractedText.trim().length > 0;
  }
}
