/// <reference types="vite/client" />

declare module '@progalaxyelabs/htms-cli/vite' {
    import { Plugin } from 'vite';

    interface HtmsPluginOptions {
        include?: RegExp;
        outputDir?: string;
        watch?: boolean;
    }

    export function htmsPlugin(options?: HtmsPluginOptions): Plugin;
    export default htmsPlugin;
}

interface ImportMetaEnv {
    // API Configuration
    readonly VITE_API_URL: string;
    readonly VITE_API_TIMEOUT: string;

    // Feature Flags
    readonly VITE_ENABLE_DEBUG: string;
    readonly VITE_ENABLE_ANALYTICS: string;

    // App Configuration
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;

    // External Services
    readonly VITE_GOOGLE_ANALYTICS_ID?: string;
    readonly VITE_SENTRY_DSN?: string;

    // Built-in Vite variables
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly SSR: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
