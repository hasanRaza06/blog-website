import { Hono } from 'hono'
import { userRouter } from './routes/user'
import {blogRouter} from "./routes/blog"
import {verify} from "hono/jwt"
import { cors } from 'hono/cors'


const app = new Hono<{
  Bindings:{
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>

app.use("*",cors());

// app.use('/api/v1/blog/*', async (c, next) => {
//   try {
//     const header = c.req.header('authorization') || '';
//     const token = header.split(' ')[1];

//     if (!token) {
//       c.status(403);
//       return c.json({ message: 'Token is not valid' });
//     }

//     const response = await verify(token, c.env.JWT_SECRET);

//     if (response.id) {
//       await next();
//     } else {
//       c.status(403);
//       return c.json({ message: 'Token is not valid' });
//     }
//   } catch (error) {
//     c.status(403);
//     return c.json({ message: 'Token is not valid' });
//   }
// });

app.route("/api/v1/user",userRouter);
app.route("/api/v1/blog",blogRouter);


export default app
