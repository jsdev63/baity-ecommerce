import React, { Component } from "react";
import { Link } from "react-router-dom";
import { app, base, DBBase } from "../base";
import FirestoreServices from './FirestoreServices'
import FirebaseServices from './FirebaseServices'
import {MainCartList,HeaderCartList} from './CartList';
import {MainCartBrief,HeaderCartBrief}from "./CartBrief";
import styled from 'styled-components'
import {
    Col,
    Modal,
    Row,
    Grid,
    Glyphicon
  } from "react-bootstrap";
import logo_placeholder from '../assets/img/logo-placeholder.jpg';
import Loading from './Loading'

const Cartbutton = styled.button`
display:block;
margin-left:auto;
margin-right:auto;
height:35px;
width:140px;
background-color:rgb(26, 156, 142);
`
const Button =styled.button`
display:block;
margin-left:auto;
margin-right:auto;
width:30%;
height:40px;
@media only screen and (max-width: 767px) {
    width:80%;
    height:35px;;
}
`
const DropCart=styled.div`
width: 250px;
height:200px;
 overflow-y:auto;
 overflow-x: hidden;
 padding-top:5px;
`

export class MyCart extends Component {

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this)
   this.removefromCart = this.removefromCart.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.fetchItems = this.fetchItems.bind(this)


    this.state = {
      basket: {},
      products: {},
      quantities: [],
      loading: true,
      total: 0,
      completed: false,
      errorHandling: {
        showError: false,
        errorMsg: ""},
      show: false
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
    this.fetchItems()
  }

  componentWillUnmount() {
    this.basketRef && base.removeBinding(this.basketRef);
  }

  fetchItems() {
    // var path = FirebaseServices.BASKET_PATH + `/${this.props.currentUser.uid}/items`
    // console.log("path " + path)
    // this.basketRef = DBBase.bindToState(path, {
    //   context: this,
    //   state: "basket",
    //   then(data) {
    //     console.log("DBBase data: " + data)
    //     var productIds = Object.keys(this.state.basket)
    //     console.log(productIds)
      var ref = FirebaseServices.basket.child(`${this.props.currentUser.uid}/items`)
      ref.once('value',snapshot => {

        if(snapshot.val() !== null) {
        var newProducts = {}
        var total = 0
        var productIds = Object.keys(snapshot.val())
        var products = snapshot.val()
        var quantities = [];
        const listPromises = productIds.map(id =>
            FirestoreServices.products.doc(id).get().then(snapshot => {
            console.log("items " + snapshot.data())
            var quantity = products[id].quantity
            //quantities.push(quantity);
            total = Number(snapshot.data().price) * quantity + total
            var product = {...snapshot.data(), quantity: quantity};
            return newProducts = [...newProducts, product]
          })
        );

        const results = Promise.all(listPromises)
        results.then((snapshot) => {
          console.log("data " + this.state.basket.length)
          this.setState({products: newProducts, quantities: quantities, loading: false, total: total, basket: products})
          console.log("newProducts " + newProducts.length)

        })

      }else {
        this.setState({loading:false})
      }
    })
      // onFailure(error) {
      // this.setState({errorHandling: {showError: true, errorMsg: error}});
      // }

  }

  handleSubmit(event) {
    // create a chat between user and business owner **later
    // fetch owners emails
    // send email msg with uesr email and product information
    FirebaseServices.basket.child(this.props.currentUser.uid).set({'completed': true})
    this.props.updateCart(false,true)
    this.setState({completed: true});
  }

  removefromCart(id) {
    this.deleteItem(id)
  }

  deleteItem(id) {
    delete this.state.basket[id]
    this.setState({basket: this.state.basket})

    FirebaseServices.basket.child(`${this.props.currentUser.uid}/items/${id}`).remove()
    // for some reason calling fetch will not cause the page to rerender
    this.fetchItems()
    this.props.updateCart(false,false)
  }


  render(){
    var subtotal = this.state.total
    var vat = Number((subtotal * 0.05).toFixed(2))
    var total = subtotal + vat

    if (this.state.loading)
      return(
       <Loading />
      )
    else if(this.state.completed)
      return (
        <h2 style={{ textAlign:'center',color: 'rgb(26,156,142)'}}>تم إرسال الطلب للبائعين، شكرا لتسوقكم معنا</h2>
      )
    else {
      return [
        <Grid key="one">
          <h2 style={{ textAlign:'center',color: 'rgb(26,156,142)'}}>سلة التسوق</h2>
          {this.state.total > 0 ?
            <Row style={{ display: 'flex', flexWrap: 'wrap', boxShadow: '5px 5px 5px #d7d7d7' }} >
            <MainCartList products={this.state.products} removefromCart={this.removefromCart}/>
            <Col xs={12} style={{ background:'white' }}>
           <h4 style={{ textAlign:'left'}}> قيمة الطلبات: &nbsp;&nbsp;
           <span style={{ color: 'rgb(26,156,142)'}}> {subtotal}ر.س</span></h4>
           <h4 style={{ textAlign:'left'}}> القيمة الضريبية:&nbsp;&nbsp;
           <span style={{ color: 'rgb(26,156,142)'}}> {vat} ر.س </span></h4>
           <h4 style={{ textAlign:'left'}}> المجموع : &nbsp;&nbsp;
           <span style={{ color: 'rgb(26,156,142)'}}> {total} ر.س </span></h4>
           {total > 0
           ?<Button onClick={this.handleShow}>اتمام العملية</Button>
           :null}
            </Col>
             </Row>
          : <h4 style={{textAlign:'center'}}>لم تقم باضافة منتجات، إبدأ الان</h4>


           }
            <div>
                <Modal
                   show={this.state.show}
                   onHide={this.handleHide} style={{ top: 300 }}>
                 <Modal.Header>
                    سيتم ارسال بيانات تواصلك للبائع لخدمتك
                  </Modal.Header>
                  <Modal.Body>

                      <Cartbutton onClick={ () => {this.handleShow();this.handleSubmit()}}>تأكيد</Cartbutton>

                      <p style={{color:'rgb(26, 156, 142)'}}>ارسال الايميل فقط</p>
                  </Modal.Body>
                </Modal>
              </div>
            </Grid>
          ];
    };
  }


}

export class HeaderCart extends Component {

  constructor() {
    super();
    this.fetchItems = this.fetchItems.bind(this)


    this.state = {
      basket: {},
      products: {},
      loading: true,
      total: 0,
      completed: false,
      errorHandling: {
        showError: false,
        errorMsg: ""},

      };

   }
  componentWillMount() {
    this.fetchItems()
  }



  fetchItems() {
    var path = FirebaseServices.BASKET_PATH + `/${this.props.currentUser.uid}/items`
    console.log("path " + path)
    this.basketRef = base.syncState(path, {
      context: this,
      state: "basket",
      then(data) {
        var productIds = Object.keys(this.state.basket)

        var newProducts = {}
        var total = 0
        const listPromises = productIds.map(id => {
          return FirestoreServices.products.doc(id).get().then(snapshot => {
            snapshot.data()
            total = Number(snapshot.data().price) + total
            newProducts = [...newProducts, snapshot.data()]
          })
        });

        const results = Promise.all(listPromises)
        results.then((snapshot) => {
          console.log("data " + this.state.basket.length)
          this.setState({products: newProducts, loading: false, total: total})
          console.log("newProducts " + newProducts.length)
        })
      },
      onFailure(error) {
      this.setState({errorHandling: {showError: true, errorMsg: error}});
      }
    })
  }


  render(){
    var subtotal = this.state.total

    if (this.state.loading)
      return(
       <Loading />
      )

    else {
      return (
            <DropCart >
            <p style={{ textAlign:'center'}}>سلة التسوق</p>
            <hr/>
            <HeaderCartList products={this.state.products}/>
           <h4 style={{ textAlign:'center'}}> المجموع :
        <span style={{ color: 'rgb(26,156,142)'}}> {subtotal} ر.س </span>
           </h4>
             </DropCart>



    );
    };
  }
}
