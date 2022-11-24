import type { VerifyOptions } from 'jsonwebtoken';

type Option = 'AUTH_VERIFY' | 'SIGNUP_VERIFY';

const jwtOption: Record<Option, VerifyOptions> = {
  AUTH_VERIFY: {
    algorithms: ['HS256'],
    issuer: 'preRanking'
  },
  SIGNUP_VERIFY: {
    algorithms: ['HS256'],
    issuer: 'preRanking'
  }
};

export default jwtOption;
