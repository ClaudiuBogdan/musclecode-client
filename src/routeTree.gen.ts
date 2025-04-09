/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as SettingsProfileImport } from './routes/settings/profile'

// Create Virtual Routes

const UnauthorizedLazyImport = createFileRoute('/unauthorized')()
const IndexLazyImport = createFileRoute('/')()
const SettingsIndexLazyImport = createFileRoute('/settings/')()
const OnboardingIndexLazyImport = createFileRoute('/onboarding/')()
const LearningIndexLazyImport = createFileRoute('/learning/')()
const CollectionsIndexLazyImport = createFileRoute('/collections/')()
const AlgorithmsIndexLazyImport = createFileRoute('/algorithms/')()
const SettingsSecurityLazyImport = createFileRoute('/settings/security')()
const SettingsPreferencesLazyImport = createFileRoute('/settings/preferences')()
const SettingsNotificationsLazyImport = createFileRoute(
  '/settings/notifications',
)()
const SettingsBillingLazyImport = createFileRoute('/settings/billing')()
const LearningCreateLazyImport = createFileRoute('/learning/create')()
const CollectionsNewLazyImport = createFileRoute('/collections/new')()
const AlgorithmsNewLazyImport = createFileRoute('/algorithms/new')()
const CollectionsCollectionIdIndexLazyImport = createFileRoute(
  '/collections/$collectionId/',
)()
const AlgorithmsAlgorithmIdIndexLazyImport = createFileRoute(
  '/algorithms/$algorithmId/',
)()
const CollectionsCollectionIdEditLazyImport = createFileRoute(
  '/collections/$collectionId/edit',
)()
const AlgorithmsAlgorithmIdViewLazyImport = createFileRoute(
  '/algorithms/$algorithmId/view',
)()
const AlgorithmsAlgorithmIdEditLazyImport = createFileRoute(
  '/algorithms/$algorithmId/edit',
)()

// Create/Update Routes

const UnauthorizedLazyRoute = UnauthorizedLazyImport.update({
  id: '/unauthorized',
  path: '/unauthorized',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/unauthorized.lazy').then((d) => d.Route))

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const SettingsIndexLazyRoute = SettingsIndexLazyImport.update({
  id: '/settings/',
  path: '/settings/',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/settings/index.lazy').then((d) => d.Route),
)

const OnboardingIndexLazyRoute = OnboardingIndexLazyImport.update({
  id: '/onboarding/',
  path: '/onboarding/',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/onboarding/index.lazy').then((d) => d.Route),
)

const LearningIndexLazyRoute = LearningIndexLazyImport.update({
  id: '/learning/',
  path: '/learning/',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/learning/index.lazy').then((d) => d.Route),
)

const CollectionsIndexLazyRoute = CollectionsIndexLazyImport.update({
  id: '/collections/',
  path: '/collections/',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/collections/index.lazy').then((d) => d.Route),
)

const AlgorithmsIndexLazyRoute = AlgorithmsIndexLazyImport.update({
  id: '/algorithms/',
  path: '/algorithms/',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/algorithms/index.lazy').then((d) => d.Route),
)

const SettingsSecurityLazyRoute = SettingsSecurityLazyImport.update({
  id: '/settings/security',
  path: '/settings/security',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/settings/security.lazy').then((d) => d.Route),
)

const SettingsPreferencesLazyRoute = SettingsPreferencesLazyImport.update({
  id: '/settings/preferences',
  path: '/settings/preferences',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/settings/preferences.lazy').then((d) => d.Route),
)

const SettingsNotificationsLazyRoute = SettingsNotificationsLazyImport.update({
  id: '/settings/notifications',
  path: '/settings/notifications',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/settings/notifications.lazy').then((d) => d.Route),
)

const SettingsBillingLazyRoute = SettingsBillingLazyImport.update({
  id: '/settings/billing',
  path: '/settings/billing',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/settings/billing.lazy').then((d) => d.Route),
)

const LearningCreateLazyRoute = LearningCreateLazyImport.update({
  id: '/learning/create',
  path: '/learning/create',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/learning/create.lazy').then((d) => d.Route),
)

const CollectionsNewLazyRoute = CollectionsNewLazyImport.update({
  id: '/collections/new',
  path: '/collections/new',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/collections/new.lazy').then((d) => d.Route),
)

const AlgorithmsNewLazyRoute = AlgorithmsNewLazyImport.update({
  id: '/algorithms/new',
  path: '/algorithms/new',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/algorithms/new.lazy').then((d) => d.Route),
)

const SettingsProfileRoute = SettingsProfileImport.update({
  id: '/settings/profile',
  path: '/settings/profile',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/settings/profile.lazy').then((d) => d.Route),
)

const CollectionsCollectionIdIndexLazyRoute =
  CollectionsCollectionIdIndexLazyImport.update({
    id: '/collections/$collectionId/',
    path: '/collections/$collectionId/',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/collections/$collectionId/index.lazy').then(
      (d) => d.Route,
    ),
  )

const AlgorithmsAlgorithmIdIndexLazyRoute =
  AlgorithmsAlgorithmIdIndexLazyImport.update({
    id: '/algorithms/$algorithmId/',
    path: '/algorithms/$algorithmId/',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/algorithms/$algorithmId/index.lazy').then((d) => d.Route),
  )

const CollectionsCollectionIdEditLazyRoute =
  CollectionsCollectionIdEditLazyImport.update({
    id: '/collections/$collectionId/edit',
    path: '/collections/$collectionId/edit',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/collections/$collectionId/edit.lazy').then((d) => d.Route),
  )

const AlgorithmsAlgorithmIdViewLazyRoute =
  AlgorithmsAlgorithmIdViewLazyImport.update({
    id: '/algorithms/$algorithmId/view',
    path: '/algorithms/$algorithmId/view',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/algorithms/$algorithmId/view.lazy').then((d) => d.Route),
  )

const AlgorithmsAlgorithmIdEditLazyRoute =
  AlgorithmsAlgorithmIdEditLazyImport.update({
    id: '/algorithms/$algorithmId/edit',
    path: '/algorithms/$algorithmId/edit',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/algorithms/$algorithmId/edit.lazy').then((d) => d.Route),
  )

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
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/unauthorized': {
      id: '/unauthorized'
      path: '/unauthorized'
      fullPath: '/unauthorized'
      preLoaderRoute: typeof UnauthorizedLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings/profile': {
      id: '/settings/profile'
      path: '/settings/profile'
      fullPath: '/settings/profile'
      preLoaderRoute: typeof SettingsProfileImport
      parentRoute: typeof rootRoute
    }
    '/algorithms/new': {
      id: '/algorithms/new'
      path: '/algorithms/new'
      fullPath: '/algorithms/new'
      preLoaderRoute: typeof AlgorithmsNewLazyImport
      parentRoute: typeof rootRoute
    }
    '/collections/new': {
      id: '/collections/new'
      path: '/collections/new'
      fullPath: '/collections/new'
      preLoaderRoute: typeof CollectionsNewLazyImport
      parentRoute: typeof rootRoute
    }
    '/learning/create': {
      id: '/learning/create'
      path: '/learning/create'
      fullPath: '/learning/create'
      preLoaderRoute: typeof LearningCreateLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings/billing': {
      id: '/settings/billing'
      path: '/settings/billing'
      fullPath: '/settings/billing'
      preLoaderRoute: typeof SettingsBillingLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings/notifications': {
      id: '/settings/notifications'
      path: '/settings/notifications'
      fullPath: '/settings/notifications'
      preLoaderRoute: typeof SettingsNotificationsLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings/preferences': {
      id: '/settings/preferences'
      path: '/settings/preferences'
      fullPath: '/settings/preferences'
      preLoaderRoute: typeof SettingsPreferencesLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings/security': {
      id: '/settings/security'
      path: '/settings/security'
      fullPath: '/settings/security'
      preLoaderRoute: typeof SettingsSecurityLazyImport
      parentRoute: typeof rootRoute
    }
    '/algorithms/': {
      id: '/algorithms/'
      path: '/algorithms'
      fullPath: '/algorithms'
      preLoaderRoute: typeof AlgorithmsIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/collections/': {
      id: '/collections/'
      path: '/collections'
      fullPath: '/collections'
      preLoaderRoute: typeof CollectionsIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/learning/': {
      id: '/learning/'
      path: '/learning'
      fullPath: '/learning'
      preLoaderRoute: typeof LearningIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/onboarding/': {
      id: '/onboarding/'
      path: '/onboarding'
      fullPath: '/onboarding'
      preLoaderRoute: typeof OnboardingIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings/': {
      id: '/settings/'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof SettingsIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/algorithms/$algorithmId/edit': {
      id: '/algorithms/$algorithmId/edit'
      path: '/algorithms/$algorithmId/edit'
      fullPath: '/algorithms/$algorithmId/edit'
      preLoaderRoute: typeof AlgorithmsAlgorithmIdEditLazyImport
      parentRoute: typeof rootRoute
    }
    '/algorithms/$algorithmId/view': {
      id: '/algorithms/$algorithmId/view'
      path: '/algorithms/$algorithmId/view'
      fullPath: '/algorithms/$algorithmId/view'
      preLoaderRoute: typeof AlgorithmsAlgorithmIdViewLazyImport
      parentRoute: typeof rootRoute
    }
    '/collections/$collectionId/edit': {
      id: '/collections/$collectionId/edit'
      path: '/collections/$collectionId/edit'
      fullPath: '/collections/$collectionId/edit'
      preLoaderRoute: typeof CollectionsCollectionIdEditLazyImport
      parentRoute: typeof rootRoute
    }
    '/algorithms/$algorithmId/': {
      id: '/algorithms/$algorithmId/'
      path: '/algorithms/$algorithmId'
      fullPath: '/algorithms/$algorithmId'
      preLoaderRoute: typeof AlgorithmsAlgorithmIdIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/collections/$collectionId/': {
      id: '/collections/$collectionId/'
      path: '/collections/$collectionId'
      fullPath: '/collections/$collectionId'
      preLoaderRoute: typeof CollectionsCollectionIdIndexLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/login': typeof LoginRoute
  '/unauthorized': typeof UnauthorizedLazyRoute
  '/settings/profile': typeof SettingsProfileRoute
  '/algorithms/new': typeof AlgorithmsNewLazyRoute
  '/collections/new': typeof CollectionsNewLazyRoute
  '/learning/create': typeof LearningCreateLazyRoute
  '/settings/billing': typeof SettingsBillingLazyRoute
  '/settings/notifications': typeof SettingsNotificationsLazyRoute
  '/settings/preferences': typeof SettingsPreferencesLazyRoute
  '/settings/security': typeof SettingsSecurityLazyRoute
  '/algorithms': typeof AlgorithmsIndexLazyRoute
  '/collections': typeof CollectionsIndexLazyRoute
  '/learning': typeof LearningIndexLazyRoute
  '/onboarding': typeof OnboardingIndexLazyRoute
  '/settings': typeof SettingsIndexLazyRoute
  '/algorithms/$algorithmId/edit': typeof AlgorithmsAlgorithmIdEditLazyRoute
  '/algorithms/$algorithmId/view': typeof AlgorithmsAlgorithmIdViewLazyRoute
  '/collections/$collectionId/edit': typeof CollectionsCollectionIdEditLazyRoute
  '/algorithms/$algorithmId': typeof AlgorithmsAlgorithmIdIndexLazyRoute
  '/collections/$collectionId': typeof CollectionsCollectionIdIndexLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/login': typeof LoginRoute
  '/unauthorized': typeof UnauthorizedLazyRoute
  '/settings/profile': typeof SettingsProfileRoute
  '/algorithms/new': typeof AlgorithmsNewLazyRoute
  '/collections/new': typeof CollectionsNewLazyRoute
  '/learning/create': typeof LearningCreateLazyRoute
  '/settings/billing': typeof SettingsBillingLazyRoute
  '/settings/notifications': typeof SettingsNotificationsLazyRoute
  '/settings/preferences': typeof SettingsPreferencesLazyRoute
  '/settings/security': typeof SettingsSecurityLazyRoute
  '/algorithms': typeof AlgorithmsIndexLazyRoute
  '/collections': typeof CollectionsIndexLazyRoute
  '/learning': typeof LearningIndexLazyRoute
  '/onboarding': typeof OnboardingIndexLazyRoute
  '/settings': typeof SettingsIndexLazyRoute
  '/algorithms/$algorithmId/edit': typeof AlgorithmsAlgorithmIdEditLazyRoute
  '/algorithms/$algorithmId/view': typeof AlgorithmsAlgorithmIdViewLazyRoute
  '/collections/$collectionId/edit': typeof CollectionsCollectionIdEditLazyRoute
  '/algorithms/$algorithmId': typeof AlgorithmsAlgorithmIdIndexLazyRoute
  '/collections/$collectionId': typeof CollectionsCollectionIdIndexLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/login': typeof LoginRoute
  '/unauthorized': typeof UnauthorizedLazyRoute
  '/settings/profile': typeof SettingsProfileRoute
  '/algorithms/new': typeof AlgorithmsNewLazyRoute
  '/collections/new': typeof CollectionsNewLazyRoute
  '/learning/create': typeof LearningCreateLazyRoute
  '/settings/billing': typeof SettingsBillingLazyRoute
  '/settings/notifications': typeof SettingsNotificationsLazyRoute
  '/settings/preferences': typeof SettingsPreferencesLazyRoute
  '/settings/security': typeof SettingsSecurityLazyRoute
  '/algorithms/': typeof AlgorithmsIndexLazyRoute
  '/collections/': typeof CollectionsIndexLazyRoute
  '/learning/': typeof LearningIndexLazyRoute
  '/onboarding/': typeof OnboardingIndexLazyRoute
  '/settings/': typeof SettingsIndexLazyRoute
  '/algorithms/$algorithmId/edit': typeof AlgorithmsAlgorithmIdEditLazyRoute
  '/algorithms/$algorithmId/view': typeof AlgorithmsAlgorithmIdViewLazyRoute
  '/collections/$collectionId/edit': typeof CollectionsCollectionIdEditLazyRoute
  '/algorithms/$algorithmId/': typeof AlgorithmsAlgorithmIdIndexLazyRoute
  '/collections/$collectionId/': typeof CollectionsCollectionIdIndexLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/login'
    | '/unauthorized'
    | '/settings/profile'
    | '/algorithms/new'
    | '/collections/new'
    | '/learning/create'
    | '/settings/billing'
    | '/settings/notifications'
    | '/settings/preferences'
    | '/settings/security'
    | '/algorithms'
    | '/collections'
    | '/learning'
    | '/onboarding'
    | '/settings'
    | '/algorithms/$algorithmId/edit'
    | '/algorithms/$algorithmId/view'
    | '/collections/$collectionId/edit'
    | '/algorithms/$algorithmId'
    | '/collections/$collectionId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/login'
    | '/unauthorized'
    | '/settings/profile'
    | '/algorithms/new'
    | '/collections/new'
    | '/learning/create'
    | '/settings/billing'
    | '/settings/notifications'
    | '/settings/preferences'
    | '/settings/security'
    | '/algorithms'
    | '/collections'
    | '/learning'
    | '/onboarding'
    | '/settings'
    | '/algorithms/$algorithmId/edit'
    | '/algorithms/$algorithmId/view'
    | '/collections/$collectionId/edit'
    | '/algorithms/$algorithmId'
    | '/collections/$collectionId'
  id:
    | '__root__'
    | '/'
    | '/login'
    | '/unauthorized'
    | '/settings/profile'
    | '/algorithms/new'
    | '/collections/new'
    | '/learning/create'
    | '/settings/billing'
    | '/settings/notifications'
    | '/settings/preferences'
    | '/settings/security'
    | '/algorithms/'
    | '/collections/'
    | '/learning/'
    | '/onboarding/'
    | '/settings/'
    | '/algorithms/$algorithmId/edit'
    | '/algorithms/$algorithmId/view'
    | '/collections/$collectionId/edit'
    | '/algorithms/$algorithmId/'
    | '/collections/$collectionId/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  LoginRoute: typeof LoginRoute
  UnauthorizedLazyRoute: typeof UnauthorizedLazyRoute
  SettingsProfileRoute: typeof SettingsProfileRoute
  AlgorithmsNewLazyRoute: typeof AlgorithmsNewLazyRoute
  CollectionsNewLazyRoute: typeof CollectionsNewLazyRoute
  LearningCreateLazyRoute: typeof LearningCreateLazyRoute
  SettingsBillingLazyRoute: typeof SettingsBillingLazyRoute
  SettingsNotificationsLazyRoute: typeof SettingsNotificationsLazyRoute
  SettingsPreferencesLazyRoute: typeof SettingsPreferencesLazyRoute
  SettingsSecurityLazyRoute: typeof SettingsSecurityLazyRoute
  AlgorithmsIndexLazyRoute: typeof AlgorithmsIndexLazyRoute
  CollectionsIndexLazyRoute: typeof CollectionsIndexLazyRoute
  LearningIndexLazyRoute: typeof LearningIndexLazyRoute
  OnboardingIndexLazyRoute: typeof OnboardingIndexLazyRoute
  SettingsIndexLazyRoute: typeof SettingsIndexLazyRoute
  AlgorithmsAlgorithmIdEditLazyRoute: typeof AlgorithmsAlgorithmIdEditLazyRoute
  AlgorithmsAlgorithmIdViewLazyRoute: typeof AlgorithmsAlgorithmIdViewLazyRoute
  CollectionsCollectionIdEditLazyRoute: typeof CollectionsCollectionIdEditLazyRoute
  AlgorithmsAlgorithmIdIndexLazyRoute: typeof AlgorithmsAlgorithmIdIndexLazyRoute
  CollectionsCollectionIdIndexLazyRoute: typeof CollectionsCollectionIdIndexLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  LoginRoute: LoginRoute,
  UnauthorizedLazyRoute: UnauthorizedLazyRoute,
  SettingsProfileRoute: SettingsProfileRoute,
  AlgorithmsNewLazyRoute: AlgorithmsNewLazyRoute,
  CollectionsNewLazyRoute: CollectionsNewLazyRoute,
  LearningCreateLazyRoute: LearningCreateLazyRoute,
  SettingsBillingLazyRoute: SettingsBillingLazyRoute,
  SettingsNotificationsLazyRoute: SettingsNotificationsLazyRoute,
  SettingsPreferencesLazyRoute: SettingsPreferencesLazyRoute,
  SettingsSecurityLazyRoute: SettingsSecurityLazyRoute,
  AlgorithmsIndexLazyRoute: AlgorithmsIndexLazyRoute,
  CollectionsIndexLazyRoute: CollectionsIndexLazyRoute,
  LearningIndexLazyRoute: LearningIndexLazyRoute,
  OnboardingIndexLazyRoute: OnboardingIndexLazyRoute,
  SettingsIndexLazyRoute: SettingsIndexLazyRoute,
  AlgorithmsAlgorithmIdEditLazyRoute: AlgorithmsAlgorithmIdEditLazyRoute,
  AlgorithmsAlgorithmIdViewLazyRoute: AlgorithmsAlgorithmIdViewLazyRoute,
  CollectionsCollectionIdEditLazyRoute: CollectionsCollectionIdEditLazyRoute,
  AlgorithmsAlgorithmIdIndexLazyRoute: AlgorithmsAlgorithmIdIndexLazyRoute,
  CollectionsCollectionIdIndexLazyRoute: CollectionsCollectionIdIndexLazyRoute,
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
        "/login",
        "/unauthorized",
        "/settings/profile",
        "/algorithms/new",
        "/collections/new",
        "/learning/create",
        "/settings/billing",
        "/settings/notifications",
        "/settings/preferences",
        "/settings/security",
        "/algorithms/",
        "/collections/",
        "/learning/",
        "/onboarding/",
        "/settings/",
        "/algorithms/$algorithmId/edit",
        "/algorithms/$algorithmId/view",
        "/collections/$collectionId/edit",
        "/algorithms/$algorithmId/",
        "/collections/$collectionId/"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/unauthorized": {
      "filePath": "unauthorized.lazy.tsx"
    },
    "/settings/profile": {
      "filePath": "settings/profile.tsx"
    },
    "/algorithms/new": {
      "filePath": "algorithms/new.lazy.tsx"
    },
    "/collections/new": {
      "filePath": "collections/new.lazy.tsx"
    },
    "/learning/create": {
      "filePath": "learning/create.lazy.tsx"
    },
    "/settings/billing": {
      "filePath": "settings/billing.lazy.tsx"
    },
    "/settings/notifications": {
      "filePath": "settings/notifications.lazy.tsx"
    },
    "/settings/preferences": {
      "filePath": "settings/preferences.lazy.tsx"
    },
    "/settings/security": {
      "filePath": "settings/security.lazy.tsx"
    },
    "/algorithms/": {
      "filePath": "algorithms/index.lazy.tsx"
    },
    "/collections/": {
      "filePath": "collections/index.lazy.tsx"
    },
    "/learning/": {
      "filePath": "learning/index.lazy.tsx"
    },
    "/onboarding/": {
      "filePath": "onboarding/index.lazy.tsx"
    },
    "/settings/": {
      "filePath": "settings/index.lazy.tsx"
    },
    "/algorithms/$algorithmId/edit": {
      "filePath": "algorithms/$algorithmId/edit.lazy.tsx"
    },
    "/algorithms/$algorithmId/view": {
      "filePath": "algorithms/$algorithmId/view.lazy.tsx"
    },
    "/collections/$collectionId/edit": {
      "filePath": "collections/$collectionId/edit.lazy.tsx"
    },
    "/algorithms/$algorithmId/": {
      "filePath": "algorithms/$algorithmId/index.lazy.tsx"
    },
    "/collections/$collectionId/": {
      "filePath": "collections/$collectionId/index.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
