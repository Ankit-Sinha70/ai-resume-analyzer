export const SKILL_EXTRACTION_PROMPT = `You are an expert resume and job description analyzer. Extract all skills from the following text.

Categorize the skills into these groups:
1. technicalSkills: Programming concepts, algorithms, data structures, methodologies (e.g., REST APIs, Microservices, CI/CD)
2. softSkills: Communication, leadership, teamwork, problem-solving abilities
3. tools: Specific software, platforms, and tools (e.g., Git, Docker, AWS, Jira)
4. frameworks: Programming frameworks and libraries (e.g., React, Node.js, Django, Spring)
5. languages: Programming languages (e.g., JavaScript, Python, Java, TypeScript)

IMPORTANT:
- Extract ONLY skills that are explicitly mentioned or strongly implied
- Normalize skill names (e.g., "JS" -> "JavaScript", "node" -> "Node.js")
- Remove duplicates
- Keep skills concise (1-3 words each)

Return ONLY valid JSON in this exact format, no additional text:
{
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "frameworks": ["framework1", "framework2"],
  "languages": ["language1", "language2"]
}

Text to analyze:
{{TEXT}}`;

export const SUGGESTIONS_PROMPT = `You are a career advisor helping improve resume-job matching. Based on the analysis below, provide actionable suggestions.

Resume Skills: {{RESUME_SKILLS}}
Job Required Skills: {{JOB_SKILLS}}
Matched Skills: {{MATCHED_SKILLS}}
Missing Skills: {{MISSING_SKILLS}}
Match Percentage: {{MATCH_PERCENTAGE}}%

Provide 3-5 specific, actionable suggestions to improve the resume for this job. Focus on:
1. How to highlight existing relevant skills better
2. Which missing skills are most critical to add
3. How to address skill gaps (courses, projects, certifications)
4. Resume formatting or presentation improvements

Return ONLY a JSON array of suggestion strings, no additional text:
["suggestion1", "suggestion2", "suggestion3"]`;
