# husky란

git은 Hook이라는 기능을 가지고 있습니다. Git 에서 특정 이벤트(add, commit, push 등)를
실행할 때, 그 이벤트에 Hook을 설정하여 Hook에 설정된 스크립트를 실행할 수 있습니다.

    1. Git hook이란?

> Git 과 관련한 어떠한 이벤트가 발생하면 특정 스크립트를 실행할 수 있도록 하는 기능이다.
> 크게 클라이언트 훅과 서버 훅으로 구분된다.
> 클라이언트훅은 Commit, Merge가 발생하거나 push가 발생하기 전에 클라이언트에서 실행하는 훅이다.
> 서버 훅은 Git repository로 push 가 발생했을 때 서버에서 실행하는 훅이다.

    husky란 Git Hook을 간편하게 사용할 수 있도록 도와주는 툴이다.


    2. husky를 사용하는 이유
    개발자는 Git 같은 서비스를 이용해서 코드를 공유하는 경우가 많은데, 보통은 팀이나 프로젝트 협업 하는 분들은 ESLint와 Prettier로 팀내의 규칙을 정해서 코딩을 진행합니다. 하지만 가끔씩 ESLint와 Prettier가 확인하지 않은, 오류가 있거나 읽기 어려운 코드가 Git에 공유되는 경우가 종종 있습니다.
    그런경우를 사전에 방지하기위해 Husky를 이용하면, Git에 특정 이벤트(add, commit, push 등)이 일어나기 전 자동으로 ESLint와 Prettier가 작동하게 할 수 있다.

    3. lint-staged란
    - 내가 add한 파일들에 대해서 git 파일에 대해 lint와 우리가 설정해둔 명령어를 실행해주는 라이브러리다.(문법 오류나 스타일 오류를 분석하고 표시 및 수정해주는 도구이다.)

> husky만 사용하면 프로젝트의 모든 코드를 검사히기 때문에 비효율적이지만,
> lint-staged는 Git의 staged한 코드만 검사해서, 보다 효율적인 lint가 가능하다
