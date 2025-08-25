import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: EditPageProps) {
  const { id } = await params;
  const taskId = parseInt(id, 10);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) return notFound();

  // ✅ Formu submit edince buraya düşecek
  async function updateTask(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;
    const priority = formData.get("priority") as string;
    const completed = formData.get("completed") === "on";

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        completed,
      },
    });

    redirect(`/tasks/${taskId}`); // Kaydedince detay sayfasına dön
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-black">
      <h1 className="text-2xl font-bold mb-6">Görevi Düzenle</h1>

      <form action={updateTask} className="space-y-4">
        {/* Başlık */}
        <div>
          <label className="block mb-1 font-medium">Başlık</label>
          <input
            type="text"
            name="title"
            defaultValue={task.title}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block mb-1 font-medium">Açıklama</label>
          <textarea
            name="description"
            defaultValue={task.description ?? ""}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Son Tarih */}
        <div>
          <label className="block mb-1 font-medium">Son Tarih</label>
          <input
            type="date"
            name="dueDate"
            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Öncelik */}
        <div>
          <label className="block mb-1 font-medium">Öncelik</label>
          <select
            name="priority"
            defaultValue={task.priority}
            className="w-full border rounded-lg p-2"
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>

        {/* Tamamlandı */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="completed"
            defaultChecked={task.completed}
            className="w-4 h-4"
          />
          <label className="font-medium">Tamamlandı</label>
        </div>

        {/* Kaydet butonu */}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Kaydet
        </button>
      </form>
    </main>
  );
}
