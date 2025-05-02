import {createBrowserRouter, Navigate, redirect} from "react-router-dom";
import App from "../App.tsx";
import LoginComponent from "../component/authentication/LoginComponent.tsx";
import AdminRegistrationComponent from "../component/authentication/AdminRegistrationComponent.tsx";
import UserRegistrationComponent from "../component/authentication/UserRegistrationComponent.tsx";
import AdminComponent from "../component/admin/AdminComponent.tsx";
import UserListComponent from "../component/admin/user/UserListComponent.tsx";
import {Routes} from "../models/Routes.tsx";
import UserDetailComponent from "../component/user/UserDetailComponent.tsx";
import BlackListComponent from "../component/admin/user/blacklist/BlacklistComponent.tsx";
import SettingsComponent from "../component/settings/SettingsComponent.tsx";
import {CookieHandler} from "../util/CookieHandler.tsx";
import UpdateRoleComponent from "../component/admin/role/UpdateRoleComponent.tsx";
import CreateRoleComponent from "../component/admin/role/CreateRoleComponent.tsx";
import RoleListComponent from "../component/admin/role/RoleListComponent.tsx";
import ResetPasswordComponent from "../component/user/ResetPasswordComponent.tsx";
import DashboardComponent from "../component/dashboard/DashboardComponent.tsx";
import CreateUserComponent from "../component/admin/user/CreateUserComponent.tsx";
import TwoFactorComponent from "../component/authentication/TwoFactorComponent.tsx";
import InvitedUserRegistrationComponent from "../component/authentication/InvitedUserRegistrationComponent.tsx";
import CredentialsSettingsComponent from "../component/settings/CredentialsSettingsComponent.tsx";
import ConfirmationComponent from "../component/authentication/cofirmation/ConfirmationComponent.tsx";
import ConfirmEmailComponent from "../component/authentication/ConfirmEmailComponent.tsx";
import AuthenticationComponent from "../component/authentication/AuthenticationComponent.tsx";
import ErrorComponent from "../component/errorpages/ErrorComponent.tsx";
import LoginConfirmedComponent from "../component/authentication/cofirmation/LoginConfirmedComponent.tsx";
import RegistrationConfirmedComponent from "../component/authentication/cofirmation/RegistrationConfirmedComponent.tsx";
import EmailChangedConfirmComponent from "../component/authentication/cofirmation/EmailChangedConfirmComponent.tsx";
import SetPasswordComponent from "../component/user/SetPasswordComponent.tsx";
import PasswordChangedConfirmComponent
    from "../component/authentication/cofirmation/PasswordChangedConfirmComponent.tsx";
import CreateAccessTokenComponent from "../component/settings/accesstoken/CreateAccessTokenComponent.tsx";
import AccessTokenListComponent from "../component/settings/accesstoken/AccessTokenListComponent.tsx";

const routerConfig = [
    {
        path: Routes.ROOT,
        element: <App/>,
    },
    {
        path: Routes.AUTHENTICATION,
        element: <AuthenticationComponent/>,
        children: [
            {
                index: true,
                element: <Navigate to={Routes.Authentication.LOGIN} replace/>
            },
            {
                path: Routes.Authentication.LOGIN,
                element: <LoginComponent/>
            },
            {
                path: Routes.Authentication.REGISTRATION,
                element: <UserRegistrationComponent/>
            },
            {
                path: Routes.Authentication.REGISTRATION_ADMIN,
                element: <AdminRegistrationComponent/>
            },
            {
                path: Routes.Authentication.CONFIRM_REGISTRATION,
                element: <ConfirmEmailComponent/>
            },
            {
                path: Routes.Authentication.TWO_FACTOR,
                element: <TwoFactorComponent/>
            },
            {
                path: Routes.Authentication.RESET_PASSWORD,
                element: <ResetPasswordComponent/>
            },
        ]
    },
    {
        path: Routes.CONFIRMED,
        element: <ConfirmationComponent/>,
        children: [
            {
                path: Routes.Confirmation.LOGIN,
                element: <LoginConfirmedComponent/>
            },
            {
                path: Routes.Confirmation.REGISTRATION,
                element: <RegistrationConfirmedComponent/>
            },
            {
                path: Routes.Confirmation.EMAIL_CHANGED,
                element: <EmailChangedConfirmComponent/>
            },
            {
                path: Routes.Confirmation.PASSWORD_CHANGED,
                element: <PasswordChangedConfirmComponent/>
            }
        ]
    },
    {
        path: Routes.ADMIN,
        element: <AdminComponent/>,
        loader: async () => {
            const decodedJwt = CookieHandler.getAuthTokenDecoded();
            if (!decodedJwt || !decodedJwt.isAdmin()) {
                return redirect(Routes.Error.getErrorRoute(403));
            }

            return {};
        },
        children: [
            {
                path: Routes.Admin.UserSection.LIST,
                element: <UserListComponent/>
            },
            {
                path: Routes.Admin.UserSection.CREATE,
                element: <CreateUserComponent/>
            },
            {
                path: Routes.Admin.UserSection.USER_DETAIL,
                element: <UserDetailComponent/>
            },
            {
                path: Routes.Admin.RoleSection.LIST,
                element: <RoleListComponent/>
            },
            {
                path: Routes.Admin.RoleSection.DETAIL,
                element: <UpdateRoleComponent/>
            },
            {
                path: Routes.Admin.RoleSection.CREATE,
                element: <CreateRoleComponent/>
            },
            {
                path: Routes.Admin.UserSection.BLACKLIST,
                element: <BlackListComponent/>
            },
            {
                path: Routes.Admin.Dashboard.ROOT,
                element: <DashboardComponent/>
            },
            {
                path: Routes.Admin.Settings.OVERVIEW,
                element: <SettingsComponent/>
            },
            {
                path: Routes.Admin.Settings.CREDENTIALS,
                element: <CredentialsSettingsComponent/>
            },
            {
                path: Routes.Admin.ACCESSTOKEN.OVERVIEW,
                element: <AccessTokenListComponent/>
            },
            {
                path: Routes.Admin.ACCESSTOKEN.CREATE,
                element: <CreateAccessTokenComponent/>
            },
        ]
    },
    {
        path: Routes.User.DETAIL,
        element: <UserDetailComponent/>
    },
    {
        path: Routes.User.CHANGE_PASSWORD,
        element: <SetPasswordComponent/>,
    },
    {
        path: Routes.INVITATION,
        element: <InvitedUserRegistrationComponent/>
    },
    {
        path: Routes.ERROR,
        element: <ErrorComponent/>
    }
];

const router = createBrowserRouter(routerConfig);

export {
    routerConfig,
    router
}
