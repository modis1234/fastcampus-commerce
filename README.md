## Part5 1-2 프로트젝트 생성 및 환경 설정

- 프로젝트 생성
  - Next.js / Typsescript
  - `$yarn create next-app commerce --typescript`
- 기존에 jsconfig.json => tsconfig.json 에 적용 - 생성된 tsconfig.json에 다음 코드 추가

  ```javascript

  “compilerOptions”: {
  “baseUrl”: “.”,
  “paths”: {
    “@components/_”: [“components/_”]
  }
  }
  ```

- formattting 관련 설정
  - eslint / prettier 추가
  - .prettierrc 파일 생성
  ```javascript
  {
    "semi": false,
    "singleQuote": true,
    "tabWidth": 2,
    "useTabs": false
  }
  ```
  - .prettierignore 파일 생성
    ```javascript
    node_modules.next
    public
    ```
