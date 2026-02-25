export type EntityType = 'person' | 'date' | 'address' | 'id' | 'organization';

export type AppPage = 'home' | 'loading' | 'workflow';

export interface DetectedEntity {
  id: string
  text: string
  type: EntityType
  page: number
  included: boolean
}

export interface UploadedFile {
  name: string
  size: number
  file: File
}
