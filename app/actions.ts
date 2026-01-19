"use server"

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'
import { supabase } from '../lib/supabase'

export async function createProduct(prevState: unknown, formData: FormData) {
  try{
    const owner = formData.get('owner') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string, 10)
    const data = await prisma.products.create({
      data:{
        owner: owner,
        name: name,
        description: description,
        price: price,
        stock: stock
      }
    })
    return { success: true }
  }catch (error) {
    console.error('Error', error);
    return {
      success: false,
      message: 'Something went wrong',
      error: error
    }
  }
}

export async function editProduct(prevState: unknown, formData: FormData) {
  const id = formData.get('id') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string, 10)
  const data = await prisma.products.update({
    where:{
      id: id
    },
    data:{
      description: description,
      price: price,
      stock: stock
    }
  })
  return data
}

export async function deleteProduct(id: string) {
  const data = await prisma.products.delete({
    where:{
      id: id
    }
  })
  return data
}

export async function getProducts(owner: string) {
  const data = await prisma.products.findMany({
    where:{
      owner: owner
    }
  })
  return data
}
export async function getSales() {
  const data = await prisma.sales.findMany({
    select: {
      id: true,
      quantity: true,
      price: true,
      sale_date: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      sale_date: 'desc',
    },
  });
  return data
}

export async function getSalesPerProduct() {
  const groupedSales = await prisma.sales.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true,
    },
  });

  const productIds = groupedSales.map(s => s.productId);

  const products = await prisma.products.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const result = groupedSales.map(sale => ({
    productId: sale.productId,
    productName: products.find(p => p.id === sale.productId)?.name,
    totalSold: sale._sum.quantity,
  }));

  return result
}

export async function createSale(id: string) {
  try{
      await prisma.$transaction(async (tx) => {
      // 1. Get product
      const product = await tx.products.findUnique({
        where: { id: id }
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < 1) {
        throw new Error("Insufficient stock");
      }

      // 2. Create sale
      await tx.sales.create({
        data: {
          productId: product.id,
          quantity: 1,
          price: product.price * 1,
        },
      });

      // 3. Reduce stock
      await tx.products.update({
        where: { id: id  },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
      });
      return { success: true }
  }catch (error) {
    console.error('Error', error);
    return {
      success: false,
      message: 'Something went wrong',
      error: error
    }
  }
}

export async function removeSale(id: string) {
  try{ 
    await prisma.$transaction(async (tx) => {
    // 1. Get product
    const product = await tx.products.findUnique({
      where: { id: id }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const saleToDelete = await tx.sales.findFirst({
      where: { productId: id }
    });

    // 2. Create sale
    await prisma.sales.delete({
      where:{
        id: saleToDelete?.id as string
      }
    })

    // 3. Reduce stock
    await tx.products.update({
      where: { id: id },
      data: {
        stock: {
          increment: 1,
        },
      },
    });
  });
  return { success: true }
  }catch (error) {
    console.error('Error', error);
    return {
      success: false,
      message: 'Something went wrong',
      error: error
    }
  }
}