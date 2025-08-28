import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { deleteTask } from "./actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type TaskPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const { id } = await params;
  const taskId = parseInt(id, 10);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) return notFound();

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-black">
       <div className="flex items-center gap-1 mb-6">
    <Link
      href="/"
      className="flex items-center text-gray-600 hover:text-blue-600"
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
    </Link>

    <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
    Görev Detayı
  </h1>
  </div>

      <div className="space-y-3">
        <p><span className="font-semibold">Başlık:</span> {task.title}</p>
        {task.description && (
          <p><span className="font-semibold">Açıklama:</span> {task.description}</p>
        )}
        <p><span className="font-semibold">Öncelik:</span> {task.priority}</p>
        <p><span className="font-semibold">Son Tarih:</span> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</p>
        <p><span className="font-semibold">Durum:</span> {task.completed ? "✅ Tamamlandı" : "⏳ Beklemede"}</p>
      </div>

      <div className="flex gap-3 mt-6">
        {/* Düzenle butonu → edit sayfasına gider */}
        <Link
          href={`/tasks/${task.id}/edit`}
          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Düzenle
        </Link>

        {/* Silme formu */}
        <form action={deleteTask}>
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Sil
          </button>
        </form>
      </div>
    </main>
  );
}
