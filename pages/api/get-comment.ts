import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function getComment(userId: string, orderItemId: number) {
  try {
    const response = await prisma.comment.findUnique({
      where: {
        orderItemId: orderItemId,
      },
    })
    console.log(response)

    if (response?.userId === userId) {
      return response
    }

    return { message: 'userID is not matched' }
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
  const { orderItemid } = req.query
  const session = await unstable_getServerSession(req, res, authOptions)
  if (session == null) {
    res.status(200).json({ items: [], message: `no Session` })
    return
  }

  if (orderItemid == null) {
    res.status(200).json({ items: [], message: `no orderItemid` })
    return
  }
  try {
    const wishlist = await getComment(String(session.id), Number(orderItemid))
    res.status(200).json({ items: wishlist, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}
