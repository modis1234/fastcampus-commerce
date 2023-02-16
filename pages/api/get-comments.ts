import type { NextApiRequest, NextApiResponse } from 'next'
//asdfas
import { OrderItem, PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function getComments(productId: number) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId,
      },
    })
    console.log(orderItems)

    let response = []

    // orderItems를 기반으로 Comment를 조회한다.
    for (const orderItem of orderItems) {
      let orderItems: OrderItem[] = []

      const res = await prisma.comment.findUnique({
        where: {
          orderItemId: orderItem.id,
        },
      })

      response.push({ ...orderItem, ...res })
    }

    console.log(response)

    return response
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  items?: any
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { productId } = req.query
  // const session = await unstable_getServerSession(req, res, authOptions)
  if (productId == null) {
    res.status(200).json({ items: [], message: `no Session` })
    return
  }
  try {
    const wishlist = await getComments(Number(productId))
    res.status(200).json({ items: wishlist, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}
