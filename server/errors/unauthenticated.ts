import StatusCodes from "http-status-codes";
import CustomAPIError from "./customError";

class UnauthenticatedError extends CustomAPIError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export default UnauthenticatedError;
