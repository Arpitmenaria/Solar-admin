interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  error?: string;
}

export function FormField({ label, htmlFor, children, error }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-label">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
