class GenericError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends GenericError {
  constructor(message) {
    super(message, 404);
  }
}

export default class BusinessError extends GenericError {
  constructor(message) {
    super(message, 400);
  }
}

export class AuthError extends GenericError {
  constructor(message) {
    super(message, 401);
  }
}
