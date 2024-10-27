import * as React from 'react';
import {useEffect, useState} from 'react';
import {Select} from 'antd';
import {AdminService} from "../../../api/AdminService.tsx";
import {RoleResponse} from "../../../models/role/RoleResponse.ts";
import {NotificationHandler} from "../../../util/NotificationHandler.tsx";

interface RowSelectComponentProps {
    roleName?: string | null;
    onRoleChanged?: ((role: string) => void) | null;
    style?: React.CSSProperties
}

const RowSelectComponent = (props: RowSelectComponentProps) => {
    const [roles, setRoles] = useState<Array<RoleResponse>>([]);
    const [loading, isLoading] = useState(false);

    useEffect(() => {
        loadRoles();
    }, [])

    const loadRoles = async () => {
        try {
            isLoading(true);

            const roles = await AdminService.Role.getAllRoles();

            //@ts-ignore
            setRoles(roles.filter(role => !role.isAdmin()));
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isLoading(false)
        }
    }

    const handleRoleChanged = (value: string) => {
        if (props.onRoleChanged) {
            props.onRoleChanged(value)
        }
    }

    return (
        <Select
            showSearch
            placeholder="Search to Select"
            optionFilterProp="label"
            style={{width: 200, ...props.style}}
            options={roles.map(role => {
                return {
                    value: role.name,
                    label: role.name
                }
            })}
            value={props.roleName}
            onChange={handleRoleChanged}
            loading={loading}
        />
    );
}

export default RowSelectComponent;