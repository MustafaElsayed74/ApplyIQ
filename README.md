# ApplyIQ

AI Cover Letter Generator to craft tailored, professional cover letters from your CV and a job description.

## Features
- Personalized cover letters matched to the job description.
- Multiple writing styles: formal, professional, friendly, confident, creative.
- PDF parsing using `unpdf` to extract resume text.
- Metadata extraction: company name, job title, and HR/recruiter email.

## Tech Stack
- Next.js 16 (App Router) + React 19
- Tailwind CSS 4, Radix UI components
- OpenAI API (`gpt-4o-mini`)

## Prerequisites
- Node.js 18+
- `pnpm` or `npm`
- `OPENAI_API_KEY`

## Setup
Create `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Install and run:

```bash
# using pnpm
pnpm install
pnpm dev

# or using npm
npm install
npm run dev
```

## Scripts
- dev: start development server
- build: production build
- start: run production server
- lint: run ESLint

## Key Files
- [app/actions/parse-pdf.ts](app/actions/parse-pdf.ts): PDF text extraction
- [app/actions/generate-cover-letter.ts](app/actions/generate-cover-letter.ts): letter + metadata generation

## Troubleshooting
- Ensure `OPENAI_API_KEY` is set.
- Retry if rate-limited (HTTP 429).
- For image-based PDFs, provide a text-based resume.
