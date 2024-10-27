import "./RoleListComponent.css"

import {useEffect, useState} from 'react';
import {Table, TableProps, Tag} from 'antd';
import {useNavigate} from "react-router-dom";
import {AdminService} from "../../../api/AdminService.tsx";
import {Routes} from "../../../models/Routes.tsx";
import {RoleResponse} from "../../../models/role/RoleResponse.ts";
import {NotificationHandler} from "../../../util/NotificationHandler.tsx";
import {useLoader} from "../../common/LoaderProvider.tsx";
import AdminDetailSectionComponent from "../AdminDetailSectionComponent.tsx";

const UserListComponent = () => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const {loading, showProgress, hideProgress} = useLoader();

    const columns: TableProps<RoleResponse>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: function (a, b) {
                return a.name.localeCompare(b.name)
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => {
                return createdAt.toLocaleString()
            },
            //@ts-ignore
            sorter: function (a, b) {
                return a.createdAt.getTime() - b.createdAt.getTime()
            }
        },
        {
            title: 'Type',
            dataIndex: 'isSystemRole',
            key: 'isSystemRole',
            render: (isSystemRole) => {
                if (isSystemRole) {
                    return <Tag color="success">System</Tag>
                } else {
                    return <Tag color="default">Custom</Tag>
                }
            }
        }
    ];

    useEffect(() => {
        loadRoles();
    }, [])

    const loadRoles = async () => {
        try {
            showProgress();

            const roles = await AdminService.Role.getAllRoles();
            //@ts-ignore
            setRoles(roles);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const onRowClicked = (item: RoleResponse) => {
        navigate(Routes.getRoleDetailPath(item.id));
    }

    return (
        <AdminDetailSectionComponent enableLoading={false}>
            <div className={"role_list"}>
                <Table columns={columns} dataSource={roles}
                       onRow={(record) => {
                           return {
                               onClick: () => {
                                   onRowClicked(record)
                               },
                           };
                       }}
                       pagination={{total: roles.length}}
                       loading={loading}/>
            </div>
        </AdminDetailSectionComponent>
    );
};

export default UserListComponent;
