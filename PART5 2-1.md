## part5 ch02-1 Notion Public API 활용(1)

- Notion API 활용해 데이터 CRUD 적용하기
- Notion Developers
  (https://developers.notion.com/)
  - 워크스페이스에 CRUD가 가능
  - Commerce 서비스에서 사용해보기

## 실습

- 개인 Notion 계정 생성
- Commerce DB Page 추가
- product DB 추가

1. integration 생성

   - 내 계정의 로그인 후 https://www.notion.com/my-integrations 접속
   - \+ New Integration 버튼 클릭해 commerce-api 이름으로 My integrations 추가
   - Secrets Show 클릭해 SECRET KEY 복사
   - 통합에 포함할 기능을 선택하십시오.
   - 제출을 클릭하여 통합을 생성합니다.
     ![integration 생성](./public/snapshot/1.%EA%B3%84%EC%A0%95%20%EC%83%9D%EC%84%B1.PNG)
     ![데이터베이스 생성](./public/snapshot/2.product%20DB%20%EC%83%88%EC%84%B1.PNG)

1. 생성한 Commerce-api Intaegration을 commerce DB/product DB에 공유
   - 작업 공간의 데이터베이스 페이지로 이동.
   - 페이지 오른쪽 상단 모서리에 있는 •••를 클릭합니다..
   - 팝업 하단에서 연결 추가를 클릭합니다.
   - 연결 검색... 메뉴에서 통합을 검색하고 선택합니다..
     ![integration/datebase 공유 셋팅](./public/snapshot/3.commerce-api%20integration%20%EA%B3%B5%EC%9C%A0.PNG)
1. 등록 기능 구현하기
   **pages/api/add-items.ts** 생성

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: 'secret_sAGrnZTLFAw5sWiypL27duFpW35z1ZlhCwVmP9rt6tr',
})

const databaseId = 'e11f0b7f5ac54ee698eeb27ec6661410'

async function addItem(name: string) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: [
          {
            text: {
              content: name,
            },
          },
        ],
      },
    })
    console.log(response)
    console.log('Success! Entry added.')
  } catch (error) {
    console.error(JSON.stringify(error))
  }
}

type Data = {
  message: string,
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
    await addItem(String(name))
    res.status(200).json({ message: `Success ${name} added` })
  } catch (error) {
    res.status(400).json({ message: `Failed ${name} added` })
  }
}
```

4. intex.tsx에 button 추가 및 input 태그 추가
   **index.tsx**

```javascript
export default function Home() {
    ...
     const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (inputRef.current === null || inputRef.current.value === '') {
      alert('name을 넣어주세요')
      return
    }
    fetch(`/api/add-item?name=${inputRef.current.value}`)
      .then((res) => res.json())
      .then((data) => alert(data.message))
  }
    ...
    ...
    return(
        ...
        ...
        <input ref={inputRef} type="text" placeholder="name" />

        <button onClick={handleClick}>Add Jacket</button>
        ...
        ...
    )

}
```

5. yarn dev 로 실행하기
   !(./public/snapshot/2022-12-19%2013%3B40%3B48.avi)
