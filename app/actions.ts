"use server"

import { prisma } from '@/lib/db'

//get
export async function getInventoryItems(owner: 'kevin' | 'aya') {
  try{
    await prisma.products.findMany({
      where: { owner },
      orderBy: { createdAt: 'desc' },
    })
    return{ success: true }
  }catch(error){
    console.log('Error fetching inventory items:', error);
    return { success: false, error: 'Failed to fetch inventory items' }
  }
}

export async function getSalesRecords(owner: 'kevin' | 'aya') {
  try{
    await prisma.sales.findMany({
      where: { owner },
      orderBy: { createdAt: 'desc' },
    })
  }catch(error){
    console.log('Error fetching sales:', error);
    return { success: false, error: 'Failed to fetch sales' }
  }
}

//post
export async function addInventoryItem(prevState: unknown, formData: FormData){
  try{
    const name = formData.get('name') as string
    const quantity = parseInt(formData.get('quantity') as string, 10)
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
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
  }catch(error){
    console.log('Error adding inventory items:', error);
    return { success: false, error: 'Failed to add inventory items' }
  }
}

export async function addSales(prevState: unknown, formData: FormData){
  try{
    const productId = formData.get('productId') as string
    const owner = formData.get('owner') as string
    const quantity = parseInt(formData.get('quantity') as string, 10)
    const price = parseFloat(formData.get('price') as string)
    const type = formData.get('type') as string

    await prisma.$transaction(async (tx) => {
      // 1. Create sale record
      await tx.sales.create({
        data: {
          productId,
          owner,
          quantity,
          price,
          type,
        },
      })

      // 2. Reduce product quantity
      await tx.products.update({
        where: { id: productId },
        data: {
          quantity: {
            decrement: quantity,
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
export async function removeSales(prevState: unknown, formData: FormData){
  try{
    const productId = formData.get('productId') as string
    const owner = formData.get('owner') as string
    const quantity = parseInt(formData.get('quantity') as string, 10)
    const price = parseFloat(formData.get('price') as string)
    const type = formData.get('type') as string

    await prisma.$transaction(async (tx) => {
      // 1. Create sale record
      await tx.sales.create({
        data: {
          productId,
          owner,
          quantity,
          price,
          type,
        },
      })

      // 2. Reduce product quantity
      await tx.products.update({
        where: { id: productId },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      })
    })

  }catch(error){
    console.log('Error adding sales:', error);
    return { success: false, error: 'Failed to add sales' }
  }
}