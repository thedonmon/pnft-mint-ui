"use client"

import * as React from "react"
import { useCallback, useEffect } from "react"

import { Progress } from "@/components/ui/progress"

type MintProgressProps = {
  minted?: number
  total?: number
}

export function MintProgress({ minted, total }: MintProgressProps) {
  const [progress, setProgress] = React.useState(0)
  // Destructure the fetched candyMachineData

  const calculateProgress = useCallback(() => {
    if (!minted || !total) return
    const redeemed = minted
    const currentProgress = Math.floor((redeemed / total) * 100)
    setProgress(currentProgress)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minted])

  useEffect(() => {
    calculateProgress()
  }, [minted, total, calculateProgress])

  return (
    <div className="mb-2 flex flex-col space-y-2">
      <Progress value={progress} className="w-full" />
      <div className="flex items-center justify-end">
        <p className="text-sm font-medium leading-none">
          {minted}/{total}
        </p>
      </div>
    </div>
  )
}
