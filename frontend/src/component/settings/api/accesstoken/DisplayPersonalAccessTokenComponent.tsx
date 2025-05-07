import React from 'react';
import {Button, Input,  Typography, message, Flex} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, CopyOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Paragraph, Text  } = Typography;

interface IDisplayPersonalAccessTokenComponentProps {
    accessToken: string | undefined;
    style?: React.CSSProperties
}

const DisplayPersonalAccessTokenComponent: React.FC<IDisplayPersonalAccessTokenComponentProps>  = ({accessToken, style}) => {

    const handleCopy = async () => {
        await navigator.clipboard.writeText(accessToken || "");
        message.success('Access Token copied!');
    };

    return (
        <Flex vertical={true} style={{ width: '100%', ...style }}>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={accessToken ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                style={{ overflow: 'hidden' }}
            >
                <Paragraph strong>Your new personal access token</Paragraph>
                <Flex vertical={false} justify="flex-start" align={"center"} style={{gap: "10px"}}>
                    <Input.Password
                        variant={"filled"}
                        readOnly
                        value={accessToken}
                        iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                        visibilityToggle={true}
                    />
                    <Button onClick={handleCopy} icon={<CopyOutlined />}>
                        Copy
                    </Button>
                </Flex>

                <Text type="warning">
                    This token is only shown once. Make sure to copy it now — you won't be able to see it again.
                </Text>
            </motion.div>
        </Flex>
    );
};

export default DisplayPersonalAccessTokenComponent;