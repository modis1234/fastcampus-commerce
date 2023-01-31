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

export default function Products() {
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

  // useEffect(() => {
  //   fetch(`/api/get-categories`)
  //     .then((res) => res.json())
  //     .then((data) => setCategories(data.items))
  // }, [])

  // useEffect(() => {
  //   fetch(
  //     `/api/get-products-count?category=${selectedCategory}&contains=${debouncedKeyword}`
  //   )
  //     .then((res) => res.json())
  //     .then((data) => setTotal(Math.ceil(data.items / TAKE)))
  // }, [selectedCategory, debouncedKeyword])

  // useEffect(() => {
  //   console.log('selectedCategory->', selectedCategory)
  //   const skip = TAKE * (activePage - 1)
  //   fetch(
  //     `/api/get-products?skip=${skip}&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedKeyword}`
  //   )
  //     .then((res) => res.json())
  //     .then((data) => setProducts(data.items))
  // }, [activePage, selectedCategory, selectedFilter, debouncedKeyword])

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
    <div className="px-36 mt-36 mb-36">
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
