## part5 ch03 10.장바구니 UI 구현

-

## 실습

### 1. 공통 UI 정리

- /products/page를 홈으로 바꾸기 위해 /pages/index.tsx으로 붙여넣기

```javascript
import { categories, products } from '@prisma/client'
import Image from 'next/image'
import React, { useState, useEffect, useCallback } from 'react'
import { Input, Pagination, SegmentedControl, Select } from '@mantine/core'
import { CATEGORY_MAP, FILTERS, TAKE } from 'constants/products'
import { IconSearch } from '@tabler/icons'
import useDebounce from 'hooks/useDebounce'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activePage, setPage] = useState(1)
  // const [total, setTotal] = useState(0)
  // const [categories, setCategories] = useState<categories[]>([])
  const [selectedCategory, setCategory] = useState<string>('-1')
  // const [products, setProducts] = useState<products[]>([])
  const [selectedFilter, setFilter] = useState<string | null>(FILTERS[0].value)
  const [keyward, setKeyward] = useState('')

  const debouncedKeyword = useDebounce<string>(keyward)

  const { data: categories } = useQuery<
    { items: categories[] },
    unknown,
    categories[]
  >(
    [`/api/get-categories`],
    () => fetch(`/api/get-categories`).then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  )

  const { data: total = 0 } = useQuery<{ items: number }, unknown, number>(
    [
      `/api/get-products-count?category=${selectedCategory}&contains=${debouncedKeyword}`,
    ],
    () =>
      fetch(
        `/api/get-products-count?category=${selectedCategory}&contains=${debouncedKeyword}`
      ).then((res) => res.json()),
    {
      select: (data) => Math.ceil(data.items / TAKE),
    }
  )

  const { data: products } = useQuery<
    { items: products[] },
    unknown,
    products[]
  >(
    [
      `/api/get-products?skip=${
        TAKE * (activePage - 1)
      }&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedKeyword}`,
    ],
    () =>
      fetch(
        `/api/get-products?skip=${
          TAKE * (activePage - 1)
        }&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedKeyword}`
      ).then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  )

  const handleCange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyward(e.target.value)
  }

  return (
    <div className="mt-36 mb-36">
      {session && <p>안녕하세요. {session.user?.name}님</p>}
      <div className="mb-4">
        <Input
          icon={<IconSearch />}
          placeholder="Your email"
          value={keyward}
          onChange={handleCange}
        />
      </div>
      <div className="mb-4">
        <Select value={selectedFilter} onChange={setFilter} data={FILTERS} />
      </div>
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
      <div className="w-full flex mt-5">
        {total && (
          <Pagination
            className="m-auto"
            page={activePage}
            onChange={setPage}
            total={total}
          />
        )}
      </div>
    </div>
  )
}

```

### 2. Header 컴포넌트 만들기

**/components/Header.tsx\*** 파일 생성

```javascript
import { IconHome, IconShoppingCart, IconUser } from '@tabler/icons'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="mt-12 mb-12">
      <div className="w-full flex h-50 items-center">
        <IconHome onClick={() => router.push('/')} /> //home 으로 이동
        <span className="m-auto" />
        <IconShoppingCart
          className="mr-4"
          onClick={() => router.push('/cart')} // 카드 페이지 이동
        />
        {session ? (
          <Image
            src={session.user?.image ?? ''}
            alt="profile"
            width={30}
            height={30}
            style={{ borderRadius: '50%' }}
            onClick={() => router.push('/my')}
          /> // 로그인 되어있을 떄
        ) : (
          <IconUser onClick={() => router.push('/login')} /> // 로그인 페이지로 이동
        )}
      </div>
    </div>
  )
}
```

### 3. 상품 상세에 장바구니에 넣을 수 있는 Form을 만들기

[Mantine / input](https://ui.mantine.dev/category/inputs)

- /components/CountControl.tsx 파일 생성
  **Mantine-Input Number input with custom controls 복사+붙여넣기**

```javascript
import { useRef, Dispatch, SetStateAction } from 'react'
import {
  createStyles,
  NumberInput,
  NumberInputHandlers,
  ActionIcon,
} from '@mantine/core'
import { IconPlus, IconMinus } from '@tabler/icons'

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `6px ${theme.spacing.xs}px`,
    borderRadius: theme.radius.sm,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]
    }`,
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,

    '&:focus-within': {
      borderColor: theme.colors[theme.primaryColor][6],
    },
  },

  control: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3]
    }`,

    '&:disabled': {
      borderColor:
        theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[3],
      opacity: 0.8,
      backgroundColor: 'transparent',
    },
  },

  input: {
    textAlign: 'center',
    paddingRight: `${theme.spacing.sm}px !important`,
    paddingLeft: `${theme.spacing.sm}px !important`,
    height: 28,
    flex: 1,
  },
}))

interface QuantityInputProps {
  value: number | undefined
  setValue: Dispatch<SetStateAction<number | undefined>>
  min?: number
  max?: number
}

export function CountControl({
  value,
  setValue,
  min = 1,
  max = 10,
}: QuantityInputProps) {
  const { classes } = useStyles()
  const handlers = useRef<NumberInputHandlers>(null)

  return (
    <div className={classes.wrapper}>
      <ActionIcon<'button'>
        size={28}
        variant="transparent"
        onClick={() => handlers.current?.decrement()}
        disabled={value === min}
        className={classes.control}
        onMouseDown={(event) => event.preventDefault()}
      >
        <IconMinus size={16} stroke={1.5} />
      </ActionIcon>

      <NumberInput
        variant="unstyled"
        min={min}
        max={max}
        handlersRef={handlers}
        value={value}
        onChange={setValue}
        classNames={{ input: classes.input }}
        readOnly
      />

      <ActionIcon<'button'>
        size={28}
        variant="transparent"
        onClick={() => handlers.current?.increment()}
        disabled={value === max}
        className={classes.control}
        onMouseDown={(event) => event.preventDefault()}
      >
        <IconPlus size={16} stroke={1.5} />
      </ActionIcon>
    </div>
  )
}

```

### 4. /pages/products/[id]/index.tsx 컴포넌트에 CountControl.tsx 컴포넌트 적용

```javascript
// import ImageGallery from 'react-image-gallery'

...
...
import { CountControl } from 'components/CountControl'
...
...

//SSR
// export async function getServerSideProps(context: GetServerSideProps) {
  export async function getServerSideProps(context: GetStaticPropsContext) {
  ...
  ...
  const [quantity, setQuantity] = useState<number | undefined>(1)
     const validate = (type: 'cart' | 'order') => {
    if (quantity == null) {
      alert('최소 수량을 선택하세요.')
      return
    }

    // TODO: 장바구리에 등록하는 기능 추가

    router.push('/cart')
  }
  return (
    <>
        ...
        ...

        </div>
        <div>
          <span className="text-lg">수량</span>
          <CountControl value={quantity} setValue={setQuantity} max={200} />
        </div>
        <div className="flex space-x-3">
          ...
          ...

    </>
  )
}

```

## 결과

- 접속 주소: http://localhost:3000/auth/google
  ![](public\snapshot\4.결과.PNG)

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
