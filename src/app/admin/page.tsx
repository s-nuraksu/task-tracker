// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow text-black">
      <h1 className="text-2xl font-bold mb-6">Admin Paneli</h1>
      <p>Kullanıcı yönetimi ve raporlar burada olacak.</p>
    </main>
  );
}
