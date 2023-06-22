import React, { useEffect, useState } from "react"
import { Timer } from "lucide-react"

import { getRemainingTime } from "@/lib/utils"

type CountDownProps = {
  targetDate: BigInt
  hideOnComplete?: boolean
}

export const Countdown = ({
  targetDate,
  hideOnComplete = false,
}: CountDownProps) => {
  const [remaining, setRemaining] = useState(getRemainingTime(targetDate))

  useEffect(() => {
    const updateRemainingTime = () => {
      const newRemaining = getRemainingTime(targetDate)
      setRemaining(newRemaining)

      // stop the interval if hideOnComplete is true and the countdown has ended
      if (hideOnComplete && newRemaining.ended) {
        clearInterval(intervalId)
      }
    }

    const intervalId = setInterval(updateRemainingTime, 1000) // update every second

    return () => clearInterval(intervalId) // cleanup on unmount
  }, [targetDate, hideOnComplete]) // include hideOnComplete in dependencies

  if (hideOnComplete && remaining.ended) {
    return null
  }

  return (
    <div className=" flex items-center space-x-4 rounded-md border p-4">
      <Timer />
      <div className="flex flex-row space-x-4">
        <div className="text-center">
          <div className="rounded-md border p-2">
            <p className="text-lg font-bold">{remaining.days}</p>
          </div>
          <p className="text-sm">Days</p>
        </div>
        <div className="text-center">
          <div className="rounded-md border p-2">
            <p className="text-lg font-bold">{remaining.hours}</p>
          </div>
          <p className="text-sm">Hours</p>
        </div>
        <div className="text-center">
          <div className="rounded-md border p-2">
            <p className="text-lg font-bold">{remaining.minutes}</p>
          </div>
          <p className="text-sm">Minutes</p>
        </div>
        <div className="text-center">
          <div className="rounded-md border p-2">
            <p className="text-lg font-bold">{remaining.seconds}</p>
          </div>
          <p className="text-sm">Seconds</p>
        </div>
      </div>
    </div>
  )
}
