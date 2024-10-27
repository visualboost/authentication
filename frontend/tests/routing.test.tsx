import {afterEach, beforeEach, describe, expect, Mock, test, vi} from 'vitest'
import {mockUseNavigate, mockLocationReplace} from "./util/mock/MockHooksUtil";
import {MockApiUtil} from "./util/mock/MockApiUtil";
import {mockGetJwt, mockGetJwtDecoded} from "./util/mock/MockCookieHandlerUtil";

import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {createMemoryRouter, MemoryRouter, RouterProvider} from "react-router-dom";
import App from "../src/App";
import {Routes} from "../src/models/Routes";
import {SystemState} from "../src/models/SystemState";
import {createToken} from "./util/JwtTestUtil";
import {SystemRoles} from "../src/models/user/SystemRoles";
import {UserState} from "../src/models/auth/UserState";
import ConfirmEmailComponent from "../src/component/authentication/ConfirmEmailComponent";
import {routerConfig} from "../src/router/Router";

let mockNavigate: Mock;

beforeEach(() => {
    mockNavigate = mockUseNavigate();
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe('Routing', () => {

    describe(`Root (${Routes.ROOT})`, () => {

        test('Navigate to Admin Registration form if system is not initialized (Means no admin exist)', async () => {
            MockApiUtil.SystemService.mockSystemState(SystemState.NOT_INITIALIZED);

            render(
                <MemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </MemoryRouter>
            );

            // Wait for the async navigation logic to complete
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.REGISTRATION_ADMIN);
            });
        });


        test('Navigate to Login Component if the system is initialized (admin already exist) and no jwt cookie exist', async () => {
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetJwt(null);

            render(
                <MemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </MemoryRouter>
            );

            // Wait for the async navigation logic to complete
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.LOGIN);
            });
        });


        test('Navigate to Confirm registration component if the system is initialized, and the user state from jwt is PENDING', async () => {
            const token = createToken("userId", SystemRoles.USER, UserState.PENDING, "my_hook")
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetJwt(token);
            mockGetJwtDecoded(token);

            render(
                <MemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.CONFIRM_REGISTRATION);
            });
        });

        test('Navigate to the admin dashboard if the userstate is ACTIVE and the role is ADMIN', async () => {
            const token = createToken("userId", SystemRoles.ADMIN, UserState.ACTIVE, "my_hook")
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetJwt(token);
            mockGetJwtDecoded(token);

            render(
                <MemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Admin.Dashboard.ROOT);
            });
        });

        test('Navigate to the authentication hook if exists', async () => {
            const authenticationHook = "http://localhost/test";
            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE, authenticationHook)
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetJwt(token);
            mockGetJwtDecoded(token);
            const mockedReplaceFun = mockLocationReplace()

            render(
                <MemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mockedReplaceFun).toHaveBeenCalledWith(authenticationHook);
            });
        });

        test('Navigate to the default login success component if not authentication hook exists', async () => {
            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE, null)
            MockApiUtil.SystemService.mockSystemState(SystemState.INITIALIZED);
            mockGetJwt(token);
            mockGetJwtDecoded(token);

            render(
                <MemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Confirmation.LOGIN);
            });
        });

        test('Navigate to error page (503) if system state can not be requested', async () => {
            MockApiUtil.SystemService.mockSystemState(new Error("failed"));

            render(
                <MemoryRouter initialEntries={[Routes.ROOT]}>
                    <App/>
                </MemoryRouter>
            );

            // Wait for the async navigation logic to complete
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
                <RouterProvider router={testRouter}/>
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
                <RouterProvider router={testRouter}/>
            );

            const linkToRegistrationView = await screen.findByLabelText("Registration Link")
            expect(linkToRegistrationView).not.toBeNull();
            fireEvent.click(linkToRegistrationView as HTMLElement);

            await waitFor(() => {
                expect(testRouter.state.location.pathname).toBe(Routes.Authentication.REGISTRATION);
            })
        });

        test('Navigate to registration component if "Register here" is clicked', async () => {
            const testRouter = createMemoryRouter(routerConfig, {
                initialEntries: [Routes.Authentication.LOGIN],
            });

            render(
                <RouterProvider router={testRouter}/>
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

        test('Navigate to Admin dashboard if user is active and has userrole ADMIN', async () => {
            const token = createToken("userId", SystemRoles.ADMIN, UserState.ACTIVE, "some_hook")
            MockApiUtil.AuthenticationService.mockRefetchToken(token);

            render(
                <MemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </MemoryRouter>
            );

            // Wait for the async navigation logic to complete
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.ADMIN);
            });
        });

        test('Navigate to the authentication hook if exists and userrole is not ADMIN', async () => {
            const authenticationHook = "http://localhost/test";
            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE, authenticationHook)
            MockApiUtil.AuthenticationService.mockRefetchToken(token);
            const mockedReplaceFun = mockLocationReplace()

            render(
                <MemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mockedReplaceFun).toHaveBeenCalledWith(authenticationHook);
            });
        });

        test('Navigate to the default login success component if not authentication hook exists', async () => {
            const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE, null)
            MockApiUtil.AuthenticationService.mockRefetchToken(token);

            render(
                <MemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Confirmation.LOGIN);
            });
        });

        test('Navigate to error page (503) if token cant be fetched can not be requested', async () => {
            MockApiUtil.AuthenticationService.mockRefetchToken(new Error("failed"));

            render(
                <MemoryRouter initialEntries={[Routes.Authentication.CONFIRM_REGISTRATION]}>
                    <ConfirmEmailComponent/>
                </MemoryRouter>
            );

            // Wait for the async navigation logic to complete
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(Routes.Error.getErrorRoute(503));
            });
        });
    });

});