import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import AppRouterProvider from "./AppRouterProvider.tsx";
import '../src/i18n/i18n.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppRouterProvider/>
    </StrictMode>,
)
