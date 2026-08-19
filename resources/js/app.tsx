import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Git Deployment Synchronizer';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Page component ./Pages/${name}.tsx not found`);
        }
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#38bdf8',
        showSpinner: true,
    },
});
