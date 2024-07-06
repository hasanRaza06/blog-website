import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign ,verify} from "hono/jwt";
import { signinInput , signupInput } from "@hasan1025/common-medium";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.post('/signup',async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    const {success}=signupInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({message:"Invalid Signup Credentials password must be of at minimum 6 character ans name must be of at minimum 3 character"});
    }
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });
  
    const token=await sign({id:user.id,email:user.email,name:user.name},c.env.JWT_SECRET);
  
    return c.json({ message: 'User created successfully!', jwt:token});
  } catch (error) {
    console.error(error);
    return c.text('Internal Server Error', 500);
  }
  })
  
  userRouter.post("/signin", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
    try {
      const body = await c.req.json();
      const { email, password } = body;
      if (!email || !password) {
        return c.json({ message: "Email and password are required" }, 400);
      }
      const {success}=signinInput.safeParse(body);
      if(!success){
      c.status(411);
      return c.json({message:"Invalid Signin Credentials password must be of at minimum 6 character"});
     }
      
  
      const user = await prisma.user.findUnique({
        where: { email ,password}
      });
  
      if (!user) {
        return c.json({ message: "Check email,password and try again!" }, 401);
      }
  
      const token =await sign({ id: user.id, email: user.email, name: user.name }, c.env.JWT_SECRET);
      return c.json({ message: "Login Successful", jwt: token });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Internal server error" }, 500);
    }
  });

  userRouter.get("/isLoggedIn", async (c) => {
    try {
      const header = c.req.header("authorization") || "";
      const token = header.split(" ")[1];
  
      if (!token) {
        return c.json({ isLoggedIn: false });
      }
  
      const response = await verify(token, c.env.JWT_SECRET);
      if (response.id) {
        return c.json({ isLoggedIn: true });
      } else {
        return c.json({ isLoggedIn: false });
      }
    } catch (error) {
      return c.json({ isLoggedIn: false });
    }
  });