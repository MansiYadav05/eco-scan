/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
