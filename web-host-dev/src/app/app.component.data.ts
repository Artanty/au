// дублирование ([key] = remoteName) для возможного разруливания конфликта имен 
// или возможности загрузки нескольких инстансов - todo пробовать.
// exposedModule не вынесено за скобки для возможности загружать компонент, а не модуль.

import { Remotes } from "./app.component.types";

//[key] всегда равняется роуту.
export const remotes: Remotes = {
  au: {
    isEagerLoading: true,
    url: `${process.env["AU_WEB_URL"]}`,
    buttonName: 'AU',
    buttonTitle: 'Аутентификация',
    remoteModuleScript: {
      remoteName: "au",
      remoteEntry: `${process.env["AU_WEB_URL"]}/remoteEntry.js`,
      exposedModule: "./Module",
    },
    routerPath: "au",
    moduleName: "AuthModule",

  },
  // faq: {
  //   url: `${process.env["FAQ_WEB_URL"]}`,
  //   buttonName: 'テスト',
  //   buttonTitle: 'Экзамен',
  //   remoteModuleScript: {
  //     remoteName: "faq",
  //     remoteEntry: `${process.env["FAQ_WEB_URL"]}/remoteEntry.js`,
  //     exposedModule: "./Module",
  //   },
  //   routerPath: "faq",
  //   moduleName: "FaqModule"
  // },
  // test: {
  //   isEagerLoading: false,
  //   url: `${process.env["FAQ_WEB_URL"]}`,
  //   buttonName: 'test',
  //   buttonTitle: 'test',
  //   remoteModuleScript: {
  //     remoteName: "faq",
  //     remoteEntry: `${process.env["FAQ_WEB_URL"]}/remoteEntry.js`,
  //     exposedModule: "./Module",
  //   },
  //   routerPath: "test",
  //   moduleName: "FaqModule"
  // }
}