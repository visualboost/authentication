import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import axios, {AxiosInstance} from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {CookieHandler} from "../../../src/util/CookieHandler";
import {Interceptor} from "../../../src/api/Interceptors";
import {AdminService} from "../../../src/api/AdminService";
import {SystemStateService} from "../../../src/api/SystemStateService";
import {UserService} from "../../../src/api/UserService";
import {AuthenticationService} from "../../../src/api/AuthenticationService";

vi.mock('../../../src/api/AuthenticationService');
vi.mock('../../../src/util/CookieHandler');

describe('Unauthorized Interceptor', () => {
    let client: AxiosInstance;
    let mock: MockAdapter;

    beforeEach(() => {
        client = axios.create();
        mock = new MockAdapter(client);
        Interceptor.addUnauthorizedInterceptor(client);
    });

    afterEach(() => {
        vi.clearAllMocks();
    })

    it('should retry the request after refreshing the token on 401 error', async () => {
        const mockAuthToken = 'newAuthToken';
        //@ts-ignore
        AuthenticationService.refreshToken.mockResolvedValue(mockAuthToken);
        CookieHandler.setAuthToken = vi.fn();

        mock.onGet('/test').replyOnce(401);
        mock.onGet('/test').reply(200, {data: 'success'});

        const response = await client.get('/test');

        expect(response.status).toBe(200);
        expect(response.data).toEqual({data: 'success'});

        expect(AuthenticationService.refreshToken).toHaveBeenCalledTimes(1);
        expect(CookieHandler.setAuthToken).toHaveBeenCalledWith(mockAuthToken);
    });

    it('should not retry if the error is not 401', async () => {
        mock.onGet('/test').replyOnce(403);
        await expect(client.get('/test')).rejects.toThrowError();
        expect(AuthenticationService.refreshToken).not.toHaveBeenCalled();
    });

    it('AdminService contains unauthorized interceptor', async () => {
        //@ts-ignore
        const responseInterceptors = AdminService.instance.client.interceptors.response.handlers
        expect(responseInterceptors).toHaveLength(1);
    });

    it('UserService contains unauthorized interceptor', async () => {
        //@ts-ignore
        const responseInterceptors = UserService.instance.client.interceptors.response.handlers
        expect(responseInterceptors).toHaveLength(1);
    });

    it('SystemStateService does not contain unauthorized interceptor', async () => {
        //@ts-ignore
        const responseInterceptors = SystemStateService.instance.client.interceptors.response.handlers
        expect(responseInterceptors).toHaveLength(0);
    });

    it('AuthenticationService does not contain unauthorized interceptor', async () => {
        //@ts-ignore
        const responseInterceptors = AuthenticationService.instance.client.interceptors.response.handlers
        expect(responseInterceptors).toHaveLength(0);
    });
});
