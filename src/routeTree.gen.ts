/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const AlgorithmLazyImport = createFileRoute('/algorithm')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const AlgorithmLazyRoute = AlgorithmLazyImport.update({
  id: '/algorithm',
  path: '/algorithm',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/algorithm.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/algorithm': {
      id: '/algorithm'
      path: '/algorithm'
      fullPath: '/algorithm'
      preLoaderRoute: typeof AlgorithmLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/algorithm': typeof AlgorithmLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/algorithm': typeof AlgorithmLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/algorithm': typeof AlgorithmLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/algorithm'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/algorithm'
  id: '__root__' | '/' | '/algorithm'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  AlgorithmLazyRoute: typeof AlgorithmLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  AlgorithmLazyRoute: AlgorithmLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/algorithm"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/algorithm": {
      "filePath": "algorithm.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
