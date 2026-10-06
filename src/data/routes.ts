import { Route } from "lib/types"

export const routes: Record<string, Route> = {
  'page-one': {
    content: 'page-1',
    title: "Page 1",
    description: "This is page one!",
    pathType: "WebPage",
    navData: {
      test: "this is some test nav data!"
    }
  },
  'page-two': {
    content: "page-2",
    title: "Page 2",
    description: "This is page two!",
    pathType: "WebPage",
    navData: {
      test: "this is some test nav data!"
    }
  },
  'tab-one': {
    content: "tab-one",
    title: "Tab 1",
    description: "This is tab one!",
    pathType: "WebPage"
  },
  'tab-two': {
    content: "tab-two",
    title: "Tab 2",
    description: "This is tab two!",
    pathType: "WebPage"
  },
  '404': {
    content: "page-404",
    title: "404 - Page not found",
    description: "The page you request was not found!",
    pathType: "WebPage"
  }
}

export const aliases: Record<string, string> = {
  '/': '/page-one'
}
