## part5 ch02-1 Notion Public API 활용(1)

- Notion API 활용해 데이터 CRUD 적용하기
- Notion Developers
  (https://developers.notion.com/)
  - 워크스페이스에 CRUD가 가능
  - Commerce 서비스에서 사용해보기

## 실습

### 1. 노션 데이터베이스에서 getItems / detailItem

1. getItems
   https://developers.notion.com/reference/post-database-query

- pages/api 디렉토리에 get-items.ts api 서버 생성

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: 'secret_sAGrnZTLFAw5sWiypL27duFpW35z1ZlhCwVmP9rt6tr',
})

const databaseId = 'e11f0b7f5ac54ee698eeb27ec6661410'

async function getItems() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [ // sort 옵션 적용
        {
          property: 'price',
          direction: 'ascending',
        },
      ],
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
  const { name } = req.query

  if (name === null) {
    return res.status(400).json({ message: 'No name' })
  }
  try {
    const response = await getItems()
    res.status(200).json({ items: response?.results, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

2. detailItem

- pages/api 디렉토리에 get-detail.ts api 서버 생성

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: 'secret_sAGrnZTLFAw5sWiypL27duFpW35z1ZlhCwVmP9rt6tr',
})

const databaseId = 'e11f0b7f5ac54ee698eeb27ec6661410'

async function getDetail(pageId: string, propertyId: string) {
  try {
    const response = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    })
    console.log(response)
    return response
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  detail?: any
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
    const { pageId, propertyId } = req.query
    const response = await getDetail(String(pageId), String(propertyId))
    res.status(200).json({ detail: response, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

- getItems 호출하기

  ```javascript

  ** index.tsx
  export default function Home() {
    const [products, setProducts] = useState<
    { id: string; properties: { id: string }[] }[]
  >([])  // items를 useState에 setState한다.

  useEffect(() => {
    fetch('/api/get-items')
      .then((res) => res.json())
      .then((data) => setProducts(data.items))
  }, [])


  ...
  ...

  return (
  ...
  ...
   <div>
          <p>Product List</p>
          {products &&
            products.map((item) => (
              <div key={item.id}>
                {JSON.stringify(item)}
                {item.properties &&
                  Object.entries(item.properties).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        fetch(
                          `/api/get-detail?pageId=${item.id}&propertyId=${value.id}`
                        )
                          .then((res) => res.json())
                          .then((data) => alert(JSON.stringify(data.detail)))
                      }}
                    >
                      {key}
                    </button>
                  ))}
              </div>
            ))}
        </div>
  ...
  ...

  )

  ```

## 결과

![4.getItems, getDetail 결과](./public/snapshot/4.getItems%2C%20getDetail%20%EA%B2%B0%EA%B3%BC.PNG)
