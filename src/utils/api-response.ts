type ErrorResult<T> = {
  status: 'error'
  code: number
  message: T
}

type SuccessResult<T> = {
  status: 'ok'
  code: number
  data: T
}

export type Result<T> = SuccessResult<T> | ErrorResult<T>

export const success = <T>({
  data,
  code = 200,
}: {
  data: T
  code?: number
}): SuccessResult<T> => {
  return {
    code,
    data,
    status: 'ok',
  } as const
}

export const error = <T>({
  message,
  code = 400,
}: {
  message: T
  code?: number
}): ErrorResult<T> => {
  return {
    code,
    message,
    status: 'error',
  } as const
}
