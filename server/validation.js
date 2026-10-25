/**
 * Pure input validation for the API. Every validator returns either
 * `{ value }` with cleaned data or `{ error }` with a user-facing message,
 * so route handlers stay free of parsing logic.
 */

const TEXT_FIELDS = ['make', 'model', 'category'];
const MAX_TEXT_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_ASSET_PATTERN = /^\/[a-zA-Z0-9._/-]+$/;

const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const has = (input, key) => input[key] !== undefined;

function isAllowedImageUrl(url) {
  if (LOCAL_ASSET_PATTERN.test(url)) return true;
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

/**
 * Validates a vehicle payload.
 * @param {object} input raw request body
 * @param {{ partial?: boolean }} options partial=true validates only supplied fields (for updates)
 */
export function validateVehicle(input = {}, { partial = false } = {}) {
  const value = {};
  const shouldCheck = (key) => !partial || has(input, key);

  for (const key of TEXT_FIELDS) {
    if (!shouldCheck(key)) continue;
    const text = clean(input[key]);
    if (!text || text.length > MAX_TEXT_LENGTH) return { error: `${key} must be 1–${MAX_TEXT_LENGTH} characters.` };
    value[key] = text;
  }

  if (shouldCheck('year')) {
    const maxYear = new Date().getFullYear() + 2;
    if (!Number.isInteger(input.year) || input.year < 1900 || input.year > maxYear) return { error: 'Enter a valid model year.' };
    value.year = input.year;
  }

  if (shouldCheck('price')) {
    if (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0) return { error: 'Price must be a non-negative number.' };
    value.price = input.price;
  }

  if (shouldCheck('quantity')) {
    if (!Number.isInteger(input.quantity) || input.quantity < 0) return { error: 'Quantity must be a non-negative whole number.' };
    value.quantity = input.quantity;
  }

  for (const key of ['imageUrl', 'description']) {
    if (partial && !has(input, key)) continue;
    if (input[key] != null && typeof input[key] !== 'string') return { error: `${key} must be text.` };
    value[key] = clean(input[key]);
  }

  if (value.imageUrl && !isAllowedImageUrl(value.imageUrl)) return { error: 'Image URL must be an http(s) URL or a local asset path.' };
  if (value.description?.length > MAX_DESCRIPTION_LENGTH) return { error: 'Description is too long.' };
  if (partial && Object.keys(value).length === 0) return { error: 'No details supplied.' };
  return { value };
}

/** Validates and normalises a registration request. Role is never accepted from the client. */
export function validateRegistration(input = {}) {
  const name = clean(input.name);
  const email = clean(input.email).toLowerCase();
  const { password } = input;
  const validPassword = typeof password === 'string' && password.length >= 10 && password.length <= 128;
  if (!name || name.length > MAX_TEXT_LENGTH || !EMAIL_PATTERN.test(email) || !validPassword) {
    return { error: 'Enter a name, valid email, and password of at least 10 characters.' };
  }
  return { value: { name, email, password } };
}

/** Parses search query-string filters, dropping empty values. */
export function parseSearchFilters(query = {}) {
  const value = {};
  for (const key of ['q', 'make', 'model', 'category']) {
    const text = clean(query[key]);
    if (text) value[key] = text;
  }
  for (const key of ['minPrice', 'maxPrice']) {
    if (query[key] === undefined || query[key] === '') continue;
    const amount = Number(query[key]);
    if (!Number.isFinite(amount) || amount < 0) return { error: 'Enter a valid price range.' };
    value[key] = amount;
  }
  if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) {
    return { error: 'Minimum price cannot exceed maximum price.' };
  }

  if (query.sortBy !== undefined && query.sortBy !== '') {
    const validSortFields = ['price', 'year', 'make', 'model', 'category', 'quantity', 'created_at', 'createdAt'];
    if (!validSortFields.includes(query.sortBy)) {
      return { error: `Invalid sortBy field. Allowed: ${validSortFields.join(', ')}.` };
    }
    value.sortBy = query.sortBy;
  }

  if (query.sortOrder !== undefined && query.sortOrder !== '') {
    const order = String(query.sortOrder).toLowerCase();
    if (order !== 'asc' && order !== 'desc') {
      return { error: "sortOrder must be 'asc' or 'desc'." };
    }
    value.sortOrder = order;
  }

  if (query.page !== undefined && query.page !== '') {
    const p = Number(query.page);
    if (!Number.isInteger(p) || p < 1) return { error: 'page must be a positive integer.' };
    value.page = p;
  }

  if (query.limit !== undefined && query.limit !== '') {
    const l = Number(query.limit);
    if (!Number.isInteger(l) || l < 1 || l > 100) return { error: 'limit must be between 1 and 100.' };
    value.limit = l;
  }

  return { value };
}

/** Restock amounts must be positive integers. */
export function validateRestock(quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: 'Quantity must be a positive whole number.' };
  return { value: quantity };
}
