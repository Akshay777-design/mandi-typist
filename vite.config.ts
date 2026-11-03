import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const basePath = process.env.BASE_PATH || './';
  return {
    base: basePath,
    plugins: [
      {
        name: 'websocket-guard-plugin',
        transformIndexHtml: {
          order: 'pre',
          handler() {
            return [
              {
                tag: 'script',
                children: `
(function() {
  if (typeof window === 'undefined') return;
  var OrigWebSocket = window.WebSocket;
  if (!OrigWebSocket) return;
  window.WebSocket = function(url, protocols) {
    var isVite = (typeof protocols === 'string' && (protocols === 'vite-hmr' || protocols === 'vite-ping')) ||
                 (Array.isArray(protocols) && (protocols.indexOf('vite-hmr') !== -1 || protocols.indexOf('vite-ping') !== -1)) ||
                 (typeof url === 'string' && (url.indexOf('vite-hmr') !== -1 || url.indexOf('token=') !== -1));
    if (!isVite) {
      try { return new OrigWebSocket(url, protocols); } catch (e) {}
    }
    var listeners = {};
    var mockSocket = {
      readyState: 1,
      url: String(url),
      protocol: typeof protocols === 'string' ? protocols : 'vite-hmr',
      extensions: '',
      bufferedAmount: 0,
      binaryType: 'blob',
      addEventListener: function(type, listener) {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(listener);
        if (type === 'open') {
          setTimeout(function() {
            try { listener({ type: 'open', target: mockSocket }); } catch (_) {}
          }, 0);
        }
      },
      removeEventListener: function(type, listener) {
        if (!listeners[type]) return;
        listeners[type] = listeners[type].filter(function(l) { return l !== listener; });
      },
      dispatchEvent: function(event) {
        var list = listeners[event.type];
        if (list) {
          list.forEach(function(l) { try { l(event); } catch (_) {} });
        }
        return true;
      },
      send: function() {},
      close: function(code, reason) {
        mockSocket.readyState = 3;
        var list = listeners['close'];
        if (list) {
          list.forEach(function(l) {
            try { l({ type: 'close', code: code || 1000, reason: reason || '', target: mockSocket }); } catch (_) {}
          });
        }
      }
    };
    return mockSocket;
  };
  window.WebSocket.prototype = OrigWebSocket.prototype;
  window.WebSocket.CONNECTING = 0;
  window.WebSocket.OPEN = 1;
  window.WebSocket.CLOSING = 2;
  window.WebSocket.CLOSED = 3;
})();
                `,
                injectTo: 'head-prepend',
              },
            ];
          },
        },
        transform(code, id) {
          if (id.includes('client.mjs') || id.includes('@vite/client') || id.includes('bundledDevClient')) {
            return code.replace(/ws\.send\(JSON\.stringify\(data\)\)/g, 'if (ws) ws.send(JSON.stringify(data))');
          }
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        useCredentials: true,
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: 'mandi-typist',
          name: 'Mandi Typist — Billing Practice',
          short_name: 'MandiTypist',
          description: 'Vegetable billing and decimal quantity typing practice in Manglish & Malayalam.',
          theme_color: '#15803d',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: basePath,
          scope: basePath,
          icons: [
            {
              src: `${basePath}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${basePath}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${basePath}pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: `${basePath}icon.svg`,
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
