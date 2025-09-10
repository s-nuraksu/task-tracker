import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, File } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import DirtySave from "@/src/components/DirtySave";

type TaskPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const { id } = await params;
  const taskId = parseInt(id, 10);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      files: true,
      createdBy: { select: { name: true, email: true, id: true } },
      claimedBy: { select: { name: true, email: true, id: true } },
    },
  });

  if (!task) return notFound();

  const isMineClaimed = task.claimedBy?.id === session.user.id;
  const canClaim = task.claimedById === null && task.createdById !== session.user.id;
  const isEditable = isMineClaimed && !task.completed;

  async function claimTaskAction() {
    "use server";
    const s = await getServerSession(authOptions);
    const userId = s?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const res = await prisma.task.updateMany({
      where: {
        id: taskId,
        claimedById: null,
        NOT: { createdById: userId },
        completed: false, 
      },
      data: { claimedById: userId },
    });

    if (res.count === 0) throw new Error("Görev zaten alınmış, tamamlanmış veya kendi oluşturduğun görev.");
    revalidatePath(`/tasks/${taskId}`);
  }

  async function updateTaskAction(formData: FormData) {
    "use server";
    const s = await getServerSession(authOptions);
    const userId = s?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { claimedById: true, completed: true },
    });
    if (!existing) throw new Error("Görev bulunamadı.");
    if (existing.completed) throw new Error("Tamamlanmış görev düzenlenemez.");
    if (existing.claimedById !== userId) {
      throw new Error("Sadece görevi üzerine alan kullanıcı düzenleyebilir.");
    }

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string) ?? "";
    const dueDateStr = (formData.get("dueDate") as string) ?? "";
    const priority = (formData.get("priority") as string) as "low" | "medium" | "high" | "urgent";
    const customer = (formData.get("customer") as string) ?? "";

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description: description.trim().length ? description : null,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        priority,
        customer: customer.trim().length ? customer : null,
      },
    });

    revalidatePath("/");
    redirect("/");
  }

  async function completeTaskAction() {
    "use server";
    const s = await getServerSession(authOptions);
    const userId = s?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { claimedById: true, completed: true },
    });
    if (!existing) throw new Error("Görev bulunamadı.");
    if (existing.claimedById !== userId) {
      throw new Error("Sadece görevi üzerine alan kullanıcı tamamlayabilir.");
    }
    if (existing.completed) {
      revalidatePath("/");
      redirect("/");
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
    });

    revalidatePath("/");
    redirect("/");
  }

  async function cancelTaskAction() {
    "use server";
    const s = await getServerSession(authOptions);
    const userId = s?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { claimedById: true, completed: true },
    });
    if (!existing) throw new Error("Görev bulunamadı.");
    if (existing.completed) throw new Error("Tamamlanmış görev iptal edilemez.");
    if (existing.claimedById !== userId) {
      throw new Error("Sadece görevi üzerine alan kullanıcı iptal edebilir.");
    }


    revalidatePath("/");
    redirect("/");
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const initialForDirty = {
    title: task.title ?? "",
    description: task.description ?? "",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    priority: task.priority,
    customer: task.customer ?? "",
  };

  return (
    <main className="max-w-5xl mx-auto mt-10 bg-white rounded-lg shadow border border-gray-200 text-black">
      <div className="flex items-center justify-between bg-blue-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-gray-300 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-1" />
          </Link>
          <h1 className="font-bold text-xl">Talep Detay</h1>
        </div>

        <div className="flex gap-3">
          {canClaim && !task.completed && (
            <form action={claimTaskAction}>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm"
              >
                Üzerinde Çalış
              </button>
            </form>
          )}

          {isEditable && (
            <DirtySave
              formId="inline-edit-form"
              initial={initialForDirty}
              title="Değişiklikleri Kaydet"
              label="Kaydet"
            />
          )}

          {isEditable && (
            <form action={cancelTaskAction}>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium text-sm"
                title="Görevi İptal Et"
              >
                İptal Et
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="p-6">
        <form id="inline-edit-form" action={updateTaskAction}>
          <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="w-1/4 font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Talep ID
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-bold">{task.id}</td>
                </tr>

                <tr>
                  <td className="w-1/4 font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Talep Konusu
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {isEditable ? (
                      <input
                        name="title"
                        defaultValue={task.title}
                        required
                        className="w-full border rounded-lg p-2"
                      />
                    ) : (
                      task.title
                    )}
                  </td>
                </tr>

                {(isEditable || task.description) && (
                  <tr>
                    <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                      Talep Açıklama
                    </td>
                    <td className="px-4 py-3 text-gray-800 whitespace-pre-wrap">
                      {isEditable ? (
                        <textarea
                          name="description"
                          defaultValue={task.description ?? ""}
                          className="w-full border rounded-lg p-2"
                          rows={4}
                        />
                      ) : (
                        task.description ?? "—"
                      )}
                    </td>
                  </tr>
                )}

                <tr>
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Talep Eden Kullanıcı
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {task.createdBy?.name || task.createdBy?.email || "—"}
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Atanan (Üzerinde Çalışan)
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {task.claimedBy ? (
                      task.claimedBy.name || task.claimedBy.email
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                        Boşta
                      </span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Talep Eden Müşteri
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {isEditable ? (
                      <input
                        name="customer"
                        defaultValue={task.customer ?? ""}
                        placeholder="Müşteri adı"
                        className="w-full border rounded-lg p-2"
                      />
                    ) : task.customer ? (
                      task.customer
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
                        Bilinmiyor
                      </span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Talep Departman
                  </td>
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
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Talep Tarihi
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {new Date(task.createdAt).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Son Tarih
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {isEditable ? (
                      <input
                        type="date"
                        name="dueDate"
                        defaultValue={
                          task.dueDate
                            ? new Date(task.dueDate).toISOString().split("T")[0]
                            : ""
                        }
                        className="border rounded-lg p-2"
                      />
                    ) : task.dueDate ? (
                      new Date(task.dueDate).toLocaleDateString("tr-TR")
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    Talep Öncelik
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {isEditable ? (
                      <select
                        name="priority"
                        defaultValue={task.priority}
                        className="border rounded-lg p-2"
                      >
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                        <option value="urgent">Acil</option>
                      </select>
                    ) : (
                      <>
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
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>

        {isMineClaimed && !task.completed && (
          <div className="flex justify-end">
            <form action={completeTaskAction}>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md"
                title="Görevi tamamla ve anasayfaya dön"
              >
                Tamamla
              </button>
            </form>
          </div>
        )}

        {task.files.length > 0 && (
          <div className="mt-6">
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-1/4 font-semibold bg-gray-50 px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                      Ekli Dosyalar
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      <div className="space-y-2">
                        {task.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                          >
                            <div className="flex items-center gap-3">
                              <File className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)} • {file.type}
                                </p>
                              </div>
                            </div>
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Dosyayı indir"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
