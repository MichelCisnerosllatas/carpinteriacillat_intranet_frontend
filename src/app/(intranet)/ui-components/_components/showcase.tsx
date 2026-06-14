'use client'

import React, { useState } from 'react'
// Toast helpers
import { toastSuccess, toastError, toastWarning, toastInfo, toastPromise } from '@/shared/lib/toast'
// SweetAlert2 helpers
import { swalConfirm, swalSuccess, swalError, swalWarning, swalInput } from '@/shared/lib/swal'
// Axios instance
import api from '@/shared/api/apiClient'
import { sleep } from '@/shared/lib/utils'
import {
  Bell, Check, ChevronDown, Info, Loader2, Mail, Moon,
  Plus, Search, Settings, Sun, Trash, User, X,
} from 'lucide-react'
import { useTheme } from 'next-themes'

// ── shadcn/ui ui ──────────────────────────────────────────────────
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { Switch } from '@/shared/ui/switch'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { ScrollArea } from '@/shared/ui/scroll-area'

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
      <Separator />
    </section>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────
export function UIComponentsShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)
  const [switchOn, setSwitchOn] = useState(false)
  const [checked, setChecked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch: theme is only known on the client
  React.useEffect(() => setMounted(true), [])

  return (
    <TooltipProvider>
      <div className="space-y-10 max-w-5xl">

        {/* ── Button ─────────────────────────────────────────────────── */}
        <Section title="Button" description="import { Button } from '@/shared/ui/button'">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Plus className="size-4" /></Button>
          <Button disabled><Loader2 className="mr-2 size-4 animate-spin" />Loading</Button>
        </Section>

        {/* ── Badge ──────────────────────────────────────────────────── */}
        <Section title="Badge" description="import { Badge } from '@/shared/ui/badge'">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Section>

        {/* ── Alert ──────────────────────────────────────────────────── */}
        <Section title="Alert" description="import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert'">
          <Alert className="w-full max-w-md">
            <Info className="size-4" />
            <AlertTitle>Info alert</AlertTitle>
            <AlertDescription>This is an informational alert message.</AlertDescription>
          </Alert>
          <Alert variant="destructive" className="w-full max-w-md">
            <X className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong. Please try again.</AlertDescription>
          </Alert>
        </Section>

        {/* ── Avatar ─────────────────────────────────────────────────── */}
        <Section title="Avatar" description="import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <Avatar className="size-12">
            <AvatarFallback className="text-lg">JD</AvatarFallback>
          </Avatar>
        </Section>

        {/* ── Input & Label ──────────────────────────────────────────── */}
        <Section title="Input & Label" description="import { Input } from '@/shared/ui/input'  |  import { Label } from '@/shared/ui/label'">
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="email-demo">Email</Label>
            <Input id="email-demo" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="search-demo">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input id="search-demo" className="pl-8" placeholder="Search..." />
            </div>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="disabled-demo">Disabled</Label>
            <Input id="disabled-demo" placeholder="Disabled input" disabled />
          </div>
        </Section>

        {/* ── Textarea ───────────────────────────────────────────────── */}
        <Section title="Textarea" description="import { Textarea } from '@/shared/ui/textarea'">
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" placeholder="Type your message here..." />
          </div>
        </Section>

        {/* ── Select ─────────────────────────────────────────────────── */}
        <Section title="Select" description="import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/shared/ui/select'">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        {/* ── Checkbox & Switch ──────────────────────────────────────── */}
        <Section title="Checkbox & Switch" description="import { Checkbox } from '@/shared/ui/checkbox'  |  import { Switch } from '@/shared/ui/switch'">
          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={checked}
              onCheckedChange={(v) => setChecked(Boolean(v))}
            />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="notifications"
              checked={switchOn}
              onCheckedChange={setSwitchOn}
            />
            <Label htmlFor="notifications">Enable notifications</Label>
          </div>
        </Section>

        {/* ── Card ───────────────────────────────────────────────────── */}
        <Section title="Card" description="import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card'">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Card content. You can put any content inside a card.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Action</Button>
              <Button size="sm" variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </Section>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Section title="Tabs" description="import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'">
          <Tabs defaultValue="account" className="w-96">
            <TabsList className="w-full">
              <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
              <TabsTrigger value="password" className="flex-1">Password</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader><CardTitle>Account</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Account tab content.</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <CardHeader><CardTitle>Password</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Password tab content.</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Settings tab content.</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>

        {/* ── Dropdown Menu ──────────────────────────────────────────── */}
        <Section title="Dropdown Menu" description="import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/shared/ui/dropdown-menu'">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Options <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="mr-2 size-4" />Profile</DropdownMenuItem>
              <DropdownMenuItem><Settings className="mr-2 size-4" />Settings</DropdownMenuItem>
              <DropdownMenuItem><Bell className="mr-2 size-4" />Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 size-4" />Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        {/* ── Dialog ─────────────────────────────────────────────────── */}
        <Section title="Dialog" description="import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description. Use dialogs for important interactions.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-sm text-muted-foreground">
                Dialog body content goes here.
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* ── Alert Dialog ───────────────────────────────────────────── */}
        <Section title="Alert Dialog" description="import { AlertDialog, AlertDialogTrigger, AlertDialogContent, ... } from '@/shared/ui/alert-dialog'">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Item</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Yes, delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        {/* ── Collapsible ────────────────────────────────────────────── */}
        <Section title="Collapsible" description="import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/collapsible'">
          <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen} className="w-72 space-y-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Toggle section
                <ChevronDown className={`size-4 transition-transform ${collapsibleOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent space-y-2">
              <div className="rounded-md border px-4 py-2 text-sm">Item one</div>
              <div className="rounded-md border px-4 py-2 text-sm">Item two</div>
              <div className="rounded-md border px-4 py-2 text-sm">Item three</div>
            </CollapsibleContent>
          </Collapsible>
        </Section>

        {/* ── Tooltip ────────────────────────────────────────────────── */}
        <Section title="Tooltip" description="import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/shared/ui/tooltip'">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon"><Info className="size-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>This is a tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline"><Bell className="mr-2 size-4" />Hover me</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Notifications are enabled</TooltipContent>
          </Tooltip>
        </Section>

        {/* ── Skeleton ───────────────────────────────────────────────── */}
        <Section title="Skeleton" description="import { Skeleton } from '@/shared/ui/skeleton'">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-44" />
          </div>
        </Section>

        {/* ── Table ──────────────────────────────────────────────────── */}
        <Section title="Table" description="import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'">
          <Table className="w-full max-w-2xl">
            <TableCaption>A list of recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 'INV-001', status: 'Paid',    method: 'Credit Card', amount: '$250.00' },
                { id: 'INV-002', status: 'Pending', method: 'PayPal',      amount: '$150.00' },
                { id: 'INV-003', status: 'Unpaid',  method: 'Bank Transfer', amount: '$350.00' },
              ].map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell className="text-right">{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        {/* ── Scroll Area ────────────────────────────────────────────── */}
        <Section title="Scroll Area" description="import { ScrollArea } from '@/shared/ui/scroll-area'">
          <ScrollArea className="h-48 w-64 rounded-md border p-4">
            <div className="space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="text-sm">Scroll item {i + 1}</div>
              ))}
            </div>
          </ScrollArea>
        </Section>

        {/* ── Separator ──────────────────────────────────────────────── */}
        <Section title="Separator" description="import { Separator } from '@/shared/ui/separator'">
          <div className="w-64 space-y-2">
            <div className="text-sm">Above</div>
            <Separator />
            <div className="text-sm">Below</div>
          </div>
          <div className="flex h-10 items-center gap-3">
            <span className="text-sm">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Right</span>
          </div>
        </Section>

        {/* ── Theme toggle (next-themes) ──────────────────────────────── */}
        <Section title="Theme Toggle (next-themes)" description="useTheme() from 'next-themes'">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <span className="text-sm text-muted-foreground">Current: <strong>{theme}</strong></span>
        </Section>

        {/* ── Toast (sonner) ─────────────────────────────────────────── */}
        <Section title="Toast — sonner" description="import { toastSuccess, toastError, toastWarning, toastInfo, toastPromise } from '@/shared/lib/toast'">
          <Button variant="outline" className="border-green-500 text-green-600" onClick={() => toastSuccess('Success!', 'Operation completed successfully.')}>
            Success
          </Button>
          <Button variant="outline" className="border-red-500 text-red-600" onClick={() => toastError('Error!', 'Something went wrong.')}>
            Error
          </Button>
          <Button variant="outline" className="border-yellow-500 text-yellow-600" onClick={() => toastWarning('Warning!', 'This action may have side effects.')}>
            Warning
          </Button>
          <Button variant="outline" className="border-blue-500 text-blue-600" onClick={() => toastInfo('Info', 'Here is some useful information.')}>
            Info
          </Button>
          <Button variant="outline" onClick={() => toastPromise(sleep(2000), { loading: 'Processing...', success: 'Done!', error: 'Failed.' })}>
            Promise Toast
          </Button>
        </Section>

        {/* ── SweetAlert2 ────────────────────────────────────────────── */}
        <Section title="SweetAlert2" description="import { swalConfirm, swalSuccess, swalError, swalWarning, swalInput } from '@/shared/lib/swal'">
          <Button variant="outline" onClick={async () => {
            const ok = await swalConfirm({ title: 'Are you sure?', text: 'This cannot be undone.', danger: true })
            if (ok) toastSuccess('Confirmed!', 'You confirmed the action.')
          }}>
            Confirm (danger)
          </Button>
          <Button variant="outline" onClick={() => swalSuccess('Success!', 'The operation was completed.')}>
            Success Alert
          </Button>
          <Button variant="outline" onClick={() => swalError('Error', 'Something went wrong.')}>
            Error Alert
          </Button>
          <Button variant="outline" onClick={() => swalWarning('Warning', 'Proceed with caution.')}>
            Warning Alert
          </Button>
          <Button variant="outline" onClick={async () => {
            const { value } = await swalInput({ title: 'Enter your name', inputPlaceholder: 'John Doe' })
            if (value) toastInfo('Input received', `You entered: ${value}`)
          }}>
            Input Dialog
          </Button>
        </Section>

        {/* ── Axios ──────────────────────────────────────────────────── */}
        <Section title="Axios" description="import { api } from '@/shared/services/api'  — configured in src/shared/services/api.ts">
          <div className="w-full max-w-2xl space-y-3 rounded-lg border p-4 text-sm">
            <p className="font-medium">Config file: <code className="rounded bg-muted px-1 py-0.5">src/shared/services/api.ts</code></p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Base URL from <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code> env variable</li>
              <li>Request interceptor → attaches <code className="rounded bg-muted px-1">Bearer token</code> from auth store</li>
              <li>Response interceptor → handles 401 (auto logout) and normalises error messages</li>
            </ul>
            <pre className="mt-2 rounded bg-muted p-3 text-xs overflow-x-auto">{`import { api, apiGet, apiPost } from '@/shared/services/api'

// Full response
const res = await api.get('/users')

// Data directly (typed)
const users = await apiGet<User[]>('/users')
const user  = await apiPost<User>('/users', { name: 'John' })`}</pre>
          </div>
        </Section>


      </div>
    </TooltipProvider>
  )
}