"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, Briefcase, Sparkles, Copy, Check, Upload, X, ChevronDown, Mail } from "lucide-react"
import { generateCoverLetter } from "@/app/actions/generate-cover-letter"
import { extractTextFromPDF } from "@/app/actions/parse-pdf"
import { Input } from "@/components/ui/input"

const COVER_LETTER_STYLES = [
  { value: "formal", label: "Formal" },
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "confident", label: "Confident" },
  { value: "creative", label: "Creative" },
] as const

export function CoverLetterGenerator() {
  const [cv, setCv] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [fileName, setFileName] = useState("")
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [coverLetterStyle, setCoverLetterStyle] = useState<string>("professional")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    setIsParsing(true)
    setError("")
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await extractTextFromPDF(formData)

      if (result.error) {
        setError(result.error)
        setFileName("")
      } else {
        setCv(result.text || "")
        setActiveStep(2)
      }
    } catch (err) {
      setError("Failed to parse PDF. Please try again or paste your CV manually.")
      setFileName("")
    } finally {
      setIsParsing(false)
    }
  }

  const clearFile = () => {
    setCv("")
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerate = async () => {
    if (!cv.trim() || !jobDescription.trim()) {
      setError("Please provide both your CV and the job description")
      return
    }

    setIsLoading(true)
    setError("")
    setCoverLetter("")

    try {
      const result = await generateCoverLetter(cv, jobDescription, coverLetterStyle)

      if (result.error) {
        setError(result.error)
      } else {
        setCoverLetter(result.coverLetter || "")
        if (result.hrEmail) {
          setRecipientEmail(result.hrEmail)
        }
        if (result.jobTitle && result.companyName) {
          setEmailSubject(`Application for ${result.jobTitle} at ${result.companyName}`)
        } else if (result.jobTitle) {
          setEmailSubject(`Application for ${result.jobTitle}`)
        }
        setActiveStep(3)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm overflow-x-auto pb-2">
        <StepIndicator
          step={1}
          label="Upload CV"
          isActive={activeStep === 1}
          isComplete={cv.length > 0}
          onClick={() => setActiveStep(1)}
        />
        <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] flex-shrink-0" />
        <StepIndicator
          step={2}
          label="Job Details"
          isActive={activeStep === 2}
          isComplete={jobDescription.length > 0}
          onClick={() => cv.length > 0 && setActiveStep(2)}
        />
        <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] flex-shrink-0" />
        <StepIndicator
          step={3}
          label="Cover Letter"
          isActive={activeStep === 3}
          isComplete={coverLetter.length > 0}
          onClick={() => coverLetter.length > 0 && setActiveStep(3)}
        />
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>}

      {activeStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Upload Your CV</h2>
              <p className="text-xs text-muted-foreground">PDF format supported</p>
            </div>
          </div>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="cv-upload"
            />
            {fileName ? (
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                    <p className="text-xs text-muted-foreground">PDF uploaded</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="cv-upload"
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-lg p-8 sm:p-12 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Parsing PDF...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-foreground">Click to upload</span>
                      <p className="text-xs text-muted-foreground mt-1">or drag and drop your PDF</p>
                    </div>
                  </>
                )}
              </label>
            )}
          </div>

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or paste manually</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Textarea
            placeholder="Paste your CV/resume content here..."
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            className="min-h-[150px] sm:min-h-[200px] resize-none text-sm"
          />

          <Button className="w-full sm:w-auto" onClick={() => cv.trim() && setActiveStep(2)} disabled={!cv.trim()}>
            Continue to Job Details
          </Button>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Job Description</h2>
              <p className="text-xs text-muted-foreground">Paste the job posting details</p>
            </div>
          </div>

          <Textarea
            placeholder="Paste the job description here... Include the role title, company, requirements, and responsibilities."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px] sm:min-h-[280px] resize-none text-sm"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tone</label>
            <div className="flex flex-wrap gap-2">
              {COVER_LETTER_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setCoverLetterStyle(style.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    coverLetterStyle === style.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
          {/* End style selector */}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setActiveStep(1)} className="order-2 sm:order-1">
              Back
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !cv.trim() || !jobDescription.trim()}
              className="order-1 sm:order-2 flex-1 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {activeStep === 3 && coverLetter && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Your Cover Letter</h2>
                <p className="text-xs text-muted-foreground">Generated by AI</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">{coverLetter}</div>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send via Gmail
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="recipient" className="text-xs text-muted-foreground">
                  Recipient Email
                </label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="hr@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-xs text-muted-foreground">
                  Email Subject
                </label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Application for Software Engineer Position"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(coverLetter)}`
                window.open(gmailUrl, "_blank")
              }}
              className="flex-1 sm:flex-none"
            >
              <Mail className="h-4 w-4 mr-2" />
              Open in Gmail
            </Button>
            <Button variant="outline" onClick={() => setActiveStep(2)}>
              Edit Job Description
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCoverLetter("")
                setJobDescription("")
                setCv("")
                setFileName("")
                setActiveStep(1)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
              }}
            >
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepIndicator({
  step,
  label,
  isActive,
  isComplete,
  onClick,
}: {
  step: number
  label: string
  isActive: boolean
  isComplete: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors flex-shrink-0 ${
        isActive
          ? "bg-primary text-primary-foreground"
          : isComplete
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "bg-muted text-muted-foreground"
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-medium">
        {isComplete && !isActive ? <Check className="h-3 w-3" /> : step}
      </span>
      <span className="font-medium whitespace-nowrap">{label}</span>
    </button>
  )
}
