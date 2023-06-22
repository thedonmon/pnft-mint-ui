import {
  DefaultGuardSet,
  GuardSet,
} from "@metaplex-foundation/mpl-candy-machine"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mergeGuards = (
  defaultGuards: DefaultGuardSet,
  groupGuards: DefaultGuardSet
): DefaultGuardSet => {
  const result: DefaultGuardSet = { ...defaultGuards } // Start with a shallow copy of defaultGuards

  // Iterate over groupGuards
  for (const [key, option] of Object.entries(groupGuards)) {
    if (
      option.__option === "Some" ||
      !result[key] ||
      result[key].__option === "None"
    ) {
      result[key] = option // If the group has a value for this key, or the default doesn't, use the group's value
    }
  }

  return result
}

export function getRemainingTime(targetDate: BigInt) {
  const targetDateTime = Number(targetDate) * 1000
  const now = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds()
    )
  )
  const diff = targetDateTime - now.getTime()

  if (diff <= 0) {
    return {
      ended: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return {
      ended: false,
      days,
      hours,
      minutes,
      seconds,
    }
  }
}
