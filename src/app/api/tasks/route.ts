import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();

  // Kullanıcıyı email üzerinden bul
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      userId: user.id, // userId burada veriliyor
    },
  });

  return NextResponse.json(newTask);
}

export async function PUT(req: Request) {
  const { id, completed } = await req.json();
  const updatedTask = await prisma.task.update({
    where: { id },
    data: { completed },
  });
  return NextResponse.json(updatedTask);
}
