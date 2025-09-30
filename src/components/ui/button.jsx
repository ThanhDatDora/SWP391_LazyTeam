import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
export function Button({ asChild, className, variant='default', size='default', ...props }){
  const Comp = asChild ? Slot : 'button'
  const base = 'inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const variants = { default:'bg-foreground text-background hover:bg-black/90', secondary:'bg-secondary text-secondary-foreground hover:bg-secondary/80', outline:'border bg-white hover:bg-muted', ghost:'hover:bg-muted' }
  const sizes = { sm:'h-8 px-3', default:'h-10 px-4', lg:'h-11 px-6' }
  return <Comp className={cn(base, variants[variant]||variants.default, sizes[size]||sizes.default, className)} {...props} />
}