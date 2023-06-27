// BotTaxGuardCard.tsx
import { FC } from "react";
import GuardCard from "../guard-card";
import { BotTax } from "@metaplex-foundation/mpl-candy-machine";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface BotTaxGuardCardProps {
  guardData: BotTax;
  onUpdate: () => void;
  onRemove: () => void;
}

const BotTaxGuardCard: FC<BotTaxGuardCardProps> = ({ guardData, onUpdate, onRemove }) => {
    console.log(guardData);
  return (
    <GuardCard guardName="Bot Tax Guard" onUpdate={onUpdate} onRemove={onRemove}>
      <p>{guardData.lamports.identifier}: {Number(guardData.lamports.basisPoints) / LAMPORTS_PER_SOL}</p>
      <p>Last Instruction: {guardData.lastInstruction.toString()}</p>
    </GuardCard>
  );
};

export default BotTaxGuardCard;