"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const mintTiers = [
  {
    name: "Early Mint",
    label: "early",
    href: "/mint/early",
  },
  {
    name: "Public Mint",
    label: "public",
    href: "/mint/public",
  },
  {
    name: "WL1 Mint",
    label: "late",
    href: "/mint/late",
  },
  {
    name: "Token Mint",
    label: "token",
    href: "/mint/token",
  },
]

interface MintNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MintNav({ className, ...props }: MintNavProps) {
  const pathname = usePathname()

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center", className)} {...props}>
          {mintTiers.map((example) => (
            <Link
              href={example.href}
              key={example.href}
              className={cn(
                "flex items-center px-4",
                pathname?.startsWith(example.href)
                  ? "font-bold text-primary"
                  : "font-medium text-muted-foreground"
              )}
            >
              {example.name}{" "}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
