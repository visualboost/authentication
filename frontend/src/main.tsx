import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import AppRouterProvider from "./AppRouterProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppRouterProvider/>
    </StrictMode>,
)
