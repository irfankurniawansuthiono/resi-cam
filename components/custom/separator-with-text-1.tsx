import { Separator } from "@/components/ui/separator";

export const title = "With Text Center";

const SeparatorWithText = ({text, className}: {text: string, className?: string}) => (
  <div className={`${className} w-full`}>
    <div className="relative flex items-center gap-2">
      <Separator className="flex-1" />
      <span className="shrink-0 px-2 text-xs text-muted-foreground uppercase">
        {text}
      </span>
      <Separator className="flex-1" />
    </div>
  </div>
);

export default SeparatorWithText;
