import {afterEach, beforeEach, describe, expect, Mock, test} from 'vitest'
import {mockLocationReplace, mockUseNavigate} from "./util/mock/MockHooksUtil";
import {MockApiUtil} from "./util/mock/MockApiUtil";
import {mockGetAuthToken, mockGetJwtDecoded} from "./util/mock/MockCookieHandlerUtil";

import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {createMemoryRouter} from "react-router-dom";
import App from "../src/App";
import {Routes} from "../src/models/Routes";
import {SystemState} from "../src/models/SystemState";
import {createToken} from "./util/JwtTestUtil";
import {SystemRoles} from "../src/models/user/SystemRoles";
import {UserState} from "../src/models/auth/UserState";
import ConfirmEmailComponent from "../src/component/authentication/ConfirmEmailComponent";
import {routerConfig} from "../src/router/Router";
import TestMemoryRouter from "./util/TestMemoryRouter";
import AuthenticationComponent from "../src/component/authentication/AuthenticationComponent";
import TestRouterProvider from "./util/TestRouterProvider";

let mockNavigate: Mock;

beforeEach(() => {
    mockNavigate = mockUseNavigate();
    MockApiUtil.SystemService.mockGetXsfrToken();
})

afterEach(() => {
    MockApiUtil.restore();
})

describe('Routing', () => {

    describe(`Root (${Routes.ROOT})`, () => {

        test('Navigate to Authentication Component if system is not initialized (Means no admin exist)', async () => {
            MockApiUtil.SystemService.mockSystemState(SystemState.NOT_INITIALIZED);

            render(
                <TestMemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.AUTHENTICATION);
            });
        });
    });

    describe(`Authentication (${Routes.AUTHENTICATION})`, () => {

        test('Navigate to Admin Registration Component if the system is not initialized (admin does not exist)', async () => {
            MockApiUtil.SystemService.mockSystemState(SystemState.NOT_INITIALIZED);

            render(
                <TestMemoryRouter initialEntries={[Routes.AUTHENTICATION]}>
                    <AuthenticationComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.REGISTRATION_ADMIN);
            });
        });

        test('Navigate to Login Component if the system is initialized (admin does exist) and no auth token exists', async () => {
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetAuthToken(null);

            render(
                <TestMemoryRouter initialEntries={[Routes.AUTHENTICATION]}>
                    <AuthenticationComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.LOGIN);
            });
        });

        test('Navigate to Confirm registration component if the system is initialized, and the user state is PENDING', async () => {
            const token = createToken("userId", SystemRoles.USER, UserState.PENDING)
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetAuthToken(token);
            mockGetJwtDecoded(token);

            render(
                <TestMemoryRouter initialEntries={[Routes.AUTHENTICATION]}>
                    <AuthenticationComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.CONFIRM_REGISTRATION);
            });
        });

        test('Navigate to the admin dashboard if the userstate is ACTIVE and the role is ADMIN', async () => {
            const token = createToken("userId", SystemRoles.ADMIN, UserState.ACTIVE)
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetAuthToken(token);
            mockGetJwtDecoded(token);

            render(
                <TestMemoryRouter initialEntries={[Routes.AUTHENTICATION]}>
                    <AuthenticationComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Admin.Dashboard.ROOT);
            });
        });

        test('Navigate to the authentication hook if exists', async () => {
            const authenticationHook = "http://localhost/test";
            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE)
            MockApiUtil.SystemService.mockGetHooks({
                AUTHENTICATION: authenticationHook,
                EMAIL_CHANGE: "",
                PASSWORD_CHANGE: "",
                PASSWORD_RESET: ""
            })
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetAuthToken(token);
            mockGetJwtDecoded(token);
            const mockedReplaceFun = mockLocationReplace()

            render(
                <TestMemoryRouter initialEntries={[Routes.AUTHENTICATION]}>
                    <AuthenticationComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockedReplaceFun).toHaveBeenCalledWith(authenticationHook);
            });
        });

        test('Navigate to the default login success component if not authentication hook exists', async () => {
            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE)
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            MockApiUtil.SystemService.mockGetHooks({
                AUTHENTICATION: "",
                EMAIL_CHANGE: "",
                PASSWORD_CHANGE: "",
                PASSWORD_RESET: ""
            })
            mockGetAuthToken(token);
            mockGetJwtDecoded(token);

            render(
                <TestMemoryRouter initialEntries={[Routes.AUTHENTICATION]}>
                    <AuthenticationComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Confirmation.LOGIN);
            });
        });

        test('Navigate to error page (503) if system state can not be requested', async () => {
            MockApiUtil.SystemService.mockSystemState(new Error("failed"));

            render(
                <TestMemoryRouter initialEntries={[Routes.AUTHENTICATION]}>
                    <AuthenticationComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Error.getErrorRoute(503));
            });
        });

    });

    describe(`Login (${Routes.Authentication.LOGIN})`, () => {

        afterEach(() => {
            cleanup();
        })

        beforeEach(() => {
            MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        })

        test('Navigate to forgot password component if "forgot password" is clicked', async () => {
            const testRouter = createMemoryRouter(routerConfig, {
                initialEntries: [Routes.Authentication.LOGIN],
            });

            render(
                <TestRouterProvider router={testRouter}/>
            );

            const linkToForgotPassword = screen.queryByLabelText("Forgot Password Link")
            expect(linkToForgotPassword).not.toBeNull();
            fireEvent.click(linkToForgotPassword as HTMLElement);

            expect(testRouter.state.location.pathname).toBe(Routes.Authentication.RESET_PASSWORD);
        });

        test('Navigate to registration component if "Register here" is clicked', async () => {
            const testRouter = createMemoryRouter(routerConfig, {
                initialEntries: [Routes.Authentication.LOGIN],
            });

            render(
                <TestRouterProvider router={testRouter}/>
            );

            const linkToRegistrationView = await screen.findByLabelText("Registration Link")
            expect(linkToRegistrationView).not.toBeNull();
            fireEvent.click(linkToRegistrationView as HTMLElement);

            await waitFor(() => {
                expect(testRouter.state.location.pathname).toBe(Routes.Authentication.REGISTRATION);
            })
        });

    });

    describe(`Confirm Email Component (${Routes.Authentication.CONFIRM_REGISTRATION})`, () => {

        beforeEach(() => {
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
        })

        test('Navigate to Admin dashboard if user is active and has user role ADMIN', async () => {
            const token = createToken("userId", SystemRoles.ADMIN, UserState.ACTIVE)
            MockApiUtil.AuthenticationService.mockRefetchToken(token);

            render(
                <TestMemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </TestMemoryRouter>
            );

            // Wait for the async navigation logic to complete
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.ADMIN);
            });
        });

        test('Navigate to the authentication hook if exists and user role is not ADMIN', async () => {
            const authenticationHook = "http://localhost/test";
            MockApiUtil.SystemService.mockGetHooks({
                AUTHENTICATION: authenticationHook,
                EMAIL_CHANGE: "",
                PASSWORD_CHANGE: "",
                PASSWORD_RESET: ""
            })

            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE)
            MockApiUtil.AuthenticationService.mockRefetchToken(token);
            const mockedReplaceFun = mockLocationReplace()

            render(
                <TestMemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockedReplaceFun).toHaveBeenCalledWith(authenticationHook);
            });
        });

        test('Navigate to the default login success component if not authentication hook exists', async () => {
            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE)
            MockApiUtil.AuthenticationService.mockRefetchToken(token);
            MockApiUtil.SystemService.mockGetHooks({
                AUTHENTICATION: null,
                EMAIL_CHANGE: "",
                PASSWORD_CHANGE: "",
                PASSWORD_RESET: ""
            })

            render(
                <TestMemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Confirmation.LOGIN);
            });
        });

        test('Navigate to error page (503) if token cant be fetched can not be requested', async () => {
            MockApiUtil.AuthenticationService.mockRefetchToken(new Error("failed"));

            render(
                <TestMemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </TestMemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Error.getErrorRoute(503));
            });
        });
    });

});