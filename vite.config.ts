// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// NOTE: We don't need the `vite-plugin-commonjs` import anymore.
// Vite has a built-in, configurable CommonJS plugin.

// Get port number from directory name as fallback
const dirName = __dirname.split(path.sep).pop() || '';
const portMatch = dirName.match(/server-(\d+)/);
const fallbackPort = portMatch ? parseInt(portMatch[1]) : 3001;

// https://vite.dev/config/
export default defineConfig(() => {
  // Get port from CLI args if provided
  const cliPort = process.env.PORT ? parseInt(process.env.PORT) : undefined;
  
  // Cache and output directory optimization (use environment variables if set)
  const cacheDir = process.env.VITE_POOF_CACHEDIR || path.resolve(__dirname, 'node_modules/.vite');
  const outDir = process.env.VITE_POOF_OUTDIR || path.resolve(__dirname, 'dist');

  return {
    cacheDir,
    // SOLUTION PART 1: Force Vite to pre-bundle the problematic dependencies
    optimizeDeps: {
      include: [
        // The main library that uses `require`
        '@tarobase/js-sdk',
        // Its internal dependencies that it tries to `require`
        '@privy-io/react-auth',
        '@privy-io/react-auth/solana',
      ],
    },
    build: {
      outDir,
      minify: process.env.BUILD_PROFILE === 'production',
      // Disable sourcemaps for production builds to optimize bundle size
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        treeshake: process.env.BUILD_PROFILE === 'production',
        onwarn(warning: any, warn: any) {
          if (warning.code === 'EVAL' && warning.loc?.file?.includes('vm-browserify')) {
            return;
          }
          if (warning.message.includes('annotation that Rollup cannot interpret')) {
            return;
          }
          warn(warning);
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            tarobase: ['@tarobase/js-sdk'],
          }
        }
      },
    },
    plugins: [
      react(),
      nodePolyfills(),
      // We removed the separate commonjs() plugin call. We use the built-in `build.commonjsOptions` instead.
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        'perf_hooks': false,
        'v8': false
      },
    },
    define: {
      global: 'globalThis',
    },
    server: {
      port: cliPort || fallbackPort,
      allowedHosts: true,
      historyApiFallback: true,
    },
  };
});