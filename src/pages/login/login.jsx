import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { Form, Icon, Input, Button, message } from 'antd'
import { connect } from 'react-redux'

import './login.less'
import logo from '../../assets/images/logo.png'
import { login } from '../../redux/actions'


/*
 登陆的路由组件
*/
class Login extends Component {

    handleSubmit = (event) => {
        //阻止事件的默认行为
        event.preventDefault()

        //对所有的表单字段进行校验  err：存储校验失败的值 ，values:用户名和密码
        this.props.form.validateFields(async (err, values) => {
            //校验成功
            if (!err) {
                // console.log('提交登录的 ajax 请求',values)
                //请求登录
                const { username, password } = values

                //调用分发异步的 action 函数=>发登陆的异步请求,有了结果后 更新状态
                this.props.login(username, password)

            } else {
                console.log('校验失败')
            }
        })

        //得到 form 对象
        // const form = this.props.form
        //获取表单项的输入数据
        // const values = form.getFieldsValue()
    }

    //密码验证
    validatePwd = (rule, value, callback) => {
        if (!value) {
            callback('密码必须输入')
        }
        else if (value.length < 4) {
            callback('密码长度不能小于4')
        }
        else if (value.length > 12) {
            callback('密码长度不能大于12')
        }
        else if (!/^[a-zA-Z0-9_]+$/.test()) {
            callback('密码必须是英文、数字或下划线组成')
        }
        else {
            callback() //验证通过
        }

    }

    render() {

        //如果用户已经登录，自动跳转到管理界面
        const user = this.props.user
        if (user && user._id) {
            return <Redirect to='/home' />
        }

        const errorMsg = this.props.user.errorMsg

        //得到具有强大功能的 form 对象
        const form = this.props.form
        const { getFieldDecorator } = form

        return (
            <div className="login">
                <header className="login-header">
                    <img src={logo} alt="logo" />
                    <h1>React 项目：后台管理系统</h1>
                </header>
                <section className="login-content">
                    <div className={user.errorMsg ? 'error-msg show' : 'error-msg'}>{user.errorMsg}</div> 
                    <h2>用户登录</h2>
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <Form.Item>

                            {
                                /*
                                 用 户 名 / 密 码 的 的 合 法 性 要 求 
                                 1). 必 须 输 入 
                                 2). 必 须 大 于 等 于 4 位 
                                 3). 必 须 小 于 等 于 12 位 
                                 4). 必 须 是 英 文 、 数 字 或 下 划 线 组 成
                                  */
                            }
                            {
                                getFieldDecorator('username', { //配置对象：属性名必须是特定的一些名称
                                    //声明式验证：直接使用别人定义好的验证规则进行验证
                                    rules: [
                                        { required: true, whitespace: true, message: '用户名必须输入' },
                                        { min: 4, message: '用户名至少 4 位' },
                                        { max: 12, message: '用户名最多 12 位' },
                                        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名至必须是英文、数字或下划线组成' }
                                    ],
                                    initialValue: 'dingge' //指定初始值

                                })(
                                    <Input
                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="用户名"
                                    />
                                )

                            }
                        </Form.Item>
                        <Form.Item>
                            {
                                getFieldDecorator('password', {
                                    rules: [
                                        {
                                            validator: this.validatePwd
                                        }
                                    ]
                                })(
                                    <Input
                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="密码"
                                    />
                                )
                            }
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </section>
            </div>
        )
    }
}
/*
1.高阶函数
   1).一类特别的函数
     a.接受函数类型的参数
     b.返回值是函数
   2).常见
     a.定时器：setTimeout()/setInterval
     b.Promise:Promise(()=>{}) then(value=>{},reason=>{})
     c.数组遍历相关的方法：forEach()/filter()/map()/reduce()/find()/findIndex()
     d.函数对象的 bind()
     e.Form.create()()/getFiledDecorator()()
   3).高阶函数更新动态，更加具有拓展性

2.高阶组件
    1).本质就是一个函数
    2).接收一个组件(被包装组件)，返回一个新的组件（包装组件），包装组件会向被包装组件传入特定的属性
    3).作用：拓展组件的功能
    4).高阶组件也是高阶函数：接收一个组件函数，返回是一个新的组件函数
*/
/*
包装 Form 组件生成一个新的组件：Form(Login)
新组件会向 Form 组件传递一个强大的对象属性：form
*/

const WrapLogin = Form.create()(Login)
export default connect(
    state => ({ user: state.user }),
    { login }
)(WrapLogin)

/*
1.前台表单验证
2.收集表单输入数据
*/