import React from 'react';
import {Card, Checkbox, Flex, Space, Typography} from 'antd';
import Scope from './Scope';
import {ensureReadScopesForWriteScopes, ensureWriteScopesForReadScopes} from "../../../../util/ScopeUtil.tsx";
import {CheckboxChangeEvent} from "antd/es/checkbox/Checkbox";

const {Text} = Typography;

const scopeDescriptions: Record<string, string> = {
    [Scope.Scopes.READ]: 'Read access to scopes',
    [Scope.Scopes.WRITE]: 'Write access to scopes',
    [Scope.User.READ_MULTIPLE]: 'Read details of multiple users',
    [Scope.User.WRITE]: 'Create and delete user accounts',
    [Scope.User.INVITE]: 'Invite new users',
    [Scope.User.CHANGE_EMAIL]: 'Request new email address for other users',
    [Scope.User.CHANGE_ROLE]: 'Change user role',
    [Scope.Role.READ]: 'Read role details.',
    [Scope.Role.WRITE]: 'Manage user roles',
    [Scope.Blacklist.READ]: 'Get blocked user and IP addresses',
    [Scope.Blacklist.WRITE]: 'Block user or IP address',
    [Scope.Settings.READ]: 'Get settings',
    [Scope.Settings.WRITE]: 'Update settings',
    [Scope.Statistics.READ]: 'Get system statistics',
};

const groupedScopes = {
    "Scope Management": Scope.Scopes.getAllScopes(),
    "User Management": Scope.User.getAllScopes(),
    "Role Management": Scope.Role.getAllScopes(),
    "Blacklist Management": Scope.Blacklist.getAllScopes(),
    "Settings Management": Scope.Settings.getAllScopes(),
    "Statistics Management": Scope.Statistics.getAllScopes(),
};

interface ScopeComponentProps {
    scopes: string[];
    onScopesSelected: (scopes: string[]) => void;
}

const ScopeComponent: React.FC<ScopeComponentProps> = ( {scopes, onScopesSelected}) => {
    const handleOnScopeSelected = (e: CheckboxChangeEvent) => {
        let selectedValues = scopes;

        const selectedValue = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
            selectedValues = [...selectedValues, ...ensureReadScopesForWriteScopes([selectedValue])]
        } else {
            selectedValues = selectedValues.filter(s => !ensureWriteScopesForReadScopes([selectedValue]).includes(s))
        }

        onScopesSelected(selectedValues);
    };

    const renderScopeGroup = (groupName: string, groupScopes: string []) => {
        return <Card title={groupName}>
            <Checkbox.Group
                value={scopes}
                style={{width: '100%', flexDirection: 'column'}}
            >
                {groupScopes.map((scope) => (
                    <div key={scope} style={{marginBottom: '10px'}}>
                        <Checkbox value={scope} onChange={handleOnScopeSelected}>
                            <Text strong style={{padding: '10px'}}>
                                {scope}
                            </Text>
                            <br/>
                            <Text italic style={{padding: '10px'}}>
                                {scopeDescriptions[scope] || 'No description available'}
                            </Text>
                        </Checkbox>
                    </div>
                ))}
            </Checkbox.Group>
        </Card>
    }

    return (
        <Flex vertical>
            <Text style={{marginBottom: '10px'}}>Select the scopes you want to assign (optional):</Text>
            <Space size={20} direction={'vertical'} style={{width: '100%'}}>
                {Object.entries(groupedScopes).map(([groupName, scopes]) => (
                    renderScopeGroup(groupName, scopes)
                ))}
            </Space>
        </Flex>
    );
};

export default ScopeComponent;
