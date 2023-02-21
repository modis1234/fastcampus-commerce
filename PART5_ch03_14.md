## part5 ch03 14. 후기 이미지 구현

## 실습

- 이미지 업로드 후 저장은 DB에 저장할 수 있지만, 용량이 커지면서 비효율적이다.
- File은 File을 저장하는 곳에 저장하고 DB에는 url만 저장하는 것이 일반적이다.

> 웹서비스에서 이미지 업로드하는 과정  
> File을 저장소에 등록하고 url을 받는다.  
> url을 DB에 저장한다.

> Image를 저장하고 url을 받기위해  
> Image hosting 서비스를 활용할 수도 있음  
> cloudflare / firebase / aws s3 등…  
> (https://developers.cloudflare.com/images/cloudflareimages/tutorials/integrate-cloudflare-images/)  
> 유료인 경우가 많음
> -->> 실습에서는 무료 이미지 DB 저장소를 활용
> ImgBB
> (https://imgbb.com/)

### 1. Page에서 Input type=file로 ImgBB에 파일을 올리고 url을 생성한다.

- url로 미리보기를 구현
- page/upload.tsx 페이지 생성
  **page/upload.tsx**

```javascript
import styled from '@emotion/styled'
import Button from 'components/Button'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

export default function ImageUpload() {
  const inputRef = useRef < HTMLInputElement > null
  const [image, setImage] = useState('')

  const handleUpload = () => {
    if (inputRef.current && inputRef.current.files) {
      const fd = new FormData()
      fd.append(
        'image',
        inputRef.current.files[0],
        inputRef.current.files[0].name
      )

      fetch(
        'https://api.imgbb.com/1/upload?key=4f78d820ef455512511752317d835b5f&expiration=15552000', // ImgBB 활용
        {
          method: 'POST',
          body: fd,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data)

          setImage(data.data.image.url)
        })
        .catch((error) => console.log(error))
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" />
      <Button onClick={handleUpload}>업로드</Button>
      {image !== '' && (
        <AutoSizeImageWrapper>
          <Image src={image} alt="" layout="fill" objectFit="contain" />
        </AutoSizeImageWrapper>
      )}
    </div>
  )
}

const AutoSizeImageWrapper = styled.div`
  width: 500px;
  height: 500px;
  position: relative;
`
```

- next.config.js 에 "i.ibb.co" 도메인을 domains 를 등록 해준다.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  ...
  ...
  images: {
    domains: [
      'picsum.photos',
      'raw.githubusercontent.com',
      'cdn.shopity.com',
      'lh3.googleusercontent.com',
      'i.ibb.co',
    ],
  },
}

module.exports = nextConfig

```

**결과**  
http://localhost:3000/upload  
![결과](./public\snapshot\5-3-14upload페이지결과.PNG)

### 2. AutoSizeImageWrapper를 공통 Commponent로 분리 한다.

- **component/AutoSizeImage.tsx** 생성

```javascript
import styled from '@emotion/styled'
import Image from 'next/image'

export default function AutoSizeImage({
  src,
  size = 500,
}: {
  src: string
  size?: number
}) {
  return (
    <AutoSizeImageWrapper size={size}>
      <Image src={src} alt="" layout="fill" objectFit="contain" />
    </AutoSizeImageWrapper>
  )
}

const AutoSizeImageWrapper = styled.div<{ size: number }>`
  width: ${(props) => (props.size ? `${props.size}px` : '500px')};
  height: ${(props) => (props.size ? `${props.size}px` : '500px')};
  position: relative;
`
```

### 3. edit.tsx 페이지에 이미지 업로드 기능 적용

- **edit.tsx**

```javascript
import { Slider } from '@mantine/core'
import AutoSizeImage from 'components/AutoSizeImage'
import CustomEditor from 'components/Editor'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

export default function CommentEdit() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])
  const router = useRouter()
  ...
  ...

  ...
  ...
  // 이미지 업로드 핸들러
  const handleChange = () => {
    if (
      inputRef.current &&
      inputRef.current.files &&
      inputRef.current.files.length > 0
    ) {
      for (let i = 0; i < inputRef.current.files.length; i++) {
        const fd = new FormData()
        fd.append(
          'image',
          inputRef.current.files[i],
          inputRef.current.files[i].name
        )

        fetch(
          'https://api.imgbb.com/1/upload?key=4f78d820ef455512511752317d835b5f&expiration=15552000',
          {
            method: 'POST',
            body: fd,
          }
        )
          .then((res) => res.json())
          .then((data) => {
            console.log(data)

            setImages((prev) =>
              Array.from(new Set(prev.concat(data.data.image.url)))
            )
          })
          .catch((error) => console.log(error))
      }
    }
  }

   ...
   ...
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
      <div style={{ display: 'flex' }}>
        {images &&
          images.length > 0 &&
          images.map((image, idx) => <AutoSizeImage key={idx} src={image} />)}
      </div>
    </div>
  )
}

```

### 4. update-comments.ts API 이미지 파라미터 추가

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
  images,
}: {
  userId: string
  orderItemId: number
  rate: number
  contents: string
  images: string
}) {
  try {
    const response = await prisma.comment.upsert({
      where: {
        orderItemId,
      },
      update: {
        contents,
        rate,
        images,
      },
      create: {
        userId,
        orderItemId,
        contents,
        rate,
        images,
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
  const { orderItemId, rate, contents, images } = JSON.parse(req.body)

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
      images: images,
    })
    res.status(200).json({ items: wishlist, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

**edit.tsx 이미지 구현 결과**  
http://localhost:3000/comment/edit?orderItemId=5  
![결과](./public\snapshot\edit적용.PNG)

### 5. CommentItem.tsx 컴포넌트에 이미지 추가 구현

- **CommentsItem.tsx**

```javascript
import styled from '@emotion/styled'
import { IconStar } from '@tabler/icons'
import { format } from 'date-fns'
import { convertFromRaw, EditorState } from 'draft-js'
import { CommentItemType } from 'pages/products/[id]'
import AutoSizeImage from './AutoSizeImage'
import CustomEditor from './Editor'

export default function CommentItem({ item }: { item: CommentItemType }) {
  console.log('item->', item)
  return (
    <Wrapper>
      <div>
        ...
        ...
      <div style={{ display: 'flex' }}>
        {item.images?.split(',').map((image, idx) => (
          <AutoSizeImage key={idx} src={image} size={150} />
        ))}
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

**edit.tsx 이미지 구현 결과**  
http://localhost:3000/products/187
![결과](./public\snapshot\commentItem적용.PNG)

## 결과

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
