interface ImportMetaEnv {
  /** `on` serves the API from MSW in the browser and on the SSR server. */
  readonly VITE_API_MOCKS?: 'on' | 'off'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
