import {mockUseNavigate} from "../util/mock/MockHooksUtil";

import {beforeEach, describe, expect, Mock, test} from 'vitest'
import {MockApiUtil} from "../util/mock/MockApiUtil";
import {render, waitFor, screen, fireEvent} from "@testing-library/react";
import {Routes} from "../../src/models/Routes";
import {MemoryRouter} from "react-router-dom";
import UserRegistrationComponent from "../../src/component/authentication/UserRegistrationComponent";
import NotFoundError from "../../src/models/errors/NotFoundError";
import {PrivacyPolicyOptions} from "../../src/models/system/PrivacyPolicyOptions";
import userEvent from "@testing-library/user-event";
import {createToken} from "../util/JwtTestUtil";
import {SystemRoles} from "../../src/models/user/SystemRoles";
import {UserState} from "../../src/models/auth/UserState";

describe('User Registration', () => {
    let mockNavigate: Mock;

    beforeEach(() => {
        mockNavigate = mockUseNavigate();
    })

    test('Navigate to error view (403) if getAllowRegistrationView return false', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(false);

        render(
            <MemoryRouter initialEntries={[Routes.Authentication.REGISTRATION]}>
                <UserRegistrationComponent/>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(Routes.Error.getErrorRoute(403), {replace: true});
        });
    });

    test('Displays an error if privacy policy is enabled but no privacy policy is defined', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.SystemService.mockGetPrivacyPolicy(new NotFoundError());

        render(
            <MemoryRouter initialEntries={[Routes.Authentication.REGISTRATION]}>
                <UserRegistrationComponent/>
            </MemoryRouter>
        );

        const notificationTitle = await screen.findByText("Missing privacy policy");
        expect(notificationTitle).not.toBeNull();
    });

    test('Displays an error if an unexpected error occurred during getAllowRegistrationView or getPrivacyPolicy', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.SystemService.mockGetPrivacyPolicy(new Error("test error"));

        render(
            <MemoryRouter initialEntries={[Routes.Authentication.REGISTRATION]}>
                <UserRegistrationComponent/>
            </MemoryRouter>
        );

        const notificationTitle = await screen.findByText("test error");
        expect(notificationTitle).not.toBeNull();
    });

    test('Display privacy policy link if privacy policy is enabled and a url is defined.', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.SystemService.mockGetPrivacyPolicy(new PrivacyPolicyOptions(true, "myPrivacyPolicyLink"));

        render(
            <MemoryRouter initialEntries={[Routes.Authentication.REGISTRATION]}>
                <UserRegistrationComponent/>
            </MemoryRouter>
        );

        const privacyPolicyCheckbox = await screen.findByLabelText("Registration Privacy Policy Link")

        await waitFor(() => {
            expect(privacyPolicyCheckbox).not.toBeNull();
        })
    });

    test('Register button is disabled if privacy policy is enabled and privacy url is defined but user did not agree', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.SystemService.mockGetPrivacyPolicy(new PrivacyPolicyOptions(true, "myPrivacyPolicyLink"));

        render(
            <MemoryRouter initialEntries={[Routes.Authentication.REGISTRATION]}>
                <UserRegistrationComponent/>
            </MemoryRouter>
        );

        const usernameInput = await screen.findByLabelText('Registration Username Input');
        const emailInput = await screen.findByLabelText('Registration Email Input');
        const passwordInput = await screen.findByLabelText('Registration Password Input');

        await userEvent.type(usernameInput, 'TestUser');
        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        const loginButton = await screen.findByLabelText("Registration Button")
        expect(loginButton).not.toBeNull();
        //@ts-ignore
        expect(loginButton).toBeDisabled();
    });

    test('Register button is enabled if privacy policy is enabled and privacy url is defined and the user did agree', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.SystemService.mockGetPrivacyPolicy(new PrivacyPolicyOptions(true, "myPrivacyPolicyLink"));

        render(
            <MemoryRouter initialEntries={[Routes.Authentication.REGISTRATION]}>
                <UserRegistrationComponent/>
            </MemoryRouter>
        );

        const usernameInput = await screen.findByLabelText('Registration Username Input');
        const emailInput = await screen.findByLabelText('Registration Email Input');
        const passwordInput = await screen.findByLabelText('Registration Password Input');
        const privacyPolicyCheckbox = await screen.findByLabelText("Registration Privacy Policy Link")

        await userEvent.type(usernameInput, 'TestUser');
        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        fireEvent.click(privacyPolicyCheckbox)

        const loginButton = await screen.findByLabelText("Registration Button")
        expect(loginButton).not.toBeNull();
        //@ts-ignore
        expect(loginButton).not.toBeDisabled();
    });


    test('Navigate to confirm registration view if after "createUser" successfully called.', async () => {
        MockApiUtil.SystemService.mockGetAllowRegistrationView(true);
        MockApiUtil.SystemService.mockGetPrivacyPolicy(new PrivacyPolicyOptions(true, "myPrivacyPolicyLink"));

        const token = createToken("userId", SystemRoles.USER, UserState.ACTIVE, null)
        MockApiUtil.AuthenticationService.mockCreateUser(token);

        render(
            <MemoryRouter initialEntries={[Routes.Authentication.REGISTRATION]}>
                <UserRegistrationComponent/>
            </MemoryRouter>
        );

        const usernameInput = await screen.findByLabelText('Registration Username Input');
        const emailInput = await screen.findByLabelText('Registration Email Input');
        const passwordInput = await screen.findByLabelText('Registration Password Input');
        const privacyPolicyCheckbox = await screen.findByLabelText("Registration Privacy Policy Link")

        await userEvent.type(usernameInput, 'TestUser');
        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'password123');

        fireEvent.click(privacyPolicyCheckbox)

        const loginButton = await screen.findByLabelText("Registration Button");
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(Routes.Authentication.CONFIRM_REGISTRATION);
        })
    });


});