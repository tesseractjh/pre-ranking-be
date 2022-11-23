import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';

dotenv.config();
const {
  GOOGLE_AUTH_ID,
  GOOGLE_AUTH_SECRET,
  GOOGLE_AUTH_CALLBACK,
  KAKAO_AUTH_ID,
  KAKAO_AUTH_SECRET,
  KAKAO_AUTH_CALLBACK
} = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_AUTH_ID,
      clientSecret: GOOGLE_AUTH_SECRET,
      callbackURL: GOOGLE_AUTH_CALLBACK
    },
    (accessToken, refreshToken, profile, done) => {
      const { id, provider, emails } = profile;
      const user = { id, provider, email: emails?.[0]?.value };
      return done(null, user);
    }
  )
);

passport.use(
  new KakaoStrategy(
    {
      clientID: KAKAO_AUTH_ID,
      clientSecret: KAKAO_AUTH_SECRET,
      callbackURL: KAKAO_AUTH_CALLBACK
    },
    (accessToken, refreshToken, profile, done) => {
      const { id, provider, _json } = profile;
      const user = {
        id: id.toString(),
        provider,
        email: _json?.kakao_account?.email
      };
      return done(null, user);
    }
  )
);
