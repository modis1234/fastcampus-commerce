## part5 ch03 01.상세 페이지 구현(이미지 다루기)

## 실습

### 1.이미지 라이브러리 찾기

### 2-1. react-image-gallery 라이브러리 적용하기

[react-image-gallery][https://github.com/xiaolin/react-image-gallery]  
[demo][https://www.linxtion.com/demo/react-image-gallery/)]

1.  설치
    `$yarn add react-image-gallery`
2.  global.css 추가
    @import '~react-image-gallery/styles/css/image-gallery.css';
3.  pages/products.tsx 생성
    **products.tsx**

```javascript
import ImageGallery from 'react-image-gallery'

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
    original: 'https://picsum.photos/id/1019/1000/600/',
    thumbnail: 'https://picsum.photos/id/1019/250/150/',
  },
]

export default function Products() {
  return <ImageGallery items={images} />
}
```

### 2-2. next/image를 활용할 수 있는 nuka-carousel 라이브러리 적용하기

[nuka-carousel](https://github.com/formidablelabs/nuka-carousel)

1. 설치
   `$yarn add nuka-carousel`
2. pages/products.tsx 코드 작성

```javascript
// import ImageGallery from 'react-image-gallery'

import Image from 'next/image'
import Carousel from 'nuka-carousel/lib/carousel'

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
    original: 'https://picsum.photos/id/1019/1000/600/',
    thumbnail: 'https://picsum.photos/id/1019/250/150/',
  },
  {
    original:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
    thumbnail:
      'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/4v.jpg',
  },
]

export default function Products() {
  //   return <ImageGallery items={images} />
  return (
    <Carousel animation="zoom" autoplay withoutControls wrapAround speed={10}>
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
  )
}
```

3. 여러가지 옵션 적용  
   @ 요구사항

- 큰 이미지 슬라이드는 스스로 무한히 돌아가고
- 큰 이미지 밑에는 작은 섬네일들이 있고
- 섬네일을 누르면 슬라이드가 바뀌도록

```javascript
// import ImageGallery from 'react-image-gallery'

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

  //   return <ImageGallery items={images} />
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
    </>
  )
}
```

## 결과

- 실행  
   `$yarn dev`  
   ![결과](./public/snapshot/5-3-1%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B2%B0%EA%B3%BC.PNG)

## 이슈 및 에러 경험

> ### image domain error
>
> ![에러발생](./public/snapshot/5-3-1%EC%97%90%EB%9F%AC%EC%B2%98%EB%A6%AC.PNG) > [에러처리][https://nextjs.org/docs/api-reference/next/image]

- **next.config.js** 코드 작성

```javascript
const nextConfig = {
  ...
  ...
  images: {
    domains: ['picsum.photos'],
  },
}

module.exports = nextConfig
```

## 참고

[이미지 슬라이드 / 이미지 갤러리 찾아보기]  
[https://alvarotrigo.com/blog/react-carousels/]  
[npm trends]  
[https://npmtrends.com/nuka-carousel-vs-react-slick-vs-react-slider-vs-react-swipe-vs-react-swiper-vs-slick-carousel-vs-swiper]  
[https://npmtrends.com/react-gallery-swiper-vs-react-grid-gallery-vs-react-image-gallery-vs-react-image-lightbox-vs-react-image-slider]

[bundle phobia][https://bundlephobia.com/]  
[import cost][https://marketplace.visualstudio.com/items?itemname=wix.vscode-import-cost]

[정리]
![참고](./public/snapshot/5-3-1%20%EC%B0%B8%EA%B3%A0.PNG)
