import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import WithService from '../hoc/hoc';
import FriendsAndGroupsList from '../friendsAndGroupsList/friendsAndGroupsList';
import NavigationGroups from '../navigationGroups/navigationGroups';
import allGroups from './allGroups.svg';

class AllGroups extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arr: [],
            idInput: '',
            idExit: '',
            totalSize: ''
        }
    }

    render() {

        const { idInput, idExit, totalSize } = this.state;
        const { history } = this.props;

        return (
            <div>
                <NavigationGroups />
                <FriendsAndGroupsList getItems={(start, end) =>
                    `/api/group/all?start=${start}&end=${end}`
                }
                    arrItems={(items) => {
                        this.setState({
                            arr: [...this.state.arr, ...items.groups]
                        })
                    }}
                    arrItemModification={(item) => {
                        const index = this.state.arr.findIndex(el => {
                            return el.group.id === item.group.id
                        });
                        const newElem = item;
                        const newArrItems = [...this.state.arr.slice(0, index), newElem, ...this.state.arr.slice(index + 1)];
                        this.setState({
                            arr: newArrItems,
                            idInput: '',
                            idExit: ''
                        })
                    }}
                    path={(id) => {
                        history.push(`/groups/${id}`)
                    }
                    }
                    titleItem={(el, funcGoItem, btnAction) => {
                        return el.map(item => {
                            let btnActionGroup = null;
                            let currentStatusGroup = "Создатель группы"
                            let classItem = "friends-and-groups-list__list__item";
                            if (idInput === item.group.id && idInput.length > 0) {
                                classItem = "friends-and-groups-list__list__item_confirmation"
                            }
                            if (idExit === item.group.id && idExit.length > 0) {
                                classItem = "friends-and-groups-list__list__item_warning"
                            }
                            if (item.info.groupRelationStatus === "NONE") {
                                btnActionGroup = <button onClick={() => {
                                    btnAction(item.group.id, "NONE")
                                    this.setState({
                                        idInput: item.group.id
                                    })
                                }}
                                    className="friends-and-groups-list__list__item__content__btns_main"
                                >
                                    Вступить в группу
                                </button>;
                                currentStatusGroup = "Не состоите в группе"
                            }
                            if (item.info.groupRelationStatus === "PARTICIPANT") {
                                btnActionGroup = <button onClick={() => {
                                    btnAction(item.group.id, "PARTICIPANT")
                                    this.setState({
                                        idExit: item.group.id
                                    })
                                }}
                                    className="friends-and-groups-list__list__item__content__btns_danger"
                                >
                                    Выйти из группы
                                </button>;
                                currentStatusGroup = "Состоите в группе"
                            }
                            return (
                                <li key={item.group.id} className={classItem}>
                                    <div onClick={() => funcGoItem(item.group.id)}>
                                        <img
                                            className="friends-and-groups-list__list__item__img"
                                            src={"data:image/jpg;base64," + item.group.photo}
                                            alt="photoGroup"
                                        />
                                    </div>
                                    <div className="friends-and-groups-list__list__item__content">
                                        <span
                                            onClick={() => funcGoItem(item.group.id)}
                                            className="friends-and-groups-list__list__item__content_name">
                                            {item.group.name}
                                        </span>
                                        <div className="friends-and-groups-list__list__item__content_current-status">
                                            <span>
                                                {currentStatusGroup}
                                            </span>
                                        </div>
                                        <div className="friends-and-groups-list__list__item__content__btns">
                                            {btnActionGroup}
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                    }}
                    renderItems={this.state.arr}
                    searchName={"Поиск  из всех групп"}
                    arrItemsSearch={(items) => {
                        this.setState({
                            arr: [...items.groups]
                        })
                    }}
                    messageNotContent={<img
                        src={allGroups}
                        alt="allGroups"
                    />}
                    nameList={"групп"}
                    totalSize={(size) => {
                        this.setState({
                            totalSize: size
                        })
                    }}
                    totalSizeReturn={totalSize}
                />
            </div>
        )
    }
}


export default withRouter(WithService()(AllGroups));