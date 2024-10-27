import {vi} from "vitest";
import {useNavigate} from "react-router-dom";

const mockUseNavigate = () => {
    const mockNavigate = vi.fn();

    vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
            ...actual,
            useNavigate: vi.fn()
        }
    });

    //@ts-ignore
    useNavigate.mockReturnValue(mockNavigate);

    return mockNavigate;
};

const mockLocationReplace = () => {
    const originalLocation = window.location;

    //@ts-ignore
    delete window.location;

    const mockFun = vi.fn();
    window.location = {
        ...originalLocation,
        replace: mockFun
    };

    return mockFun;
};

export {
    mockUseNavigate,
    mockLocationReplace
}