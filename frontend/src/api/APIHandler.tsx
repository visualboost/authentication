import {CookieHandler} from "../util/CookieHandler.tsx";
import {HttpErrorHandler} from "../models/errors/HttpErrorHandler.tsx";
import axios, {AxiosInstance} from "axios";
import {setupCache} from "axios-cache-interceptor";
import {Protocol} from "../constants/Protocol.ts";

export class APIHandler {

    client: AxiosInstance;
    cachedClient: AxiosInstance;
    url: string;

    constructor() {
        const backendUrl = this.getBackendUrl();

        this.url = backendUrl;
        this.client = axios.create({
            baseURL: backendUrl
        });

        const axiosInstanceForCache = axios.create({
            baseURL: backendUrl
        });
        this.cachedClient = setupCache(axiosInstanceForCache, {
            ttl: 30 * 60 * 1000
        });
    }

    getProtocol(): string {
        let protocol: Protocol;

        if(import.meta.env.PROD){
            //@ts-ignore
            protocol = window._env_.PROTOCOL as Protocol;
        } else {
            protocol = import.meta.env.VITE_PROTOCOL as Protocol;
        }

        if(protocol === Protocol.HTTPS){
            return "https://";
        }else{
            return "http://";
        }
    }

    getDomain(): string {
        if(import.meta.env.PROD){
            //@ts-ignore
            return window._env_.DOMAIN as string;
        } else {
            return import.meta.env.VITE_DOMAIN as string;
        }
    }

    getRoute(): string {
        let proxyRoute: string | null = null;
        if(import.meta.env.PROD){
            //@ts-ignore
            proxyRoute = window._env_.PROXY_BACKEND_ROUTE as string;
        }

        if(!proxyRoute) return "";
        return proxyRoute;
    }

    getBackendPort(): string {
        let port: string;
        if(import.meta.env.PROD){
            //@ts-ignore
            port = window._env_.PROXY_BACKEND_PORT as string;
        } else {
            port = import.meta.env.VITE_BACKEND_PORT as string;
        }

        return port;
    }

    getBackendUrl(): string{
        let url = `${this.getProtocol()}${this.getDomain()}`
        const port = this.getBackendPort();

        if(port){
            url += ":" + port;
        }

        const route = this.getRoute();
        if(route){
            url += route;
        }

        return url;
    }

    createHeaders(additionalHeaders: object = {}): object {
        let headers = {
            'Content-Type': 'application/json',
        }

        const jwt = CookieHandler.getAuthToken();
        //@ts-ignore
        headers["Authorization"] = `Bearer ${jwt}`;
        //@ts-ignore
        headers["X-XSRF-TOKEN"] = CookieHandler.getXsfrToken();

        headers = {
            ...headers,
            ...additionalHeaders
        }

        return headers
    }


    async callGet<T>(client: AxiosInstance, path: string, responseConverter: ((response: unknown) => T), headers: object = {}, options: object = {}): Promise<T> {
        try {
            const response = await client.get(this.url + path, {
                headers: {
                    ...this.createHeaders(headers),
                },
                withCredentials: true,
                ...options
            });

            const responseAsJson = response.data;
            return responseConverter(responseAsJson);
        } catch (error) {
            //@ts-ignore
            if (error.response) {
                //@ts-ignore
                this.handleError(error.status, error.response.data.message);
            }

            throw error;
        }
    }

    async get<T>(path: string, responseConverter: ((response: unknown) => T), headers: object = {}): Promise<T> {
        return this.callGet<T>(this.client, path, responseConverter, headers);
    }

    /**
     * Execute a get request but cachches the result
     *
     * @param [forceReload=false] If set to true,the cache will be disabled and the request will be fully executed
     */
    async getAndCache<T>(path: string, responseConverter: ((response: unknown) => T), headers: object = {}, forceReload: boolean = false): Promise<T> {
        return this.callGet<T>(this.cachedClient, path, responseConverter, headers, {cache: !forceReload});
    }

    async post<T>(path: string, body: unknown, responseConverter: ((response: unknown) => T), headers: object = {}): Promise<T> {
        try {
            const response = await this.client.post(this.url + path, body, {
                headers: {
                    ...this.createHeaders(headers),
                },
                withCredentials: true
            });

            const responseAsJson = response.data;
            return responseConverter(responseAsJson);
        } catch (error) {
            //@ts-ignore
            if (error.response) {
                //@ts-ignore
                this.handleError(error.status, error.response.data.message);
            }

            throw error;
        }
    }

    async put<T>(path: string, body: unknown, responseConverter: ((response: unknown) => T), headers: object = {}): Promise<T> {
        try {
            const response = await this.client.put(this.url + path, body, {
                headers: {
                    ...this.createHeaders(headers),
                },
                withCredentials: true
            });

            const responseAsJson = response.data;
            return responseConverter(responseAsJson);
        } catch (error) {
            //@ts-ignore
            if (error.response) {
                //@ts-ignore
                this.handleError(error.status, error.response.data.message);
            }

            throw error;
        }
    }

    async patch<T>(path: string, body: unknown, responseConverter: ((response: unknown) => T), headers: object = {}): Promise<T> {
        try {
            const response = await this.client.patch(this.url + path, body, {
                headers: {
                    ...this.createHeaders(headers),
                },
                withCredentials: true
            });

            const responseAsJson = response.data;
            return responseConverter(responseAsJson);
        } catch (error) {
            //@ts-ignore
            if (error.response) {
                //@ts-ignore
                this.handleError(error.status, error.response.data.message);
            }

            throw error;
        }
    }

    async delete<T>(path: string, responseConverter: ((response: unknown) => T), headers: object = {}): Promise<T> {
        try {
            const response = await this.client.delete(this.url + path, {
                headers: {
                    ...this.createHeaders(headers),
                },
                withCredentials: true
            });

            const responseAsJson = response.data;
            return responseConverter(responseAsJson);
        } catch (error) {
            //@ts-ignore
            if (error.response) {
                //@ts-ignore
                this.handleError(error.status, error.response.data.message);
            }

            throw error;
        }
    }

    handleError(status: number, message: string) {
        const httpError = HttpErrorHandler.getErrorByStatusCode(status);

        if (httpError) {
            throw httpError;
        }

        throw new Error(message)
    }


}
