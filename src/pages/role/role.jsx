import React, { Component } from 'react'
import { Card, Button, Table, Modal, message } from 'antd'
import {connect} from 'react-redux'
import { PAGE_SIZE } from '../../utils/constants'
import { reqRoles, reqAddRole ,reqUpdateRole} from '../../api'
import AddForm from './add-form'
import  AuthForm from './auth-form'
import storageUtils from '../../utils/storageUtils'
import { formateDate } from '../../utils/dateUtils'
import {logout} from '../../redux/actions'
import { async } from 'q';
/*
首页路由
*/
 class Role extends Component {
    state = {
        roles: [],//所有角色的列表
        role: {},//选中的 role
        isShowAdd: false , //是否显示添加界面
        isShowAuth:false   //是否显示设置权限界面   
    }

    constructor(props){
        super(props)

        this.auth=React.createRef()
    }


    initColumn = () => {
        this.columns = [
            {
                title: '角色名称',
                dataIndex: 'name'
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (create_time) => formateDate(create_time )
            },
            {
                title: '授权时间',
                dataIndex: 'auth_time',
                render:formateDate
            },
            {
                title: '授权人',
                dataIndex: 'auth_name'
            },
        ]
    }

    getRoles = async () => {
        const result = await reqRoles()
        if (result.status === 0) {
            const roles = result.data
            this.setState({
                roles
            })
        }

    }

    onRow = (role) => {
        return {
            onClick: evevt => {
                this.setState({
                    role
                })
            }
        }
    }

    //添加角色
    addRole = () => {
        //进行表单验证
        this.form.validateFields(async (error, values) => {
            if (!error) {
               //隐藏确认框
               this.setState({
                   isShowAdd:false
               })
                //收集输入数据
                const { roleName } = values
            //    this.form.resetFields()
                
                console.log(roleName)
                //请求添加
                const result = await reqAddRole(roleName)
                console.log("status:"+result.status)
                if(result.status===0){
                      //根据结果显示/更新列表显示
                      message.success('添加角色成功')
                    // this.getRoles()
                       const role=result.data
                    //   //更新 roles 状态
                    //   const roles=[...this.state.roles]
                    //   roles.push(role)
                    //   this.setState({
                    //       roles
                    //   })

                    //更新 roles 状态：基于原状态更新
                  this.setState(state=>({
                      roles:[...state.roles,role]
                  }))


                }else{
                    message.error('添加角色失败')
                }
               
            }
        })

    }
    //更新角色
    updateRole=async ()=>{

        //隐藏确认框
        this.setState({
            isShowAuth: false
        })

        const role=this.state.role
        //得到最新的 menus
       const menus= this.auth.current.getMenus()
       role.menus=menus
       role.auth_name=this.props.user.username 
        //请求更新
       const result=await reqUpdateRole(role)
      if(result.status===0){
          //如果当前更新的是自己角色的权限，强制退出
          if (role._id == this.props.user.role_id){
              this.props.logout()
              message.success('当前用户角色权限修改了，重新登录')
          }else{
              message.success('更新角色权限成功')
              this.setState({
                  roles:[...this.state.roles]
              })
          }
      }
    }

    componentWillMount() {
        this.initColumn()
    }

    componentDidMount() {
        this.getRoles()
    }

  

    render() {
        const { roles, role, isShowAdd ,isShowAuth} = this.state

        const title = (
            <span>
                <Button type="primary" onClick={() => this.setState({ isShowAdd: true })}>创建角色</Button>&nbsp;&nbsp;&nbsp;
                <Button type="primary" disabled={!role._id} onClick={() => this.setState({ isShowAuth: true })}>设置角色权限</Button>
            </span>
        )

        return (
            <Card title={title}>
                <Table
                    bordered
                    rowKey='_id'
                    dataSource={roles}
                    columns={this.columns}
                    pagination={{ defaultPageSize: PAGE_SIZE }}
                    rowSelection={{ 
                        type: 'radio', 
                        selectedRowKeys: [role._id] ,
                        onSelect:(role)=>{  //选择某个 radio 时回调
                            this.setState({
                                role 
                            })
                        }
                    }}
                    onRow={this.onRow}
                />
                <Modal
                    title="添加角色"
                    visible={isShowAdd}
                    onOk={this.addRole}
                    onCancel={() => {
                        this.setState({isShowAdd: false})
                        this.form.resetFields()
                    }}
                >
                    <AddForm
                        setForm={(form) => this.form = form}
                    />
                </Modal>
                <Modal
                    title="设置角色权限"
                    visible={isShowAuth}
                    onOk={this.updateRole}
                    onCancel={() => {
                        this.setState({ isShowAuth: false })
                    }}
                >
                    <AuthForm ref={this.auth} role={role}/>
                </Modal>

            </Card>
        )
    }
}
export default connect(
    state=>({user:state.user}),
    {logout}
)(Role)