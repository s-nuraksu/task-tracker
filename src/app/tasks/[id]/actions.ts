"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function cancelTask(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id || Number.isNaN(id)) throw new Error("Geçersiz görev id");

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({
    where: { id },
    select: { claimedById: true, isCanceled: true },
  });
  if (!task) throw new Error("Task not found");

  if (task.isCanceled) {
    redirect(`/tasks/${id}`); 
  }

  if (task.claimedById !== userId) {
    throw new Error("Bu görevi iptal etme yetkin yok");
  }

  await prisma.task.update({
    where: { id },
    data: { isCanceled: true },
  });

  redirect("/"); 
}

export async function toggleComplete(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id || Number.isNaN(id)) throw new Error("Geçersiz görev id");

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({
    where: { id },
    select: { claimedById: true, isCanceled: true, completed: true },
  });
  if (!task) throw new Error("Task not found");

  if (task.isCanceled) {
    throw new Error("İptal edilmiş görev güncellenemez");
  }

  if (task.claimedById !== userId) {
    throw new Error("Bu görevi güncelleme yetkin yok");
  }

  await prisma.task.update({
    where: { id },
    data: { completed: !task.completed }, 
  });

  redirect(`/tasks/${id}`);
}
