import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import firebase from "firebase";
import { app, base, database, storage } from "../base";
import FirebaseServices from './FirebaseServices'
import { Nav, Navbar, NavItem, NavbarBrand,NavDropdown,MenuItem,Glyphicon ,Modal,Col,Collapse,Row} from "react-bootstrap";
import bayty_icon from '../assets/img/bayty_icon.png';
import {GoSignIn,GoSignOut,GoHome} from 'react-icons/lib/go';
import {MdPersonAdd,MdAddToPhotos,MdEventSeat,MdPersonOutline,MdWeekend} from 'react-icons/lib/md';
import {TiUserAddOutline} from 'react-icons/lib/ti';
import { IndexLinkContainer } from 'react-router-bootstrap';
import styled from 'styled-components'
import logo_placeholder from '../assets/img/logo-placeholder.jpg';
import Homepage from '../assets/img/Unselected-homepage.png';
import Idea from '../assets/img/Unselected-idea.png';
import Product from '../assets/img/UNselected-product.png';
import Profile from '../assets/img/Profile-icon.png';
import Cart from '../assets/img/Cart-icon.png';
import {HeaderCart} from "./MyCart";


const CartNo = styled.div`
position:absolute;
left:15px;
top:5px;
height:15px;
width:15px;
font-size:10px;
color:white;
text-align:center;
background-color:red;
border-radius: 50%;
`
 const Input = styled.input`
 width:450px;
 margin:0;
 padding:0;
 @media only screen and (max-width: 767px) {
  width:100%;
  height:30px;
}
 `
 const Search =styled.div`
margin-top:20px;
width:50%;
 display:none;
 @media only screen and (max-width: 767px) {
display:inline-block;
float:right;
 `
 const UserImg = styled.img`
 width:35px;
 height:35px;
 border-radius: 50%;
position:absolute;
left:20px;
top:10px;
 `
const UserLogo = styled.div`
font-size: 10px;
dispaly:inline-block;
color:rgb(26, 156, 142);
margin-top: -10px;
@media only screen and (max-width: 767px) {
margin:0;
}
`
const UserName = styled.p`
display:inline;
@media only screen and (max-width: 767px) {
  margin-left:-20px;}
`
const IconImg = styled.img`
width:20px;
 height:20px;
;`
const Button=styled.button`
height:30px;
width:90%;
display:block;
margin-left:auto;
margin-right:auto;
`

class Header extends Component {

  constructor( ) {
    super( );

    this.state = {
      userName: "",
      firstTime: true,    
      show: false,
      currentUser:""
  
     
    };
  this.handleShow = this.handleShow.bind(this);
  this.handleHide = this.handleHide.bind(this);
  }
  handleShow() {
    this.setState({ show: true });
  }

  handleHide() {
    this.setState({ show: false });
  }
  componentWillMount() {
    // if (this.props.authenticated){
    //   if (this.props.group === "prof"){
    //     FirebaseServices.readDBRecord('profUser', `${this.props.currentUser.uid}`)
    //       .then(val => {
    //         this.setState({userName: val.name, firstTime: false})})
    //   }else {
    //     FirebaseServices.readDBRecord('normalUser', `${this.props.currentUser.uid}`)
    //       .then(val =>
    //           this.setState({userName: val.name, firstTime: false}))
    //   }
    // }
  }

  render() {

    return (
      <Navbar  fixedTop collapseOnSelect  >
        <Navbar.Header  >
           <NavbarBrand>
         <IndexLinkContainer to="/" style={{cursor:"pointer"}}>
          <img src={bayty_icon} />
          </IndexLinkContainer>
          </NavbarBrand>
          {/* mobile search bar */}
          <Nav  className="search">
          <NavItem >
            <div className="inner-addon right-addon">
            <i   className="glyphicon glyphicon-search" ></i>
                <Input  id="search"  className="form-control" type="text"  placeholder="بحث عن منتجات أفكار ...."></Input>
                </div>
                </NavItem></Nav>
                <Search  id="demo-2">
                {/* <form id="demo-2">
	              <input type="search"  placeholder="بحث عن منتجات أفكار ...."/>
                 </form> */}
                  <i   className="glyphicon glyphicon-search" onClick={this.handleShow}></i>
                </Search> 
                <Modal  {...this.props}
                  show={this.state.show}
                  onHide={this.handleHide}  style={{ top: 30 }}  >
                  <Modal.Body>
                  <form >
	              <Input  placeholder="بحث عن منتجات أفكار ...."/>
                 </form>
                  </Modal.Body>
                </Modal>

                {!this.props.authenticated ? (
                  <Nav pullLeft>
                    <NavItem>
                    <LinkContainer to="/login" activeClassName="active">
                    {/* <UserImg src={logo_placeholder}/> */}
                    <IconImg src={Profile} />
                    </LinkContainer>
                    </NavItem>
                    </Nav>

            ) : (
              <Nav pullLeft>
              <NavItem>
              <LinkContainer to="/myprofile" activeClassName="active">
             
              <UserLogo > <IconImg src={Profile} />
              <br/>
                    <UserName >
                    مرحبا ،  {this.props.userName}
                
              </UserName>
             
              </UserLogo>

              </LinkContainer>
           
              </NavItem>
              </Nav>
          )}
         <div style={{position:'relative'}} className="cartmenu">
           <LinkContainer to="/mycart" activeClassName="active" style={{position:'relative',cursor: 'pointer'}}>
         <div style={{position:'relative'}}>
         {this.props.cart > 0 ?
          <CartNo>{this.props.cart}</CartNo>
          : null
         }
          <IconImg src={Cart} className="shoppingcart"/>
          </div>
          </LinkContainer>
          {this.props.authenticated ?
          <div className="shorcartlist">
          <HeaderCart currentUser={this.props.currentUser}  />
          <LinkContainer to="/mycart" >
            <Button>عرض السلة</Button>
            </LinkContainer>
            </div>:null}
          </div>

          
         <Navbar.Toggle />
        </Navbar.Header>
        <Nav pullLeft>
        </Nav>
        <Navbar.Collapse >

        <Nav  bsStyle="tabs" justified >
            <IndexLinkContainer to="/" >
              <NavItem> <IconImg src={Homepage} className="icons"/>الرئيسية</NavItem>
            </IndexLinkContainer>
            <LinkContainer to="/productspage" >
              <NavItem> <IconImg src={Product} className="icons"/>المنتجات</NavItem>
            </LinkContainer>
            <LinkContainer to="/ideaspage" >
              <NavItem> <IconImg src={Idea} className="icons"/>الأفكار</NavItem>
            </LinkContainer>
            </Nav>

              {/* <div>
              <Nav bsStyle="tabs"
          justified  >
              <LinkContainer to="/myproducts">
                <NavItem  href="#"> <MdEventSeat className="icons"/>
                  استعراض منتجاتي
                </NavItem>
                </LinkContainer>

                <LinkContainer to="/newproduct">
                  <NavItem ><MdAddToPhotos className="icons"/>اضافة منتج جديد  </NavItem>
                </LinkContainer>

              </Nav>
              </div>



          {/* <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
          <MenuItem eventKey={3.1}>Action</MenuItem>
          <MenuItem eventKey={3.2}>Another action</MenuItem>
          <MenuItem eventKey={3.3}>Something else here</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey={3.4}>Separated link</MenuItem>
        </NavDropdown> */}

       </Navbar.Collapse >

      </Navbar>

    );
  }
}

export default Header;
