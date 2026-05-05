class ApiResponse {
  static success(res, data = {}, message = "Succès", statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }
  static created(res, data = {}, message = "Créé avec succès") {
    return ApiResponse.success(res, data, message, 201);
  }
  static noContent(res) {
    return res.status(204).send();
  }
  static paginated(res, data, pagination) {
    return res.status(200).json({ success: true, data, pagination });
  }
}

export default ApiResponse;
