import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        // 🔑 SOLUCIÓN: Añadir la propiedad 'base' con la ruta de la raíz.
        // Esto corrige cómo React/Vite busca los archivos JS/CSS compilados.
        base: '/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                // Esto está bien para el desarrollo, pero asegúrate de que
                // las rutas absolutas dentro del código React son correctas.
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
