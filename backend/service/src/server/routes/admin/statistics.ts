//@ts-nocheck

import express from "express";
import {Statistics} from "../../../models/api/statistics/Statistics.ts";
import {User} from "../../../models/db/User.ts";
import {TimeLineHistory} from "../../../models/api/statistics/TimeLineHistory.ts";
import {DeletedUserStatisticModel} from "../../../models/db/settings/DeletedUserStatistic.ts";
import {Blacklist} from "../../../models/db/Blacklist.ts";
import {FailedLoginAttemptsModel} from "../../../models/db/settings/LoginStatistic.ts";
import {SecurityStatistics} from "../../../models/api/statistics/SecurityStatistics.ts";
import {Role} from "../../../models/db/Roles.ts";
import {RoleStatistic} from "../../../models/api/statistics/RoleStatistic.ts";

const router = express.Router();

router.get(
    '/',
    async (req, res, next) => {
        try {
            //@ts-ignore
            const totalUserNumber = await User.countDocuments({});

            const newUserStatistic = await getNewUserStatisticResults();
            const deletedUserStatistic = await getDeletedUserStatisticResults();
            const lastLoginStatistic = await getLastLoginStatistics();
            const failedLoginAttemptsStatistic = await getFailedLoginAttempts();
            const usersPerRoleStatistics = await getUserByRole();

            const blockedEmails = await Blacklist.countDocuments({email: {$exists: true}});
            const blockedIPs = await Blacklist.countDocuments({ip: {$exists: true}});

            const statistics = new Statistics(totalUserNumber, newUserStatistic, deletedUserStatistic, lastLoginStatistic, usersPerRoleStatistics, failedLoginAttemptsStatistic, new SecurityStatistics(blockedEmails, blockedIPs));

            return res.json(statistics);
        } catch (e) {
            next(e);
        }
    }
);

const getUserByRole = async() => {
    const roles = await Role.find().lean();

    const newUserRoleStatisticResults = await Promise.all(
        roles.map(async (role) => {
            const userPerRole = await User.countDocuments({role: role.name})
            return new RoleStatistic(role.name, userPerRole);
        })
    )
    return newUserRoleStatisticResults;
}

const getNewUserStatisticResults = async() => {
    const newUserStatisticResults = await Promise.all([
        User.countDocuments({createdAt: {$gte: getDaysAgoAsDate(7), $lte: Date.now()}}),
        User.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(1), $lte: Date.now()}}),
        User.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(3), $lte: Date.now()}}),
        User.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(6), $lte: Date.now()}}),
        User.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(12), $lte: Date.now()}})
    ])
    return new TimeLineHistory(newUserStatisticResults[0], newUserStatisticResults[1], newUserStatisticResults[2], newUserStatisticResults[3], newUserStatisticResults[4]);
}

const getDeletedUserStatisticResults = async() => {
    const deletedUserStatisticResults = await Promise.all([
        DeletedUserStatisticModel.countDocuments({createdAt: {$gte: getDaysAgoAsDate(7), $lte: Date.now()}}),
        DeletedUserStatisticModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(1), $lte: Date.now()}}),
        DeletedUserStatisticModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(3), $lte: Date.now()}}),
        DeletedUserStatisticModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(6), $lte: Date.now()}}),
        DeletedUserStatisticModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(12), $lte: Date.now()}})
    ])
    return new TimeLineHistory(deletedUserStatisticResults[0], deletedUserStatisticResults[1], deletedUserStatisticResults[2], deletedUserStatisticResults[3], deletedUserStatisticResults[4]);
}

const getLastLoginStatistics = async() => {
    const lastLoginStatisticResults = await Promise.all([
        User.countDocuments({lastLogin: {$gte: getDaysAgoAsDate(7), $lte: Date.now()}}),
        User.countDocuments({lastLogin: {$gte: getMonthsAgoAsDate(1), $lte: Date.now()}}),
        User.countDocuments({lastLogin: {$gte: getMonthsAgoAsDate(3), $lte: Date.now()}}),
        User.countDocuments({lastLogin: {$gte: getMonthsAgoAsDate(6), $lte: Date.now()}}),
        User.countDocuments({lastLogin: {$gte: getMonthsAgoAsDate(12), $lte: Date.now()}})
    ])
    return new TimeLineHistory(lastLoginStatisticResults[0], lastLoginStatisticResults[1], lastLoginStatisticResults[2], lastLoginStatisticResults[3], lastLoginStatisticResults[4]);
}


const getFailedLoginAttempts = async() => {
    const failedLoginAttemptsStatisticResults = await Promise.all([
        FailedLoginAttemptsModel.countDocuments({createdAt: {$gte: getDaysAgoAsDate(7), $lte: Date.now()}}),
        FailedLoginAttemptsModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(1), $lte: Date.now()}}),
        FailedLoginAttemptsModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(3), $lte: Date.now()}}),
        FailedLoginAttemptsModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(6), $lte: Date.now()}}),
        FailedLoginAttemptsModel.countDocuments({createdAt: {$gte: getMonthsAgoAsDate(12), $lte: Date.now()}})
    ])
    return new TimeLineHistory(failedLoginAttemptsStatisticResults[0], failedLoginAttemptsStatisticResults[1], failedLoginAttemptsStatisticResults[2], failedLoginAttemptsStatisticResults[3], failedLoginAttemptsStatisticResults[4]);
}

const getDaysAgoAsDate = (daysAgo: number) => {
    let date = new Date();
    date.setDate(date.getDate() - Math.abs(1));
    return date;
}

const getMonthsAgoAsDate = (monthsAgo: number) => {
    let date = new Date();

    let month = date.getMonth();
    if (month < monthsAgo - 1) {
        month = 0;
    } else {
        month = month - monthsAgo;
    }

    date.setMonth(month);
    date.setHours(0, 0, 0, 0);
    return date;
}

export {
    router
}