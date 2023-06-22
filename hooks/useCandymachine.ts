import { useCallback, useEffect, useState } from "react"
import {
  CandyGuard,
  CandyMachine,
  DefaultGuardSet,
  fetchCandyGuard,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine"
import { Umi, publicKey } from "@metaplex-foundation/umi"

export const useCandyMachine = (
  umi: Umi
): {
  candyMachine: CandyMachine
  candyGuard: CandyGuard<DefaultGuardSet>
  fetchCM: (umi: Umi) => Promise<void>
  error: Error | null
} => {
  const candyMachinePublicKey = publicKey(
    process.env.NEXT_PUBLIC_CANDYMACHINE_PK || ""
  )
  const candyGuardMintAuthority = publicKey(
    process.env.NEXT_PUBLIC_CANDY_GUARD_MINT_AUTHORITY || ""
  )
  const [candyMachine, setCandyMachine] = useState<CandyMachine | null>(null)
  const [candyGuard, setCandyGuard] =
    useState<CandyGuard<DefaultGuardSet> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(
    async (umiParam: Umi) => {
      try {
        const cm = await fetchCandyMachine(umiParam, candyMachinePublicKey)
        setCandyMachine(cm)

        const cg = await fetchCandyGuard(
          umiParam,
          cm?.mintAuthority ?? candyGuardMintAuthority
        )
        setCandyGuard(cg)
      } catch (e) {
        if (e instanceof Error) {
          console.log(e)
          setError(e)
        } else {
          // e is something else, possibly 'unknown'
          console.error(e)
          setError(new Error("An unexpected error occurred."))
        }
      }
    },
    [candyMachinePublicKey]
  )

  useEffect(() => {
    if (umi && candyMachinePublicKey) {
      fetchData(umi)
    }
  }, [umi, candyMachinePublicKey, fetchData])

  return {
    candyMachine: candyMachine as CandyMachine,
    candyGuard: candyGuard as CandyGuard<DefaultGuardSet>,
    fetchCM: fetchData,
    error,
  }
}
