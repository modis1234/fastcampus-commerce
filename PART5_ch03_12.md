## part5 ch03 12. 구매하기 구현

## 실습

주문의 요구사항

- 단일 상품의 주문 가능
- 여러 상품의 묶음 주문도 가능

### 1. 개별 상품 주문 정보를 담는 OrderItem 테이블, 실제 주문 정보를 담는 Order 테이블 생성

- OrderItem은 Cart와 같은 구조

  - userId
  - productId
  - quantity
  - price
  - amount
  - (할인정보)

- Orders 테이블

  - orderItemIds: string
  - receiver: string
  - address: string
  - phone: string
  - createdAt: Date
  - status: number (주문취소 -1, 주문대기0, 결제대기1, 결제완료2, 배송
    대기3, 배송중4, 배송완료5, 환불대기6, 환불완료7, 반품대기8, 반품완료9)

- Cart와 OrderItem에 들어가는 amount에 대해서 Cart에서는 price가 중요하지 않다.  
  quantity만 있으면 amount 계산해서 보여줄 수 있지만(계산 편의를 위
  해 담음)  
  OrderItem에는 생성하는 당시 할인 정보가 담긴 price 저장이 필요

  **schema.prisma**

```javascript
...
...
model OrderItem{
  id Int @id @default(autoincrement())
  productId Int
  quantity Int
  price Int
  amount Int
}

model Orders {
  id Int @id @default(autoincrement())
  userId String
  orderItemIds String
  receiver String?
  address String?
  phoneNumber String?
  createdAt DateTime @default(now())
  status Int
}
```

`$ yarn prisma db push`
`$ yarn prisma generate`

### 2. 주문하기 진입점 상품상세, 장바구니, my 주문 내역(조회 및 업데이트)

**pages/my.tsx** 컴포넌틑 생성

```javascript
import styled from '@emotion/styled'
import { Badge, Button } from '@mantine/core'
import { Cart, OrderItem, Orders, products } from '@prisma/client'
import { IconRefresh, IconX } from '@tabler/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CountControl } from 'components/CountControl'
import { CATEGORY_MAP } from 'constants/products'
import { format } from 'date-fns'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

interface OrderItemDetail extends OrderItem {
  name: string
  image_url: string
}

interface OrderDetail extends Orders {
  orderItems: OrderItemDetail[]
}

const ORDER_STATUS_MAP = [
  '주문취소',
  '주문대기',
  '결제대기',
  '배송대기',
  '배송중',
  '배송완료',
  '환불대기',
  '환불완료',
  '반품대기',
  '반품완료',
]

export const ORDER_QUERY_KEY = '/api/get-order'

export default function MyPage() {
  const router = useRouter()

  const { data } = useQuery<{ items: OrderDetail[] }, unknown, OrderDetail[]>(
    [ORDER_QUERY_KEY],
    () =>
      fetch(ORDER_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items)
  )

  return (
    <div className="text-2xl mb-3">
      <span>주문내역 ({data ? data?.length : 0})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data ? (
            data?.length > 0 ? (
              data?.map((item, index) => <DetailItem key={index} {...item} />)
            ) : (
              <div>주문내역이 아무것도 없습니다.</div>
            )
          ) : (
            <div>불러오는 중...</div>
          )}
        </div>
      </div>
    </div>
  )
}

const DetailItem = (props: OrderDetail) => {
  const queryClient = useQueryClient()
  const { mutate: updateOrderStatus } = useMutation<
    unknown,
    unknown,
    number,
    any
  >(
    (status) =>
      fetch(`/api/update-order-status`, {
        method: 'POST',
        body: JSON.stringify({
          id: props.id,
          status: status,
          userId: props.userId,
        }),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (status) => {
        // 조회되기전에 데이터 미리 조작
        await queryClient.cancelQueries({ queryKey: [ORDER_QUERY_KEY] })

        // Snapshot the previous value
        const previous = queryClient.getQueryData([ORDER_QUERY_KEY])

        // Optimistically update to the new value
        queryClient.setQueryData<Cart[]>([ORDER_QUERY_KEY], (old) =>
          old?.map((c) => {
            if (c.id === props.id) {
              return { ...c, status: status }
            }
            return c
          })
        )

        // Return a context object with the snapshotted value
        return { previous }
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([ORDER_QUERY_KEY], context.previous)
      },
      onSuccess: () => {
        queryClient.invalidateQueries([ORDER_QUERY_KEY])
      },
    }
  )

  const handdlePayment = () => {
    // TODO: 주문상태를 5 로 바꿔준다.
    updateOrderStatus(5)
  }

  const handleCancle = () => {
    // TODO: 주문상태를 -1 로 바꿔준다.
    updateOrderStatus(-1)
  }

  return (
    <div
      className="w-full flex flex-col p-4 rounded-md"
      style={{ border: '1px solid grey' }}
    >
      <div className="flex ml-4">
        <Badge color={props.status < 1 ? 'red' : ''} className="mb-2">
          {ORDER_STATUS_MAP[props.status + 1]}
        </Badge>
        <IconX className="ml-auto" onClick={handleCancle} />
      </div>
      {props.orderItems.map((orderItem, idx) => (
        <Item key={idx} {...orderItem} />
      ))}
      <div className="flex mt-4">
        <div className="flex flex-col">
          <span className="mb-2">주문정보</span>
          <span>받는사람: {props.receiver ?? '입력필요'}</span>
          <span>주소: {props.address ?? '입력필요'}</span>
          <span>연락처: {props.phoneNumber ?? '입력필요'}</span>
        </div>
        <div className="flex flex-col ml-auto mr-4 text-right">
          <span className="mb-2">
            합계 금액:
            <span className="text-red-500">
              {props.orderItems
                .map((item) => item.amount)
                .reduce((prev, curr) => prev + curr, 0)
                .toLocaleString('ko-kr')}
              원
            </span>
          </span>
          <span className="text-zinc-400 mt-auto mb-auto">
            주문일자:{' '}
            {format(new Date(props.createdAt), 'yyyy년 M월 d일 HH:mm:ss')}
          </span>
          <Button
            style={{ backgroundColor: 'black', color: 'white' }}
            onClick={handdlePayment}
          >
            결제 처리
          </Button>
        </div>
      </div>
    </div>
  )
}

const Item = (props: OrderItemDetail) => {
  const router = useRouter()
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity)
  const [amount, setAmount] = useState<number>(props.quantity)
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price)
    }
  }, [quantity, props.price])

  return (
    <div className="w-full flex p-4" style={{ borderBottom: '1px solid grey' }}>
      <Image
        src={props.image_url}
        width={155}
        height={195}
        alt={props.name}
        onClick={() => router.push(`/products/${props.productId}`)}
      />
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">
          가격:{props.price.toLocaleString('ko-kr')} 원
        </span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={20} />
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')} 원</span>
      </div>
    </div>
  )
}

const Row = styled.div`
  display: flex;
  * ~ * {
    margin-left: auto;
  }
`

```

**pages/cart.tsx** 컴포넌트 수정

```javascript
import styled from '@emotion/styled'
import { Button } from '@mantine/core'
import { Cart, OrderItem, products } from '@prisma/client'
import { IconRefresh, IconX } from '@tabler/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CountControl } from 'components/CountControl'
import { CATEGORY_MAP } from 'constants/products'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { ORDER_QUERY_KEY } from './my'

interface CartItem extends Cart {
  name: string
  price: number
  image_url: string
}

export const CART_QUERY_KEY = '/api/get-cart'

export default function CartPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data } = useQuery<{ items: CartItem[] }, unknown, CartItem[]>(
    [CART_QUERY_KEY],
    () =>
      fetch(CART_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items)
  )

  const dilyveryAmount = data && data.length > 0 ? 5000 : 0
  const discountAmount = 0

  const amount = useMemo(() => {
    if (data == null) {
      return 0
    }
    return data
      ?.map((item) => item.amount)
      .reduce((prev, curr) => prev + curr, 0)
  }, [data])

  const { data: products } = useQuery<
    { items: products[] },
    unknown,
    products[]
  >(
    [`/api/get-products?skip=0&take=3`],
    () => fetch(`/api/get-products?skip=0&take=3`).then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  )

  const { mutate: addOrder } = useMutation<
    unknown,
    unknown,
    Omit<OrderItem, 'id' | 'userId'>[],
    any
  >(
    (items) =>
      fetch(`/api/add-order`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: () => {
        queryClient.invalidateQueries([ORDER_QUERY_KEY])
      },
      onSuccess: () => {
        router.push('/my')
      },
    }
  )

  const handleOrder = () => {
    //TODO: 주문하기 기능 구현
    if (data == null) return
    addOrder(
      data?.map((cart) => ({
        productId: cart.productId,
        price: cart.price,
        amount: cart.amount,
        quantity: cart.quantity,
      }))
    )
    alert(`장바구니에 담긴 것들 ${JSON.stringify(data)} 주문하기`)
  }

  return (
    <div className="text-2xl mb-3">
      <span>Cart ({data ? data?.length : 0})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data ? (
            data?.length > 0 ? (
              data?.map((item, index) => <Item key={index} {...item} />)
            ) : (
              <div>장바구니에 아무것도 없습니다.</div>
            )
          ) : (
            <div>불러오는 중...</div>
          )}
        </div>
        <div className="px-4">
          <div
            className="flex flex-col p-4 space-y-4"
            style={{ minWidth: 300, border: '1px solid grey' }}
          >
            <div>Info</div>
            <Row>
              <span>금액</span>
              <span>{amount?.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span>배송비</span>
              <span>{dilyveryAmount.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span>할인 금액</span>
              <span>{discountAmount.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span className="font-semibold">결제 금액</span>
              <span className="font-semibold text-red-500">
                {(amount ?? 0 + dilyveryAmount - discountAmount).toLocaleString(
                  'ko-kr'
                )}
                원
              </span>
            </Row>
            <Button
              style={{ backgroundColor: 'black' }}
              radius="xl"
              size="md"
              styles={{
                root: { height: 48 },
              }}
              onClick={handleOrder}
            >
              구매하기
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-32">
        <p>추천상품</p>
        {products && (
          <div className="grid grid-cols-3 gap-5">
            {products.map((item) => (
              <div
                key={item.id}
                style={{ maxWidth: 310 }}
                onClick={() => router.push(`/products/${item.id}`)}
              >
                <Image
                  className="rounded"
                  alt={item.name ?? ''}
                  src={item.image_url ?? ''}
                  width={300}
                  height={200}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
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
      </div>
    </div>
  )
}

const Item = (props: CartItem) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity)
  const [amount, setAmount] = useState<number>(props.quantity)
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price)
    }
  }, [quantity, props.price])

  const { mutate: updateCart } = useMutation<unknown, unknown, Cart, any>(
    (item) =>
      fetch(`/api/update-cart`, {
        method: 'POST',
        body: JSON.stringify({ item }),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (item) => {
        // 조회되기전에 데이터 미리 조작
        await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEY] })

        // Snapshot the previous value
        const previous = queryClient.getQueryData([CART_QUERY_KEY])

        // Optimistically update to the new value
        queryClient.setQueryData<Cart[]>([CART_QUERY_KEY], (old) =>
          old?.filter((c) => c.id !== item.id).concat(item)
        )

        // Return a context object with the snapshotted value
        return { previous }
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([CART_QUERY_KEY], context.previous)
      },
      onSuccess: () => {
        queryClient.invalidateQueries([CART_QUERY_KEY])
      },
    }
  )

  const { mutate: deleteCart } = useMutation<unknown, unknown, number, any>(
    (id) =>
      fetch(`/api/delete-cart`, {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (id) => {
        // 조회되기전에 데이터 미리 조작
        await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEY] })

        // Snapshot the previous value
        const previous = queryClient.getQueryData([CART_QUERY_KEY])

        // Optimistically update to the new value
        queryClient.setQueryData<Cart[]>([CART_QUERY_KEY], (old) =>
          old?.filter((c) => c.id !== id)
        )

        // Return a context object with the snapshotted value
        return { previous }
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([CART_QUERY_KEY], context.previous)
      },
      onSuccess: () => {
        queryClient.invalidateQueries([CART_QUERY_KEY])
      },
    }
  )

  const handleUpdate = () => {
    //TODO: 장바구니에서 수정 기능 구현
    if (quantity == null) {
      alert('최소 수량을 선택하세요.')
      return
    }
    updateCart({ ...props, quantity: quantity, amount: props.price * quantity })
  }

  const handleDelete = async () => {
    //TODO: 장바구니에서 삭제 기능 구현
    await deleteCart(props.id)
    alert(`장바구니에서 ${props.name} 삭제`)
  }

  return (
    <div className="w-full flex p-4" style={{ borderBottom: '1px solid grey' }}>
      <Image
        src={props.image_url}
        width={155}
        height={195}
        alt={props.name}
        onClick={() => router.push(`/products/${props.productId}`)}
      />
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">
          가격:{props.price.toLocaleString('ko-kr')} 원
        </span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={20} />
          <IconRefresh onClick={handleUpdate} />
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')} 원</span>
        <IconX onClick={handleDelete} />
      </div>
    </div>
  )
}

const Row = styled.div`
  display: flex;
  * ~ * {
    margin-left: auto;
  }
`


```

### 3. api 구현

add-order: post orderItem 들을 생성하고 createMany or create  
get-order: order 목록을 조회(필요하다면 filter로 status 별)  
update-order: orderItem의 option을 변경하여 order까지 업데이트하거  
나 order의 status를 업데이트 (아마도 admin 처럼 기능을 주면 될듯)

1. 주문하기 API 생성
   **api/add-order.ts**

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'

import { OrderItem, PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function addOrder(
  userId: string,
  items: Omit<OrderItem, 'id'>[],
  orderInfo?: { receiver: string; address: string; phoneNumber: string }
) {
  try {
    // orderItem 들을 만든다.

    let orderItemIds = []
    for (const item of items) {
      const orderItem = await prisma.orderItem.create({
        data: {
          ...item,
        },
      })
      console.log(`Created id: ${orderItem.id}`)
      orderItemIds.push(orderItem.id)
    }

    console.log(JSON.stringify(orderItemIds))

    // 만들어진 orderItemIds 를ㄹ 포함한 order를 만든다.

    const response = await prisma.orders.create({
      data: {
        userId,
        orderItemIds: orderItemIds.join(','),
        ...orderInfo,
        status: 0,
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
  const session = await unstable_getServerSession(req, res, authOptions)
  const { items, orderInfo } = JSON.parse(req.body)

  if (session == null) {
    res.status(200).json({ items: [], message: `no Session` })
    return
  }
  try {
    const wishlist = await addOrder(String(session.id), items, orderInfo)
    res.status(200).json({ items: wishlist, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

2. 주문 내역 가져오기 API 생성
   **api/get-order.ts**

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'

import { OrderItem, PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function getOrder(userId: string) {
  try {
    // orders 테이블에서 나의 주문들을 조회한다.
    const orders = await prisma.orders.findMany({
      where: {
        userId: userId,
      },
    })
    console.log(orders)

    let response = []

    // orders 안에 있는 orderItemids로 orderItem을 꺼내고 products 테이블에서 이미지 등 정보를 조합한다.
    for (const order of orders) {
      let orderItems: OrderItem[] = []
      for (const id of order.orderItemIds
        .split(',')
        .map((item) => Number(item))) {
        const res: OrderItem[] = await prisma.$queryRaw`
        SELECT i.id, quantity, amount, i.price, name, image_url, productId FROM OrderItem as i JOIN products as p ON i.productId=p.id
        WHERE i.id=${id};`
        orderItems.push.apply(orderItems, res)
      }
      response.push({ ...order, orderItems })
    }

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
  const { id } = req.query
  const session = await unstable_getServerSession(req, res, authOptions)
  if (session == null) {
    res.status(200).json({ items: [], message: `no Session` })
    return
  }
  try {
    const wishlist = await getOrder(String(session.id))
    res.status(200).json({ items: wishlist, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

3. 주문 내역 업데이트 API 생성
   **api/update-order-status.ts**

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function updateOrderStatus(id: number, status: number) {
  try {
    const response = await prisma.orders.update({
      where: {
        id: id,
      },
      data: {
        status: status,
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
  const session = await unstable_getServerSession(req, res, authOptions)
  const { id, status, userId } = JSON.parse(req.body)

  if (session == null || session.id !== userId) {
    res
      .status(200)
      .json({ items: [], message: `no Session or Invalid Session` })
    return
  }
  try {
    const wishlist = await updateOrderStatus(id, status)
    res.status(200).json({ items: wishlist, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

## 결과

- 접속 주소: http://localhost:3000/my
  ![](public\snapshot\5-3-12결과.PNG)

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
