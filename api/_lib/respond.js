/** Consistent JSON response helpers used across all routes. */

export const ok = (res, data) => res.status(200).json(data);
export const created = (res, data) => res.status(201).json(data);
export const noContent = (res) => res.status(204).end();

export const badRequest = (res, message = 'Bad request') =>
  res.status(400).json({ error: message });

export const unauthorized = (res, message = 'Unauthorized') =>
  res.status(401).json({ error: message });

export const forbidden = (res, message = 'Forbidden') =>
  res.status(403).json({ error: message });

export const notFound = (res, message = 'Not found') =>
  res.status(404).json({ error: message });

export const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
};

export const methodNotAllowed = (res) =>
  res.status(405).json({ error: 'Method not allowed' });
