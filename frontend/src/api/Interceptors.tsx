import {AuthenticationService} from "./AuthenticationService.tsx";
import {CookieHandler} from "../util/CookieHandler.tsx";
import {AxiosInstance} from "axios";
import UnauthorizedError from "../models/errors/UnauthorizedError.ts";
import {Routes} from "../models/Routes.tsx";
import {Modal} from "antd";

const {warn} = Modal;

export class Interceptor {

    /**
     * Interceptor that checks if the backend throws an 401.
     * 401 means that the authToken is invalid/expired.
     * Try to create a new authToke by calling "GET /authentication/token".
     */
    static addUnauthorizedInterceptor(client: AxiosInstance) {
        client.interceptors.response.use((response) => {
                return response
            },
            async (error) => {
                const originalRequest = error.config;

                //Forward if error is not Unauthorized
                if (error.status !== 401) {
                    return Promise.reject(error);
                }

                try {
                    const authToken = await AuthenticationService.refreshToken();
                    CookieHandler.setAuthToken(authToken);

                    originalRequest.headers['Authorization'] = `Bearer ${authToken}`;
                    return client(originalRequest);
                } catch (e) {
                    if (e instanceof UnauthorizedError) {
                        Interceptor.showLogoutModal();
                    }

                    return Promise.reject(error);
                }

            }
        );
    }

    static showLogoutModal(){
        warn({
            title: 'Your session is expired!',
            content: 'Please logout and login again.',
            okText: 'Logout',
            onOk: async () => {
                await AuthenticationService.logout();
                window.location.replace(Routes.Authentication.LOGIN);
            },
            styles: {
                mask: { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
            },
            centered: true
        });
    }

}