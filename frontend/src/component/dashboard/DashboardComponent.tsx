import React, {useEffect, useState} from 'react';
import {Card, Col, Row, Statistic, Typography} from 'antd';
import {LoginOutlined, UserAddOutlined, UserDeleteOutlined, UserOutlined,} from '@ant-design/icons';
import {BarChart} from '@mui/x-charts/BarChart';
import {AdminService} from "../../api/AdminService.tsx";
import {Statistics} from "../../models/statistics/Statistics.ts";
import {TimeLineHistory} from "../../models/statistics/TimeLineHistory.ts";
import {SecurityStatistics} from "../../models/statistics/SecurityStatistics.ts";
import {RoleStatistic} from "../../models/statistics/RoleStatistic.ts";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {useLoader} from "../common/LoaderProvider.tsx";
import AdminDetailSectionComponent from "../admin/AdminDetailSectionComponent.tsx";

const {Title} = Typography;

const DashboardComponent = () => {
    const {showProgress, hideProgress} = useLoader();
    const [statistics, setStatistics] = useState<Statistics | null>(null);

    const fetchStatistics = async () => {
        showProgress();
        try {
            const statistics = await AdminService.Statistics.getStatistics();
            setStatistics(statistics)
            hideProgress();
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error)
        } finally {
            hideProgress();
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    const StatisticCard = (title: string, value: number, prefix: React.ReactNode, color: string, suffix: React.ReactNode | null = null) => {
        return <Card>
            <Statistic
                title={title}
                value={value}
                prefix={prefix}
                suffix={suffix}
                valueStyle={{color: color}}
            />
        </Card>
    }

    const TotalUserStatisticCard = (value: number | undefined) => {
        return StatisticCard("Total Registered Users", value ? value : 0, <UserOutlined/>, '#000000')
    }

    const NewUserStatisticCard = (title: string, value: number | undefined) => {
        return StatisticCard(title, value ? value : 0, <UserAddOutlined/>, '#3f8600')
    }

    const LeftUserStatisticCard = (title: string, value: number | undefined) => {
        return StatisticCard(title, value ? value : 0, <UserDeleteOutlined/>, '#cf1322')
    }

    const UserActivityStatisticCard = (title: string, value: number | undefined) => {
        return StatisticCard(title, value ? value : 0, <LoginOutlined/>, '#1890ff')
    }

    const TimeLineHistoryChart = (timelineHistory: TimeLineHistory | undefined, description: string, color: string,) => {
        const data = timelineHistory ? [timelineHistory.last7Days, timelineHistory.last30Days, timelineHistory.last3Months, timelineHistory.last6Months, timelineHistory.last12Months] : [0, 0, 0, 0, 0];

        return <BarChart
            series={[
                {data: data}
            ]}
            borderRadius={5}
            height={290}
            xAxis={[{
                data: ['Last 7 days', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last 12 Months'],
                scaleType: 'band',
                label: description,
                labelStyle: {
                    fontSize: 12,
                    fontStyle: 'italic',
                    lineHeight: '40px'
                }

            }]}
            colors={[color]}

        />
    }

    const UserOfRolesChart = (userOfRoles: Array<RoleStatistic> | undefined, color: string) => {
        const sortedUserOrRoles = userOfRoles ? userOfRoles.sort((a, b) => a.role.localeCompare(b.role)) : [];
        const xAxisLabel = sortedUserOrRoles.map(s => s.role);
        const data = sortedUserOrRoles.map(s => s.totalUsers);

        return <BarChart
            series={[
                {data: data}
            ]}
            borderRadius={5}
            height={290}
            xAxis={[{
                data: xAxisLabel,
                scaleType: 'band',
                label: "Total amount of registered users for specified roles",
                labelStyle: {
                    fontSize: 12,
                    fontStyle: 'italic'
                }
            }]}
            colors={[color]}

        />
    }

    const SecurityStatisticsChart = (securityStatistics: SecurityStatistics | undefined, color: string) => {
        const data = securityStatistics ? [securityStatistics.blockedEmails, securityStatistics.blockedIPs] : [0, 0];

        return <BarChart
            series={[
                {data: data}
            ]}
            borderRadius={5}
            height={290}
            xAxis={[{
                data: ['Blocked E-Mails', 'Blocked IP-Addresses'],
                scaleType: 'band',
                label: "Blocked e-mail addresses or ip-addresses",
                labelStyle: {
                    fontSize: 12,
                    fontStyle: 'italic'
                }
            }]}
            colors={[color]}

        />
    }

    return (
        <AdminDetailSectionComponent title={"Dashboard"}>
                <Row gutter={[16, 16]}>
                    <Col flex="25%">
                        {TotalUserStatisticCard(statistics?.totalUsers)}
                    </Col>
                    <Col flex="25%">
                        {UserActivityStatisticCard("Active User (Last 7 days)", statistics?.activeUsers.last7Days)}
                    </Col>
                    <Col flex="25%">
                        {NewUserStatisticCard("New User (Last 7 days)", statistics?.newUsers.last7Days)}
                    </Col>
                    <Col flex="25%">
                        {LeftUserStatisticCard("Users Left (Last 7 days)", statistics?.deletedUsers.last7Days)}
                    </Col>
                </Row>


                <Card style={{margin: '40px 0 0 0'}}>
                    <Title level={3}>User Statistics:</Title>
                    <Row gutter={[16, 16]} style={{marginTop: '0'}}>
                        <Col flex="50%">
                            {TimeLineHistoryChart(statistics?.activeUsers, "Users who have logged in at least once during the specified period", '#1890ff')}
                        </Col>
                        <Col flex="50%">
                            {TimeLineHistoryChart(statistics?.newUsers, "Users who have newly joined during the specified period", '#88bd58')}
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{marginTop: '0'}}>
                        <Col flex="50%">
                            {TimeLineHistoryChart(statistics?.deletedUsers, "Users who were deleted during the specified period.", '#c24c54')}
                        </Col>
                        <Col flex="50%">
                            {UserOfRolesChart(statistics?.userOfRoles, '#7b4cc2')}
                        </Col>
                    </Row>
                </Card>

                <Card style={{margin: '40px 0 0 0'}}>
                    <Title level={3}>Security Statistics:</Title>
                    <Row gutter={[16, 16]} style={{marginTop: '0'}}>
                        <Col flex="50%">
                            <Col flex="50%">
                                {TimeLineHistoryChart(statistics?.failedLoginAttempts, "Login attempt failures during the specified period", '#faad14')}
                            </Col>
                        </Col>
                        <Col flex="50%">
                            <Col flex="50%">
                                {SecurityStatisticsChart(statistics?.securityStatistics, '#faad14')}
                            </Col>
                        </Col>
                    </Row>
                </Card>
        </AdminDetailSectionComponent>
    );
};

export default DashboardComponent;
