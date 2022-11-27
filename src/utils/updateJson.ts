import type { Request } from 'express';

const updateJson = (req: Request, json: Request['json']) => {
  if (!req.json) {
    req.json = {} as Request['json'];
  }

  Object.entries(json).forEach(([key, value]) => {
    req.json[key] = value;
  });
};

export default updateJson;
