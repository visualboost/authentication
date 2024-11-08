import {mockLocationReplace, mockUseNavigate} from "../util/mock/MockHooksUtil";

import {beforeEach, describe, expect, Mock, test} from 'vitest'
import {MockApiUtil} from "../util/mock/MockApiUtil";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {Routes} from "../../src/models/Routes";
import LoginComponent from "../../src/component/authentication/LoginComponent";
import {SigninResponseBody} from "../../src/models/auth/SigninResponseBody";
import userEvent from '@testing-library/user-event';
import {createToken} from "../util/JwtTestUtil";
import {SystemRoles} from "../../src/models/user/SystemRoles";
import {UserState} from "../../src/models/auth/UserState";
import TestMemoryRouter from "../util/TestMemoryRouter";

describe('Login', () => {
    let mockNavigate: Mock;

    beforeEach(() => {
        MockApiUtil.restore();
        MockApiUtil.AuthenticationService.mockLogout();
        mockNavigate = mockUseNavigate();
    })

    test('Hide the registration link if "getAllowRegistrationView" return false', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(false);

        render(
            <TestMemoryRouter initialEntries={[Routes.Authentication.LOGIN]}>
                <LoginComponent/>
            </TestMemoryRouter>
        );

        const linkToRegistrationVIew = screen.queryByLabelText("Registration Link")

        await waitFor(() => {
            expect(linkToRegistrationVIew).toBeNull();
        });
    });

    test('Show the registration link if "getAllowRegistrationView" return true', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);

        render(
            <TestMemoryRouter initialEntries={[Routes.Authentication.LOGIN]}>
                <LoginComponent/>
            </TestMemoryRouter>
        );

        const linkToRegistrationVIew = await screen.findByLabelText("Registration Link")

        await waitFor(() => {
            expect(linkToRegistrationVIew).not.toBeNull();
        });
    });

    test('Navigate to 2 factor auth component if "signin" returns twoFactorAuthId', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.AuthenticationService.mockSignin(new SigninResponseBody("null", "randomTwoFactorAuthId"));

        render(
            <TestMemoryRouter initialEntries={[Routes.Authentication.LOGIN]}>
                <LoginComponent/>
            </TestMemoryRouter>
        );

        const emailInput = screen.getByLabelText('Login Email Input');
        const passwordInput = screen.getByLabelText('Login Password Input');

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        const loginButton = await screen.findByLabelText("Login Button")
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(Routes.getConfirmTwoFactorAuth("randomTwoFactorAuthId"));
        });
    });

    test('Navigate to confirm registration view if sign in was successful but userstate is PENDING', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.AuthenticationService.mockSignin(new SigninResponseBody(createToken("id", SystemRoles.ADMIN, UserState.PENDING), null));

        render(
            <TestMemoryRouter initialEntries={[Routes.Authentication.LOGIN]}>
                <LoginComponent/>
            </TestMemoryRouter>
        );

        const emailInput = screen.getByLabelText('Login Email Input');
        const passwordInput = screen.getByLabelText('Login Password Input');

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        const loginButton = await screen.findByLabelText("Login Button")
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.CONFIRM_REGISTRATION);
        });
    });

    test('Navigate to Admin dashboard if sign in was successful, twoFactorAuthId is null and user role is ADMIN', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.AuthenticationService.mockSignin(new SigninResponseBody(createToken("id", SystemRoles.ADMIN, UserState.ACTIVE), null));

        render(
            <TestMemoryRouter initialEntries={[Routes.Authentication.LOGIN]}>
                <LoginComponent/>
            </TestMemoryRouter>
        );

        const emailInput = screen.getByLabelText('Login Email Input');
        const passwordInput = screen.getByLabelText('Login Password Input');

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        const loginButton = await screen.findByLabelText("Login Button")
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(Routes.Admin.Dashboard.ROOT);
        });
    });

    test('Navigate to authentication hook if sign in was successful, twoFactorAuthId is null, user role is not ADMIN and authentication hook is defined', async () => {
        const authenticationHook = "http://localhost/test";
        const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE)
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.AuthenticationService.mockSignin(new SigninResponseBody(token, null));
        MockApiUtil.SystemService.mockGetHooks({ AUTHENTICATION: authenticationHook, EMAIL_CHANGE: "", PASSWORD_CHANGE: "", PASSWORD_RESET: "" })
        const mockedReplaceFun = mockLocationReplace()

        render(
            <TestMemoryRouter initialEntries={[Routes.Authentication.LOGIN]}>
                <LoginComponent/>
            </TestMemoryRouter>
        );

        const emailInput = screen.getByLabelText('Login Email Input');
        const passwordInput = screen.getByLabelText('Login Password Input');

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        const loginButton = await screen.findByLabelText("Login Button")
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockedReplaceFun).toHaveBeenCalledWith(authenticationHook);
        });
    });

    test('Navigate to confirm login view if sign in was successful, twoFactorAuthId is null and user role is not ADMIN and authentication hook is not defined', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.SystemService.mockGetHooks({ AUTHENTICATION: "", EMAIL_CHANGE: "", PASSWORD_CHANGE: "", PASSWORD_RESET: "" })
        MockApiUtil.AuthenticationService.mockSignin(new SigninResponseBody(createToken("id", SystemRoles.USER, UserState.ACTIVE), null));

        render(
            <TestMemoryRouter initialEntries={[Routes.Authentication.LOGIN]}>
                <LoginComponent/>
            </TestMemoryRouter>
        );

        const emailInput = screen.getByLabelText('Login Email Input');
        const passwordInput = screen.getByLabelText('Login Password Input');

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        const loginButton = await screen.findByLabelText("Login Button")
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(Routes.Confirmation.LOGIN);
        });
    });


});