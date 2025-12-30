class resHandler {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; 
  }
}

const ok = (res, data, message = "success") => {
  return res.status(200).json(new resHandler(200, data, message));
};

const created = (res, data, message = "created") => {
  return res.status(201).json(new resHandler(201, data, message));
};

const badRequest = (res, message = "Bad request") => {
  return res.status(400).json(new resHandler(400, null, message));
};

const notFound = (res, message = "Not found") => {
  return res.status(404).json(new resHandler(404, null, message));
};

const serverError = (res, message = "Internal server error") => {
  return res.status(500).json(new resHandler(500, null, message));
};

export { resHandler, ok, created, badRequest, notFound, serverError };
