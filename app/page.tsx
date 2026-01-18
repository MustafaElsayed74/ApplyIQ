import { CoverLetterGenerator } from "@/components/cover-letter-generator"
import { Inter } from "next/font/google"
import { FileText } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  return (
    <main className={`min-h-screen bg-background ${inter.className}`}>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-lg">Cover Letter Generator</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 text-balance">
            Create Your Cover Letter in Seconds
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed">
            Upload your CV, add the job details, and get a personalized cover letter ready to send.
          </p>
        </div>

        <CoverLetterGenerator />
      </div>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs text-muted-foreground text-center">Your data is processed securely and never stored.</p>
          <p
            className="text-sm text-muted-foreground text-center mt-3 flex items-center justify-center gap-2"
            dir="rtl"
          >
            <span>القشة الأقوىٰ في العالم</span>
            <span className="text-red-500 animate-pulse">❤️</span>
          </p>
        </div>
      </footer>
    </main>
  )
}
