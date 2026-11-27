
export type ReorderItem = {
  id: number
  name: string
  stateValue: number
}

export type ReorderGroup = {
  idNavigation: number
  navigationName: string
  items: ReorderItem[]
}
