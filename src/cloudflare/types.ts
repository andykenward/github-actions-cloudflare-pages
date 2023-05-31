export interface FetchError {
  code: number
  message: string
  error_chain?: FetchError[]
}

export interface FetchNoResult {
  success: boolean
  errors: FetchError[]
}

export interface FetchResult<ResponseType = unknown> extends FetchNoResult {
  result: ResponseType
  messages: string[]
  result_info?: unknown
}
