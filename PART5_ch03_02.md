## part5 ch03 02.상세 페이지 구현(컨텐츠 다루기)

- draft.js 기반 react-draft-wysiwyg을 써보자
-

## 실습

### 1.draft.js 기반 react-draft-wysiwyg 사용하기

`$ yarn add draft-js react-draft-wysiwyg`  
`$ yarn add -D @types/draft-js @types/react-draft-wysiwyg`

> **wysiwyg(위즈윅)** what you see is what you get

### 2. Editor 컴포넌트 만들기

- 작성시에도 사용하고 / 보여줄때도 사용할 수 있도록

* components/Editor.tsx 생성

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
    <Wrapper>
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

const Wrapper = styled.div`
  padding: 16px;
`

```

### 3. planetScale에서 product 테이블에 contents 컬럼 추가

```sql
ALTER TABLE products ADD COLUMN contents TEXT NULL;
```

### 4. schema.prisma 파일 products 모델에 contents 추가

- schema.prisma

```javascript
...
...

model products {
  id Int @id @default(autoincrement())
  name String
  image_url String?
  category_id Int
  contents String?   <--- String 타입의 contents추가
  createdAt DateTime @default(now())

  @@index([category_id])
}

```

- `$ yarn prisma generate`

### 5. product 테이블 API 실습

- pages/products/[id] 디렉토리 생성

#### 5-1. products 테이블 GET

- products.tsx 파일 생성

  ```javascript
  import Head from 'next/head'
  import Image from 'next/image'
  import Carousel from 'nuka-carousel/lib/carousel'
  import { useState } from 'react'
  const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1016/1000/600/',
      thumbnail: 'https://picsum.photos/id/1016/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1013/1000/600/',
      thumbnail: 'https://picsum.photos/id/1013/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1012/1000/600/',
      thumbnail: 'https://picsum.photos/id/1012/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1011/1000/600/',
      thumbnail: 'https://picsum.photos/id/1011/250/150/',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/1.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/1.jpg',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/2.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/2.jpg',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/3.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/3.jpg',
    },
  ]
  export default function Products() {
    const [index, setIndex] = useState(0)
    // return <ImageGallery items={images} />
    return (
      <>
        <Head>
          <meta
            property="og:url"
            content="http://www.nytimes.com/2015/02/19/arts/international/when-great-minds-dont-think-alike.html"
          />
          <meta property="og:type" content="article" />
          <meta
            property="og:title"
            content="When Great Minds Don’t Think Alike"
          />
          <meta
            property="og:description"
            content="How much does culture influence creative thinking?"
          />
          <meta
            property="og:image"
            content="http://static01.nyt.com/images/2015/02/19/arts/international/19iht-btnumbers19A/19iht-btnumbers19A-facebookJumbo-v2.jpg"
          />
        </Head>
        <Carousel
          animation="zoom"
          autoplay
          withoutControls
          wrapAround
          speed={10}
          slideIndex={index}
        >
          {images.map((item) => (
            <Image
              key={item.original}
              src={item.original}
              alt="Image"
              width={1000}
              height={600}
              layout="responsive"
            />
          ))}
        </Carousel>
        <div style={{ display: 'flex' }}>
          {images.map((item, idx) => (
            <div key={idx} onClick={() => setIndex(idx)}>
              <Image src={item.original} alt="image" width={100} height={60} />
            </div>
          ))}
        </div>
      </>
    )
  }
  ```

- api/get-products.ts API 파일 생성

  ```javascript
  import type { NextApiRequest, NextApiResponse } from 'next'
  import { PrismaClient } from '@prisma/client'
  const prisma = new PrismaClient()
    async function getProducts() {
    try {
        const response = await prisma.products.findMany()
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
        const { name } = req.query

        if (name === null) {
        return res.status(400).json({ message: 'No name' })
        }
        try {
            const products = await getProducts()
            res.status(200).json({ items: products, message: `Success` })
        } catch (error) {
            res.status(400).json({ message: `Failed` })
        }
    }
  ```

#### **5-2. products 테이블 FInd By ID**

- pages/products/[id] 경로에 index.tsx 파일 생성  
  **index.tsx**

  ```javascript
  // import ImageGallery from 'react-image-gallery'
  import CustomEditor from 'components/Editor'
  import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
  import Image from 'next/image'
  import { useRouter } from 'next/router'
  import Carousel from 'nuka-carousel/lib/carousel'
  import { useState, useEffect } from 'react'

  const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1016/1000/600/',
      thumbnail: 'https://picsum.photos/id/1016/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1013/1000/600/',
      thumbnail: 'https://picsum.photos/id/1013/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1012/1000/600/',
      thumbnail: 'https://picsum.photos/id/1012/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1011/1000/600/',
      thumbnail: 'https://picsum.photos/id/1011/250/150/',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/1.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/1.jpg',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/2.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/2.jpg',
    },
    {
      original:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/3.jpg',
      thumbnail:
        'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/3.jpg',
    },
  ]

  export default function Products() {
    const [index, setIndex] = useState(0)
    const router = useRouter()
    const { id: productId } = router.query
    const [editorState, setEditorState] =
      (useState < EditorState) | (undefined > undefined)

    useEffect(() => {
      if (productId) {
        fetch(`/api/get-product?id=${productId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.items.contents) {
              setEditorState(
                EditorState.createWithContent(
                  convertFromRaw(JSON.parse(data.items.contents))
                )
              )
            } else {
              setEditorState(EditorState.createEmpty())
            }
          })
      }
    }, [productId])

    return (
      <>
        <Carousel
          animation="zoom"
          autoplay
          withoutControls
          wrapAround
          speed={10}
          slideIndex={index}
        >
          {images.map((item) => (
            <Image
              key={item.original}
              src={item.original}
              alt="Image"
              width={1000}
              height={600}
              layout="responsive"
            />
          ))}
        </Carousel>
        <div style={{ display: 'flex' }}>
          {images.map((item, idx) => (
            <div key={idx} onClick={() => setIndex(idx)}>
              <Image src={item.original} alt="image" width={100} height={60} />
            </div>
          ))}
        </div>
        {editorState !== null && (
          <CustomEditor editorState={editorState} readOnly />
        )}
      </>
    )
  }
  ```

- api/get-product.ts API 파일 생성
  **get-product.ts**

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
//asdfas
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getProduct(id: number) {
  try {
    console.log(id)

    const response = await prisma.products.findUnique({
      where: {
        id: id,
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
  if (id === null) {
    res.status(400).json({ message: `no id` })
    return
  }
  try {
    const products = await getProduct(Number(id))
    res.status(200).json({ items: products, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

5-3. products 테이블 UPDATE By ID

- pages/products/[id] 경로에 edit.tsx 파일 생성

**edit.tsx**

```javascript
// import ImageGallery from 'react-image-gallery'

import CustomEditor from 'components/Editor'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Carousel from 'nuka-carousel/lib/carousel'
import { useState, useEffect } from 'react'

const images = [
  {
    original: 'https://picsum.photos/id/1018/1000/600/',
    thumbnail: 'https://picsum.photos/id/1018/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1015/1000/600/',
    thumbnail: 'https://picsum.photos/id/1015/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1016/1000/600/',
    thumbnail: 'https://picsum.photos/id/1016/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1013/1000/600/',
    thumbnail: 'https://picsum.photos/id/1013/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1012/1000/600/',
    thumbnail: 'https://picsum.photos/id/1012/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1011/1000/600/',
    thumbnail: 'https://picsum.photos/id/1011/250/150/',
  },
  {
    original:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
    thumbnail:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
  },
  {
    original:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/1.jpg',
    thumbnail:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/1.jpg',
  },
  {
    original:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/2.jpg',
    thumbnail:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/2.jpg',
  },
  {
    original:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/3.jpg',
    thumbnail:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/3.jpg',
  },
]

export default function Products() {
  const [index, setIndex] = useState(0)
  const router = useRouter()
  const { id: productId } = router.query
  const [editorState, setEditorState] =
    (useState < EditorState) | (undefined > undefined)

  useEffect(() => {
    if (productId) {
      fetch(`/api/get-product?id=${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.items.contents) {
            setEditorState(
              EditorState.createWithContent(
                convertFromRaw(JSON.parse(data.items.contents))
              )
            )
          } else {
            setEditorState(EditorState.createEmpty())
          }
        })
    }
  }, [productId])

  const handleSave = () => {
    if (editorState) {
      fetch(`/api/update-product`, {
        method: 'POST',
        body: JSON.stringify({
          id: String(productId),
          contents: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert('Success')
        })
    }
  }

  return (
    <>
      <Carousel
        animation="zoom"
        autoplay
        withoutControls
        wrapAround
        speed={10}
        slideIndex={index}
      >
        {images.map((item) => (
          <Image
            key={item.original}
            src={item.original}
            alt="Image"
            width={1000}
            height={600}
            layout="responsive"
          />
        ))}
      </Carousel>
      <div style={{ display: 'flex' }}>
        {images.map((item, idx) => (
          <div key={idx} onClick={() => setIndex(idx)}>
            <Image src={item.original} alt="image" width={100} height={60} />
          </div>
        ))}
      </div>
      {editorState !== null && (
        <CustomEditor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          onSave={handleSave}
        />
      )}
    </>
  )
}
```

- api/update-product.ts API 파일 생성  
  **update-product.ts**

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
//asdfas
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateProduct(id: number, contents: string) {
  try {
    console.log(id)

    const response = await prisma.products.update({
      where: {
        id: id,
      },
      data: {
        contents: contents,
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
  console.log('update->', req.body)
  const { id, contents } = JSON.parse(req.body)
  if (id == null || contents == null) {
    res.status(400).json({ message: `no id or contents` })
    return
  }
  try {
    const products = await updateProduct(Number(id), contents)
    res.status(200).json({ items: products, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}
```

## 결과

- 접속 주소: http://localhost:3000/products/2/edit
  ![결과](./public/snapshot/5-3-2%EA%B2%B0%EA%B3%BC.PNG)

## 이슈 및 에러 경험

## 참고

```

```
