import React, { Component } from "react";
import { Link } from "react-router-dom";
import { DropdownButton,MenuItem ,Col,Row,ButtonToolbar,
  NavDropdown,Button,Image,Carousel,Grid} from "react-bootstrap";
import ProductList from './ProductList';
import styled from 'styled-components'
import traditionalkitchen from '../assets/img/traditionalkitchen.jpg';
import bedroom from '../assets/img/bedroom.jpg';
import livingroom from '../assets/img/livingroom.jpg';


const Select = styled.select`
background-color: rgb(26, 156, 142);
color:white;
font-size:20px;
padding-right:10px;
border:0;
width:100%;
height:60px;
border-radius: 0;
-webkit-appearance: none;
@media only screen and (max-width: 767px) {
  font-size:15px;
}

`

const PaddingDiv = styled.div`
  padding-right: 0px;
  padding-top: 20px;
  padding-left: 0;
  padding-bottom: 0;
  @media only screen and (max-width: 767px) {
    display:inline-block;
    width:20%;
    font-size:10px;
    padding-left: 5px;
    padding-bottom: 10px;}
`;

class ProductsPage extends Component {
   
    render() {

      return (
  <div>
      <Grid>
     <Row style={{display: 'flex', flexWrap: 'wrap'}}>
     
        <Col sm={4} xs={12}  >
      
 <PaddingDiv>
  
 <div className="inner-addon left-addon">
          <i className="glyphicon glyphicon-plus white" style={{padding:'20px 0 10px 10px'}} ></i>
  <Select name="selectThis" id="selectThis">
                    <option value="">التصنيف</option>
                    <option value=".option1">Option 1</option>
                    <option value=".option2">Option 2</option>
                    <option value=".option3">Option 3</option>
                    <option value=".option4">Option 4</option>
                </Select>
                </div>
                </PaddingDiv>
                <PaddingDiv>
                <div className="inner-addon left-addon">
          <i className="glyphicon glyphicon-plus white" style={{padding:'20px'}} ></i>
                <Select name="selectThis" id="selectThis">
                    <option value="">القسم</option>
                    <option value=".option1">Option 1</option>
                    <option value=".option2">Option 2</option>
                    <option value=".option3">Option 3</option>
                    <option value=".option4">Option 4</option>
                </Select>
                </div>
                </PaddingDiv>
                <PaddingDiv>
                <div className="inner-addon left-addon">
          <i className="glyphicon glyphicon-plus white" style={{padding:'20px'}} ></i>
                <Select name="selectThis" id="selectThis">
                    <option value="">السعر</option>
                    <option value=".option1">Option 1</option>
                    <option value=".option2">Option 2</option>
                    <option value=".option3">Option 3</option>
                    <option value=".option4">Option 4</option>
                </Select>
                </div>
                </PaddingDiv>
                <PaddingDiv>
                <div className="inner-addon left-addon">
          <i className="glyphicon glyphicon-plus white" style={{padding:'20px'}} ></i>
                <Select name="selectThis" id="selectThis">
                    <option value="">العلامة التجارية</option>
                    <option value=".option1">Option 1</option>
                    <option value=".option2">Option 2</option>
                    <option value=".option3">Option 3</option>
                    <option value=".option4">Option 4</option>
                </Select>
                </div>
                </PaddingDiv>
                <PaddingDiv>
                <div className="inner-addon left-addon">
          <i className="glyphicon glyphicon-plus white" style={{padding:'20px'}} ></i>
                <Select name="selectThis" id="selectThis">
                    <option value="">الطراز</option>
                    <option value=".option1">Option 1</option>
                    <option value=".option2">Option 2</option>
                    <option value=".option3">Option 3</option>
                    <option value=".option4">Option 4</option>
                </Select>
                </div>
                </PaddingDiv> 
          
   </Col>
  
   <Col sm={8} xs={12} >
      
      <div>
  <Carousel >
      <Carousel.Item>
        <div>
        <img  src={bedroom}     />
        <Carousel.Caption className="hero">
          <h3>غير مزاجك واجعل منزلك أكثر جاذبية </h3>
        </Carousel.Caption>
        
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div>
        <img  src= {traditionalkitchen}     />
        <Carousel.Caption className="hero">
          <h3>غير مزاجك واجعل منزلك أكثر جاذبية </h3>
        </Carousel.Caption>
        </div>
      </Carousel.Item>
      <Carousel.Item>
      <div>
        <img  src= {livingroom}   />
        <Carousel.Caption className="hero">
          <h3>غير مزاجك واجعل منزلك أكثر جاذبية </h3>
        </Carousel.Caption>
        </div>
      </Carousel.Item>
      
    </Carousel>
   </div>

   <ProductList thisUserOnly={false}/>
   </Col>
   </Row>
   </Grid>
	</div>			
    
  );}}
  
  export default ProductsPage;