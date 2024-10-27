import "./AdminComponent.css";

import {useState} from 'react';
import {Button, Card, Layout, Menu} from 'antd';
import {LogoutOutlined, SettingOutlined, UserOutlined,} from '@ant-design/icons';
import {FaArrowLeft} from "react-icons/fa6";
import {FaArrowRight} from "react-icons/fa";
import {Outlet, useNavigate} from "react-router-dom";
import {Routes} from "../../models/Routes.tsx";
import {IoPeople, IoPersonAdd} from "react-icons/io5";
import {MdBlock, MdOutlineAddModerator, MdOutlineSecurity} from "react-icons/md";
import {AiFillSecurityScan} from "react-icons/ai";
import {TbLayoutDashboardFilled} from "react-icons/tb";
import {AuthenticationService} from "../../api/AuthenticationService.tsx";

const {Content, Sider} = Layout;

const AdminComponent = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenuKey, setSelectedMenuKey] = useState("dashboard");

    const handleMenuClick = (key: string) => {
        setSelectedMenuKey(key);

        if (key === 'dashboard') {
            navigate(Routes.Admin.Dashboard.ROOT)
        } else if (key === 'user_overview') {
            navigate(Routes.getUserListPath(false))
        } else if (key === 'user_create') {
            navigate(Routes.Admin.UserSection.CREATE)
        } else if (key === 'roles_overview') {
            navigate(Routes.Admin.RoleSection.LIST)
        } else if (key === 'role_create') {
            navigate(Routes.Admin.RoleSection.CREATE)
        } else if (key === 'blacklist') {
            navigate(Routes.Admin.UserSection.BLACKLIST)
        } else if (key === 'settings_admin') {
            navigate(Routes.Admin.Settings.OVERVIEW)
        } else if (key === 'settings_credentials') {
            navigate(Routes.Admin.Settings.CREDENTIALS)
        }
    };

    const handleLogout = async () => {
        await AuthenticationService.logout();
        navigate(Routes.ROOT)
    };

    const items = [
        {
            key: 'dashboard',
            icon: <TbLayoutDashboardFilled/>,
            label: 'Dashboard',
        },
        {
            key: 'user_parent',
            icon: <UserOutlined/>,
            label: 'User',
            children: [
                {
                    key: 'user_overview',
                    label: 'Overview',
                    icon: <IoPeople/>

                },
                {
                    key: 'user_create',
                    label: 'Add User',
                    icon: <IoPersonAdd/>

                },
                {
                    key: 'blacklist',
                    label: 'Blocked',
                    icon: <MdBlock/>

                },
            ],
        },
        {
            key: 'roles_parent',
            icon: <MdOutlineSecurity/>,
            label: 'Roles',
            children: [
                {
                    key: 'roles_overview',
                    label: 'Overview',
                    icon: <AiFillSecurityScan/>

                },
                {
                    key: 'role_create',
                    label: 'Add Role',
                    icon: <MdOutlineAddModerator/>

                },
            ],
        },
        {
            key: 'settings',
            icon: <SettingOutlined/>,
            label: 'Settings',
            children: [
                {
                    key: 'settings_admin',
                    label: 'Admin Settings',
                    icon: <AiFillSecurityScan/>

                },
                {
                    key: 'settings_credentials',
                    label: 'Credentials',
                    icon: <MdOutlineAddModerator/>

                },
            ],
        },
    ];

    return (
        <Layout className={"layout"}>
            <Sider theme={"light"} trigger={null} collapsed={collapsed} collapsible>
                <div className={"menu"}>
                    <div className={"menu_header"}>
                        {collapsed ?
                            <Button type={"text"} className={"collapse_btn"} icon={<FaArrowRight/>}
                                    onClick={() => setCollapsed(false)}/> :
                            <Button type={"text"} className={"collapse_btn"} icon={<FaArrowLeft/>}
                                    onClick={() => setCollapsed(true)}/>
                        }
                        <div
                            className={"menu_title"}
                        >
                            {!collapsed ? "Menu" : ""}
                        </div>
                    </div>

                    <Menu mode="inline"
                          defaultSelectedKeys={[selectedMenuKey]}
                          defaultOpenKeys={["user_parent"]}
                          selectedKeys={[selectedMenuKey]}
                          onSelect={(event => handleMenuClick(event.key))}
                          items={items}/>

                    <Button className={"logout_btn"} icon={<LogoutOutlined/>} onClick={handleLogout}>
                        {collapsed ? "" : "Logout"}
                    </Button>
                </div>
            </Sider>
            <Layout>
                <Content className={"content"}>
                    <Card className={"admin_detail_card"}>
                        <Outlet/>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminComponent;
