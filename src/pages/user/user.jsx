import React, { Component } from 'react'
import { Card, Button, Table, Modal, message } from 'antd'

import { formateDate } from '../../utils/dateUtils'
import { PAGE_SIZE } from '../../utils/constants'
import LinkButton from '../../components/link-button';
import { reqUsers, reqDeleteUsers, reqAddorUpdateUser } from '../../api';
import { async } from 'q';
import UserForm from './user-form';
/*
首页路由
*/
export default class User extends Component {
    state = {
        users: [], //所有用户列表
        roles: [],  //所有角色的列表
        isShow: false  //是否显示确认框
    }

    initColumns = () => {
        this.columns = [
            {
                title: '用户名',
                dataIndex: 'username'
            },
            {
                title: '邮箱',
                dataIndex: 'email'
            },
            {
                title: '电话',
                dataIndex: 'phone'
            },

            {
                title: '注册时间',
                dataIndex: 'create_time',
                render: formateDate
            },
            {
                title: '所属角色',
                dataIndex: 'role_id',
                render: (role_id) => this.roleNames[role_id]
            },
            {
                title: '操作',
                render: (user) => (
                    <span>
                        <LinkButton onClick={() => this.showUpdate(user)}>修改</LinkButton>
                        <LinkButton onClick={() => this.deleteUser(user)}>删除</LinkButton>
                    </span>
                )
            },

        ]
    }

    //根据 role的数组，生成包含所有角色名的对象（属性名用角色 id 值）
    initRoleNames = (roles) => {
        const roleNames = roles.reduce((pre, role) => {
            pre[role._id] = role.name
            return pre
        }, {})
        this.roleNames = roleNames
    }
    //显示添加界面
    showAdd=()=>{
        this.user=null  //清除 user 数据
        this.setState({isShow:true})
    }

    //更新用户
    showUpdate=(user)=>{
        this.user=user
        this.setState({ isShow: true })
    }

    //删除指定用户
    deleteUser = (user) => {
        Modal.confirm({
            title: `确认删除${user.username}吗？`,
            onOk: async () => {
                const result = await reqDeleteUsers(user._id)
                if (result.status === 0) {
                    message.success('删除用户成功！')
                    this.getUsers()
                }
            }
        })
    }

    //添加或者更新用户
    addOrUpdateUser =async () => {
        this.setState({isShow:false})
        //1.收集输入数据
        const user = this.form.getFieldsValue()
        //输入框数据清除
        this.form.resetFields()
        //如果是更新，需要给 user 指定 _id 属性
        if(this.user){
           user._id=this.user._id
        }

        //2.提交添加的请求
        const result = await reqAddorUpdateUser(user)
        //3.更新列表显示
        if (result.status === 0) {
            message.success(`${this.user?'修改':'添加'}用户成功`)
            this.getUsers()
        }
    }

    //获取用户列表
    getUsers = async () => {
        const result = await reqUsers()
        if (result.status === 0) {
            const { users, roles } = result.data
            this.initRoleNames(roles)
            this.setState({
                users,
                roles
            })
        }
    }
    componentWillMount() {
        this.initColumns()
    }
    componentDidMount() {
        this.getUsers()
    }

    render() {
        const title = <Button type='primary' onClick={this.showAdd}>创建用户</Button>
        const user=this.user||{}

        const { users, isShow, roles } = this.state
        return (
            <Card title={title}>
                <Table
                    bordered
                    rowKey='_id'
                    dataSource={users}
                    columns={this.columns}
                    pagination={{ defaultPageSize: PAGE_SIZE }}
                />

                <Modal
                    title={user._id ? '修改用户': '添加用户'}
                    visible={isShow}
                    onOk={this.addOrUpdateUser}
                    onCancel={() => {
                        this.form.resetField()
                        this.setState({ isShow: false })
                    }}
                >
                    < UserForm
                        setForm={form => this.form = form}
                        roles={roles}
                        user={user}
                    />
                </Modal>

            </Card>
        )
    }
}
