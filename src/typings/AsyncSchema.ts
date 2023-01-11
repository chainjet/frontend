export interface AsyncSchema {
  name: string
  integrationId: string
  integrationAction?: string
  integrationTrigger?: string
  accountId?: string
  dependencies?: string[]
}
