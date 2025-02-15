import { Providers } from "./providers"
import type React from "react"
import { AnimatedGradient } from "@/components/ui/animated-gradient"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AnimatedGradient />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
