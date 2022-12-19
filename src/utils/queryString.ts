const queryString = (obj: Record<string, unknown>) => {
  const params = Object.entries(obj)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`);

  return params.length ? `?${params.join('&')}` : '';
};

export default queryString;
