"use server"

const getSystemPrompt = (style: string) => {
  const baseGuidelines = `You are an expert career coach and professional cover letter writer. Your task is to analyze a candidate's CV/resume and a job description, then generate a compelling, personalized cover letter.

Core Guidelines:
- Match the candidate's skills and experience to the job requirements
- Highlight relevant achievements and quantifiable results when available
- Keep the letter concise (3-4 paragraphs)
- Include a strong opening that grabs attention
- End with a clear call to action
- Do not include placeholder text like [Your Name] - write as if the candidate is writing
- Do not make up information not present in the CV
- Use proper paragraph structure with clear spacing`

  const styleGuidelines: Record<string, string> = {
    formal: `
Style: FORMAL
- Use traditional, corporate language and structure
- Begin with "Dear Hiring Manager" or similar formal salutation
- Maintain a respectful, reserved tone throughout
- Use complete sentences and avoid contractions
- Close with "Sincerely" or "Respectfully"
- Focus on qualifications and professional achievements`,

    professional: `
Style: PROFESSIONAL
- Use polished, business-appropriate language
- Balance warmth with professionalism
- Demonstrate enthusiasm while remaining composed
- Use industry-standard terminology
- Close with "Best regards" or "Kind regards"
- Highlight both skills and cultural fit`,

    friendly: `
Style: FRIENDLY PROFESSIONAL
- Use warm, approachable language while staying professional
- Show genuine enthusiasm for the role
- Include subtle personality while maintaining credibility
- Use "I'm excited" or "I'm thrilled" naturally
- Close with "Warm regards" or "Best"
- Connect on a human level while demonstrating competence`,

    confident: `
Style: CONFIDENT
- Use assertive, bold language
- Lead with strongest achievements and impact
- Demonstrate clear value proposition upfront
- Use action verbs and powerful statements
- Show conviction about being the right fit
- Close with a confident call to action`,

    creative: `
Style: CREATIVE
- Use engaging, memorable language
- Start with an attention-grabbing opening hook
- Show personality and unique perspective
- Use storytelling elements where appropriate
- Demonstrate innovative thinking
- Make the letter stand out while remaining professional`,
  }

  return `${baseGuidelines}\n${styleGuidelines[style] || styleGuidelines.professional}`
}

const extractionPrompt = `Analyze the job description and extract the following information. Return ONLY a JSON object with these fields:
- hrEmail: The HR or recruiter email address if found (empty string if not found)
- companyName: The company name
- jobTitle: The job title/position name

Example response:
{"hrEmail": "careers@company.com", "companyName": "Acme Inc", "jobTitle": "Software Engineer"}

If you cannot find an email, leave hrEmail as empty string. Always try to find the company name and job title.`

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateWithOpenAI(systemContent: string, userPrompt: string, retries = 2): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OpenAI API key not configured")

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    })

    if (response.status === 429 && attempt < retries) {
      await sleep(30000)
      continue
    }

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`OpenAI API error: ${errorBody}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ""
  }

  throw new Error("Max retries exceeded for OpenAI")
}

async function extractEmailMetadata(jobDescription: string): Promise<{
  hrEmail: string
  companyName: string
  jobTitle: string
}> {
  try {
    const result = await generateWithOpenAI(extractionPrompt, `Job Description:\n${jobDescription}`, 1)

    // Parse JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        hrEmail: parsed.hrEmail || "",
        companyName: parsed.companyName || "",
        jobTitle: parsed.jobTitle || "",
      }
    }
  } catch (error) {
    console.error("Error extracting email metadata:", error)
  }

  return { hrEmail: "", companyName: "", jobTitle: "" }
}

export async function generateCoverLetter(cv: string, jobDescription: string, style = "professional") {
  if (!cv || cv.trim().length === 0) {
    return { error: "Please provide your CV content." }
  }

  if (!jobDescription || jobDescription.trim().length === 0) {
    return { error: "Please provide the job description." }
  }

  try {
    const userPrompt = `
CV/Resume:
${cv}

Job Description:
${jobDescription}

Please generate a professional cover letter for this candidate applying to this position.`

    const [coverLetter, emailMetadata] = await Promise.all([
      generateWithOpenAI(getSystemPrompt(style), userPrompt),
      extractEmailMetadata(jobDescription),
    ])

    return {
      coverLetter,
      hrEmail: emailMetadata.hrEmail,
      companyName: emailMetadata.companyName,
      jobTitle: emailMetadata.jobTitle,
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while generating the cover letter. Please try again.",
    }
  }
}
