const { statusCode } = require("./constant");
const resMsg = require("./messages");

class Response {
  successResponse(res, status = 200, message, data, metadata) {
    res.status(status).send({
      status,
      message,
      data: data ? data : [],
      metadata: metadata ? metadata : {},
    });
  }

  errorResponse(
    res,
    status = statusCode.SERVER_ERROR,
    message = resMsg.SERVER_ERROR,
    data = []
  ) {
    res.status(status).send({
      status,
      message,
      data,
    });
  }
}

module.exports = new Response();
