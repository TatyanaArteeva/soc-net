import React, {useState, useEffect} from 'react';
import './group.scss';
import WithService from '../hoc/hoc';
import { withRouter } from "react-router-dom";
import {connect} from 'react-redux';
import {groupId, groupAccesses, groupInfoRelation, currentIdLocation} from '../../actions';
import {Link, HashRouter} from 'react-router-dom';
import ModalWindowAllParticipantsGroup from '../modalWindowAllParticipantsGpoup/modalWindowAllParticipantsGroup';
import PostsList from '../postsList/postsList';
import Spinner from '../spinner/spinner';

const Group =({Service, idInUrl, groupId, groupAccesses, accesses, groupInfoRelation, infoRelation, currentIdLocation})=>{
    const[nameGroup, setNameGroup]=useState();
    const[themeGroup, setThemeGroup]=useState();
    const[subThemeGroup, setSubThemeGroup]=useState();
    const[descriptionGroup, setDescriptionGroup]=useState();
    const[photoGroup, setPhotoGroup]=useState();
    const[photoNameGroup, setPhotoNameGroup]=useState();
    const[id, setId]=useState();
    const[userInGroup, setUsersInGroup]=useState([]);
    const [totalSizeUserInGroup, setTotalSizeUserInGroup]=useState();
    const [modalWindowAllParticipantsGroup, setModalWindowAllParticipantsGroup]=useState(false);
    const [spinner, setSpinner]=useState(true)
    
    useEffect(()=>{
        let cleanupFunction = false;
            currentIdLocation(idInUrl)
            const information=async () =>{
            try{
                const res=await Service.getGroup(`/api/group/${idInUrl}/page-info`);
                const userGroup=await Service.getUserGroup(`/api/group-relation/get-group-accounts/${idInUrl}?start=0&end=6`);
                    if(!cleanupFunction){
                        groupId(idInUrl)
                        localStorage.setItem('idGroup', idInUrl);
                        if(res.data.group.ownTheme.length>0){
                            setThemeGroup(res.data.group.ownTheme)
                            setSubThemeGroup(res.data.group.subTheme)
                        }else{
                            setThemeGroup(res.data.group.theme)
                            setSubThemeGroup(res.data.group.subTheme)
                        }
                        if(res.data.group.theme.length===0){
                            setThemeGroup("Тематика группы не выбрана")
                        }
                        setNameGroup(res.data.group.name)
                        setSubThemeGroup(res.data.group.subTheme)
                        setDescriptionGroup(res.data.group.description)
                        setPhotoNameGroup(res.data.group.photoName)
                        setId(res.data.group.id)
                        setUsersInGroup(userGroup.data.accounts)
                        setTotalSizeUserInGroup(userGroup.data.totalSize)
                        const newFormatPhoto="data:image/jpg;base64," + res.data.group.photo;
                        setPhotoGroup(newFormatPhoto);
                        groupAccesses(res.data.accesses);
                        groupInfoRelation(res.data.info);  
                        setSpinner(false)
                    }
            }catch(e){
                console.log(e)
            }
             
        }
        information()

        return () => cleanupFunction = true;
        
    },[])

    function addGroups(){
        Service.postAddGroups(`/api/group-relation/join-group/${idInUrl}`)
            .then(res=>{
                if(res.status===200){
                    Service.getGroup(`/api/group/${idInUrl}/page-info`)
                        .then(res=>{
                            groupInfoRelation(res.data.info);
                        })
                    Service.getUserGroup(`/api/group-relation/get-group-accounts/${idInUrl}?start=0&end=6`)
                        .then(res=>{
                            setUsersInGroup(res.data.accounts)
                            setTotalSizeUserInGroup(res.data.totalSize)
                        })
                }
            })
    }

    function exitFromGroup(){
        Service.postAddGroups(`/api/group-relation/leave-group/${idInUrl}`)
            .then(res=>{
                if(res.status===200){
                    Service.getGroup(`/api/group/${idInUrl}/page-info`)
                        .then(res=>{
                            groupInfoRelation(res.data.info);
                        })
                    Service.getUserGroup(`/api/group-relation/get-group-accounts/${idInUrl}?start=0&end=6`)
                        .then(res=>{
                            setUsersInGroup(res.data.accounts)
                            setTotalSizeUserInGroup(res.data.totalSize)
                        })
                }
            })
    }

    function openAllUserGroup(){
        console.log("open")
        setModalWindowAllParticipantsGroup(true);
    }

    function closeAllUserGroup(){
        setModalWindowAllParticipantsGroup(false);
    }

    let modalWindowAllParticipants=null;

    if(modalWindowAllParticipantsGroup===true){
        modalWindowAllParticipants=<div className="group__participants_modal-window">
                                        <div>
                                            <button onClick={closeAllUserGroup}>Закрыть</button>
                                        </div>
                                        <ModalWindowAllParticipantsGroup/>
                                    </div>
    }



    let btnModificationGroup=null;
    let btnActionGroup=null;
    if(accesses.canModify){
        btnModificationGroup=<HashRouter>
                                <Link to="/modificationGroups"><button>Редактировать</button></Link>
                            </HashRouter>
    }

    if(infoRelation.groupRelationStatus==="NONE"){
        btnActionGroup=<button onClick={()=>addGroups()}>Вступить в группу</button>;
    }

    if(infoRelation.groupRelationStatus==="PARTICIPANT"){
        btnActionGroup=<button onClick={()=>exitFromGroup()}>Выйти из группы</button>;
    }

    let postsContent=<div>Вы не состоите в группе! Контент не доступен!</div>
    console.log(infoRelation)
    if(infoRelation.groupRelationStatus==="OWNER" || infoRelation.groupRelationStatus==="PARTICIPANT"){
        postsContent=<PostsList idForPosts={idInUrl} messageOnWallType={"GROUP"}/>
    }

    const groupContent= <>
                             <div className="group_photo">
                                <div className="photo"><img className="photoUser" src={photoGroup}  alt="photoGroup"/></div>
                                {btnActionGroup}
                            </div>
                            <div className="group_information">
                                {btnModificationGroup}
                                <div className="group_name">Название группы: {nameGroup}</div>
                                <div className="group_information_theme">здесь будет тема: {themeGroup}</div>
                                <div className="group_information__subTheme">Здесь будет субтема: {subThemeGroup}</div>
                                <div className="group_information__description">Здесь будет описание: {descriptionGroup}</div>
                                <div className="group_information__admin">Здесь будет администратор группы</div>
                            </div>
                            <div>
                                
                                <div>Участники группы: {totalSizeUserInGroup}
                                    <button onClick={openAllUserGroup}>Показать всех</button>
                                    {modalWindowAllParticipants}
                                </div>
                                <ul className="group_participants">
                                    {
                                        userInGroup.map(el=>{
                                            const imgUser="data:image/jpg;base64," + el.account.photo;
                                            const linkToPageUserGroup=`/${el.account.id}`
                                            return <li key={el.account.id} className="group_participant_item">
                                                            <Link to={linkToPageUserGroup}>
                                                            <img src={imgUser} alt="imgUser" className="group_participant_item__img"/>
                                                            <span>{el.account.firstName} {el.account.lastName}</span>
                                                            </Link>
                                                    </li>
                                                    
                                        })
                                    }
                                </ul>
                            </div>
                        </>

        const content=spinner? <Spinner/>: groupContent;

        return(
            <div>
                <div className="group">
                    {content}
                    <div className="group_publicMessages">
                        Здесь будут новости группы
                        {postsContent}
                    </div>
                </div>
            </div>
        )
    }

const mapStateToProps = (state) => {
    return {
        idGroup: state.groupId,
        accesses: state.groupAccesses,
        infoRelation: state.groupInfoRelation
    }
}

const mapDispatchToProps = {
    groupId,
    groupAccesses, 
    groupInfoRelation,
    currentIdLocation
}


export default withRouter(WithService()(connect(mapStateToProps, mapDispatchToProps)(Group)))