"use client"

import GuardsContainer from "@/components/guard-container";
import { MintNav } from "@/components/mint-nav"
import { useCandyMachine } from "@/hooks/useCandymachine"
import { useUmi } from "@/hooks/useUmi";
import { DefaultGuardSet } from "@metaplex-foundation/mpl-candy-machine";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";

export default function GuardPage() {
    const umi = useUmi();
    const { candyGuard, fetchCM } = useCandyMachine(umi);
    const [guardToUse, setGuardToUse] = useState<DefaultGuardSet>(candyGuard?.guards);

    useEffect(() => {
        if (!candyGuard) return;
        setGuardToUse(candyGuard?.guards);
    }, [candyGuard]);

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <MintNav />
      <div className="flex flex-col gap-4 md:flex-row">
        { guardToUse ? <GuardsContainer candyGuard={candyGuard} onChange={() => fetchCM(umi)} /> : <p>No guards found</p> }
      </div>
    </section>
  )
}
