export function Input({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-foreground">{label}</label>}
      <input
 className="bg-background border border-border text-foreground px-4 py-2.5 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary min-h-11"        {...props}
      />
    </div>
  )
}
