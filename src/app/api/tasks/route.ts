import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

// 🔹 GET → Kullanıcının tüm görevlerini getir
type SortKey = "createdAt" | "dueDate" | "priority";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  const { searchParams } = new URL(req.url);
  const sortParam = (searchParams.get("sort") as SortKey) || "createdAt";

  const orderBy =
    sortParam === "priority"
      ? { priority: "desc" as const }
      : sortParam === "dueDate"
      ? { dueDate: "asc" as const }
      : { createdAt: "desc" as const };

  const tasks = await prisma.task.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    orderBy,
    include: {
      files: true, // Dosyaları da içerecek şekilde güncelle
    },
  });

  return NextResponse.json(tasks);
}

// 🔹 POST → Yeni görev oluştur
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // FormData olarak verileri al
  const formData = await req.formData();
  
  // Form alanlarını al
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const priority = formData.get("priority") as string;
  const department = formData.get("department") as string;
  const customer = formData.get("customer") as string;
  const files = formData.getAll("files") as File[];

  if (!title || title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Kullanıcıyı bul
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Görev oluştur
  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: (priority as any) || "medium",
      department: department || null,
      customer: customer || null,
      userId: user.id,
    },
  });

  // Dosyaları işle
  if (files && files.length > 0 && files[0].size > 0) {
    try {
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      // Upload dizinini oluştur (yoksa)
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Upload dizini oluşturulamadı:', error);
      }
      
      // Her dosya için işlem yap
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueName = `${uuidv4()}-${file.name}`;
        const filePath = join(uploadDir, uniqueName);
        
        // Dosyayı diske yaz
        await writeFile(filePath, buffer);
        
        // Veritabanına dosya kaydı ekle
        await prisma.file.create({
          data: {
            name: file.name,
            url: `/uploads/${uniqueName}`,
            size: file.size,
            type: file.type,
            taskId: task.id,
          },
        });
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
    }
  }

  return NextResponse.json(task);
}

// 🔹 PUT → Görev güncelle
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    id,
    completed,
    title,
    description,
    dueDate,
    priority,
    department,
    customer,
  } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      completed: completed ?? task.completed,
      title: title ?? task.title,
      description: description ?? task.description,
      dueDate: dueDate ? new Date(dueDate) : task.dueDate,
      priority: priority ?? task.priority,
      department: department ?? task.department,
      customer: customer ?? task.customer,
    },
  });

  return NextResponse.json(updatedTask);
}

// 🔹 DELETE → Görev sil
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const task = await prisma.task.findUnique({ 
    where: { id },
    include: { files: true }
  });

  if (!task || task.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Önce dosyaları sil (varsa)
  if (task.files.length > 0) {
    await prisma.file.deleteMany({
      where: { taskId: id }
    });
  }

  // Görevi sil
  await prisma.task.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Task deleted successfully" });
}