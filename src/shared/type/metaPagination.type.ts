export type MetaPaginationType = {
  current_page: number,
  from: number,
  last_page: number,
  links: links[],
  path: string,
  per_page: number,
  to: number,
  total: number
}

type links = {
  url: string | null,
  label: string,
  page: number | null,
  active: boolean
}