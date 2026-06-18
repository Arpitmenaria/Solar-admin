interface PaginationButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label?: string;
}

export function PaginationButton({ icon, onClick, disabled, label }: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
    >
      {icon}
    </button>
  );
}
