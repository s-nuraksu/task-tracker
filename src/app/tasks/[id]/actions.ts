"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function deleteTask(formData: FormData) {
  const id = Number(formData.get("id"));
  await prisma.task.delete({ where: { id } });
  redirect("/");
}

export async function toggleComplete(formData: FormData) {
  const id = Number(formData.get("id"));
  const completed = formData.get("completed") === "true";

  await prisma.task.update({
    where: { id },
    data: { completed: !completed },
  });

  redirect(`/tasks/${id}`);
}
