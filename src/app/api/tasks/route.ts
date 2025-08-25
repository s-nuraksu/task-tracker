import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 🔹 GET → Kullanıcının tüm görevlerini getir
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "createdAt"; // default createdAt

  // Kullanıcıyı bul
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Kullanıcıya ait görevleri getir
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy:
      sort === "priority"
        ? { priority: "desc" }
        : sort === "dueDate"
        ? { dueDate: "asc" }
        : { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

// 🔹 POST → Yeni görev oluştur
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, dueDate, priority, department, customer } =
    await req.json();

  if (!title || title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Kullanıcıyı bul
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Görev oluştur
  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      department: department || null,
      customer: customer || null,
      userId: user.id,
    },
  });

  return NextResponse.json(task);
}

// 🔹 PUT → Görev güncelle
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

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== user.id) {
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

// 🔹 DELETE → Görev sil
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

  const task = await prisma.task.findUnique({ where: { id } });

  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.task.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Task deleted successfully" });
}
