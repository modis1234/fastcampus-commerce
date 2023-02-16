## part5 ch03 13. 후기 글 구현

## 실습

> - 후기 요구사항  
>   배송완료된 주문에 대해서만 상품마다 후기를 작성할 수 있게 한다

### 1. Comment 테이블 만들기

- userId
- orderItemId
- rate
- contents
- images
- updatedAt

**prisma/schema.prisma**

```javascript
...
...
model Comment {
  id Int @id @default(autoincrement())
  userId String
  oredrItemId Int @unique
  rate Int
  contents String?
  images String?
  updatedAt DateTime @updatedAt
}

```

### 2.기능 만들기

> get-comment(작성 중인 후기 있는지 체크 / 작성 권한 있는 사람만)  
> update-comment  
> get-comments(productId 기준으로)

1. get-comment API 생성
   **api/get-comment.ts**

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
//asdfas
import { PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function getComment(userId: string, orderItemId: number) {
  try {
    const response = await prisma.comment.findUnique({
      where: {
        oredrItemId: orderItemId,
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
```

2. edit.tsx 컴포넌틑 생성

```javascript
import { Slider } from '@mantine/core'
import CustomEditor from 'components/Editor'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function CommentEdit() {
  const router = useRouter()
  const [rate, setRate] = useState(5)
  const { orderItemId } = router.query
  const [editorState, setEditorState] =
    (useState < EditorState) | (undefined > undefined)

  useEffect(() => {
    if (orderItemId) {
      fetch(`/api/get-comment?orderItemId=${orderItemId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.items.contents) {
            setEditorState(
              EditorState.createWithContent(
                convertFromRaw(JSON.parse(data.items.contents))
              )
            )
            setRate(data.items.rate)
          } else {
            setEditorState(EditorState.createEmpty())
          }
        })
    }
  }, [orderItemId])

  const handleSave = () => {
    if (editorState) {
      fetch(`/api/update-comment`, {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          rate: rate,
          contents: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          images: [],
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert('Success')
          router.back()
        })
    }
  }
  return (
    <div>
      {editorState !== null && (
        <CustomEditor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          onSave={handleSave}
        />
      )}
      <Slider
        defaultValue={5}
        min={1}
        max={5}
        step={1}
        onChange={setRate}
        marks={[
          { value: 1 },
          { value: 2 },
          { value: 3 },
          { value: 4 },
          { value: 5 },
        ]}
      />
    </div>
  )
}
```

2-1. my.tsx 컴포넌트 후기 작성 버튼 만들기
**my.tsx**

```javascript
...
...
...
...

const Item = (props: OrderItemDetail & { status: number }) => {
  const router = useRouter()
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity)
  const [amount, setAmount] = useState<number>(props.quantity)
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price)
    }
  }, [quantity, props.price])

  const handleComment = () => {
    router.push(`/comment/edit?orderItemsId=${props.id}`)
  }

  return (
   ...
   ...
      <div className="flex flex-col ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')} 원</span>
        <div>
          {props.status === 5 && (
            <Button
              style={{
                backgroundColor: 'black',
                color: 'white',
                marginTop: 'auto',
              }}
              onClick={handleComment}
            >
              후기 작성
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

```

2-2. components/Editor.tsx 수정

```javascript
import styled from '@emotion/styled'
import { EditorState } from 'draft-js'
import dynamic from 'next/dynamic'
import { Dispatch, SetStateAction } from 'react'
import { EditorProps } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import Button from './Button'

const Editor = dynamic<EditorProps>(
  () => import('react-draft-wysiwyg').then((module) => module.Editor),
  {
    ssr: false,
  }
)

export default function CustomEditor({
  editorState,
  readOnly = false,
  noPadding = false,
  onSave,
  onEditorStateChange,
}: {
  editorState: EditorState | undefined
  readOnly?: boolean
  noPadding?: boolean
  onSave?: () => void
  onEditorStateChange?: Dispatch<SetStateAction<EditorState | undefined>>
}) {
  return (
    <Wrapper readOnly={readOnly} noPadding={noPadding}>
      <Editor
        readOnly={readOnly}
        editorState={editorState}
        toolbarHidden={readOnly}
        wrapperClassName="wrapeer-class"
        toolbarClassName="editorToobar-hidden"
        editorClassName="editor-class"
        toolbar={{
          options: ['inline', 'list', 'textAlign', 'link'],
        }}
        localization={{
          locale: 'ko',
        }}
        onEditorStateChange={onEditorStateChange}
      />
      {!readOnly && <Button onClick={onSave}>Save</Button>}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ readOnly: boolean; noPadding: boolean }>`
  ${(props) => (props.noPadding ? '' : 'padding: 16px;')}
  ${(props) =>
    props.readOnly ? '' : 'border: 1px solid black; border-radius: 8px;'}
`


```

3. update-comment.ts 후기 업데이트 API 생성

```javascript

import type { NextApiRequest, NextApiResponse } from 'next'
//asdfas
import { PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function updateComment({
  userId,
  orderItemId,
  rate,
  contents,
}: {
  userId: string
  orderItemId: number
  rate: number
  contents: string
}) {
  try {
    const response = await prisma.comment.upsert({
      where: {
        orderItemId,
      },
      update: {
        contents,
        rate,
      },
      create: {
        userId,
        orderItemId,
        contents,
        rate,
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
  const { id } = req.query
  const session = await unstable_getServerSession(req, res, authOptions)
  const { orderItemId, rate, contents } = JSON.parse(req.body)

  if (session == null) {
    res.status(200).json({ items: [], message: `no Session` })
    return
  }

  try {
    const wishlist = await updateComment({
      userId: String(session.id),
      orderItemId: orderItemId,
      rate: rate,
      contents: contents,
    })
    res.status(200).json({ items: wishlist, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

### 3. component/CommentItem.tsx 컴포넌트 생성

```javascript
import styled from '@emotion/styled'
import { IconStar } from '@tabler/icons'
import { format } from 'date-fns'
import { convertFromRaw, EditorState } from 'draft-js'
import { CommentItemType } from 'pages/products/[id]'
import CustomEditor from './Editor'

export default function CommentItem({ item }: { item: CommentItemType }) {
  console.log('item->', item)
  return (
    <Wrapper>
      <div>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <IconStar
                  key={idx}
                  fill={idx < item.rate ? 'red' : 'none'}
                  stroke={idx < item.rate ? 0 : 1}
                />
              ))}
            </div>
            <span className="text-zinc-300 text-xs">
              {item.price.toLocaleString('ko-kr')} 원 * {item.quantity} 개={''}
              {item.amount.toLocaleString('ko-kr')} 원
            </span>
          </div>
          <p className="text-zinc-300 ml-auto">
            {format(new Date(item.updatedAt), 'yyyy년 M월 d일')}
          </p>
        </div>
        <CustomEditor
          editorState={EditorState.createWithContent(
            convertFromRaw(JSON.parse(item.contents ?? ''))
          )}
          readOnly
          noPadding
        />
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px;
`
```

### 4. page\products\[id]\index.tsx 컴포넌트 후기 불러오기 기능 구현

1. get-comments.ts 후기 글들 불러오기 API 생성

```javascript
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
```

2. index.tsx 컴포넌트 후기 글 UI 표출

```javascript
// import ImageGallery from 'react-image-gallery'

import { Button } from '@mantine/core'
import { Cart, Comment, OrderItem, products } from '@prisma/client'
import { IconHeart, IconHeartbeat, IconShoppingCart } from '@tabler/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import CommentItem from 'components/CommentItem'
import { CountControl } from 'components/CountControl'
import CustomEditor from 'components/Editor'
import { CATEGORY_MAP } from 'constants/products'
import { format } from 'date-fns'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { GetServerSideProps, GetStaticPropsContext } from 'next'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Carousel from 'nuka-carousel/lib/carousel'
import { CART_QUERY_KEY } from 'pages/cart'
import { ORDER_QUERY_KEY } from 'pages/my'
import { useState, useEffect } from 'react'

//SSR
// export async function getServerSideProps(context: GetServerSideProps) {
export async function getServerSideProps(context: GetStaticPropsContext) {
    ...
    ...

  const comments = await fetch(
    `http://localhost:3000/api/get-comments?productId=${context.params?.id}`
  )
    .then((res) => res.json())
    .then((data) => data.items)
  return {
    props: {
      product: { ...product, images: [product.image_url, product.image_url] },
      comments: comments,
    },
  }
}

const WISHLIST_QUERY_KEY = '/api/get-wishlist'

export interface CommentItemType extends Comment, OrderItem {}

export default function Products(props: {
  product: products & { images: string[] }
  comments: CommentItemType[]
}) {
  const [index, setIndex] = useState(0)
  const { data: session } = useSession()
  const [quantity, setQuantity] = useState<number | undefined>(1)

  const router = useRouter()
  const queryClient = useQueryClient()

  const { id: productId } = router.query
  const [editorState] = useState<EditorState | undefined>(() =>
    props.product.contents
      ? EditorState.createWithContent(
          convertFromRaw(JSON.parse(props.product.contents))
        )
      : EditorState.createEmpty()
  )

  ...
  ...
  ...


  return (
    <>
      {product != null && productId != null ? (
            ...
            ...
            ...

            {editorState !== null && (
              <CustomEditor editorState={editorState} readOnly />
            )}
            <div>
              <p className="text-2xl font-semibold">후기</p>
              {props.comments &&
                props.comments.map((comment, idx) => (
                  <CommentItem key={idx} item={comment} />
                ))}
            </div>
          </div>
        ...
        ...
        ..,

    </>
  )
}

```

## 결과

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
