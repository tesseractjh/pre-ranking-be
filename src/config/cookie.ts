const cookieOption = {
  SIGNUP: { httpOnly: true, signed: true },
  REFRESH_TOKEN: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    signed: true
  }
};

export default cookieOption;
