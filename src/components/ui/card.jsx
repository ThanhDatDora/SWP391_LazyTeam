import * as React from 'react';
import { cn } from '../../lib/utils';
export function Card({ className, ...props }){ return <div className={cn('rounded-2xl border bg-white text-foreground shadow-sm', className)} {...props} />; }
export function CardHeader({ className, ...props }){ return <div className={cn('p-4 border-b', className)} {...props} />; }
export function CardTitle({ className, ...props }){ return <h3 className={cn('text-lg font-semibold', className)} {...props} />; }
export function CardDescription({ className, ...props }){ return <p className={cn('text-sm text-muted-foreground', className)} {...props} />; }
export function CardContent({ className, ...props }){ return <div className={cn('p-4', className)} {...props} />; }