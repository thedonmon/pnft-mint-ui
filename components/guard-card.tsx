import { FC } from "react";
import { Card } from "./ui/card";
import { formatCamelCase } from "@/lib/utils";

type GuardCardProps = React.ComponentProps<typeof Card> & {
  guardName: string;
  groupLabel?: string;
  onUpdate: () => void;
  onRemove: () => void;
}

const GuardCard: FC<GuardCardProps> = ({ guardName, onUpdate, onRemove, children, groupLabel, ...props }) => {
  return (
    <div className="mb-4 w-full rounded border p-4 shadow sm:w-auto">
      <h2 className="mb-2 text-lg font-bold">{formatCamelCase(guardName)}</h2>
      {/* Display guardData here as needed */}
      {children}
      <button className="mr-2 mt-4 rounded bg-blue-500 px-4 py-2 text-white" onClick={onUpdate}>Update</button>
      <button className="mt-4 rounded bg-red-500 px-4 py-2 text-white" onClick={onRemove}>Remove</button>
    </div>
  );
};

export default GuardCard;