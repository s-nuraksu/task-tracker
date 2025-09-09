import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

type SortKey = "createdAt" | "dueDate" | "priority";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const { searchParams } = new URL(req.url);
  const sortParam = (searchParams.get("sort") as "createdAt" | "dueDate" | "priority") || "createdAt";
  const show = searchParams.get("show"); // "canceled" ise iptalleri getir

  const orderBy =
    sortParam === "priority"
      ? { priority: "desc" as const }
      : sortParam === "dueDate"
      ? { dueDate: "asc" as const }
      : { createdAt: "desc" as const };

  const baseWhere =
    show === "canceled"
      ? { isCanceled: true }
      : { isCanceled: false };

  const where = isAdmin
    ? baseWhere
    : {
        AND: [
          baseWhere,
          {
            OR:
              show === "canceled"
                ? [
                    { createdById: session.user.id },
                    { claimedById: session.user.id },
                  ]
                : [
                    { createdById: session.user.id },
                    { claimedById: null },
                    { claimedById: session.user.id },
                  ],
          },
        ],
      };

  try {
    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        files: true,
        createdBy: { select: { name: true } },
        claimedBy: { select: { name: true } },
      },
    });

    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json(
      { error: "Database error", detail: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const priority = formData.get("priority") as string;
  const department = formData.get("department") as string;
  const customer = formData.get("customer") as string;
  const files = formData.getAll("files") as File[];

  if (!title || title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: (priority as any) || "medium",
      department: department || null,
      customer: customer || null,
      createdById: user.id,
      claimedById: null,
    },
  });

  if (files && files.length > 0 && files[0].size > 0) {
    try {
      const uploadDir = join(process.cwd(), "public", "uploads");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error("Upload dizini oluşturulamadı:", error);
      }

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueName = `${uuidv4()}-${file.name}`;
        const filePath = join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        await prisma.file.create({
          data: {
            name: file.name,
            url: `/uploads/${uniqueName}`,
            size: file.size,
            type: file.type,
            taskId: task.id,
          },
        });
      }
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
    }
  }

  return NextResponse.json(task);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    id,
    completed,
    title,
    description,
    dueDate,
    priority,
    department,
    customer,
  } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 🛡️ Düzenleme yetkisi: sadece claimer
  const task = await prisma.task.findUnique({
    where: { id },
    select: { claimedById: true, title: true, description: true, dueDate: true, priority: true, department: true, customer: true, completed: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.claimedById !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      completed: completed ?? task.completed,
      title: title ?? task.title,
      description: description ?? task.description,
      dueDate: dueDate ? new Date(dueDate) : task.dueDate,
      priority: priority ?? task.priority,
      department: department ?? task.department,
      customer: customer ?? task.customer,
    },
  });

  return NextResponse.json(updatedTask);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: { files: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.claimedById !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (task.files.length > 0) {
    await prisma.file.deleteMany({
      where: { taskId: id },
    });
  }

  await prisma.task.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Task deleted successfully" });
}
