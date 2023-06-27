// BotTaxGuardCard.tsx
import { FC } from "react";
import GuardCard from "../guard-card";
import { StartDate } from '@metaplex-foundation/mpl-candy-machine';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { unixTimestampToUTCDate } from "@/lib/utils";

interface StartDateGuardCardProps {
  guardData: StartDate;
  onUpdate: () => void;
  onRemove: () => void;
}

const StartDateGuardCard: FC<StartDateGuardCardProps> = ({ guardData, onUpdate, onRemove }) => {
    console.log(guardData);
  return (
    <GuardCard guardName="Start Date Guard" onUpdate={onUpdate} onRemove={onRemove}>
      <p>Start Date: {unixTimestampToUTCDate(Number(guardData.date))} UTC</p>
    </GuardCard>
  );
};

export default StartDateGuardCard;