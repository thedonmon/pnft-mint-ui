import { KeypairSigner, PublicKey } from "@metaplex-foundation/umi"

import { AllowListConfig, allowListConfig } from "../config/allowlist"

//TODO: Fill for more gates
export type DefaultMintSettings = {
  nftGate: {
    //Owner of the NFT to gate by
    nftGateMint: PublicKey
  }
  thirdPartySigner: {
    signer: KeypairSigner
  }
}

export const getAllowListByGuard = (guard: string = "default") => {
  const list = allowListConfig[guard]
  // You might want to handle the case where the guard isn't in the allowListConfig:
  if (!list || list.length === 0) {
    return null
  }
  return list
}
