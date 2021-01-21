import React, { useEffect, useState } from 'react';
import request from '@pkgs/request';
import LiquCharts from './LiquCharts';
import './style.less';
import { Spin } from 'antd';

interface IUsageStat {
    title: any,
    usageStat: any,
    loading: boolean
}


const UsageStat = (props: IUsageStat) => {
    const [usageData, setUsageData] = useState({} as any);

    const { api } = props.title
    const fetchData = async () => {
        try {
            const dat = await request(`${api}`)
            setUsageData(dat);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        fetchData();
    }, [ props.usageStat?.api])

    const UsageStat = [
        {
            ident: 'zstack', // 3408 多云
            name: '计算',
            children: [
                {
                    name: '弹性云服务器',
                    total: usageData?.instanceTotal,
                    children: [{ used: usageData?.cpuUsed, total: usageData?.cpuTotal, color: ['#81A6FE', '#3370FF'] },
                    { used: usageData?.memUsed, total: usageData?.memTotal, color: ['#FBC969', '#FFAB0A'] },
                    { used: usageData?.volumeUsed, total: usageData?.volumeTotal, color: ['#81A6FE', '#3370FF'] }]
                },
                {
                    name: '裸金属服务器',
                    total: usageData?.baremetalTotal,
                    children: [{ used: usageData?.baremetalCpuUsed, total: usageData?.baremetalCpuTotal, color: ['#F99198', '#FB4E57'] },
                    { used: usageData?.baremetalMemUsed, total: usageData?.baremetalMemTotal, color: ['#81A6FE', '#3370FF'] },
                    { used: usageData?.baremetalVolumeUsed, total: usageData?.baremetalVolumeTotal, color: ['#85DFAA', '#16C45B'] }]
                }],
            api: '/zstack/v1/cmp/dashboard/manager/capacity/used',
        }, {
            ident: 'dstore', // 3398 对象存储
            name: '存储',
            children: [{
                name: '云硬盘',
                total: usageData?.instanceTotal,
                children: [{ used: usageData?.baremetalCpuUsed, total: usageData?.baremetalCpuUsed, color: ['#81A6FE', '#3370FF'] }]
            }, {
                name: '对象存储',
                total: usageData?.instance_running_num,
                children: [{ used: usageData?.disk_used, total: usageData?.disk_capacity, color: ['#FBC969', '#FFAB0A'] }]
            }],
            api: '/api/screen/view/dstore/res'
        }, {
            ident: 'db', // 3400
            name: '数据库',
            children: [{
                name: '数据库MySQL版',
                total: usageData[0]?.instance_running_num,
                children: [{ used: usageData[0]?.cpu_used, total: usageData[0]?.cpu_capacity, color: ['#81A6FE', '#3370FF'] },
                { used: usageData[0]?.mem_used, total: usageData[0]?.mem_capacity, color: ['#FBC969', '#FFAB0A'] },
                { used: usageData[0]?.disk_used, total: usageData[0]?.disk_capacity, color: ['#81A6FE', '#3370FF'] }]
            },
            {
                name: '数据库MongoDB版',
                total: usageData[2]?.instance_running_num,
                children: [{ used: usageData[2]?.cpu_used, total: usageData[2]?.cpu_capacity, color: ['#F99198', '#FB4E57'] },
                { used: usageData[2]?.mem_used, total: usageData[2]?.mem_capacity, color: ['#81A6FE', '#3370FF'] },
                { used: usageData[2]?.disk_used, total: usageData[2]?.disk_capacity, color: ['#85DFAA', '#16C45B'] }]
            },
            {
                name: '数据库Redis版',
                total: usageData[1]?.instance_running_num,
                children: [{ used: usageData[1]?.cpu_used, total: usageData[1]?.cpu_capacity, color: ['#81A6FE', '#3370FF'] },
                { used: usageData[1]?.mem_used, total: usageData[1]?.mem_capacity, color: ['#FBC969', '#FFAB0A'] },
                { used: usageData[1]?.disk_used, total: usageData[1]?.disk_capacity, color: ['#81A6FE', '#3370FF'] }]
            }],
            api: '/api/screen/view/db/res',
        }, {
            ident: 'ccp', // 3402
            name: '容器',
            children: [{
                name: '容器',
                total: usageData?.instance_running_num,
                children: [{ used: usageData?.cpu_used, total: usageData?.cpu_capacity, color: ['#81A6FE', '#3370FF'] },
                { used: usageData?.mem_used, total: usageData?.mem_capacity, color: ['#FBC969', '#FFAB0A'] },
                { used: usageData?.disk_used, total: usageData?.disk_capacity, color: ['#81A6FE', '#3370FF'] }]
            }],
            api: '/api/screen/view/ccp/res',
        },
    ];
    return (<>

        <div>{
            UsageStat.map((item: any) => {
                if (item.api === api) {
                    return <div className='usageStat'>
                        {item.children.map((item: any) => (
                            <div className='usageStat-border'>
                                <div className='usageStat-border-title'>
                                    <p>{item.name}</p>
                                    <p>已使用 <span style={{ color: '#3370FF' }}>{item.total}</span> 台</p>
                                </div>
                                <div className='usageStat-border-liqu'>
                                    {item?.children?.map((item: any) => (
                                        props.loading ? <Spin /> :
                                            <div>
                                                <LiquCharts data={item.used / item.total} color={item?.color} />
                                                <p>已使用：{item.used}核</p>
                                                <p>总量：{item.total}核</p>
                                            </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                }
            })
        }</div>
    </>)
}

export default UsageStat;
