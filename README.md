# AI Resume Analyzer

An AI-powered resume analyzer that extracts skills from resumes and job descriptions, calculates match percentages, and provides actionable suggestions.

## Features

- 📄 **PDF Resume Parsing** - Upload your resume in PDF format
- 🎯 **Job Description Matching** - Paste any job description to compare against
- 🤖 **AI-Powered Analysis** - Uses OpenAI to extract and analyze skills
- 📊 **Match Percentage** - See how well your resume matches the job
- ✅ **Matched Skills** - View skills that align with the job requirements
- ❌ **Missing Skills** - Identify gaps in your resume
- 💡 **Suggestions** - Get AI-powered recommendations to improve your resume

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Dropzone

### Backend
- Node.js + Express
- TypeScript
- Clean Architecture
- pdf-parse for PDF extraction
- OpenAI API for skill analysis

## Project Structure

```
ai-resume-analyzer/
├── frontend/          # Next.js 14 App Router frontend
├── backend/           # Express.js API with clean architecture
├── shared/            # Shared TypeScript types
└── package.json       # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ankit-Sinha70/ai-resume-analyzer.git
cd ai-resume-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Backend (`backend/.env`):
```env
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Run the development servers:
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:3001

## API Endpoints

### POST /api/analyze
Analyze a resume against a job description.

**Request:**
- `resume` (file): PDF resume file
- `jobDescription` (string): Job description text

**Response:**
```json
{
  "success": true,
  "data": {
    "matchPercentage": 75,
    "matchedSkills": ["JavaScript", "React", "Node.js"],
    "missingSkills": ["Python", "AWS"],
    "additionalSkills": ["TypeScript", "MongoDB"],
    "suggestions": [
      "Consider adding Python experience",
      "Highlight any cloud platform experience"
    ]
  }
}
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL`

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set the root directory to `backend`
3. Add environment variables: `OPENAI_API_KEY`, `FRONTEND_URL`, `PORT`

## License

MIT
