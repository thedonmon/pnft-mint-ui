"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DefaultGuardSet,
  fetchMintCounterFromSeeds,
} from "@metaplex-foundation/mpl-candy-machine"
import {
  DigitalAsset,
  safeFetchMetadata,
} from "@metaplex-foundation/mpl-token-metadata"
import { SolAmount, none, unwrapOption } from "@metaplex-foundation/umi"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Calculator } from "lucide-react"

import { cn, getRemainingTime, mergeGuards } from "@/lib/utils"
import { useCandyMachine } from "@/hooks/useCandymachine"
import { useUmi } from "@/hooks/useUmi"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Countdown } from "./countdown"
import { MintButton } from "./mint-button"
import { MintProgress } from "./mint-progress"
import { useToast } from "./use-toast"
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { toWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { SPL_SYSTEM_PROGRAM_ID } from "@metaplex-foundation/mpl-toolbox"

type CardProps = React.ComponentProps<typeof Card> & {
  group?: string
}

export function MintCard({ className, group, ...props }: CardProps) {
  const { toast } = useToast()
  const umi = useUmi()
  const { candyMachine, candyGuard, fetchCM } = useCandyMachine(umi)
  const { connection } = useConnection()
  const { wallet, publicKey, connected } = useWallet()
  const [disableMint, setDisableMint] = useState(false)
  const [nftMint, setNftMint] = useState<DigitalAsset>()
  const [countTotal, setCountTotal] = useState<number>()
  const [countRemaining, setCountRemaining] = useState<number>()
  const [countMinted, setCountMinted] = useState<number>()
  const [message, setMessage] = useState<string>()
  const [cost, setCost] = useState<{
    amount: number
    name: string
  }>({
    amount: 0,
    name: "SOL",
  })
  const [startDate, setStartDate] = useState<BigInt>()
  const [isLive, setIsLive] = useState<boolean>()
  const [mintLimit, setMintLimit] = useState<number>()
  const [guardToUse, setGuardToUse] = useState<DefaultGuardSet>(
    candyGuard?.guards
  )
  const onMint = async (nft?: DigitalAsset, signature?: string) => {
    if (nft) {
      setNftMint(nft)
      await fetchCM(umi)
    }
    console.log("in onmint", nft, signature)
  }
  const setDisabledCallback = useCallback((disabled = false) => {
    setDisableMint(disabled)
  }, [disableMint])

  const checkCandyMachine = useCallback(async () => {
    if (!connected || !publicKey) {
        toast({
            title: "Wallet not connected",
            description: "Please connect wallet to continue",
        })
        return
    }
    if (!candyMachine) {
      return
    }
    
    // Get counts
    setCountTotal(candyMachine.itemsLoaded)
    setCountMinted(Number(candyMachine.itemsRedeemed))
    const remaining =
      candyMachine.itemsLoaded - Number(candyMachine.itemsRedeemed)
    setCountRemaining(remaining)
    const guardGroup = candyGuard?.groups?.find((g) => g?.label === group)
    let candyGuardToUse = candyGuard?.guards
    if (guardGroup?.guards) {
      //Keep defaults but override with group
      candyGuardToUse = mergeGuards(candyGuard?.guards, guardGroup.guards)
      setGuardToUse({ ...candyGuardToUse })
      console.log(candyGuardToUse)
    } else {
      setGuardToUse({ ...candyGuardToUse })
    }

    console.log(candyGuardToUse)

    const balance = await umi.rpc.getBalance(umi.identity.publicKey)
    const solBalance = Number(balance.basisPoints) / LAMPORTS_PER_SOL
    const startDate = unwrapOption(
      candyGuardToUse?.startDate ?? none(),
      () => null
    )
    if (startDate) {
      const start = startDate.date
      console.log(start, Number(start), start.toString())
      const remaining = getRemainingTime(start)
      setIsLive(remaining.ended)
      setStartDate(start)
      console.log(remaining)
    }

    const mintLimitGuard = unwrapOption(
      candyGuardToUse?.mintLimit ?? none(),
      () => null
    )
    if (mintLimitGuard) {
      const limit = Number(mintLimitGuard.limit)
      setMintLimit(limit)
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
          setDisableMint(true)
          return
        }
      }
    }

    const solPaymentGuard = unwrapOption(
      candyGuardToUse?.solPayment ?? none(),
      () => null
    )

    if (solPaymentGuard) {
      const lamports: SolAmount = solPaymentGuard.lamports
      const solCost = Number(lamports.basisPoints) / LAMPORTS_PER_SOL
      setCost({
        amount: solCost,
        name: "SOL",
      })
      if (solBalance === 0  || solPaymentGuard.lamports.basisPoints > balance.basisPoints) {
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${cost.amount} SOL to mint this NFT.`,
          duration: 5000,
        })
        setDisableMint(true)
        return
      }
    }
    const tokenPaymentGuard = unwrapOption(
      candyGuardToUse?.tokenPayment ?? none(),
      () => null
    )
    if (tokenPaymentGuard) {
      const tokenCost = tokenPaymentGuard.amount
      const tokenMint = tokenPaymentGuard.mint
      const meta = await safeFetchMetadata(umi, tokenMint)
      setCost({
        amount: Number(tokenCost),
        name: meta?.name || "Token",
      })
      const tokenAddress = getAssociatedTokenAddressSync(toWeb3JsPublicKey(tokenMint), toWeb3JsPublicKey(umi.identity.publicKey))
      const tokenAccount = await connection.getTokenAccountBalance(tokenAddress).catch((e) => { return null })
      console.log('TokenAccount', tokenAddress.toBase58(), tokenAccount)
        if (!tokenAccount || (tokenAccount.value && (tokenAccount.value?.uiAmount ?? 0) < Number(tokenPaymentGuard.amount))) {
            toast({
                title: "Insufficient Balance",
                description: `You need at least ${tokenPaymentGuard.amount} ${meta?.name || "token"} to mint this NFT.`,
                duration: 5000,
            })
            setDisableMint(true)
            return
        }
    }
    const token2022PaymentGuard = unwrapOption(
        candyGuardToUse?.token2022Payment ?? none(),
        () => null
      )
      if (token2022PaymentGuard) {
        const tokenCost = token2022PaymentGuard.amount
        const tokenMint = token2022PaymentGuard.mint
        const meta = await safeFetchMetadata(umi, tokenMint)
        setCost({
          amount: Number(tokenCost),
          name: meta?.name || "Token",
        })
        const tokenAddress = getAssociatedTokenAddressSync(toWeb3JsPublicKey(tokenMint), toWeb3JsPublicKey(umi.identity.publicKey), undefined, TOKEN_2022_PROGRAM_ID)
        //TODO Handle fetch token2022 balance
        const tokenAccount = await connection.getAccountInfo(tokenAddress).catch((e) => { return null })
            if (!tokenAccount) {
                toast({
                    title: "Insufficient Balance",
                    description: `You need at least ${token2022PaymentGuard.amount} ${meta?.name || "token"} to mint this NFT.`,
                    duration: 5000,
                })
                setDisableMint(true)
                return
            }
      }
      
    if (remaining > 0) {
      setDisableMint(false)
    }
  }, [candyMachine, guardToUse, candyGuard, group, connected, wallet])

  useEffect(() => {
    checkCandyMachine()
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candyMachine, candyGuard, wallet, connected])

  return (
    <Card
      className={cn(
        "w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-[500px]",
        className
      )}
      {...props}
    >
      <CardHeader>
        <CardTitle>Mint</CardTitle>
        <CardDescription>Mint description</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {startDate && !isLive ? (
          <Countdown targetDate={startDate} hideOnComplete />
        ) : (
          <div className="flex">
            <span className="ml-2 inline-block rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs font-medium leading-none text-[#000000] no-underline group-hover:no-underline">
              Live
            </span>{" "}
          </div>
        )}
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <Calculator />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Cost: {cost.amount} {cost.name}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid gap-2">
        <MintProgress minted={countMinted} total={countTotal} />
        <MintButton
          className="w-full"
          candyGuard={candyGuard}
          candyMachine={candyMachine}
          group={group}
          guardToUse={guardToUse}
          onMintCallback={onMint}
          disabled={disableMint}
          setDisabledCallback={setDisabledCallback}
          setMessageCallback={setMessage}
        />
        {mintLimit ? (
          <div className=" flex items-center space-x-4 p-2">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Limit {mintLimit} per wallet
              </p>
            </div>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  )
}
