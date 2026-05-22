const JSON_HEADER = { 'Content-Type': 'application/json' };

export const ok = (body: unknown) => ({
  statusCode: 200,
  body: JSON.stringify(body),
  headers: JSON_HEADER,
});

export const created = (body: unknown) => ({
  statusCode: 201,
  body: JSON.stringify(body),
  headers: JSON_HEADER,
});

export const noContent = () => ({
  statusCode: 204,
  body: '',
  headers: JSON_HEADER,
});

export const err = (status: number, msg: string) => ({
  statusCode: status,
  body: JSON.stringify({ error: msg }),
  headers: JSON_HEADER,
});

export const badRequest = (msg = 'Bad request') => err(400, msg);
export const unauthorized = () => err(401, 'Unauthorized');
export const forbidden = (msg = 'Forbidden') => err(403, msg);
export const notFound = (msg = 'Not found') => err(404, msg);
export const methodNotAllowed = () => err(405, 'Method not allowed');
export const serverError = (e: unknown) => {
  console.error(e);
  return err(500, 'Internal server error');
};
