import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { SignUpForm } from '@/features/auth/ui/sign-up-form'

export const metadata: Metadata = { title: 'Sign Up' }

export default function SignUpPage() {
  return (
    <div className="container grid h-svh max-w-none items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:p-8">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">A</div>
          <h1 className="text-xl font-medium">Admin Dashboard</h1>
        </div>
        <Card className="max-w-sm gap-4">
          <CardHeader>
            <CardTitle className="text-lg tracking-tight">Create an account</CardTitle>
            <CardDescription>
              Enter your email and password to create an account.{' '}
              Already have an account?{' '}
              <Link href="/sign-in" className="underline underline-offset-4 hover:text-primary">Sign In</Link>
            </CardDescription>
          </CardHeader>
          <CardContent><SignUpForm /></CardContent>
          <CardFooter>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
