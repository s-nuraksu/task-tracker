import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  const newTask = await prisma.task.create({ data: { title } });
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
