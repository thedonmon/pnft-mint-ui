import { useCallback, useEffect, useState } from "react"
import {
  CandyGuard,
  CandyMachine,
  DefaultGuardSet,
  fetchCandyGuard,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine"
import { PublicKey, Umi, publicKey } from "@metaplex-foundation/umi"
import {
  toWeb3JsPublicKey,
  toWeb3JsTransaction,
} from "@metaplex-foundation/umi-web3js-adapters"
import { useConnection } from "@solana/wallet-adapter-react"

export const useCandyMachine = (
  umi: Umi
): {
  candyMachine: CandyMachine
  candyGuard: CandyGuard<DefaultGuardSet>
  fetchCM: (umi: Umi) => Promise<void>
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
  useEffect(() => {
    const fetchCandyMachineAsync = async (
      umi: Umi,
      candyMachinePublicKey: PublicKey
    ) => {
      const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey)
      setCandyMachine(candyMachine)
      await fetchCandyGuard(umi, candyMachine.mintAuthority)
        .then(setCandyGuard)
        .catch((e) => {
          console.log(e)
          return null
        })
    }
    if (umi && candyMachinePublicKey) {
      fetchCandyMachineAsync(umi, candyMachinePublicKey)
    }
  }, [umi, candyMachinePublicKey])
  const fetchCM = useCallback(
    async (umiParam: Umi) => {
      console.log("fetchCM", umiParam)
      await fetchCandyMachine(umiParam, candyMachinePublicKey)
        .then(setCandyMachine)
        .catch((e) => {
          console.log(e)
        })
      await fetchCandyGuard(umiParam, candyGuardMintAuthority)
        .then(setCandyGuard)
        .catch((e) => {
          console.log(e)
          return null
        })
    },
    [umi]
  )

  return {
    candyMachine: candyMachine as CandyMachine,
    candyGuard: candyGuard as CandyGuard<DefaultGuardSet>,
    fetchCM,
  }
}
