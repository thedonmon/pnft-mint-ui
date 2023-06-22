import { useState } from "react"
import {
  CandyGuard,
  CandyMachine,
  DefaultGuardSet,
  DefaultGuardSetMintArgs,
  fetchCandyMachine,
  fetchMintCounterFromSeeds,
  getMerkleProof,
  mintV2,
  route,
} from "@metaplex-foundation/mpl-candy-machine"
import {
  DigitalAsset,
  TokenStandard,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata"
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox"
import {
  KeypairSigner,
  PublicKey,
  TransactionBuilder,
  generateSigner,
  none,
  some,
  transactionBuilder,
  unwrapOption,
} from "@metaplex-foundation/umi"
import { base58 } from "@metaplex-foundation/umi/serializers"

import { getAllowListByGuard } from "@/lib/mintsettings"
import { useUmi } from "@/hooks/useUmi"
import { Button } from "@/components/ui/button"

import { useToast } from "./use-toast"

type MintButtonProps = React.ComponentProps<typeof Button> & {
  group?: string
  candyMachine: CandyMachine
  candyGuard: CandyGuard<DefaultGuardSet>
  guardToUse: DefaultGuardSet
  thirdPartySigner?: KeypairSigner
  nftGateMint?: PublicKey
  onMintCallback?: (mint?: DigitalAsset, signature?: string) => void
  setMessageCallback?: (message?: string) => void
  setDisabledCallback?: (disabled?: boolean) => void
}

export function MintButton({
  className,
  group,
  candyMachine,
  candyGuard,
  guardToUse,
  thirdPartySigner,
  onMintCallback,
  nftGateMint,
  setDisabledCallback,
  setMessageCallback,
  ...props
}: MintButtonProps) {
  const { toast } = useToast()
  const umi = useUmi()
  const [loading, setLoading] = useState(false)

  const mintBtnHandler = async () => {
    if (!candyMachine) {
      return
    }

    try {
      setLoading(true)

      const mintArgs: Partial<DefaultGuardSetMintArgs> = {}
      console.log(guardToUse)
      //TODO: Implement rest of guard logic NFT BURN, NFT Payment, FreezeSolPayment FreezeTokenPayment etc also consolidate this logic, very cluttered
      const solPaymentGuard = unwrapOption(
        guardToUse?.solPayment ?? none(),
        () => null
      )
      if (solPaymentGuard) {
        mintArgs.solPayment = some({
          destination: solPaymentGuard.destination,
        })
      }
      const redeemedAmountGuard = unwrapOption(
        guardToUse?.redeemedAmount ?? none(),
        () => null
      )
      if (redeemedAmountGuard) {
        const latestCandyMachine = await fetchCandyMachine(
          umi,
          candyMachine.publicKey
        ).catch((e) => {
          return null
        })
        if (latestCandyMachine) {
          const redeemedAmountValue = redeemedAmountGuard.maximum
          const itemsRedeemed = latestCandyMachine.itemsRedeemed
          if (itemsRedeemed >= redeemedAmountValue) {
            toast({
              title: "Redeemed Amount Reached",
              description: `A maximum of ${redeemedAmountValue} mints could be redeemed for this group. ${itemsRedeemed} have already been redeemed.`,
              duration: 5000,
            })
            setDisabledCallback && setDisabledCallback(true)
            return
          }
        } else {
          toast({
            title: "Error",
            description: `Failed to fetch candy machine`,
            duration: 5000,
          })
          setDisabledCallback && setDisabledCallback(true)
          return
        }
      }
      const mintLimitGuard = unwrapOption(
        guardToUse?.mintLimit ?? none(),
        () => null
      )
      if (mintLimitGuard) {
        const mitLimitCounter = await fetchMintCounterFromSeeds(umi, {
          id: mintLimitGuard.id,
          user: umi.identity.publicKey,
          candyMachine: candyMachine.publicKey,
          candyGuard: candyGuard.publicKey,
        }).catch((e) => {
          return null
        })
        if (mitLimitCounter) {
          if (mitLimitCounter.count >= mintLimitGuard.limit) {
            toast({
              title: "Mint Limit Reached",
              description: `You have reached the mint limit of ${mintLimitGuard.limit} for this NFT.`,
              duration: 5000,
            })
            setDisabledCallback && setDisabledCallback(true)
            return
          }
        }
        mintArgs.mintLimit = some({
          id: mintLimitGuard.id,
        })
      }
      const thirdPartyGuard = unwrapOption(
        guardToUse?.thirdPartySigner ?? none(),
        () => null
      )
      if (thirdPartyGuard && thirdPartySigner) {
        mintArgs.thirdParty = some({
          signer: thirdPartySigner,
        })
      }
      const nftGuard = unwrapOption(guardToUse?.nftGate ?? none(), () => null)
      if (nftGuard && nftGateMint) {
        mintArgs.nftGate = some({
          mint: nftGateMint,
        })
      }
      const tokenPayment = unwrapOption(
        guardToUse?.tokenPayment ?? none(),
        () => null
      )
      if (tokenPayment) {
        mintArgs.tokenPayment = some({
          mint: tokenPayment.mint,
          destinationAta: tokenPayment.destinationAta,
        })
      }

      const token2022Payment = unwrapOption(
        guardToUse?.token2022Payment ?? none(),
        () => null
      )
      if (token2022Payment) {
        mintArgs.token2022Payment = some({
          mint: token2022Payment.mint,
          destinationAta: token2022Payment.destinationAta,
        })
      }

      const tokenBurnGuard = unwrapOption(
        guardToUse?.tokenBurn ?? none(),
        () => null
      )
      if (tokenBurnGuard) {
        mintArgs.tokenBurn = some({
          mint: tokenBurnGuard.mint,
        })
      }

      const allowListGuard = unwrapOption(
        guardToUse?.allowList ?? none(),
        () => null
      )
      let routeBuilder: TransactionBuilder | null = null
      if (allowListGuard) {
        const allowlist = getAllowListByGuard(group)
        if (allowlist) {
          routeBuilder = route(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyGuard.publicKey,
            guard: "allowList",
            group: group ? some(group) : undefined,
            routeArgs: {
              path: "proof",
              merkleRoot: allowListGuard.merkleRoot,
              merkleProof: getMerkleProof(
                allowlist,
                umi.identity.publicKey.toString()
              ),
            },
          })
          mintArgs.allowList = some({
            merkleRoot: allowListGuard.merkleRoot,
          })
        }
      }
      const nftSigner = generateSigner(umi)
      const mintV2Builder = mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        nftMint: nftSigner,
        minter: umi.identity,
        candyGuard: candyGuard?.publicKey,
        mintArgs: mintArgs,
        group: group ? group : undefined,
        tokenStandard: TokenStandard.ProgrammableNonFungible,
      })

      let tx = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 600_000 }))
        .add(mintV2Builder)
      if (routeBuilder) {
        //Make sure route ix comes first
        tx = routeBuilder
          .add(setComputeUnitLimit(umi, { units: 600_000 }))
          .add(mintV2Builder)
      }
      const { signature } = await tx.sendAndConfirm(umi, {
        confirm: { commitment: "finalized" },
        send: {
          skipPreflight: true,
        },
      })

      const nft = await fetchDigitalAsset(umi, nftSigner.publicKey).catch(
        (err) => {
          console.log(err)
          return undefined
        }
      )
      onMintCallback &&
        onMintCallback(nft, base58.deserialize(signature).toString())
      if (nft) {
        toast({
          title: "Minted!",
          description: `You minted ${nft?.metadata?.name}!`,
        })
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className={className} onClick={mintBtnHandler} {...props}>
      {loading ? "Minting..." : "Mint"}
    </Button>
  )
}
