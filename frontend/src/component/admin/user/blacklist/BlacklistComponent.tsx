import "./BlacklistComponent.css"

import {useEffect, useState} from 'react';
import {Button, message, Space, Table, TableProps, Tooltip} from 'antd';
import Search from "antd/es/input/Search";
import {AdminService} from "../../../../api/AdminService.tsx";
import {BlackListItem} from "../../../../models/blacklist/BlackListItem.ts";
import CardHeader from "../../../common/CardHeader.tsx";
import {TbLockPlus} from "react-icons/tb";
import AddToBlacklistModal from "./AddToBlacklistModal.tsx";
import {NotificationHandler} from "../../../../util/NotificationHandler.tsx";

const BlackListComponent = () => {
    const [blackListItems, setBlackListItems] = useState<Array<BlackListItem>>([]);
    const [searching, isSearching] = useState(false);
    const [loading, isLoading] = useState(false);
    const [openAddToBlacklistModal, setOpenAddToBlacklistModal] = useState(false)

    const columns: TableProps<BlackListItem>['columns'] = [
        {
            title: 'E-Mail',
            dataIndex: 'email',
            key: 'email',
            sorter: function (a, b) {
                if(!a.email || !b.email) return 0;
                return a.email.localeCompare(b?.email)
            }
        },
        {
            title: 'IP-Address',
            dataIndex: 'ip',
            key: 'ip'
        },
        {
            title: 'Blocked at',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => {
                return createdAt.toLocaleString()
            },
            sorter: function (a, b) {
                if(!a.createdAt || !b.createdAt) return 0;
                return a.createdAt.getTime() - b.createdAt.getTime()
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, item) => (
                <Space size="middle">
                    <Button type={"link"} onClick={() => handleDeleteBlacklistItem(item)}>Remove</Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        loadBlacklist();
    }, [])

    const loadBlacklist = async (searchValue: string = "") => {
        try {
            isLoading(true);

            const blackListItems = await AdminService.Blacklist.getAllBlacklistItems(searchValue);
            setBlackListItems(blackListItems);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isLoading(false)
        }
    }

    const handleDeleteBlacklistItem = async (item: BlackListItem) => {
        try {
            isLoading(true);

            if (item.ip) {
                await AdminService.Blacklist.unblockIP(item.ip);
            }

            if (item.email) {
                await AdminService.Blacklist.unblockEmail(item.email);
            }

            await loadBlacklist();
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isLoading(false)
        }
    }

    //@ts-ignore
    const onSearch = async (value) => {
        try {
            isSearching(true)
            await loadBlacklist(value);
        } catch (e) {
            message.error((e as Error).message)
        } finally {
            isSearching(false)
        }
    }


    return (
        <div className={"black_list"}>
            <CardHeader title={"Blocked E-Mail- / IP-Addresses"} actions={
                <Tooltip title={"Add new E-Mail- or IP-Address to the blacklist."} placement={"left"}>
                    <Button size={"large"} type={"text"} icon={<TbLockPlus/>}
                            onClick={() => setOpenAddToBlacklistModal(true)}></Button>
                </Tooltip>
            }/>
            <Search className={"black_list_searchbar"} placeholder={"Enter an e-mail address..."} onSearch={onSearch}
                    enterButton
                    allowClear loading={searching} disabled={loading}/>
            <Table columns={columns} dataSource={blackListItems}
                   pagination={{total: blackListItems.length}}
                   loading={loading}
                   bordered={true}
            />
            <AddToBlacklistModal open={openAddToBlacklistModal} onClose={() => setOpenAddToBlacklistModal(false)}
                                 onAddedToBlacklist={() => loadBlacklist()}/>
        </div>
    );
};

export default BlackListComponent;
