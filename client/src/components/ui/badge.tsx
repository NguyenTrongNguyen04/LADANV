import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'muted';

const variantClasses: Record<Variant, string> = {
  default: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  muted: 'bg-slate-100 text-slate-600 border-transparent'
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold', variantClasses[variant], className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

