'use client'

import React, { createContext, useContext, useState } from 'react'
import type { User } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

const UsersContext = createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, _setOpen] = useState<UsersDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  const setOpen = (str: UsersDialogType | null) =>
    _setOpen((prev) => (prev === str ? null : str))

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext>
  )
}

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers must be used within <UsersProvider>')
  return ctx
}
