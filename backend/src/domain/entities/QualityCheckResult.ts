export interface QualityCheckResultData {
    isSuitable: boolean;
    quality: 'excellent' | 'good' | 'average' | 'poor';
    issues: string[];
    summary: string;
}

export class QualityCheckResult {
    isSuitable: boolean;
    quality: 'excellent' | 'good' | 'average' | 'poor';
    issues: string[];
    summary: string;

    constructor(data: QualityCheckResultData) {
        this.isSuitable = data.isSuitable;
        this.quality = data.quality;
        this.issues = data.issues || [];
        this.summary = data.summary || '';
    }

    toJSON(): QualityCheckResultData {
        return {
            isSuitable: this.isSuitable,
            quality: this.quality,
            issues: this.issues,
            summary: this.summary,
        };
    }
}
