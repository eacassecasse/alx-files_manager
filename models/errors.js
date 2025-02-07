export default class GenericError extends Error {
  constructor(message, code = 500) {
    super();
    this.code = code;
    this.message = message;
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends GenericError {
  constructor(message) {
    super(message, 404);
  }
}

export class BusinessError extends GenericError {
  constructor(message) {
    super(message, 400);
  }
}

export class AuthError extends GenericError {
  constructor(message) {
    super(message, 401);
  }
}
