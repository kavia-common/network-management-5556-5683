const ipRegex =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;

// PUBLIC_INTERFACE
export function validateDevice(values) {
  /**
   * Validates device fields.
   * Required: name, ip, type (router|switch|server), location, status (online|offline).
   * IP must be valid IPv4.
   */
  const errors = {};
  if (!values.name || !values.name.trim()) errors.name = 'Name is required';
  if (!values.ip || !values.ip.trim()) errors.ip = 'IP is required';
  else if (!ipRegex.test(values.ip.trim())) errors.ip = 'Invalid IPv4 address';
  if (!values.type) errors.type = 'Type is required';
  else if (!['router', 'switch', 'server'].includes(values.type)) errors.type = 'Type must be router, switch, or server';
  if (!values.location || !values.location.trim()) errors.location = 'Location is required';
  if (!values.status) errors.status = 'Status is required';
  else if (!['online', 'offline'].includes(values.status)) errors.status = 'Status must be online or offline';
  return errors;
}

// PUBLIC_INTERFACE
export function hasErrors(errors) {
  /** Returns true if any error message exists. */
  return Object.values(errors).some(Boolean);
}
