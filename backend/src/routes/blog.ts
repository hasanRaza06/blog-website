import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createblogInput, updateblogInput } from "@hasan1025/common-medium";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    params: string;
  };
  Variables: {
    userId: string;
  };
}>();

// Middleware
blogRouter.use("/*", async (c, next) => {
  try {
    const header = c.req.header("authorization") || "";
    const token = header.split(" ")[1];

    if (!token) {
      c.status(403);
      return c.json({ message: "Token is not provided" });
    }

    const response = await verify(token, c.env.JWT_SECRET);

    if (response.id) {
      // @ts-ignore
      c.set("userId", response.id);
      await next();
    } else {
      c.status(403);
      return c.json({ message: "Token is not valid" });
    }
  } catch (error) {
    c.status(403);
    return c.json({ message: "Token is not valid" });
  }
});

// Route to create a blog post
blogRouter.post("/create", async (c) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const userId = c.get("userId");
    const { success } = createblogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({ message: "Invalid post credentials check title and content" });
    }
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({ message: "Blog created successfully!", post });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

// Route to update a blog post
blogRouter.put("/update", async (c) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const { title, content } = body;
    const { success } = updateblogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({ message: "Invalid post credentials check title and content" });
    }
    const updatedBlog = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title,
        content,
      },
    });

    return c.json({ message: "Blog updated successfully!", updatedBlog });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

// Route to get all blogs
blogRouter.get("/blogs", async (c) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  try {
    const posts = await prisma.post.findMany();
    return c.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json({ message: "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

// Route to get a single blog by ID
blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  try {
    const blogId = c.req.param("id");
    const blog = await prisma.post.findUnique({
      where: {
        id: blogId,
      },
    });

    if (!blog) {
      return c.json({ message: "Blog not found" }, 404);
    }

    return c.json(blog);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

// Route to get all blogs of a particular user
blogRouter.get("/user/blogs", async (c) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  try {
    const userId = c.get("userId");
    const userBlogs = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
    });

    return c.json({ userBlogs });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return c.json({ message: "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

blogRouter.delete("/delete", async (c) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const blogId = body.id;

    if (!blogId) {
      return c.json({ message: "Blog ID is required" }, 400);
    }

    const deletedBlog = await prisma.post.delete({
      where: {
        id: blogId,
      },
    });

    return c.json({ message: "Blog deleted successfully!", deletedBlog });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return c.json({ message: "Internal server error" }, 500);
  } finally {
    await prisma.$disconnect();
  }
});


export default blogRouter;
