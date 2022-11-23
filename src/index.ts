import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import 'express-async-errors';
import '@config/passport';
import handleError from '@middlewares/handleError';
import validateReferer from '@middlewares/validateReferer';
import routes from '@routes/index';

dotenv.config();
const { PORT = 4000, DOMAIN, JWT_SECRET } = process.env;

const app = express();

app.use(
  cors({
    origin: DOMAIN,
    credentials: true
  })
);
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser(JWT_SECRET));
app.use(validateReferer);
app.use(routes);
app.use(handleError);

app.listen(PORT, () => console.log(`👂 listening on ${PORT}`));
