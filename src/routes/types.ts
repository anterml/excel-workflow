export type EntityId = string

export type Entity = {
  value: string | number,
  id: EntityId,
}

export type EntitySuperRowId = `super_${EntityId}` 

export type EntityUrls = Record<EntityId, string>
export type EntityStyles = Record<EntityId, string>

export type Records = Record<string, {
  value: string,
  id: string,
}[]>

export type Eng2Ru = Record<string, string>

export type CellSettings = Record<string, {
  style?: string,
  url?: string,
}>

export type Cell = {
  value: string | number,
  id: string,
  type?: 'record',
  color?: string,
  descr?: string
}

export type ColumnSettings = Record<string, string>

export type EntitySettings = Record<string, {
  style?: string,
  url?: string,
}>

export type ColumnTitle = string

export type DataType = { id: string, value: Record<ColumnTitle, Cell> }[]
