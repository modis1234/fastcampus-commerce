import styled from '@emotion/styled'
import { IconRefresh, IconX } from '@tabler/icons'
import { CountControl } from 'components/CountControl'
import Image from 'next/image'
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
  const [data, setData] = useState<CartItem[]>()

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
        productId: 100,
        price: 20000,
        quantity: 2,
        amount: 40000,
        image_url:
          'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/9.jpg',
      },
      {
        name: '느낌있는 후드',
        productId: 100,
        price: 102300,
        quantity: 1,
        amount: 102300,
        image_url:
          'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/9.jpg',
      },
    ]
    setData(mockData)
  }, [])
  return (
    <div className="text-2xl mb-3">
      <span>Cart ({data?.length})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data?.map((item, index) => (
            <Item key={index} {...item} />
          ))}
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
          </div>
        </div>
      </div>
    </div>
  )
}

const Item = (props: CartItem) => {
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity)
  const [amount, setAmount] = useState<number>(props.quantity)
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price)
    }
  }, [quantity, props.price])
  return (
    <div className="w-full flex p-4" style={{ borderBottom: '1px solid grey' }}>
      <Image src={props.image_url} width={155} height={195} alt={props.name} />
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">
          가격:{props.price.toLocaleString('ko-kr')} 원
        </span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={20} />
          <IconRefresh />
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')} 원</span>
        <IconX />
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
