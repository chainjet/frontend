import { CursorPaging } from '../../graphql'

export type QueryById = {
  id: string
}

export type QueryMany<FILTER, SORTING> = {
  paging?: CursorPaging
  filter?: FILTER
  sorting?: SORTING[]
  search?: string
}

