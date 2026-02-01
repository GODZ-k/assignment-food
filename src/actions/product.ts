// app/admin/products/actions.ts - Server Actions for CRUD

'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import db from '@/db'; // your db instance
import {  products, categories } from '@/db/schema';

const JWT_SECRET = process.env.JWT_SECRET!;

// Authorization helper
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProductAction(formData: any) {
  try {
    await getCurrentUser();

    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().min(1, 'Description is required'),
      prices: z.object({
        quarter: z.number().optional(),
        half: z.number().optional(),
        full: z.number().min(0),
      }),
      image: z.string().url().or(z.string().min(1)),
      category: z.string().min(1),
    });

    const data = schema.parse({
      name: formData.name,
      description: formData.description,
      prices: formData.prices,
      image: formData.image,
      category: formData.category,
    });

    const [category] = await db.select().from(categories).where(eq(categories.name, data.category))

    await db.insert(products).values({
      name: data.name,
      description: data.description,
      prices: data.prices,
      image: data.image,
      category: data.category,
      categoryId:category.id
    });

    return { success:true , message:"Product created successfully"}

  } catch (error) {
    return { success:false, message: error instanceof Error ? error.message : 'Failed to create product' };
  }
}

// === READ ===
export async function getProductsAction() {
  try {
    // await getCurrentUser();
    return await db.query.products.findMany()
  } catch {
    return [];
  }
}

export async function getProductByIdAction(id: string) {
  try {
    await getCurrentUser();
    return await db.query.products.findFirst({
      where: eq(products.id, id),
    });
  } catch {
    return { success:false,message:"Failed to get product"};
  }
}

// === UPDATE ===
export const updateProductAction = async (
  formData:FormData
) => {
  try {
    await getCurrentUser();

    const productId = formData.get('id')

     const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().min(1, 'Description is required'),
      prices: z.object({
        quarter: z.number().optional(),
        half: z.number().optional(),
        full: z.number().min(0),
      }),
      image: z.string().url().or(z.string().min(1)),
      category: z.string().min(1),
    });

    const data = schema.parse({
      name: formData.get('name'),
      description: formData.get('description'),
      prices: JSON.parse(formData.get('prices') as string),
      image: formData.get('image'),
      category: formData.get('category'),
    });

    const [ categoryId ] = await db.select().from(categories).where(eq(categories.name,data.category))
    await db
      .update(products)
      .set({
        name: data.name,
        description: data.description,
        prices: data.prices,
        image: data.image,
        category: data.category,
        categoryId:categoryId.id
      })
      .where(eq(products.id, productId as string));

    return {success:true, message:"Prduct updated successfully"}
  } catch (error) {
    return { success:false, message: error instanceof Error ? error.message : 'Failed to update product' };
  }
};

// === DELETE ===
export async function deleteProductAction(id: string) {
  try {
    await getCurrentUser();
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  } catch (error) {
    return { success:false,message: 'Failed to delete product' };
  }
}

export async function changeProductAvailablityAction(id: string) {
  try {
    await getCurrentUser();
    // Get current status first to toggle
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    const newStatus = !product.isAvailable;
    await db.update(products).set({isAvailable:newStatus}).where(eq(products.id, id));
    return { success: true };
  } catch (error) {
    return { success:false,message: 'Failed to delete product' };
  }
}
