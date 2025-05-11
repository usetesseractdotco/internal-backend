import type { FastifyInstance } from 'fastify'
import type { FastifySchemaValidationError } from 'fastify/types/schema'
import { ZodError } from 'zod'

type FastifyErrorHandler = FastifyInstance['errorHandler']

const formatFastifyValidationError = (
  validationErrors: FastifySchemaValidationError[] | undefined,
) => {
  if (!validationErrors) {
    return []
  }
  const formattedErrors: Array<{ field: string; message: string }> =
    validationErrors.map((error) => {
      const field = error.instancePath
        ? error.instancePath.substring(1)
        : 'global'

      return {
        field,
        message: error.message ?? '',
      }
    })

  return formattedErrors
}

export const errorHandler: FastifyErrorHandler = (err, req, res) => {
  if (err.code === 'FST_ERR_VALIDATION') {
    const errors = formatFastifyValidationError(err.validation)

    return res.status(400).send({
      message: 'Validation error',
      errors,
    })
  }

  if (err instanceof ZodError) {
    // This part is still useful for manual Zod validation
    const formattedErrors = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }))

    return res.status(400).send({
      message: 'Validation error',
      errors: formattedErrors,
    })
  }

  req.log.error(`Unexpected error`, err) // TODO: here we should send this error to an observability service

  return res.status(500).send({ message: 'Internal server error' })
}
