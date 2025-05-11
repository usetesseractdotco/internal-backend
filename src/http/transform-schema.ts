import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { z } from 'zod'

const extendedFastifySchemaBody = z.object({
  type: z.string(),
  required: z.array(z.string()).optional().default([]),
  properties: z.record(z.unknown()),
})

const extendedFastifySchema = z
  .object({
    consumes: z.array(z.string()).optional(),
    body: extendedFastifySchemaBody.optional(),
  })
  .and(z.record(z.unknown())) // to allow other fastify schema properties

export function transformSwaggerSchema(
  data: Parameters<typeof jsonSchemaTransform>[0],
): ReturnType<typeof jsonSchemaTransform> {
  const { schema, url } = jsonSchemaTransform(data)

  const parsedSchema = extendedFastifySchema.parse(schema)

  if (parsedSchema.consumes?.includes('multipart/form-data')) {
    // create a new body if it doesn't exist
    const body = parsedSchema.body ?? {
      type: 'object',
      required: [],
      properties: {},
    }

    // add file property
    body.properties.file = {
      type: 'string',
      format: 'binary',
    }

    // ensure file is in required array
    if (!body.required.includes('file')) {
      body.required.push('file')
    }

    // update the schema with the modified body
    parsedSchema.body = body
  }

  return { schema: parsedSchema, url }
}
