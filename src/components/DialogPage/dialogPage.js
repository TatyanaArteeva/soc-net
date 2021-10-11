import React, { Component } from 'react';
import {connect} from 'react-redux';
import WithService from '../hoc/hoc';
import './dialogPage.scss';
import { withRouter } from "react-router-dom";
import {outputMessage, deleteMessageFromInputMessageObj} from '../../actions';
import 'moment/locale/ru';
import Moment from 'react-moment';
import Spinner from '../spinner/spinner';
import SpinnerMini from '../spinnerMini/spinnerMini';
import send from './send.svg';
import {  Link } from 'react-router-dom';

const localFormatDateByVersionLibMomentReact='lll'


class DialogPage extends Component{
    _cleanupFunction=false;
    constructor(props){
        super(props);
        this.state={
            idFriends: '',
            firstNameFriends: '',
            lastNameFriends: '',
            photoFriends: '',
            allAndOutputMessage: [],
            newMessage: '',
            inputMessage: '',
            heightList: '',
            req: false,
            date: '',
            firstNameUser: '',
            lastNameUser: '', 
            totalSizeMessage: '',
            spinner: true,
            spinnerMini: false,
            oneRequest:false
        }

        this.refListMessage=React.createRef();
        let start=0;
        let end=50;

        const idFriends=localStorage.getItem('idForDialogFriends');
        const idUser=localStorage.getItem('idUser');

        const {Service}=this.props;

        this.getInfoUsers=()=>{
            Service.getAccountInfo(`/api/account/${idFriends}/page-info`)
                .then(res=>{
                    if(res.status===200){
                        this.setState({
                            firstNameFriends: res.data.account.firstName,
                            lastNameFriends:  res.data.account.lastName
                        })
                    }
                })
            Service.getAccountPhoto(`/api/account/${idFriends}/photo`, {
                responseType: 'arraybuffer'
                })
                .then(res=>{
                    let photo=Buffer.from(res.data, 'binary').toString('base64');
                    const newFormatPhoto="data:image/jpg;base64," + photo;
                    this.setState({
                        photoFriends: newFormatPhoto
                    })
                })
            Service.getAccountInfo(`/api/account/${idUser}/page-info`)
                .then(res=>{
                    if(res.status===200){
                        this.setState({
                            firstNameUser: res.data.account.firstName,
                            lastNameUser: res.data.account.lastName
                        })
                    }
                })
        }

        this.getOldMessages=()=>{
            const objDataForMessages={
                end: end,
                start: start,
                startLoadTime: this.state.date,
                targetAccountId: idFriends
            }
            Service.getMessageAll('/api/message/get-private-messages', objDataForMessages)
                .then(res=>{
                    if(res.status===200){
                        const arrReverse=res.data.messages.reverse();
                        this.setState({
                            allAndOutputMessage:  arrReverse,
                            totalSizeMessage: res.data.totalSize,
                            spinner:false,
                            oneRequest:true
                        })
                    }
                    
                })
        }

        this.componentDidMount=()=>{
            this._cleanupFunction=true;
            const date=new Date().toISOString();
            this.setState({
                idFriends: idFriends,
                date: date
            },()=>{
                this.getInfoUsers();
                this.getOldMessages();
            })
        }

        this.goToPageFriends=()=>{
            this.props.history.push(this.state.idFriends)
        }

        this.postMessage=(e)=>{
            e.preventDefault();
            const OneInvalidSymbol = ' ';
    
            const oneCheck = this.state.newMessage.indexOf(OneInvalidSymbol);
    
            if(this.state.newMessage.length>0){
                if(oneCheck!==0){
                    const sendDate=new Date().toISOString()
    
                    const outputMessage= {
                        content: this.state.newMessage,
                        sourceId: this.props.id,
                        destinationId: this.state.idFriends,
                        sendDate: sendDate
                    }
    
                    Service.postMessage('/api/message/sendMessage', outputMessage)
                        .then(res=>{
                            if(res.status===200){
                                console.log("послали сообщение")
                                this.setState({
                                    newMessage: '',
                                    allAndOutputMessage:[...this.state.allAndOutputMessage, res.data]
                                },()=>{
                                    const windowMessage=document.querySelector('.dialog__list__wrapper');
                                    windowMessage.scrollTop = windowMessage.scrollHeight;
                                })
                                
                            }
                        })
                }
            }
        }

        this.valueMessage=(e)=>{
            this.setState({
                newMessage: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
            })
        }

        this.componentDidUpdate=()=>{
            const heightList=this.refListMessage.current.scrollHeight;
            const windowMessage=document.querySelector('.dialog__list__wrapper');

                if(this.state.oneRequest){
                    console.log("зашли в условие", this.state.oneRequest, this.props.inputMessage.length)
                    windowMessage.scrollTop = windowMessage.scrollHeight;
                }
                if(this.props.inputMessage.length>0){
                    this.props.inputMessage.forEach(el=>{
                        if(el.sourceId===this.state.idFriends){
                            console.log(el.sourceId, this.state.idFriends)
                            windowMessage.scrollTop = windowMessage.scrollHeight;
                        }
                    })
                }

                this.props.inputMessage.map(el=>{
                    if(el.sourceId===localStorage.getItem("idForDialogFriends")){
                        this.props.deleteMessageFromInputMessageObj(el)
                        let scrollInBottom=false;
                        if(heightList===(windowMessage.scrollTop+windowMessage.clientHeight)){
                            scrollInBottom=true;
                        }
                        this.setState({
                            allAndOutputMessage: [...this.state.allAndOutputMessage, el]
                        },()=>{
                            if (scrollInBottom) {
                                windowMessage.scrollTop = windowMessage.scrollHeight;
                                Service.postMessageRead('/api/message/acceptMessages', [el.id])
                                    .then(res=>{
                                        console.log(res)
                                        console.log("элемент принят и прочитан")
                                    })
                            }
                        })
                    }
                })

            windowMessage.addEventListener('scroll', ()=>{

                if((windowMessage.scrollTop)<= heightList/100*95 && !this.state.req){
                    if(this.state.oneRequest){
                        console.log("условие для фолс")
                        this.setState({
                            oneRequest:false
                        })
                    }
                }

                if((windowMessage.scrollTop)<= heightList/100*20 && !this.state.req){

                    start=end;
                    end=end+50;

                    if(start===this.state.totalSizeMessage){
                        return
                    }

                    if(start>this.state.totalSizeMessage){
                        return
                    }

                    
                    if(end>this.state.totalSizeMessage){
                        end=this.state.totalSizeMessage
                    }

                    if(this._cleanupFunction){
                        this.setState({
                            req: true,
                            spinnerMini: true
                        },()=>{
                            const objDataForMessages={
                                end: end,
                                start: start,
                                startLoadTime: this.state.date,
                                targetAccountId: idFriends
                            }
                            Service.getMessageAll('/api/message/get-private-messages', objDataForMessages)
                                .then(res=>{
                                    console.log("подгружаем новый контент")
                                    if(res.status===200 && this._cleanupFunction){
                                        const arrReverse=res.data.messages.reverse();
                                        this.setState({
                                            allAndOutputMessage:  [...arrReverse ,...this.state.allAndOutputMessage],
                                            req: false,
                                            spinnerMini: false,
                                        })
                                    }
                                })
                        })
                    }

                }
            })
        }

        this.keyPressEnter=(e)=>{
            if(e.key==='Enter'){
                this.postMessage(e)
            }
                
        }

        this.keyDown=(e)=>{
            if(e.key==='Enter' && e.ctrlKey===true){
                this.setState({
                    newMessage: this.state.newMessage + "\r\n"
                })
            }
        }

        this.componentWillUnmount=()=>{
            this._cleanupFunction=false
        }


    }

    render(){

        console.log(this.state.oneRequest)

        const linkToFriendPage=`/${this.state.idFriends}`;
        const linkToMyPage=`/${this.props.id}`;

        const messages= this.state.allAndOutputMessage.map(el=>{
                            const dateMilliseconds=new Date(el.sendDate).getTime();
                            const timeZone=new Date(el.sendDate).getTimezoneOffset()*60*1000;
                            const currentDateMilliseconds=dateMilliseconds-(timeZone);
                            const currentDate=new Date(currentDateMilliseconds);
                            let classMessage="dialog__list__wrapper__list__user";
                            let nameUser=<Link to={linkToMyPage}><span className="dialog__list__wrapper__list__user_name">{this.state.firstNameUser} {this.state.lastNameUser}</span></Link>
                            if(el.destinationId===this.props.id){
                                classMessage="dialog__list__wrapper__list__friend"
                                nameUser=<Link to={linkToFriendPage}><span className="dialog__list__wrapper__list__friend_name">{this.state.firstNameFriends} {this.state.lastNameFriends}</span></Link>
                            }

                            return  <li key={el.id} className={classMessage}>
                                            <div className="dialog__list__wrapper__list__content">
                                                {nameUser}
                                            </div>
                                            <div className="dialog__list__wrapper__list__content_message">
                                                {el.content}
                                            </div>
                                            <span className="dialog__list__wrapper__list__content_time">
                                                    <Moment locale="ru"
                                                            date={currentDate}
                                                            format={localFormatDateByVersionLibMomentReact}
                                                            
                                                    />
                                            </span>
                                    </li>
                        })


        const content=this.state.spinner? <Spinner/>: messages

        const miniSpinner=this.state.spinnerMini ? <SpinnerMini/> : null;
        
        return(
            <div className="dialog">
                <div className="dialog__header" onClick={this.goToPageFriends}>
                    <div className="dialog__header__content">
                        <Link to={linkToFriendPage}>
                            <div className="dialog__header__content__wrapper">
                                <img src={this.state.photoFriends} alt="photoFriends" className="dialog__header__content_img"/>
                                <span className="dialog__header__content_name">{this.state.firstNameFriends} {this.state.lastNameFriends}</span>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="dialog__list"> 
                    <div ref={this.refListMessage} className="dialog__list__wrapper">
                        <ul className="dialog__list__wrapper__list">
                            {miniSpinner}
                            {
                            content
                            }
                        </ul>
                    </div>
                </div>
                <div className="dialog__form-message" onKeyPress={this.keyPressEnter} onKeyDown={this.keyDown}>
                        <textarea   className="dialog__form-message_input" 
                                    type="text" placeholder="Введите текст сообщения" 
                                    value={this.state.newMessage}
                                    required
                                    onChange={this.valueMessage}/>
                        <div className="dialog__form-message_send" onClick={this.postMessage}>
                            <img src={send} alt="send"/>
                        </div>
                </div>
            </div>
        )
    }

   
}

const mapStateToProps=(state)=>{
    return{
        id: state.userId,
        idForDialogFriends: state.idForDialogFriends,
        inputMessage:state.inputMessageObj,
    }
}

const mapDispatchToProps={
    outputMessage,
    deleteMessageFromInputMessageObj
}

export default withRouter(WithService()(connect(mapStateToProps, mapDispatchToProps)(DialogPage)));