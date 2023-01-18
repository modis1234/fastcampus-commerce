## part5 ch03 07.회원 가입 구현

- Google OAuth 활용

## 실습

### 1. Google OAuth2.0 새 프로젝트 등록

- 개발자 인증하기 https://developers.google.com/identity/protocols/oauth2

1.  google oauth console 검색 https://console.cloud.google.com/apis/credentials
    ![](/public/snapshot/1.검색.PNG)
2.  새프로젝트 commerce1 생성  
    ![](/public/snapshot/2.새프로젝트commerce1.PNG)
3.  OAth2.0 클라이언트 ID 생성

    - 클라이언트 ID 설정  
      ![](/public/snapshot/3.Oauth2.0클라이언트ID생성.PNG)

    - 설정  
      ![](/public/snapshot/3-1클라이언트ID셋팅.PNG)

### 2. 발급 된 CLIENT_ID, SECRET 값 저장

    - constants/googleAuth.ts 파일 생성

```javascript
export const CLIENT_ID =
  '164054221351-o3n23732o6t9a4ieog9l9dcsfih58c6m.apps.googleusercontent.com'
export const SECRET = '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'
```

### 3. @react-oauth/google 라이브러리 설치 (https://github.com/MomenSherif/react-oauth#googlelogin)

`$ yarn add @react-oauth/google`

### 4. \_app.tsx 컴포넌트에 GoogleOAuthProvider 추가

**\_app.tsx**

```javascript
import { GoogleOAuthProvider } from '@react-oauth/google'
...
...
import { CLIENT_ID } from 'constants/googleAuth'

export default function App({ Component, pageProps }: AppProps) {
...
...
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

```

### 5. api 디렉토리에 auth/get-token.ts 생성

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwtDecode from 'jwt-decode'

const prisma = new PrismaClient()

async function getToken(credential: string) {
  const decoded = jwtDecode(credential)

  try {

    console.log(decoded)
    return decoded
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
  const { credential } = req.query

  try {
    const products = await getToken(String(credential))
    res.status(200).json({ items: products, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

### 6. pages 디렉토리에 auth/google.tsx 생성

```javascript
import { GoogleLogin } from '@react-oauth/google'
import React from 'react'

export default function Google() {
  return (
    <div style={{ display: 'flex' }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse)
          fetch(
            `/api/auth/get-token?credential=${credentialResponse.credential}`
          )
            .then((res) => res.json())
            .then((data) => console.log(data))
        }}
        onError={() => {
          console.log('Login Failed')
        }}
        useOneTap
      />
    </div>
  )
}
```

### 7. planetScale에 feature 브랜치 생성해 DB 연결

- **.env**에 새로 만든 브랜치의 접속 정보를 넣고

```javascript
// main 브랜치
//DATABASE_URL='mysql://hllp8hn2yf3lsr6vzehv:pscale_pw_cQiYaXEWgCvVdsNaPx3CSUHBvhVKjdQZsPNcbtobca4@ap-northeast.connect.psdb.cloud/commerce_database?sslaccept=strict'

// feature 브랜치
DATABASE_URL =
  'mysql://gce4dhcd3l52j6twc78f:pscale_pw_cmiHPUOzG8bu467tJxEeGxp0xHFt0y4JV2bmJw3cmxX@ap-northeast.connect.psdb.cloud/commerce_database?sslaccept=strict'
```

### 8.schema.prisma 파일에 user 모델 추가

- **schema.prisma**

```javascript
...
...
...

model user {
  id String @id @default(cuid())
  name String?
  email String? @unique
  image String?
}
```

### 9.`$ yarn prisma db push` 생행 후 get-token을 확장해서 user정보를 DB에 저장한다.

- **api/auth/sign-in.ts** 파일 생성

```javascript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwtDecode from 'jwt-decode'

const prisma = new PrismaClient()

async function signIn(credential: string) {
  const decoded: { name: string; email: string; picture: string } =
    jwtDecode(credential)

  try {
    const response = await prisma.user.upsert({  // upsert:: 있다면 업데이트, 없다면 생성
      where: {
        email: decoded.email,
      },
      update: {
        name: decoded.name,
        image: decoded.picture, // email이 있다면, update
      },
      create: {
        email: decoded.email,
        name: decoded.name,
        image: decoded.picture, // email이 없다면, insert
      },
    })

    console.log(decoded)
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
  const { credential } = req.query

  //   if (skip == null || take == null) {
  //     return res.status(400).json({ message: 'No skip or take' })
  //   }

  try {
    const products = await signIn(String(credential))
    res.status(200).json({ items: products, message: `Success` })
  } catch (error) {
    res.status(400).json({ message: `Failed` })
  }
}

```

### 10.google.tsx 컴포넌트에서 api 주소 변경 후 `$ yarn dev`로 실행

```javascript
import { GoogleLogin } from '@react-oauth/google'
import React from 'react'

export default function Google() {
  return (
    <div style={{ display: 'flex' }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse)
          fetch(`/api/auth/sign-in?credential=${credentialResponse.credential}`)
            .then((res) => res.json())
            .then((data) => console.log(data))
        }}
        onError={() => {
          console.log('Login Failed')
        }}
        useOneTap
      />
    </div>
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
