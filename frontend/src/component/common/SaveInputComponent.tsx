import {Form, Input, InputProps, Spin} from "antd";
import {PropsWithChildren, useEffect, useState} from "react";
import {SaveOutlined} from "@ant-design/icons/lib/icons";
import {TfiWorld} from "react-icons/tfi";
import {LoadingOutlined} from "@ant-design/icons";
import {IoMdCheckmark} from "react-icons/io";
import {RiErrorWarningFill} from "react-icons/ri";
import {useForm} from "antd/es/form/Form";

interface SaveInputComponentProps extends InputProps {
    onSave: (value: string) => Promise<void>;
}

const SaveInputComponent = (props: PropsWithChildren<SaveInputComponentProps>) => {
    const [form] = useForm();

    const [loading, isLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSaveButton, setShowSaveButton] = useState(true);

    useEffect(() => {
        setDefaultValueIfExists();
    }, []);

    const setDefaultValueIfExists = () => {
        if(!props.defaultValue) return;
        form.setFieldValue("value", props.defaultValue);
    }

    //@ts-ignore
    const save = async (values) => {
        try {
            isLoading(true);
            await props.onSave(values.value);
            setIsSaved(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            showSaveButtonAfter(2000);
        }
    }

    const showSaveButtonAfter = (millis: number) => {
        setTimeout(() => {
            isLoading(false);
            setIsSaved(false);
            setError(null);
            setShowSaveButton(true)
        }, millis)
    }

    const getSuffixIcon = () => {
        if (loading) {
            return <Spin indicator={<LoadingOutlined spin />} size="small" />
        } else if (isSaved) {
            return <IoMdCheckmark color={"#52c41a"}/>
        } else if (error !== null) {
            return <RiErrorWarningFill color={"#ff4d4f"}/>
        } else if(showSaveButton) {
            return <SaveOutlined onClick={() => form.submit()}/>
        }
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={save}
        >
            <Form.Item name="value">
                <Input
                    addonBefore={<TfiWorld/>}
                    addonAfter={getSuffixIcon()}
                    allowClear
                    onClear={() => {
                        save({value: null})
                    }}
                    style={{width: "100%"}}
                    disabled={loading}
                    {...props}
                />
            </Form.Item>
        </Form>

    );
};


export default SaveInputComponent;
