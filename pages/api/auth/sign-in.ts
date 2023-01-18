import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwtDecode from 'jwt-decode'

const prisma = new PrismaClient()

async function signIn(credential: string) {
  const decoded: { name: string; email: string; picture: string } =
    jwtDecode(credential)

  try {
    const response = await prisma.user.upsert({
      where: {
        email: decoded.email,
      },
      update: {
        name: decoded.name,
        image: decoded.picture,
      },
      create: {
        email: decoded.email,
        name: decoded.name,
        image: decoded.picture,
      },
    }) // upsert:: 있다면 업데이트, 없다면 생성

    console.log(decoded)
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
  const { credential } = req.query

  //   if (skip == null || take == null) {
  //     return res.status(400).json({ message: 'No skip or take' })
  //   }

  try {
    const products = await signIn(String(credential))
    res.status(200).json({ items: products, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}
