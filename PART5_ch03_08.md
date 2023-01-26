## part5 ch03 08.로그인 구현

-

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

4.  planteScale 스키마 가져오기
    - schema.prisma 파일 복사 후 test.prisma 생성

```javascript
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["referentialIntegrity"]
}

datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}
```

- `$ yarn prisma db pull --schema=./prisma/test.prisma`

## 결과

- 접속 주소: http://localhost:3000/auth/google
  ![](public\snapshot\4.결과.PNG)

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
