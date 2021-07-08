import React, {Component} from 'react';
import "react-image-gallery/styles/scss/image-gallery.scss";
import './myPage.scss';
import {Link, HashRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import DetailedInformationBlock from '../detailedInformationBlock/detailedInformationBlock';
import WithService from '../hoc/hoc';
import { userInformation, photoRights} from '../../actions';
import PhotoUser from '../photoUser/photoUser';
import SliderCarusel from '../sliderCarusel/sliderCarusel';

class MyPage extends Component{
    constructor(props){
        super(props)
        this.refImgGallery=React.createRef();
        this.state={
            btnDetailedInformation: false,
            firstName: '',
            lastName: '',
            birthDate: '',
        }
        const {Service} = this.props;
        
        this.detailedInformation=()=>{
            this.setState(({btnDetailedInformation})=>({
                btnDetailedInformation: !btnDetailedInformation
            }))
        }
        console.log(this.props.id)
        this.recepionInformation=()=>{
            Service.getUserAccountId(this.props.id)
                .then(res=>{
                    if(res.status===200){
                        this.props.userInformation(res.data)
                    }
                }).then(res=>{
                    this.setState({
                    firstName: this.props.information.firstName,
                    lastName: this.props.information.lastName,
                    birthDate: this.props.information.birthDate
                    })
                });
            Service.getAccountInfo(`/api/account/${this.props.id}/page-info`)
                .then(res=>this.props.photoRights(res.data.accesses));
    
        }

        this.componentDidMount=()=>{
            this.recepionInformation()
        }

        
    }

    
    render(){

        const blockDetailedInformation=this.state.btnDetailedInformation? <DetailedInformationBlock/> : null;
        return(
            <div>
                <div className="profile">
                    <div className="profile_photo"><PhotoUser/></div>
                        <div className="profile_information">
                            <HashRouter>
                                <Link to="/modification"><div className="profile_editing">Редактировать</div></Link>
                            </HashRouter>
    
                            <div className="profile_name">Мое имя: {this.state.firstName} {this.state.lastName}</div>
                            <div className="profile_information_title">Основная информация</div>
                            <div className="profile_information__birthday">День рождения: {this.state.birthDate}</div>
                            <button onClick={this.detailedInformation}>Показать подробную информацию</button>
                            {blockDetailedInformation}
                        </div>
                        <div className="profile_photos">
                            Здесь будет карусель для фото
                            <SliderCarusel/>
                        </div>
                        <div className="profile_publicMessages">Здесь будут записи со стены</div>
                </div>
            </div>
        )
    }
}

const mapStateToProps=(state)=>{
    return{
        information: state.userInformation,
        id: state.userId
    }
}

const mapDispatchToProps = {
    userInformation,
    photoRights
}

export default WithService()(connect(mapStateToProps, mapDispatchToProps)(MyPage));