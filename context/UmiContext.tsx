"use client"

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine"
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { Umi } from "@metaplex-foundation/umi"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { clusterApiUrl } from "@solana/web3.js"

// Create a new context with nullable Umi type
const UmiContext = createContext<Umi | null>(null)

// Create a provider component that holds your umi instance
const UmiProvider = ({ children }: any) => {
  const [umi, setUmi] = useState<Umi | null>(null)
  const wallet = useWallet()
  const { connection } = useConnection()
  console.log(connection, wallet, children)
  useEffect(() => {
    if (!wallet?.publicKey || !connection) {
      return
    }
    const umiInstance = createUmi(
      connection?.rpcEndpoint ?? clusterApiUrl("devnet")
    )
      .use(walletAdapterIdentity(wallet))
      .use(mplCandyMachine())
      .use(mplTokenMetadata())
    setUmi(umiInstance)
  }, [connection, wallet])

  return <UmiContext.Provider value={umi}>{children}</UmiContext.Provider>
}

// Create a hook for easy access to the umi instance
const useUmi = (): Umi => {
  const umi = useContext(UmiContext)
  if (!umi) {
    throw new Error("useUmi must be used within a UmiProvider")
  }
  return umi
}

// Export useUmi for other components to use
export { useUmi, UmiProvider }
