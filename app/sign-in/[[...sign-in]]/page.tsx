import { SignIn } from '@clerk/nextjs'
import { BarChart3 } from "lucide-react"

export default function SignInPage() {
    const navigateToHome = (e: React.MouseEvent) => {
        e.preventDefault()
        if (typeof window !== 'undefined') {
            window.location.href = '/'
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* streamci branding */}
                <a
                    href="/"
                    onClick={navigateToHome}
                    className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-serif font-bold">StreamCI</span>
                </a>

                {/* clerk sign-in component */}
                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                "bg-primary hover:bg-primary/90 text-primary-foreground",
                            card: "bg-card border-border",
                            headerTitle: "text-foreground font-serif",
                            headerSubtitle: "text-muted-foreground",
                            socialButtonsBlockButton:
                                "border-border hover:bg-muted",
                            formFieldInput:
                                "bg-background border-border focus:ring-primary",
                            footerActionLink: "text-primary hover:text-primary/90"
                        }
                    }}
                />
            </div>
        </div>
    )
}