// GuardsContainer.tsx
import { FC } from "react";
import { unwrapOption } from "@metaplex-foundation/umi";
import { CandyGuard, DefaultGuardSet, emptyDefaultGuardSetArgs } from "@metaplex-foundation/mpl-candy-machine";
import { mergeGuards } from "@/lib/utils";
import BotTaxGuardCard from "./guards/BotTaxGuardCard";
import StartDateGuardCard from "./guards/StartDateGuardCard";

interface GuardsContainerProps {
  candyGuard: CandyGuard<DefaultGuardSet>;
  groupLabel?: string;
  onChange?: () => Promise<void>;
}
type GuardCardKeys = keyof DefaultGuardSet;
type GuardCards = {
  [K in GuardCardKeys]?: FC<any>; // replace `any` with your specific guard props if necessary
}

const guardComponents: GuardCards = {
    botTax: BotTaxGuardCard,
    startDate: StartDateGuardCard
    // Map all your other GuardCard components here...
  };

const GuardsContainer: FC<GuardsContainerProps> = ({ candyGuard, groupLabel, onChange }) => {
  const guardGroup = candyGuard.groups.find((group) => group.label === groupLabel);
  let guards = candyGuard.guards;
  if (guardGroup) {
    guards = mergeGuards(guards, guardGroup.guards);
  }
  const test = Object.keys(emptyDefaultGuardSetArgs)
  console.log('test', test)
  const guardNames = Object.keys(candyGuard.guards);

  const handleUpdate = async (guardName: string, groupLabel?: string, args?: any) => {
    // Implement your update logic here
    console.log(`Update clicked for ${guardName}`);
    onChange && await onChange();
  };

  const handleRemove = async (guardName: string, groupLabel?: string, args?: any) => {
    // Implement your remove logic here
    console.log(`Remove clicked for ${guardName}`);
    onChange && await onChange();
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {guardNames.map((guardName) => {
        const guardData = unwrapOption(guards[guardName], () => null);
        const GuardComponent = guardComponents[guardName as GuardCardKeys];
        if (!GuardComponent) return null; // Skip if no corresponding component
        return (
          <GuardComponent 
            key={guardName} 
            guardName={guardName}
            groupLabel={groupLabel}
            guardData={guardData}
            onUpdate={() => handleUpdate(guardName)}
            onRemove={() => handleRemove(guardName)}
          />
        );
      })}
    </div>
  );
};

export default GuardsContainer;
