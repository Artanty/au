export interface GetProvidersResItem {
  "id": number
  "name": string
  "provider_type": string
  "created_at": string
}
export interface GetProvidersRes {
  data: GetProvidersResItem[]
};