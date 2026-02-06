import { PDFParse } from 'pdf-parse';
import { logger } from '../logging/logger';

export class PdfParseService {
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      
      if (!result.text || result.text.trim().length === 0) {
        await parser.destroy();
        throw new Error('No text content found in PDF');
      }

      // Clean up extracted text
      const cleanedText = this.cleanText(result.text);
      
      logger.debug('PDF text extracted successfully', {
        textLength: cleanedText.length,
      });

      await parser.destroy();
      return cleanedText;
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF with readable text.');
    }
  }

  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page numbers and headers/footers patterns
      .replace(/Page \d+ of \d+/gi, '')
      // Normalize line breaks
      .replace(/[\r\n]+/g, '\n')
      // Remove leading/trailing whitespace
      .trim();
  }

  async getPageCount(buffer: Buffer): Promise<number> {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getInfo();
      await parser.destroy();
      return result.total || 0;
    } catch (error) {
      logger.error('Error getting PDF page count:', error);
      return 0;
    }
  }
}
