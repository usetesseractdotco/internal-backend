type ErrorObject<T = string, D = unknown> = {
  code: number
  message: T
  details?: D
}

type ErrorResult<T = string, D = unknown> = {
  error: ErrorObject<T, D>
}

type SuccessResult<T> = {
  status: 'ok'
  code: number
  data: T
}

export type Result<T, E = string, D = unknown> =
  | SuccessResult<T>
  | ErrorResult<E, D>

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

export const error = <T = string, D = unknown>({
  message,
  code = 400,
  details,
}: {
  message: T
  code?: number
  details?: D
}): ErrorResult<T, D> => {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  } as const
}
