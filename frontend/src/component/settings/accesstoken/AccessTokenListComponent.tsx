import React, {useEffect, useState} from 'react';
import {Button, Input, message, Popconfirm, Table, Tooltip, Typography} from 'antd';
import {DeleteOutlined} from '@ant-design/icons';
import {AccessToken} from '../../../models/accesstoken/AccessToken.ts';
import {AdminService} from '../../../api/AdminService.tsx';
import {NotificationHandler} from '../../../util/NotificationHandler.tsx';
import {useLoader} from '../../common/LoaderProvider.tsx';
import {CookieHandler} from '../../../util/CookieHandler.tsx';
import AdminDetailSectionComponent from "../../admin/AdminDetailSectionComponent.tsx";
import {useNavigate} from "react-router-dom";
import {Routes} from "../../../models/Routes.tsx";
import {IoAddSharp} from "react-icons/io5";

const {Search} = Input;

interface Props {
    onItemClick?: (token: AccessToken) => void;
}

const AccessTokenTableComponent: React.FC<Props> = ({onItemClick}) => {
    const navigate = useNavigate();

    const {showProgress, hideProgress} = useLoader();
    const [accessTokens, setAccessTokens] = useState<AccessToken[]>([]);
    const [filteredTokens, setFilteredTokens] = useState<AccessToken[]>([]);

    const fetchAccessTokens = async () => {
        showProgress();
        try {
            const decodedToken = CookieHandler.getAuthTokenDecoded();
            const userId = decodedToken?.getUserId() as string;
            const tokens = await AdminService.AccessToken.getAccessTokens(userId);
            setAccessTokens(tokens);
            setFilteredTokens(tokens);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    };

    useEffect(() => {
        fetchAccessTokens();
    }, []);

    const handleSearch = (value: string) => {
        const lowerValue = value.toLowerCase();
        const filtered = accessTokens.filter((token) =>
            token.getName().toLowerCase().includes(lowerValue)
        );
        setFilteredTokens(filtered);
    };

    const handleDelete = async (token: AccessToken) => {
        showProgress();
        try {
            await AdminService.AccessToken.deleteAccessToken(token.getID()); // oder token.getId() falls benötigt
            message.success(`Token "${token.getName()}" deleted`);
            await fetchAccessTokens(); // neu laden
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, record: AccessToken) => (
                <Typography.Text>{record.getName()}</Typography.Text>
            ),
            width: '40%'
        },
        {
            title: 'Ablaufdatum',
            dataIndex: 'expiresIn',
            key: 'expiresIn',
            render: (_: any, record: AccessToken) => (
                <span>{record.getExpiresIn().toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h24",
                    weekday: "long"
                })}</span>
            ),
            width: '40%'
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: AccessToken) => (
                <Popconfirm
                    title={`Token "${record.getName()}" wirklich löschen?`}
                    okText="Ja"
                    cancelText="Nein"
                    onConfirm={() => handleDelete(record)}
                >
                    <Button danger icon={<DeleteOutlined/>} type={"primary"} size="middle">
                        Löschen
                    </Button>
                </Popconfirm>
            ),
            width: 50,
            align: 'right' as const
        },
    ];

    return (
        <AdminDetailSectionComponent title={"Access Tokens"} subtitle={"Use personal access tokens to authenticate with our API when traditional login methods are not available."} enableLoading={false} actions={
            <Tooltip title={"New Access Token"} placement={"bottom"}>
                <Button size={"large"} type={"text"} icon={<IoAddSharp />}
                        onClick={() => navigate(Routes.Admin.ACCESSTOKEN.CREATE)
                        }></Button>
            </Tooltip>
        }>
            <Search
                placeholder="Search token"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{marginBottom: 16, width: '100%'}}
                allowClear
            />

            <Table
                rowKey={(record) => record.getName() + record.getExpiresIn().toISOString()}
                columns={columns}
                dataSource={filteredTokens}
                onRow={(record) => ({
                    onClick: () => onItemClick?.(record)
                })}
                pagination={{pageSize: 10}}
            />
        </AdminDetailSectionComponent>
    );
};

export default AccessTokenTableComponent;
