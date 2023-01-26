import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const getRandom = (max: number, min: number) => {
  return Math.floor(Math.random() * (max - min) + min)
}

const getRandomData = (
  length: number,
  name: string,
  text: string,
  categotyId: number
) => {
  return Array.apply(null, Array(length)).map((_, index) => ({
    name: `${name} ${index + 1}`,
    contents: `{\"blocks\":[{\"key\":\"au0ft\",\"text\":\"${text}-${
      index + 1
    }!!\"`,
    category_id: categotyId,
    image_url: `https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/${
      index + (1 % 10) === 0 ? 10 : (index + 1) % 10
    }.jpg`,
    price: getRandom(300000, 100000),
  }))
}

const sneakers = getRandomData(
  10,
  'Sneakers',
  '본 제품은 오가닉 소재입니다.',
  1
)

const tShirt = getRandomData(10, 'T-Shirt', '본 제품은 티셔츠 입니다.', 2)

const pants = getRandomData(10, 'Pants', 'Blue Jean 세일 중!!.', 3)

const cap = getRandomData(10, 'Cap', '본 제품은 모자 입니다.', 4)

const hoodie = getRandomData(10, 'Hoodie', '본 제품은 Hoodie 입니다.', 5)

const productData: Prisma.productsCreateInput[] = [
  ...sneakers,
  ...tShirt,
  ...pants,
  ...cap,
  ...hoodie,
]

async function main() {
  const CATEGORIES = ['SNEAKERS', 'T-SHIRT', 'PANTS', 'CAP', 'HOODIE']

  CATEGORIES.forEach(async (c, i) => {
    const product = await prisma.categories.upsert({
      where: {
        id: i + 1,
      },
      update: {
        name: c,
      },
      create: {
        name: c,
      },
    })
    console.log(`Upsert category id: ${product.id}`)
  })

  await prisma.products.deleteMany({})

  for (const p of productData) {
    const product = await prisma.products.create({
      data: p,
    })
    console.log(`Created id: ${product.id}`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.log(e)
    await prisma.$disconnect()
    // process.exit(1)
  })
