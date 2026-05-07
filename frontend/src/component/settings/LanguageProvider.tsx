import {useEffect} from "react";
import {SystemStateService} from "../../api/SystemStateService.tsx";
import {useTranslation} from "react-i18next";

interface LanguageProviderProps {
    children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const { i18n } = useTranslation();

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const response = await SystemStateService.getLanguage();
            console.log(response);
            await i18n.changeLanguage(response.language)
        } catch (err: unknown) {
            console.error(err);
        }
    };

    return (
        <>
            {children}
        </>
    );
};
