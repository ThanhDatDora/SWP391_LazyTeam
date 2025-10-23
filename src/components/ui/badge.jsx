import * as React from 'react';
import { cn } from '../../lib/utils';
export function Badge({ className, variant='default', ...props }){
  const variants = { default:'bg-muted text-foreground', outline:'border' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs', variants[variant]||variants.default, className)} {...props} />;
}