/*
根据老的 state 和指定的 action 生成并返回新的 state 的函数
*/
import { combineReducers } from 'redux'

import storageUtils from '../utils/storageUtils'
import { SET_HEAD_TITLE, RECEIVE_USER,SHOW_ERROR_MSG,RESET_USER } from './action-types'

//用来管理头部标题的 reducer 函数
const initHeadTitle = '首页'

function headTitle(state = initHeadTitle, action) {
    switch (action.type) {
        case SET_HEAD_TITLE:
            return action.data
        default:
            return state
    }
}


//用来管理当前登录用户的 reducer 函数
const initUser = storageUtils.getUser()

function user(state = initUser, action) {
    switch (action.type) {
        case RECEIVE_USER:
            return action.user
        case SHOW_ERROR_MSG:
        const errorMsg=action.errorMsg
            return {...state,errorMsg}
        case RESET_USER:
            return initUser
        default:
            return state
    }
}

//向外默认暴露的是合并产生的总的 reducer 函数
export default combineReducers({
    headTitle,
    user
})

