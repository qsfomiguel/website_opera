import { cn } from "@/lib/utils";

export function PlaceholderImage({
  className,
  ratio,
}: {
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-secondary to-background",
        className,
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <div
        className="absolute inset-0 text-foreground opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 14px)",
        }}
      />
    </div>
  );
}
