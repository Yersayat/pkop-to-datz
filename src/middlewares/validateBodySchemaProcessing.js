import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ApiError } from '../lib/errors.js';
import requestSchema from '../schemas/processingMonthly.request.schema.json' assert { type: 'json' };

const ajv = new Ajv({ allErrors: true, coerceTypes: false, strict: false });
addFormats(ajv);
const validate = ajv.compile(requestSchema);

export function validateProcessingMonthlyBody(req, _res, next) {
  const ok = validate(req.body);
  if (ok) return next();
  const [first] = validate.errors || [];
  const message = first ? `${first.instancePath || 'body'} ${first.message}` : 'Validation error';
  return next(new ApiError(422, 'VALIDATION_FAILED', message, { errors: validate.errors }));
}
