import React, {createContext, useState, useContext, ReactNode} from 'react';

interface LoaderContextType {
    loading: boolean;
    showProgress: () => void;
    hideProgress: () => void;
}

interface LoaderProviderProps {
    children: ReactNode;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(false);

    const showProgress = () => setLoading(true);
    const hideProgress = () => setLoading(false);

    return (
        <LoaderContext.Provider value={{ loading, showProgress, hideProgress }}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = (): LoaderContextType => {
    const context = useContext(LoaderContext);
    if (context === null) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
};