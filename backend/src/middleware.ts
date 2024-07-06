// // import { Hono } from 'hono';
// // import { verify } from 'hono/jwt';

// // const app=new Hono<{
// //   Bindings:{
// //     JWT_SECRET:string;
// //   }
// // }>()
  

// function middlewareVerify(app: Hono) {
//   app.use('/api/v1/blog/*', async (c, next) => {
//     try {
//       const header = c.req.header('authorization') || '';
//       const token = header.split(' ')[1];

//       if (!token) {
//         c.status(403);
//         return c.json({ message: 'Token is not valid' });
//       }

//       const response = await verify(token, c.env.JWT_SECRET);

//       if (response && response.id) {
//         await next();
//       } else {
//         c.status(403);
//         return c.json({ message: 'Token is not valid' });
//       }
//     } catch (error) {
//       c.status(403);
//       return c.json({ message: 'Token is not valid' });
//     }
//   });
// }

// // export default middlewareVerify;
