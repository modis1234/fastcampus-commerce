## part5 ch03 09.찜하기 구현

-

## 실습

### 1. Session 쿠키 유기 기한 설정

- 1일 기한 설정
- default는 30일
- api/[...nextauth].ts 파일 수정

```javascript
 ...
 ...

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'database',
    // maxAge: 30 * 24 * 60 * 60, //Default [[30*24*60*60 //30일 기한 설정]]
    maxAge: 1 * 24 * 60 * 60, // 쿠키세션 1일 기한 설정
  },
}

export default NextAuth(authOptions)
```

- [!결과]()

### 2. Wishlist Model 생성

**prisma/shcema.prisma**

```javascript
...
...
...

model Wishlist {
  id Int @id @default(autoincrement())
  userId String @unique
  productsId String
}
```

- `$ yarn prisma db push`
- `$ yran prisma generate`

## 결과

- 접속 주소: http://localhost:3000/auth/google
  ![](public\snapshot\4.결과.PNG)

## 이슈 및 에러 경험

## 참고

[참고]

<!-- ![참고](./public/snapshot/5-3-3.%EC%B0%B8%EA%B3%A0.PNG) -->
