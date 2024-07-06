import zod, { z } from "zod";

export const signupInput=zod.object({
    email:zod.string().email(),
    password:zod.string().min(6),
    name:zod.string().min(3)
});

export type SignupInput=z.infer<typeof signupInput>;

export const signinInput=zod.object({
    email:zod.string().email(),
    password:zod.string().min(6)
});

export type SigninInput=z.infer<typeof signinInput>;

export const createblogInput=zod.object({
    title:zod.string().min(3),
    content:zod.string().min(10)
});

export type CreateBlogInput=z.infer<typeof createblogInput>;

export const updateblogInput=zod.object({
    title:zod.string().min(3),
    content:zod.string().min(10),
    id:zod.string()
});

export type UpdateBlogInput=z.infer<typeof updateblogInput>;

