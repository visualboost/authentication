import { notification } from 'antd';
import {HttpError} from "../models/errors/HttpError.tsx";

export class NotificationHandler {

    static showSuccessNotification(title: string, description: string, duration: number = 5){
        notification.success({
            message: title,
            description: description,
            placement: "bottomRight",
            duration: duration,
        });
    }

    static showErrorNotification(title: string, description: string, duration: number = 10){
        notification.error({
            message: title,
            description: description,
            placement: "bottomRight",
            duration: duration,
        });
    }

    static showErrorNotificationFromError(e: Error){
        if(e instanceof HttpError){
            this.showErrorNotification(e.status.toString(), e.message);
        }else{
            this.showErrorNotification("Ops!", e.message);
        }
    }
}