"use server"

import { prisma } from '@/lib/db'

//get
export async function getInventoryItems(owner: 'kevin' | 'aya') {
    const product = await prisma.products.findMany({
      where: { owner },
      orderBy: { createdAt: 'desc' },
    })
    return  product 
}

export async function getSalesRecords(owner: 'kevin' | 'aya') {
    const sales = await prisma.sales.findMany({
      where: { owner },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    })
    return sales
}

//post
export async function addInventoryItem(prevState: unknown, formData: FormData){
  try{
    const name = String(formData.get('name') ?? '').trim().toLowerCase() as string
    const quantity = Number(formData.get('quantity'))
    const category = formData.get('category') as string
    const price = Number(formData.get('price'))
    const owner = formData.get('owner') as string
    await prisma.products.create({
      data: {
        name,
        quantity,
        category,
        price,
        owner,
      },
    })
    return { success: true }
  }catch(error){
    console.log('Error adding inventory items:', error);
    return { success: false, error: 'Failed to add inventory items' }
  }
}

export async function addSales(id: string, owner:string, price: number){
  try{
    await prisma.$transaction(async (tx) => {
      // 1. Create sale record
      await tx.sales.create({
        data: {
          productId: id,
          owner,
          quantity: 1,
          price,
          type: 'sale',
        },
      })

      // 2. Reduce product quantity
      await tx.products.update({
        where: { id: id },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      })
    })

  }catch(error){
    console.log('Error adding sales:', error);
    return { success: false, error: 'Failed to add sales' }
  }
}

//put

//delete
export async function removeSales(id: string, owner:string, price: number){
  try{
    await prisma.$transaction(async (tx) => {
      // 1. Create sale record
      await tx.sales.create({
        data: {
          productId: id,
          owner,
          quantity: 1,
          price,
          type: 'unsale',
        },
      })

      // 2. Reduce product quantity
      await tx.products.update({
        where: { id },
        data: {
          quantity: {
            increment: 1,
          },
        },
      })
    })

  }catch(error){
    console.log('Error adding sales:', error);
    return { success: false, error: 'Failed to add sales' }
  }
}