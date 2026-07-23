"use server";

import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return { error: "Unauthorized" };
    }

    await dbConnect();
    await User.findByIdAndUpdate(userId, { role: newRole });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return { error: "Unauthorized" };
    }

    await dbConnect();
    await User.findByIdAndDelete(userId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
