import StatusCodes from "http-status-codes";
import CustomAPIError from "./customError";

class BadRequestError extends CustomAPIError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export default BadRequestError;
