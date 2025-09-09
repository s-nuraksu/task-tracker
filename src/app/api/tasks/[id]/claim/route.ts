import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const taskId = Number(params.id);

  const result = await prisma.task.updateMany({
    where: {
      id: taskId,
      claimedById: null,
      NOT: { createdById: userId },
    },
    data: { claimedById: userId },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Görev zaten alınmış veya kendi oluşturduğun görev." },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "Görev başarıyla üstlenildi" });
}
