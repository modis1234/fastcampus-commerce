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

## 결과

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
