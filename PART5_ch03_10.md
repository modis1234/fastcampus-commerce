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

### 5. Cart.tsx 컴포넌트 적용

```javascript
import styled from '@emotion/styled'
import { Button } from '@mantine/core'
import { products } from '@prisma/client'
import { IconRefresh, IconX } from '@tabler/icons'
import { useQuery } from '@tanstack/react-query'
import { CountControl } from 'components/CountControl'
import { CATEGORY_MAP } from 'constants/products'
import Image from 'next/image'
import { Router, useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

interface CartItem {
  name: string
  productId: number
  price: number
  quantity: number
  amount: number
  image_url: string
}

export default function Cart() {
  const router = useRouter()
  const [data, setData] = useState<CartItem[]>([])

  const dilyveryAmount = 5000
  const discountAmount = 0

  const amount = useMemo(() => {
    return data
      ?.map((item) => item.amount)
      .reduce((prev, curr) => prev + curr, 0)
  }, [data])

  useEffect(() => {
    const mockData = [
      {
        name: '멋들어진 신발',
        productId: 199,
        price: 20000,
        quantity: 2,
        amount: 40000,
        image_url:
          'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/9.jpg',
      },
      {
        name: '느낌있는 후드',
        productId: 201,
        price: 102300,
        quantity: 1,
        amount: 102300,
        image_url:
          'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/9.jpg',
      },
    ]
    setData(mockData)
  }, [])

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

  const handleOrder = () => {
    //TODO: 주문하기 기능 구현
    alert(`장바구니에 담긴 것들 ${JSON.stringify(data)} 주문하기`)
  }

  return (
    <div className="text-2xl mb-3">
      <span>Cart ({data?.length})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data?.length > 0 ? (
            data?.map((item, index) => <Item key={index} {...item} />)
          ) : (
            <div>장바구니에 아무것도 없습니다.</div>
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
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity)
  const [amount, setAmount] = useState<number>(props.quantity)
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price)
    }
  }, [quantity, props.price])

  const handleUpdate = () => {
    //TODO: 장바구니에서 수정 기능 구현
    alert(`장바구니에서 ${props.name} 수정`)
  }

  const handleDelete = () => {
    //TODO: 장바구니에서 삭제 기능 구현
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

- 최소 수량 validate 함수 추가 TODO: 추가해두고 카트로 보내자카트의 기본 UI 만들자 Item 으로 내역 한줄을 분리하자

- 수량을 직접 수정할 수 있도록 하자
  업데이트 아이콘을 추가해두자
  장바구니의 내역을 합계를 보여주는 UI를 만들고
  주문하기 버튼을 추가하자

- 장바구니 하단에 추천 상품을 나열해주자 get-products api의 오류를 찾아서 고치자

```javascript

async function getProducts({
  ...
  ...

  try {
    const products = await getProducts({
      skip: Number(skip),
      take: Number(take),
      category: Number(category),
      orderBy: String(orderBy),
      contains: contains ? String(contains) : '',  <--- whhere undefine 으로 조회 안됨.. contains undefine  에러 처리로 해결!!
    })

  }
}

```

## 결과

- 접속 주소: http://localhost:3000/cart
  ![](public\snapshot\5-3-10결과.PNG)

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
