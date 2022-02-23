module.exports = {
    generic: {
      ERRORSESSION: `Connection not active`,
      ERROR: `Something Went Wrong`,
      SUCCESS: `API Call Successful`,
      ERROR_CONNECTION: 'Connection lost'
    },
    server: {
      DB_ERROR: `Database Error`,
      JWT_ERROR: `You are not authenticated, Token Expired`,
      SEAL_ERROR: `User verification error`,
      ACCESS_ERROR: `You are not authorized to perform this operation`,
      MISSING_FORM_DATA_ERROR: `Missing Form Data`,
      VALIDATION_ERROR: 'Validation error',
      RESTRICTED_FORM_DATA: `Error in Form Data`,
      ROUTE_NOT_FOUND: `Requested route is not found`,
      MISSING_KEY: `Missing Service Key in Headers`,
      INVALID_KEY: `Service Key is not valid`,
      KEY_JWT_ERR: `Can not use SERVICE KEY and USER TOKEN at the same time`,
      ERROR_API_VERSION: 'Api version not matched'
    }
  };
