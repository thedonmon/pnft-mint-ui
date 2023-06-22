import { useEffect, useState } from "react"
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine"
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { Umi } from "@metaplex-foundation/umi"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { clusterApiUrl } from "@solana/web3.js"

export const useUmi = (): Umi => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [umi, setUmi] = useState<Umi | null>(null)
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
  }, [wallet?.publicKey, connection])
  return umi as Umi
}
