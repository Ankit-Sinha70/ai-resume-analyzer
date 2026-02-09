import { Skills } from '../../domain/entities';

interface MatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  matchedSkillDetails: SkillDetail[];
  missingSkillDetails: SkillDetail[];
}

interface SkillDetail {
  skill: string;
  rationale: string;
}

export class MatchJobDescription {
  execute(resumeSkills: Skills, jobSkills: Skills): MatchResult {
    // Get all skills as flat arrays
    const resumeAllSkills = resumeSkills.getAllSkills();
    const jobAllSkills = jobSkills.getAllSkills();

    // Normalize skills for comparison
    const normalizedResumeSkills = this.normalizeSkills(resumeAllSkills);
    const normalizedJobSkills = this.normalizeSkills(jobAllSkills);

    // Find matched skills
    const matchedSkills: string[] = [];
    const matchedNormalized = new Set<string>();
    const matchedSkillDetails: SkillDetail[] = [];

    for (const jobSkill of normalizedJobSkills) {
      for (const resumeSkill of normalizedResumeSkills) {
        if (this.skillsMatch(resumeSkill.normalized, jobSkill.normalized)) {
          matchedSkills.push(jobSkill.original);
          matchedNormalized.add(jobSkill.normalized);
          matchedSkillDetails.push({
            skill: jobSkill.original,
            rationale: `Found matching resume skill: "${resumeSkill.original}"`,
          });
          break;
        }
      }
    }

    // Find missing skills (in job but not in resume)
    const missingSkills = normalizedJobSkills
      .filter(skill => !matchedNormalized.has(skill.normalized))
      .map(skill => skill.original);

    const missingSkillDetails: SkillDetail[] = normalizedJobSkills
      .filter(skill => !matchedNormalized.has(skill.normalized))
      .map(skill => ({
        skill: skill.original,
        rationale: 'Required in job description but not found in resume.',
      }));

    // Find additional skills (in resume but not required by job)
    const additionalSkills = normalizedResumeSkills
      .filter(skill => {
        return !normalizedJobSkills.some(jobSkill => 
          this.skillsMatch(skill.normalized, jobSkill.normalized)
        );
      })
      .map(skill => skill.original);

    // Calculate match percentage
    const matchPercentage = normalizedJobSkills.length > 0
      ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100)
      : 0;

    return {
      matchPercentage,
      matchedSkills: [...new Set(matchedSkills)],
      missingSkills: [...new Set(missingSkills)],
      additionalSkills: [...new Set(additionalSkills)],
      matchedSkillDetails,
      missingSkillDetails,
    };
  }

  private normalizeSkills(skills: string[]): { original: string; normalized: string }[] {
    return skills.map(skill => ({
      original: skill,
      normalized: skill.toLowerCase().trim().replace(/[^a-z0-9+#.]/g, ''),
    }));
  }

  private skillsMatch(skill1: string, skill2: string): boolean {
    // Exact match
    if (skill1 === skill2) return true;

    // One contains the other (for variations like "react" and "reactjs")
    if (skill1.includes(skill2) || skill2.includes(skill1)) return true;

    // Common variations
    const variations: Record<string, string[]> = {
      'javascript': ['js', 'ecmascript'],
      'typescript': ['ts'],
      'nodejs': ['node', 'node.js'],
      'reactjs': ['react', 'react.js'],
      'vuejs': ['vue', 'vue.js'],
      'angularjs': ['angular'],
      'postgresql': ['postgres', 'psql'],
      'mongodb': ['mongo'],
      'kubernetes': ['k8s'],
      'amazonwebservices': ['aws'],
      'googlecloudplatform': ['gcp'],
      'microsoftazure': ['azure'],
      'continuousintegration': ['ci'],
      'continuousdeployment': ['cd'],
      'cicd': ['ci/cd', 'ci', 'cd'],
    };

    for (const [key, vals] of Object.entries(variations)) {
      const allVariations = [key, ...vals];
      if (allVariations.includes(skill1) && allVariations.includes(skill2)) {
        return true;
      }
    }

    return false;
  }
}
