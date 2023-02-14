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
      fetch(`/api/update-product`, {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: orderItemId,
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
  onSave,
  onEditorStateChange,
}: {
  editorState: EditorState | undefined
  readOnly?: boolean
  onSave?: () => void
  onEditorStateChange?: Dispatch<SetStateAction<EditorState | undefined>>
}) {
  return (
    <Wrapper readOnly={readOnly}>
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

const Wrapper = styled.div<{ readOnly: boolean }>`
  padding: 16px;
  ${(props) =>
    props.readOnly ? '' : 'border: 1px solid black; border-radius: 8px;'}
`

```

## 결과

- 접속 주소: http://localhost:3000/my
  ![](public\snapshot\5-3-12결과.PNG)

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
