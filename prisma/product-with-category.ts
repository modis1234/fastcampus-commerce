import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const getRandom = (max: number, min: number) => {
  return Math.floor(Math.random() * (max - min) + min)
}

const getRandomData = (length: number, name: string, text: string) => {
  return Array.apply(null, Array(length)).map((_, index) => ({
    name: `${name} ${index + 1}`,
    contents: `{\"blocks\":[{\"key\":\"au0ft\",\"text\":\"${text}-${
      index + 1
    }!!\",\"type\":\"unstyled\",\"depth\":0,
          \"inlineStyleRanges\":[{\"offset\":0,\"length\":16,\"style\":\"BOLD\"}],
          \"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}`,
    category_id: 1,
    image_url: `https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/${
      index + (1 % 10) === 0 ? 10 : (index + 1) % 10
    }.jpg`,
    price: Math.floor(Math.random() * (100000 - 20000) + 20000),
  }))
}

const sneakers = getRandomData(10, 'Sneakers', '본 제품은 오가닉 소재입니다.')

const tShirt = getRandomData(10, 'T-Shirt', '본 제품은 티셔츠 입니다.')

const pants = getRandomData(10, 'Pants', 'Blue Jean 세일 중!!.')

const cap = getRandomData(10, 'Cap', '본 제품은 모자 입니다.')

const hoodie = getRandomData(10, 'Hoodie', '본 제품은 Hoodie 입니다.')

const productData: Prisma.productsCreateInput[] = [
  ...sneakers,
  ...tShirt,
  ...pants,
  ...cap,
  ...hoodie,
]

async function main() {
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
