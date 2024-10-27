import "./BlacklistComponent.css"

import {useEffect, useState} from 'react';
import {ModalComponent} from "../../../common/ModalComponent.tsx";
import {BlacklistCriterias} from "../../../../models/user/BlacklistCriterias.ts";
import {Form, Input, Select} from "antd";
import {useForm} from "antd/es/form/Form";
import {AdminService} from "../../../../api/AdminService.tsx";
import {NotificationHandler} from "../../../../util/NotificationHandler.tsx";

const BlackListCriteriaOptions = [
    {
        value: BlacklistCriterias.EMAIL,
        label: 'E-Mail',
    },
    {
        value: BlacklistCriterias.IP,
        label: 'IP-Address',
    }
]

interface BlacklistItem {
    type: string;
    value: string;
}

interface AddToBlacklistModalProps {
    open: boolean
    onAddedToBlacklist: () => void;
    onClose: () => void;
}

const AddToBlacklistModal = (props: AddToBlacklistModalProps) => {
    const [form] = useForm();
    const [loading, isLoading] = useState(false);
    const [modalInputPlaceholer, setModalInputPlaceholer] = useState<string>("");

    useEffect(() => {
        handleCriteriaChanged(BlacklistCriterias.EMAIL);
    }, []);

    const addToBlacklist = async (values: BlacklistItem) => {
        const type = values.type;

        if(type === BlacklistCriterias.EMAIL){
            await callBlockEmail(values.value);
        }else if(type === BlacklistCriterias.IP) {
            await callBlockIP(values.value);
        }

        if(props.onAddedToBlacklist){
            props.onAddedToBlacklist();
        }
    }

    const callBlockEmail = async(email: string) => {
        try{
            isLoading(true);
            await AdminService.Blacklist.blockEmail(email);
            props.onClose();
        }catch (e){
            NotificationHandler.showErrorNotificationFromError(e as Error);
        }finally {
            isLoading(false);
        }
    }

    const callBlockIP = async(ip: string) => {
        try{
            isLoading(true);
            await AdminService.Blacklist.blockIP(ip);
            props.onClose();
        }catch (e){
            NotificationHandler.showErrorNotificationFromError(e as Error);
        }finally {
            isLoading(false);
        }
    }

    const handleCriteriaChanged = (value: string) => {
        if (value === BlacklistCriterias.IP) {
            setModalInputPlaceholer("Enter an IP-Address ...")
        } else if (value === BlacklistCriterias.EMAIL) {
            setModalInputPlaceholer("Enter an E-Mail-Address ...")
        }
    }

    return (<ModalComponent open={props.open} title={"Block IP- or E-Mail-Address"} okBtnTxt={"Add to blacklist"}
                            okAction={() => form.submit()} onClose={props.onClose}
                            danger={true}
                            children={
                                <Form
                                    form={form}
                                    name="blacklistForm"
                                    onFinish={addToBlacklist}
                                    layout="vertical"
                                    autoComplete="off"
                                    disabled={loading}
                                >
                                    <Form.Item
                                        label={'Type'}
                                        name={'type'}
                                        key={'type'}
                                        rules={[{required: true, message: 'Please choose a type!'}]}
                                    >
                                        <Select placeholder={"Select Type"} style={{width: '100%'}}
                                                options={BlackListCriteriaOptions} onChange={handleCriteriaChanged}/>
                                    </Form.Item>

                                    <Form.Item
                                        label={'Value'}
                                        name={"value"}
                                        key={"value"}
                                        rules={[{required: true, message: 'Please enter a value!'}]}
                                    >
                                        <Input placeholder={modalInputPlaceholer} style={{width: '100%'}}></Input>
                                    </Form.Item>
                                </Form>
                            }/>)

};
export default AddToBlacklistModal;
