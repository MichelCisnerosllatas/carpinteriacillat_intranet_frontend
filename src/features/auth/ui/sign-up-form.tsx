'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { cn, sleep } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'

const schema = z.object({
  email: z.email({ error: (i) => (i.input === '' ? 'Please enter your email.' : undefined) }),
  password: z.string().min(1, 'Please enter your password.').min(7, 'Password must be at least 7 characters long.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match.", path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

export function SignUpForm({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  function onSubmit(data: FormValues) {
    setIsLoading(true)
    toast.promise(sleep(2000), {
      loading: 'Creating account...',
      success: () => { setIsLoading(false); return `Account created for ${data.email}.` },
      error: () => { setIsLoading(false); return 'Failed to create account.' },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-3', className)} {...props}>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><PasswordInput placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button className="mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus />} Create Account
        </Button>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" disabled={isLoading}>GitHub</Button>
          <Button variant="outline" type="button" disabled={isLoading}>Google</Button>
        </div>
      </form>
    </Form>
  )
}
