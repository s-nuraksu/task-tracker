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
    <main className="max-w-5xl mx-auto mt-10 bg-white rounded-lg shadow border border-gray-200 text-black">
      {/* Üst başlık bar - COMMITUP benzeri stil */}
      <div className="flex items-center justify-between bg-blue-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-gray-300 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-1" />
          </Link>
          <h1 className="font-bold text-xl">Talep Detay</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/tasks/${task.id}/edit`}
            className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm"
          >
            Düzenle
          </Link>
          <form action={deleteTask}>
            <input type="hidden" name="id" value={task.id} />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium text-sm"
            >
              Sil
            </button>
          </form>
        </div>
      </div>

      {/* İçerik alanı */}
      <div className="p-6">

        {/* Tablo görünümü */}
        <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="w-1/4 font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep ID</td>
                <td className="px-4 py-3 text-gray-800">{task.id}</td>
              </tr>
              <tr>
                <td className="w-1/4 font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Konusu</td>
                <td className="px-4 py-3 text-gray-800">{task.title}</td>
              </tr>
              {task.description && (
                <tr>
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Açıklama</td>
                  <td className="px-4 py-3 text-gray-800 whitespace-pre-wrap">{task.description}</td>
                </tr>
              )}
              <tr>
                <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Eden Kullanıcı</td>
                <td className="px-4 py-3 text-gray-800">—</td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Eden Müşteri</td>
                <td className="px-4 py-3 text-gray-800">
                  {task.customer || (
                    <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
                      Bilinmiyor
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Departman</td>
                <td className="px-4 py-3 text-gray-800">
                  {task.department ? (
                    <span className="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                      {task.department}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Tarihi</td>
                <td className="px-4 py-3 text-gray-800">
                  {new Date(task.createdAt).toLocaleString("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Öncelik</td>
                <td className="px-4 py-3 text-gray-800">
                  {task.priority === "low" && (
                    <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-sm">
                      Düşük
                    </span>
                  )}
                  {task.priority === "medium" && (
                    <span className="inline-block px-3 py-1 rounded bg-orange-100 text-orange-800 text-sm">
                      Orta
                    </span>
                  )}
                  {task.priority === "high" && (
                    <span className="inline-block px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">
                      Yüksek
                    </span>
                  )}
                  {task.priority === "urgent" && (
                    <span className="inline-block px-3 py-1 rounded bg-red-100 text-red-800 text-sm">
                      Acil
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">Talep Durum</td>
                <td className="px-4 py-3 text-gray-800">
                  {task.completed ? (
                    <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-sm">
                      Çözüldü
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                      İşlemde
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
