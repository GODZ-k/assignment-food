// app/admin/categories/actions.ts - Complete CRUD Server Actions for Categories

'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import db from '@/db'; // your db instance
import { categories } from '@/db/schema';

const JWT_SECRET = process.env.JWT_SECRET!;

// Reuse authorization helper
async function getCurrentUser() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('_auth_token')?.value;
  if (!token) throw new Error('Unauthorized');

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = jwt.verify(token, JWT_SECRET!) as any;

    if (!payload || payload.role !== 'admin') {
      throw new Error('Admin access required');
    }
    return payload;
  } catch {
    throw new Error('Invalid token');
  }
}

// === CREATE ===
// export async function createCategoryAction(
//   prevState: { error?: string; success?: boolean },
//   formData: FormData
// ) {
//   try {
//     await getCurrentUser();

//     const schema = z.object({
//       name: z.string().min(1, 'Category name is required').max(100),
//       description: z.string().max(500).optional(),
//     });

//     const data = schema.parse({
//       name: formData.get('name')?.toString(),
//       description: formData.get('description')?.toString(),
//     });

//     // Check for duplicate name
//     const existing = await db.query.categories.findFirst({
//       where: eq(categories.name, data.name),
//     });
//     if (existing) {
//       return { error: 'Category name already exists' };
//     }

//     await db.insert(categories).values({
//       name: data.name,
//       description: data.description || '',
//     });

//     redirect('/admin/categories');
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { error: error.errors[0].message };
//     }
//     return { error: error instanceof Error ? error.message : 'Failed to create category' };
//   }
// }

// === READ ===
export async function getCategoriesAction() {
  try {
    // await getCurrentUser();
    return await db.query.categories.findMany({
      orderBy: [categories.name],
    });
  } catch {
    return [];
  }
}

export async function getCategoryByIdAction(id: string) {
  try {
    await getCurrentUser();
    return await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  } catch {
    return null;
  }
}

// === UPDATE ===
// export async function updateCategoryAction(
//   prevState: { error?: string },
//   formData: FormData
// ) {
//   try {
//     await getCurrentUser();
//     const id = formData.get('id') as string;

//     const schema = z.object({
//       id: z.string().uuid(),
//       name: z.string().min(1, 'Category name is required').max(100),
//       description: z.string().max(500).optional(),
//       isActive: z.coerce.boolean(),
//     });

//     const data = schema.parse({
//       id,
//       name: formData.get('name')?.toString(),
//       description: formData.get('description')?.toString(),
//       isActive: formData.get('isActive'),
//     });

//     // Check for duplicate name (excluding current category)
//     const existing = await db.query.categories.findFirst({
//       where: eq(categories.name, data.name),
//       columns: {
//         id: true,
//       },
//     });
//     if (existing && existing.id !== data.id) {
//       return { error: 'Category name already exists' };
//     }

//     await db
//       .update(categories)
//       .set({
//         name: data.name,
//         description: data.description || '',
//         isActive: data.isActive,
//       })
//       .where(eq(categories.id, data.id));

//     redirect('/admin/categories');
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { error: error.errors[0].message };
//     }
//     return { error: error instanceof Error ? error.message : 'Failed to update category' };
//   }
// }

// // === DELETE ===
// export async function deleteCategoryAction(id: string) {
//   try {
//     await getCurrentUser();

//     // Check if category has products
//     const productCount = await db
//       .select({ count: sql`count(*)` })
//       .from(products)
//       .where(eq(products.categoryId, id));

//     if (productCount[0]?.count && productCount[0].count > 0) {
//       return { error: 'Cannot delete category with associated products' };
//     }

//     await db.delete(categories).where(eq(categories.id, id));
//     return { success: true };
//   } catch (error) {
//     return { error: error instanceof Error ? error.message : 'Failed to delete category' };
//   }
// }

// === TOGGLE ACTIVE ===
export async function toggleCategoryAction(id: string) {
  try {
    await getCurrentUser();
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) {
      return { error: 'Category not found' };
    }

    await db
      .update(categories)
      .set({ isActive: !category.isActive })
      .where(eq(categories.id, id));

    return { success: true, isActive: !category.isActive };
  } catch (error) {
    return { error: 'Failed to toggle category status' };
  }
}
