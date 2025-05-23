export const commonOrganizationErrors = {
  ORGANIZATION_NOT_FOUND: {
    code: 404,
    message: 'ORGANIZATION_NOT_FOUND',
    details: 'Organization not found',
  },
  NOT_ORGANIZATION_OWNER: {
    code: 403,
    message: 'NOT_ORGANIZATION_OWNER',
    details: 'User is not the owner of the organization',
  },
  FAILED_TO_DELETE_ORGANIZATION: {
    code: 500,
    message: 'FAILED_TO_DELETE_ORGANIZATION',
    details: 'Failed to delete organization',
  },
  ORGANIZATION_INVITE_NOT_CREATED: {
    code: 500,
    message: 'ORGANIZATION_INVITE_NOT_CREATED',
    details: 'Failed to create organization invite',
  },
}
