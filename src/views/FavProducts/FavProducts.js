import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Grid, Row, Col } from "react-bootstrap";
import { base } from "config/base";
import FirestoreServices from 'services/FirestoreServices'
import FirebaseServices from 'services/FirebaseServices'
import ProductBrief from "components/ProductBrief";
import Loading from 'commons/Loading'
import { MdEventSeat } from 'react-icons/lib/md';
import styled from 'styled-components'
import FirebasePaginator from 'services/firebase-pag';
import InfiniteScroll from 'react-infinite-scroll-component';

const Button = styled.button`
background-color:transparent;
border:1px solid rgb(26, 156, 142);
color:rgb(26, 156, 142);
  width:100px;
  height: 30px;
  @media only screen and (max-width: 767px) {
    height: 20px;
    width:40px;
    font-size:10px;
  `;

const PAGE_SIZE = 12;
var options = {
  pageSize: PAGE_SIZE,
  finite: true,
  retainLastPage: false
};
var paginator;

class FavProducts extends Component {
  constructor() {
    super();
    this.likedProducts = this.likedProducts.bind(this);
    this.state = {
      products: {},
      extraProducts: [],
      loading: true,
      empty: true
    };
  }

  likedProducts(val) {
    if (val) {
      const productIds = Object.keys(val);
      productIds.map(id => {
        FirestoreServices.products.doc(id).get().then((snapshot) => {
          var products = [...this.state.products, snapshot.data()]
          this.setState({ products: products, loading: false, empty: false })
        });
        return true;
      });
    } else {
      this.setState({ loading: false, empty: true })
    }
  }

  componentWillMount() {
    this.listToArray = this.listToArray.bind(this)
    this.firebasePaginatorFiltering = this.firebasePaginatorFiltering.bind(this)
    this.forwardFiltring = this.forwardFiltring.bind(this)

    if (this.props.shortList) {

      FirebaseServices.likes.child(`${this.props.currentUser.uid}/products`).limitToLast(3).once("value", function (snapshot) {
      }).then(snapshot => this.likedProducts(snapshot.val()));
    } else {
      var ref = FirebaseServices.likes.child(`${this.props.currentUser.uid}/products`)
      paginator = new FirebasePaginator(ref, options)
      this.firebasePaginatorFiltering()
    }
  }

  componentWillUnmount() {
    this.userLikesRef && base.removeBinding(this.userLikesRef);
    if (paginator) {
      paginator.off('value', () => {
      });
    }
  }

  listToArray() {
    const products = this.state.products
    const productIds = Object.keys(products);

    var arr = [];
    productIds.reverse().map(id => {
      const product = products[id];
      arr.push(product);
      return true;
    });
    var list = []
    if (this.state.extraProducts.length < 1) {
      list = arr.slice()
    } else {
      list = [...this.state.extraProducts, ...arr.slice()]
    }
    this.setState({ extraProducts: list, loading: false })
  }

  firebasePaginatorFiltering() {
    var handler = (() => {
      var productIds = (Object.keys(paginator.collection))
      console.log(productIds.length)
      if (productIds.length > 0) {
        var newProducts = {}
        const listPromises = productIds.map(id => {
          return FirestoreServices.products.doc(id).get().then(snapshot => {
            snapshot.data()
            newProducts = [...newProducts, snapshot.data()]
          })
        });

        const results = Promise.all(listPromises)
        results.then((snapshot) => {
          this.setState({ products: newProducts, empty: false })
          this.listToArray();
        })
      }
    })
    paginator.on('value', handler);
  }

  forwardFiltring() {
    paginator.previous()
      .then()
  }

  render() {
    const products = this.state.products;
    const productIds = Object.keys(products);

    if (this.state.loading)
      return (
        <Loading />
      )
    else if (this.props.shortList) {
      return (
        <Grid style={{ backgroundColor: "white" }}>
          <Row style={{ display: 'flex', flexWrap: 'wrap', borderBottom: "1px dotted lightgray" }}>
            <Col xs={12} lg={12} >
              <hr style={{ marginBottom: '30px' }} />
              {this.state.empty
                ? <div><h2 style={{ color: 'rgb(26,156,142)' }}>المنتجات المفضلة</h2>
                  <h5 > ليس لديك منتجات مفضلة </h5> </div>
                : <div>
                  <Col xs={2} md={3} lg={2} style={{ margin: '10px 0 0 0' }} >
                    <Link to={`/favproducts`}>
                      <Button>المزيد</Button>
                    </Link>
                  </Col>
                  <Col xs={10} md={9} lg={10} >
                    <Link to={`/favproducts`}>
                      <h2 style={{ color: 'rgb(26,156,142)' }}>المنتجات المفضلة</h2>
                    </Link>
                  </Col>
                </div>
              }
              {productIds.map(id => {
                const product = products[id];
                return <ProductBrief key={id} product={product} />;
              })}
            </Col>
          </Row>
        </Grid>
      );
    } else {
      var newProducts = this.state.extraProducts.slice()
      return (
        <Grid Grid style={{ backgroundColor: "white" }}>
          <Row style={{ display: 'flex', flexWrap: 'wrap' }}>

            <Col xs={12} lg={12}>
              <InfiniteScroll style={{ overflow: 'none' }}
                hasMore={!paginator.isLastPage}
                next={this.forwardFiltring}
              >
                <div style={{ height: '70px' }}>
                  <h2 style={{ color: 'rgb(26,156,142)', textAlign: 'center' }}> <MdEventSeat className="icons" style={{ color: 'rgb(26,156,142)' }} />  منتجاتي المفضلة</h2>
                </div>
                <hr style={{ marginBottom: '30px' }} />
                {newProducts.length < 1
                  ? <h5> ليس لديك منتجات مفضلة </h5>
                  : null}
                {newProducts.map((product, index) => {
                  return <ProductBrief key={product.id} product={product} />;
                })}
              </InfiniteScroll>
            </Col>
          </Row>
        </Grid>
      );
    }
  }
}

export default FavProducts;
