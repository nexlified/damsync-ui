export interface Folder {
  id: string
  org_id: string
  parent_id: string | null
  name: string
  path: string
  children?: Folder[]
  created_at: string
  updated_at: string
}

export interface FolderRequest {
  name: string
  parent_id?: string
}
