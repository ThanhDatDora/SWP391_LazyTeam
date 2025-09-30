import * as React from 'react'
import { cn } from '@/lib/utils'
export function Table({ className, ...props }){ return <table className={cn('w-full text-sm border rounded-2xl overflow-hidden', className)} {...props}/> }
export function TableHeader({ className, ...props }){ return <thead className={cn('bg-muted/50', className)} {...props}/> }
export function TableHead({ className, ...props }){ return <th className={cn('px-3 py-2 text-left border-b', className)} {...props}/> }
export function TableRow({ className, ...props }){ return <tr className={cn('border-b', className)} {...props}/> }
export function TableBody({ className, ...props }){ return <tbody className={cn('', className)} {...props}/> }
export function TableCell({ className, ...props }){ return <td className={cn('px-3 py-2', className)} {...props}/> }