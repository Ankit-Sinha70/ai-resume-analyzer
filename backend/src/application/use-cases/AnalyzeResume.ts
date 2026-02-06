import { Resume, AnalysisResult, Skills } from '../../domain/entities';
import { AIService, PdfParseService, logger } from '../../infrastructure';
import { MatchJobDescription } from './MatchJobDescription';

interface AnalyzeResumeInput {
  resumeBuffer: Buffer;
  fileName: string;
  jobDescription: string;
}

export class AnalyzeResume {
  private pdfService: PdfParseService;
  private aiService: AIService;
  private matchService: MatchJobDescription;

  constructor() {
    this.pdfService = new PdfParseService();
    this.aiService = new AIService();
    this.matchService = new MatchJobDescription();
  }

  async execute(input: AnalyzeResumeInput): Promise<AnalysisResult> {
    logger.info('Starting resume analysis', { fileName: input.fileName });

    // Step 1: Extract text from PDF
    logger.debug('Extracting text from PDF...');
    const extractedText = await this.pdfService.extractText(input.resumeBuffer);

    // Create Resume entity
    const resume = new Resume({
      fileName: input.fileName,
      extractedText,
    });

    if (!resume.hasText()) {
      throw new Error('Could not extract readable text from the resume PDF');
    }

    // Step 2: Extract skills from resume using AI
    logger.debug('Extracting skills from resume...');
    const resumeSkills = await this.aiService.extractSkills(extractedText);
    resume.skills = resumeSkills;

    // Step 3: Extract skills from job description using AI
    logger.debug('Extracting skills from job description...');
    const jobSkills = await this.aiService.extractSkills(input.jobDescription);

    if (jobSkills.isEmpty()) {
      throw new Error('Could not extract skills from the job description. Please provide a more detailed description.');
    }

    // Step 4: Match skills and calculate percentage
    logger.debug('Matching skills...');
    const matchResult = this.matchService.execute(resumeSkills, jobSkills);

    // Step 5: Generate AI suggestions
    logger.debug('Generating improvement suggestions...');
    const suggestions = await this.aiService.generateSuggestions(
      resumeSkills.getAllSkills(),
      jobSkills.getAllSkills(),
      matchResult.matchedSkills,
      matchResult.missingSkills,
      matchResult.matchPercentage
    );

    // Create and return analysis result
    const result = new AnalysisResult({
      matchPercentage: matchResult.matchPercentage,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      additionalSkills: matchResult.additionalSkills,
      suggestions,
      resumeSkills: {
        technicalSkills: resumeSkills.technicalSkills,
        softSkills: resumeSkills.softSkills,
        tools: resumeSkills.tools,
        frameworks: resumeSkills.frameworks,
        languages: resumeSkills.languages,
      },
      jobSkills: {
        technicalSkills: jobSkills.technicalSkills,
        softSkills: jobSkills.softSkills,
        tools: jobSkills.tools,
        frameworks: jobSkills.frameworks,
        languages: jobSkills.languages,
      },
    });

    logger.info('Resume analysis completed', {
      matchPercentage: result.matchPercentage,
      matchedCount: result.matchedSkills.length,
      missingCount: result.missingSkills.length,
    });

    return result;
  }
}
