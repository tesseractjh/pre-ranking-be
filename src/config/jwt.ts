import type { VerifyOptions } from 'jsonwebtoken';

type Option = 'SIGNUP_VERIFY';

const jwtOption: Record<Option, VerifyOptions> = {
  SIGNUP_VERIFY: {
    algorithms: ['HS256'],
    issuer: 'preRanking'
  }
};

export default jwtOption;
