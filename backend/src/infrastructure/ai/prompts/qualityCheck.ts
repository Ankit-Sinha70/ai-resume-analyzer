export const QUALITY_CHECK_PROMPT = `You are a resume analysis engine.

Evaluate the quality and suitability of the resume text for skill extraction and job matching.

Rules:
- Assess clarity, structure, and completeness of information.
- Check for presence of meaningful professional content.
- Detect excessive noise, repetition, or meaningless text.
- Do NOT attempt to infer or add missing information.
- Do NOT analyze skills in this step.

Quality levels:
- excellent: clear sections, detailed content, well structured
- good: mostly clear with minor issues
- average: usable but lacks detail or structure
- poor: very little useful information or heavily unstructured

Return STRICT JSON only in the following format:
{
  "isSuitable": boolean,
  "quality": "excellent" | "good" | "average" | "poor",
  "issues": string[],
  "summary": string
}

Resume Text:
{{resumeText}}`;
