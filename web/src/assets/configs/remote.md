- hooks - 
- stage - этап, в который должно произойти продуктовое действие.
1. init - происходит сразу после добавления модуля ремоут приложения в роутинг хоста и перед бас ивентом "ADD_REMOTES_DONE".
---
мб это не нужно, потому что любой конфиг должен сразу же применяться.
---


что можно делать 
1. Добавить проверку в роут интерсептор, чтобы редиректить на продуктовую страницу по условию.
прим. если 403, редирект на /auth/login


---

interceptors - ссылка на шаред экшн.

экшены хранятся в формате:

export const AuthActionMap = new Map<string, any>([
  ['GO_TO_LOGIN', GoToLoginAction],
  ...
])

экшен должен возвращать промис или поток для встраивания в хост приложение.
