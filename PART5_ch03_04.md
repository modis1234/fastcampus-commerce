## part5 ch03 04.카테고리 구현

## 실습

### 1. 데이터베이스 데이터 추가

1. 기존 Clothing => SNEAKERS 업데이트

```SQL
UPDATE categories SET name=”SNEAKERS” WHERE id = 1;
```

2. 4개 카테고리 추가

```SQL
INSERT INTO categories(name) VALUES('T-SHIRT');
INSERT INTO categories(name) VALUES('PANTS');
INSERT INTO categories(name) VALUES('CAP');
INSERT INTO categories(name) VALUES('HOODIE');
```

### 2. 카테고리별 데이터 생서

- prisma/product-with-category.ts 파일 생성

```javascript
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
    }!!\",\"type\":\"unstyled\",\"depth\":0,
          \"inlineStyleRanges\":[{\"offset\":0,\"length\":16,\"style\":\"BOLD\"}],
          \"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}`,
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
```

- product-with-category.ts 파일 ts-node 실행  
  `$ yarn ts-node prisma/products-with-category.ts`

### 3. root 경로 constants/products.ts 공통 요소 export 파일 생성

**constants/products.ts**

```javascript
export const CATEGORY_MAP = ['Sneakers', 'T-Shirt', 'Pants', 'Cap', 'Hoodie']

export const TAKE = 9
```

### 4. page.tsx 컴포넌트

```javascript
import { categories, products } from '@prisma/client'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { Pagination, SegmentedControl } from '@mantine/core'
import { CATEGORY_MAP, TAKE } from 'constants/products'

export default function Products() {
  const [activePage, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<categories[]>([])
  const [selectedCategory, setCategory] = useState<string>('-1')
  const [products, setProducts] = useState<products[]>([])

  useEffect(() => {
    fetch(`/api/get-categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.items))   // getCategory
  }, [])

  useEffect(() => {
    fetch(`/api/get-products-count?category=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => setTotal(Math.ceil(data.items / TAKE)))
  }, [selectedCategory])

  useEffect(() => {
    console.log('selectedCategory->', selectedCategory)
    const skip = TAKE * (activePage - 1)
    fetch(
      `/api/get-products?skip=${skip}&take=${TAKE}&category=${selectedCategory}`
    )
      .then((res) => res.json())
      .then((data) => setProducts(data.items))
  }, [activePage, selectedCategory])

  return (
    <div className="px-36 mt-36 mb-36">
      {categories && (
        <div className="mb-4">
          <SegmentedControl
            value={selectedCategory}
            onChange={setCategory}
            data={[
              {
                label: 'ALL',
                value: '-1',
              },
              ...categories.map((category) => ({
                label: category.name,
                value: String(category.id),
              })),
            ]}
            color="dark"
          />
        </div>
      )}
      {products && (
        <div className="grid grid-cols-3 gap-5">
          {products.map((item) => (
            <div key={item.id} style={{ maxWidth: 310 }}>
              <Image
                className="rounded"
                alt={item.name ?? ''}
                src={item.image_url ?? ''}
                width={300}
                height={200}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
              />
              <div className="flex">
                <span className="ml-auto">{item.name}</span>
                <span className="ml-auto">
                  {item.price.toLocaleString('ko-KR')}원
                </span>
              </div>
              <span className="text-zinc-400">
                {/* {item.category_id === 1 && '의류'} */}
                {CATEGORY_MAP[item.category_id - 1]}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="w-full flex mt-5">
        <Pagination
          className="m-auto"
          page={activePage}
          onChange={setPage}
          total={total}
        />
      </div>
    </div>
  )
}

```

### 5. 카테고리 데이터 GET

- api/get-categories.ts

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getCategories() {
  try {
    const response = await prisma.categories.findMany()
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
  try {
    const products = await getCategories()
    res.status(200).json({ items: products, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

### 6. get-products.ts / get-products-count.ts 수정

- get-products.ts

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getProducts(skip: number, take: number, category: number) {
const where =
  category && category !== -1
    ? {
        where: {
          category_id: category,
        },
      }
    : undefined
console.log(where)
try {
  const response = await prisma.products.findMany({
    skip: skip,
    take: take,
    orderBy: {
      price: 'asc',
    },
  })
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
const { skip, take, category } = req.query

if (skip == null || take == null) {
  return res.status(400).json({ message: 'No skip or take' })
}

console.log('asdfs->', category)
try {
  const products = await getProducts(
    Number(skip),
    Number(take),
    Number(category)
  )
  res.status(200).json({ items: products, message: `Success` })
} catch (error) {
  res.status(400).json({ message: `Failed` })
}
}

```

- get-products-count.ts

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getProductsCount(category: number) {
  const where =
    category && category !== -1
      ? {
          where: {
            category_id: category,
          },
        }
      : undefined
  try {
    const response = await prisma.products.count(where)
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
  const { category } = req.query
  try {
    const products = await getProductsCount(Number(category))
    res.status(200).json({ items: products, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

## 결과

- 접속 주소: http://localhost:3000/products/page

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
