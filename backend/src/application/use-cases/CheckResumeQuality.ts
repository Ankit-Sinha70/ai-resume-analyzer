import { QualityCheckResult } from '../../domain/entities';
import { AIService, PdfParseService, logger } from '../../infrastructure';

interface CheckResumeQualityInput {
    resumeBuffer: Buffer;
    fileName: string;
}

export class CheckResumeQuality {
    private pdfService: PdfParseService;
    private aiService: AIService;

    constructor() {
        this.pdfService = new PdfParseService();
        this.aiService = new AIService();
    }

    async execute(input: CheckResumeQualityInput): Promise<QualityCheckResult> {
        logger.info('Starting resume quality check', { fileName: input.fileName });

        // Step 1: Extract text from PDF
        logger.debug('Extracting text from PDF...');
        const extractedText = await this.pdfService.extractText(input.resumeBuffer);

        if (!extractedText || extractedText.trim().length === 0) {
            logger.warn('Use case: Empty text extracted from PDF');
            return new QualityCheckResult({
                isSuitable: false,
                quality: 'poor',
                issues: ['Could not extract any text from the resume PDF. It might be an image-based PDF or corrupted.'],
                summary: 'The resume content is unreadable.',
            });
        }

        // Step 2: Check quality using AI
        logger.debug('Checking quality with AI...');
        const result = await this.aiService.checkQuality(extractedText);

        logger.info('Resume quality check completed', {
            isSuitable: result.isSuitable,
            quality: result.quality,
        });

        return result;
    }
}
