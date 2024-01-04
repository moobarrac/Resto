import StatusCodes from "http-status-codes";
import CustomAPIError from "./customError";

class UnauthorizedError extends CustomAPIError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export default UnauthorizedError;
