export class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
export function errorBody(code, message, details) {
  return { error: { code, message, details } };
}
