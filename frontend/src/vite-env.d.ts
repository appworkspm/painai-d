/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_THEME_COLOR: string;
  readonly VITE_API_URL: string;
  readonly VITE_PORT: string;
  readonly VITE_PREVIEW_PORT: string;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
