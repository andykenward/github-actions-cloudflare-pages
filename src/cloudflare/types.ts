export interface FetchError {
  code: number
  message: string
  error_chain?: FetchError[]
}

export interface FetchResult<ResponseType = unknown> {
  success: boolean
  result: ResponseType
  errors: FetchError[]
  messages: string[]
  result_info?: unknown
}
