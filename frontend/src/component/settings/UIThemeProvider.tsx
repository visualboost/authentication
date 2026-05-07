import { createContext, useContext, useEffect, useState } from "react";
import {UITheme} from "../../models/settings/UITheme.ts";
import {SystemStateService} from "../../api/SystemStateService.tsx";

interface UIThemeProviderProps {
    children: React.ReactNode;
}

interface UIThemeContextValue {
    uiTheme: UITheme | null;
    setUITheme: (theme: UITheme | null) => void;
}

const UIThemeContext = createContext<UIThemeContextValue>({
    uiTheme: null,
    setUITheme: () => {}
});

export const useUITheme = () => {
    const ctx = useContext(UIThemeContext);
    return ctx;
};

export const UIThemeProvider = ({ children }: UIThemeProviderProps) => {
    const [uiTheme, setUITheme] = useState<UITheme | null>(null);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const theme = await SystemStateService.getUITheme();
            setUITheme(theme);
        } catch (err: unknown) {
            console.error(err);
        }
    };


    return (
        <UIThemeContext.Provider value={{ uiTheme, setUITheme }}>
            {children}
        </UIThemeContext.Provider>
    );
};
