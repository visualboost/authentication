import "./UserListComponent.css"

import {useEffect, useState} from 'react';
import {Button, Input, message, Select, Space, Table, TableProps, Tag, Tooltip} from 'antd';
import {UserListItem} from "../../../models/user/UserListItem.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import {AdminService, UserFilterParams} from "../../../api/AdminService.tsx";
import {Routes} from "../../../models/Routes.tsx";
import StateComponent from "./StateComponent.tsx";
import {UserSearchCriterias} from "../../../models/user/UserSearchCriterias.ts";
import {IoIosRefresh} from "react-icons/io";
import {SearchOutlined} from "@ant-design/icons";
import {NotificationHandler} from "../../../util/NotificationHandler.tsx";
import AdminDetailSectionComponent from "../AdminDetailSectionComponent.tsx";
import {useLoader} from "../../common/LoaderProvider.tsx";

const FilterOptions = [
    {
        value: UserSearchCriterias.USERNAME,
        label: 'Name',
    },
    {
        value: UserSearchCriterias.EMAIL,
        label: 'E-Mail',
    }
]

const UserListComponent = () => {
    const navigate = useNavigate();
    const [searchParams, setUrlSearchParams] = useSearchParams();

    const [users, setUsers] = useState<Array<UserListItem>>([]);
    const [searching, isSearching] = useState(false);
    const {loading, showProgress, hideProgress} = useLoader();

    const [searchFilterCriteria, setSearchFilterCriteria] = useState(UserSearchCriterias.USERNAME);
    const [searchInputPlaceholder, setSearchInputPlaceholder] = useState("Enter a username");
    const [searchValue, setSearchValue] = useState<string | null>(null);

    const columns: TableProps<UserListItem>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'username',
            key: 'username',
            sorter: function (a, b) {
                return a.username.localeCompare(b.username)
            }
        },
        {
            title: 'E-Mail',
            dataIndex: 'email',
            key: 'email',
            //@ts-ignore
            sorter: function (a, b) {
                return a.email.localeCompare(b.email)
            }
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
            render: (state) => {
                return <StateComponent state={parseInt(state)}/>
            },
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                return <Tag color="default">{role}</Tag>
            },
            sorter: function (a, b) {
                return a.role.localeCompare(b.role)
            }
        },
        {
            title: 'Created at',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => {
                return createdAt.toLocaleString()
            },
            sorter: function (a, b) {
                return a.createdAt.getTime() - b.createdAt.getTime()
            }
        },
        {
            title: 'Last login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (lastLogin) => {
                return lastLogin.toLocaleString()
            },
            sorter: function (a, b) {
                return a.lastLogin.getTime() - b.lastLogin.getTime()
            }
        }
    ];

    useEffect(() => {
        const reload = searchParams.has('reload');
        if (reload) {
            setUrlSearchParams([])
        }

        const fetchUser = reload;
        loadUser(null, fetchUser);
    }, [])

    const loadUser = async (searchValue: UserFilterParams | null = null, forceReload: boolean = false) => {
        try {
            showProgress();

            const users = await AdminService.User.getAllUser(searchValue, forceReload);
            setUsers(users);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const refreshUserList = async () => {
        setSearchValue(null);
        await loadUser(null, true);
    }

    const onEnterSearchValue = (value: string) => {
        if (value === "") {
            setSearchValue(null)
        } else {
            setSearchValue(value)
        }
    }

    const onSearch = async () => {
        try {
            isSearching(true)

            let search = null;
            if (searchValue) {
                search = {
                    value: searchValue,
                    type: searchFilterCriteria
                }
                await loadUser(search, true);
            } else {
                await loadUser(search);
            }
        } catch (e) {
            message.error((e as Error).message)
        } finally {
            isSearching(false)
        }
    }

    const onRowClicked = (item: UserListItem) => {
        navigate(Routes.getUserDetailPath(item.id));
    }

    const handleFilterSelect = (value: UserSearchCriterias) => {
        setSearchFilterCriteria(value);

        if (value === UserSearchCriterias.EMAIL) {
            setSearchInputPlaceholder("Enter an e-mail address...")
        } else if (value === UserSearchCriterias.USERNAME) {
            setSearchInputPlaceholder("Enter an username...")
        }
    }

    return (
        <AdminDetailSectionComponent enableLoading={false}>
            <div className={"user_list"}>
                <div className={"user_list_searchbar_parent"}>
                    <Space direction={"horizontal"} className={"user_list_searchbar"}>
                        <Space.Compact style={{width: '100%'}}>
                            <Select className={"user_list_searchbar_select"} defaultValue={searchFilterCriteria}
                                    options={FilterOptions} onChange={handleFilterSelect}/>
                            <Input className={"user_list_searchbar_input"} placeholder={searchInputPlaceholder}
                                   allowClear
                                   onChange={(e) => onEnterSearchValue(e.target.value)} value={searchValue || ""}
                                   onPressEnter={onSearch}/>
                            <Button className={"user_list_searchbar_btn"} type="primary" icon={<SearchOutlined/>}
                                    loading={searching} onClick={onSearch}/>
                        </Space.Compact>
                    </Space>

                    <Tooltip title={"Reload"} placement={"bottom"}>
                        <Button type={"primary"} icon={<IoIosRefresh style={{fontSize: '20px'}}/>}
                                className={"user_list_refresh_btn"} onClick={refreshUserList}/>
                    </Tooltip>
                </div>

                <Table columns={columns} dataSource={users}
                       onRow={(record) => {
                           return {
                               onClick: () => {
                                   onRowClicked(record)
                               },
                           };
                       }}
                       pagination={{showSizeChanger: true}}
                       loading={loading}/>
            </div>
        </AdminDetailSectionComponent>
    );
};

export default UserListComponent;
