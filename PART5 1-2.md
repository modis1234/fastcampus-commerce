## Part5 1-2 프로트젝트 생성 및 환경 설정

- 프로젝트 생성
  - Next.js / Typsescript
  - `$yarn create next-app commerce --typescript`
- 기존에 jsconfig.json => tsconfig.json 에 적용 - 생성된 tsconfig.json에 다음 코드 추가

  ```javascript

  "compilerOptions": {
  "baseUrl": ".",
  "paths": {
    "@components/_": ["components/_"]
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
- github repository 추가 및 연동
  - 개인 github에 repository 생성
  - https://github.com/modis1234/fastcampus-commerce.git 로 add remote
- 깃 커밋하긴전에 eslint와 prettier를 돌리도록 한다.

  - 협업 중 각각 개인의 개발 환경에는 각각 다른 eslint / prettier가 셋팅되어져 있을것이다.
  - 공통에 formmating을 유지할 수 있는 방법이 필요하다.
  - 깃 커밋하긴전에 esling와 prettier를 돌려 공통 된 formmatting을 적용한다.
  - lint-staged & husky <br/>
    (https://github.com/okonet/lint-staged)<br/>
    (https://github.com/typicode/husky)
  - lint-stated: git 상태의 파일들만 타겟으로 뭔가 할 수 있게 해줌
  - husky: git hook 동작에 대한 정의를 .git파일이 아닌 .husky에서 관리하여 repository에서 공유가 가능하도록 함<br/>

    ## lint-staged / husky 적용하기

    1. 설치하기

       `#yarn add -D lint-staged husky`

    2. lint-stated 셋팅하기

    - package.json에 lint-staged 코드 추가

      ```javascript
      ** pakage.json
      "lint-staged": {
          "*.{js,jsx,ts,tsx}": [ //js, jsx,ts,tsx 확장자 파일들만 대상으로 지정
          "eslint –fix", // eslint에 fix 하고 싶다.
          "prettier –write", // prettier write 하고싶다??
          "git add" // git add 하고 싶다??
          ]
      }
      ```

      3. husky 셋팅하기

         - `$yarn husky install`

         - `$yarn husky add .husky/pre-commit "yarn lint-staged --no-stash"`

           ->.husky 폴더가 추가 되고 pre-commit 설정이 추가 됨

         - 커밋을 하면
